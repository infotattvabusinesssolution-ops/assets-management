import assert from 'node:assert';
import test from 'node:test';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { connectDB, isDbConnected } from '../config/db.js';
import { config } from '../config/index.js';
import {
  DEFAULT_PASSWORD_POLICY,
  buildPasswordRegex,
  validatePasswordAgainstPolicy,
  generateCompliantPassword,
  getPolicyForCompany,
  savePolicyForCompany,
  getAllCompanyPolicies,
  memoryPasswordPolicies
} from '../modules/admin/passwordPolicy.service.js';
import {
  isUserSysAdmin,
  getPasswordPolicy,
  savePasswordPolicy,
  getAllPasswordPolicies,
  generateCompliantPasswordEndpoint,
  testPasswordSimulation
} from '../modules/admin/passwordPolicy.controller.js';
import {
  login,
  changePassword,
  createUser,
  updateUser,
  resetUserPassword,
  FALLBACK_USERS
} from '../modules/auth/auth.controller.js';
import {
  createAdminUser,
  updateAdminUser,
  resetAdminUserPassword
} from '../modules/admin/adminOrg.controller.js';
import { authenticateToken } from '../middleware/auth.js';

// Helper to create mock Express req/res
function createMockReqRes({ user = null, body = {}, query = {}, params = {}, headers = {} } = {}) {
  const req = {
    user,
    body,
    query,
    params,
    headers: { ...headers }
  };
  let statusCode = 200;
  let responseData = null;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    send(data) {
      responseData = data;
      return this;
    },
    getStatusCode() { return statusCode; },
    getData() { return responseData; }
  };
  return { req, res };
}

test('Dynamic Multi-Company Password Policy - E2E Integration Suite', async (t) => {

  // Connect to Database
  await connectDB(2);
  const dbActive = isDbConnected();
  console.log(`\n======================================================`);
  console.log(`Database Connection: ${dbActive ? 'ONLINE (MS SQL Server 2025)' : 'OFFLINE (Resilient In-Memory Mode)'}`);
  console.log(`======================================================\n`);

  // Query existing companies and roles for valid foreign key references when DB is active
  let realCompanyA = null;
  let realCompanyB = null;
  let realRole = null;

  if (dbActive) {
    const companies = await prisma.company.findMany({ take: 2 }).catch(() => []);
    realCompanyA = companies[0] || null;
    realCompanyB = companies[1] || null;
    realRole = await prisma.role.findFirst().catch(() => null);
  }

  const compAId = realCompanyA?.id || `COMP-E2E-A-${Date.now()}`;
  const compBId = realCompanyB?.id || `COMP-E2E-B-${Date.now()}`;
  const validRoleId = realRole?.id || 'role-001';

  // =========================================================================
  // 1. DATABASE PERSISTENCE VERIFICATION
  // =========================================================================
  await t.test('1. Database Persistence & Restart Resilience', async (st) => {
    const testCompanyId = compAId;
    const policyData = {
      minLength: 14,
      maxLength: 28,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecialChar: true,
      preventSpaces: true
    };

    await st.test('1.1 Save policy for company and verify persistence flag', async () => {
      const saved = await savePolicyForCompany(testCompanyId, policyData);
      assert.strictEqual(saved.companyId, testCompanyId);
      assert.strictEqual(saved.minLength, 14);
      assert.strictEqual(saved.maxLength, 28);
      assert.strictEqual(saved.requireUppercase, true);
      assert.strictEqual(saved.requireLowercase, true);
      assert.strictEqual(saved.requireNumber, true);
      assert.strictEqual(saved.requireSpecialChar, true);
      assert.strictEqual(saved.preventSpaces, true);
      assert.strictEqual(saved.isDefault, false);
      assert.strictEqual(saved.persistedToDatabase, dbActive, 'persistedToDatabase should match DB status');
    });

    await st.test('1.2 Clear in-memory cache to simulate full backend restart & verify DB recovery', async () => {
      // Simulate backend restart by wiping memory cache completely
      memoryPasswordPolicies.clear();
      assert.strictEqual(memoryPasswordPolicies.has(testCompanyId), false, 'Memory cache must be empty');

      // Fetch policy again - should load from SQL Server if DB is online
      const fetched = await getPolicyForCompany(testCompanyId);
      assert.strictEqual(fetched.minLength, 14);
      assert.strictEqual(fetched.maxLength, 28);
      assert.strictEqual(fetched.requireSpecialChar, true);
      assert.strictEqual(fetched.preventSpaces, true);

      if (dbActive) {
        // Query database directly to confirm SQL Server record
        const rows = await prisma.$queryRawUnsafe(`
          SELECT * FROM company_password_policies WHERE company_id = '${testCompanyId}'
        `);
        assert.ok(rows && rows.length > 0, 'Record must exist in SQL Server company_password_policies table');
        assert.strictEqual(rows[0].min_length, 14);
        assert.strictEqual(rows[0].max_length, 28);
      }
    });

    await st.test('1.3 Verify in-memory fallback correctly reports persistence status', async () => {
      const { req, res } = createMockReqRes({
        user: { role: { code: 'SYS_ADMIN' } },
        body: {
          companyId: testCompanyId,
          minLength: 15,
          maxLength: 30
        }
      });

      await savePasswordPolicy(req, res);
      const data = res.getData();
      assert.strictEqual(res.getStatusCode(), 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.persistedToDatabase, dbActive);
      if (dbActive) {
        assert.ok(data.message.includes('saved successfully to database'), 'Message indicates live database save');
      } else {
        assert.ok(data.message.includes('saved to session memory'), 'Message indicates session memory save without false DB claim');
      }
    });
  });

  // =========================================================================
  // 2. FIRST-TIME LOGIN AND FORCED PASSWORD CHANGE
  // =========================================================================
  await t.test('2. First-Time Login & Forced Password Change Workflow', async (st) => {
    const testUsername = `user_forced_${Date.now()}`;
    const testEmail = `${testUsername}@example.com`;
    const tempPassword = `InitialTemp#2026!`;

    // Configure company with strict policy: min 12 characters, special char required
    await savePolicyForCompany(compAId, {
      minLength: 12,
      maxLength: 32,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecialChar: true,
      preventSpaces: true
    });

    // Create test user in DB or memory
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    let createdUserId = `USR-TEST-${Date.now()}`;

    if (dbActive) {
      const createdDbUser = await prisma.user.create({
        data: {
          id: createdUserId,
          username: testUsername,
          email: testEmail,
          fullName: 'Test Forced Change User',
          passwordHash,
          roleId: validRoleId,
          companyId: compAId,
          forcePasswordChange: true,
          active: true
        }
      });
      createdUserId = createdDbUser.id;
    } else {
      FALLBACK_USERS.unshift({
        id: createdUserId,
        username: testUsername,
        email: testEmail,
        fullName: 'Test Forced Change User',
        passwordHash,
        companyId: compAId,
        forcePasswordChange: true,
        active: true
      });
    }

    await st.test('2.1 Login with temporary password returns mustChangePassword: true', async () => {
      const { req, res } = createMockReqRes({
        body: { username: testUsername, password: tempPassword }
      });

      await login(req, res, () => {});
      const data = res.getData();

      assert.strictEqual(res.getStatusCode(), 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.mustChangePassword, true, 'User must be flagged for mandatory password change');
      assert.ok(data.token, 'Auth token should be issued');
    });

    await st.test('2.2 Forced change with password violating company policy is rejected (400)', async () => {
      // Violates minLength: 12 (length = 8)
      const violatingPassword = 'Short1!';
      const { req, res } = createMockReqRes({
        user: { id: createdUserId, username: testUsername, companyId: compAId },
        body: { newPassword: violatingPassword }
      });

      await changePassword(req, res, () => {});
      const data = res.getData();

      assert.strictEqual(res.getStatusCode(), 400);
      assert.strictEqual(data.success, false);
      assert.ok(data.message.includes('Password does not meet company requirements'));
      assert.ok(data.errors.some(e => e.includes('12 characters')));
    });

    await st.test('2.3 Forced change with compliant password succeeds (200) and resets flag', async () => {
      const compliantPassword = 'CompliantPass#2026Sec';
      const { req, res } = createMockReqRes({
        user: { id: createdUserId, username: testUsername, companyId: compAId },
        body: { newPassword: compliantPassword }
      });

      await changePassword(req, res, () => {});
      const data = res.getData();

      assert.strictEqual(res.getStatusCode(), 200);
      assert.strictEqual(data.success, true);
      assert.ok(data.message.includes('Password updated successfully'));

      if (dbActive) {
        const updated = await prisma.user.findUnique({ where: { id: createdUserId } });
        assert.strictEqual(updated.forcePasswordChange, false, 'forcePasswordChange flag must be set to false in DB');
      }
    });

    await st.test('2.4 Subsequent login with new password succeeds with mustChangePassword: false', async () => {
      const { req, res } = createMockReqRes({
        body: { username: testUsername, password: 'CompliantPass#2026Sec' }
      });

      await login(req, res, () => {});
      const data = res.getData();

      assert.strictEqual(res.getStatusCode(), 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.mustChangePassword, false, 'Subsequent login must not prompt for password change');
    });

    // Cleanup user
    if (dbActive) {
      await prisma.user.delete({ where: { id: createdUserId } }).catch(() => {});
    }
    const idx = FALLBACK_USERS.findIndex(u => u.id === createdUserId);
    if (idx !== -1) FALLBACK_USERS.splice(idx, 1);
  });

  // =========================================================================
  // 3. API AUTHORIZATION AND MULTI-TENANT SECURITY
  // =========================================================================
  await t.test('3. API Authorization & Multi-Tenant Access Control', async (st) => {
    // Seed policies
    await savePolicyForCompany(compAId, { minLength: 8, requireUppercase: true });
    await savePolicyForCompany(compBId, { minLength: 12, requireUppercase: true });

    await st.test('3.1 Unauthenticated requests are rejected with 401 Unauthorized', async () => {
      const { req, res } = createMockReqRes({
        headers: {} // No authorization header
      });

      let nextCalled = false;
      await authenticateToken(req, res, () => { nextCalled = true; });

      assert.strictEqual(nextCalled, false, 'Middleware must block execution');
      assert.strictEqual(res.getStatusCode(), 401, 'Must return 401 Unauthorized');
      assert.strictEqual(res.getData()?.message, 'Authentication token required');
    });

    await st.test('3.2 Company Admin A can view and modify Company A policy (200 OK)', async () => {
      const compAAdmin = {
        id: 'usr-admin-a',
        username: 'admin_a',
        companyId: compAId,
        role: { code: 'COMPANY_ADMIN', name: 'Company Admin' }
      };

      // View
      const { req: getReq, res: getRes } = createMockReqRes({
        user: compAAdmin,
        query: { companyId: compAId }
      });
      await getPasswordPolicy(getReq, getRes);
      assert.strictEqual(getRes.getStatusCode(), 200);
      assert.strictEqual(getRes.getData()?.policy?.companyId, compAId);

      // Modify
      const { req: saveReq, res: saveRes } = createMockReqRes({
        user: compAAdmin,
        body: { companyId: compAId, minLength: 9 }
      });
      await savePasswordPolicy(saveReq, saveRes);
      assert.strictEqual(saveRes.getStatusCode(), 200);
      assert.strictEqual(saveRes.getData()?.policy?.minLength, 9);
    });

    await st.test('3.3 Company Admin A CANNOT view or modify Company B policy (403 Forbidden)', async () => {
      const compAAdmin = {
        id: 'usr-admin-a',
        username: 'admin_a',
        companyId: compAId,
        role: { code: 'COMPANY_ADMIN', name: 'Company Admin' }
      };

      // Attempt View Company B
      const { req: getReq, res: getRes } = createMockReqRes({
        user: compAAdmin,
        query: { companyId: compBId }
      });
      await getPasswordPolicy(getReq, getRes);
      assert.strictEqual(getRes.getStatusCode(), 403, 'Must return 403 Forbidden');
      assert.ok(getRes.getData()?.message.includes('Access Denied'));

      // Attempt Modify Company B
      const { req: saveReq, res: saveRes } = createMockReqRes({
        user: compAAdmin,
        body: { companyId: compBId, minLength: 15 }
      });
      await savePasswordPolicy(saveReq, saveRes);
      assert.strictEqual(saveRes.getStatusCode(), 403, 'Must return 403 Forbidden');
      assert.ok(saveRes.getData()?.message.includes('Access Denied'));
    });

    await st.test('3.4 Company Admin A CANNOT modify Global Default policy (403 Forbidden)', async () => {
      const compAAdmin = {
        id: 'usr-admin-a',
        username: 'admin_a',
        companyId: compAId,
        role: { code: 'COMPANY_ADMIN', name: 'Company Admin' }
      };

      // Attempt to save default policy with companyId: null
      const { req: nullReq, res: nullRes } = createMockReqRes({
        user: compAAdmin,
        body: { companyId: null, minLength: 10 }
      });
      await savePasswordPolicy(nullReq, nullRes);
      assert.strictEqual(nullRes.getStatusCode(), 403, 'Must return 403 Forbidden for null companyId');

      // Attempt to save default policy with companyId: 'DEFAULT'
      const { req: defReq, res: defRes } = createMockReqRes({
        user: compAAdmin,
        body: { companyId: 'DEFAULT', minLength: 10 }
      });
      await savePasswordPolicy(defReq, defRes);
      assert.strictEqual(defRes.getStatusCode(), 403, 'Must return 403 Forbidden for DEFAULT');
      assert.ok(defRes.getData()?.message.includes('Only System Administrators can configure the global default'));
    });

    await st.test('3.5 System Admin can view and modify Company A, Company B, and Global Default', async () => {
      const sysAdmin = {
        id: 'usr-sys-admin',
        username: 'sa_master',
        companyId: null,
        role: { code: 'SYS_ADMIN', name: 'System Administrator', isSystem: true }
      };

      // Modify Company A
      const { req: aReq, res: aRes } = createMockReqRes({
        user: sysAdmin,
        body: { companyId: compAId, minLength: 11 }
      });
      await savePasswordPolicy(aReq, aRes);
      assert.strictEqual(aRes.getStatusCode(), 200);

      // Modify Company B
      const { req: bReq, res: bRes } = createMockReqRes({
        user: sysAdmin,
        body: { companyId: compBId, minLength: 13 }
      });
      await savePasswordPolicy(bReq, bRes);
      assert.strictEqual(bRes.getStatusCode(), 200);

      // Modify Global Default
      const { req: defReq, res: defRes } = createMockReqRes({
        user: sysAdmin,
        body: { companyId: null, minLength: 8, requireSpecialChar: true }
      });
      await savePasswordPolicy(defReq, defRes);
      assert.strictEqual(defRes.getStatusCode(), 200);
    });
  });

  // =========================================================================
  // 4. PASSWORD POLICY CACHE & REAL-TIME SYNC
  // =========================================================================
  await t.test('4. Password Policy Cache Synchronization', async (st) => {
    await st.test('4.1 Immediate reflection without backend restart', async () => {
      // 1. Initial save: minLength 10
      await savePolicyForCompany(compAId, { minLength: 10, requireUppercase: true });
      let policy = await getPolicyForCompany(compAId);
      assert.strictEqual(policy.minLength, 10);

      // 2. Immediate update: minLength 18
      await savePolicyForCompany(compAId, { minLength: 18, requireUppercase: true });

      // 3. Immediate fetch via getPolicyForCompany
      policy = await getPolicyForCompany(compAId);
      assert.strictEqual(policy.minLength, 18, 'Cache must reflect 18 immediately without requiring backend restart');

      // 4. Immediate simulation validation with updated rule
      const pass12 = 'ValidPass12#';
      const checkResult = validatePasswordAgainstPolicy(pass12, policy);
      assert.strictEqual(checkResult.isValid, false, '12-char password must immediately fail against updated 18-char requirement');
    });

    await st.test('4.2 Verify policy isolation between companies in cache', async () => {
      await savePolicyForCompany(compBId, { minLength: 6 });

      const pCache = await getPolicyForCompany(compAId);
      const pOther = await getPolicyForCompany(compBId);

      assert.strictEqual(pCache.minLength, 18);
      assert.strictEqual(pOther.minLength, 6);
    });
  });

  // =========================================================================
  // 5. EXISTING FUNCTIONALITY REGRESSION TESTING
  // =========================================================================
  await t.test('5. Existing Functionality Regression Testing', async (st) => {

    await st.test('5.1 Normal Login: Standard user login succeeds with valid password, fails with wrong password', async () => {
      // Test invalid password
      const { req: failReq, res: failRes } = createMockReqRes({
        body: { username: 'admin', password: 'WrongPassword999!' }
      });
      await login(failReq, failRes, () => {});
      assert.strictEqual(failRes.getStatusCode(), 401);
      assert.strictEqual(failRes.getData()?.success, false);

      // Test valid password for admin account
      const { req: okReq, res: okRes } = createMockReqRes({
        body: { username: 'admin', password: 'Password@123' }
      });
      await login(okReq, okRes, () => {});
      assert.strictEqual(okRes.getStatusCode(), 200);
      assert.strictEqual(okRes.getData()?.success, true);
      assert.ok(okRes.getData()?.token);
    });

    await st.test('5.2 User Creation: Rejects non-compliant password and creates user with compliant password', async () => {
      await savePolicyForCompany(compAId, { minLength: 12, requireSpecialChar: true });

      // Non-compliant password: too short
      const { req: failReq, res: failRes } = createMockReqRes({
        body: {
          username: `user_fail_${Date.now()}`,
          email: `user_fail_${Date.now()}@example.com`,
          fullName: 'Fail User',
          password: 'Pass1!',
          roleId: validRoleId,
          companyId: compAId
        }
      });
      await createUser(failReq, failRes, () => {});
      assert.strictEqual(failRes.getStatusCode(), 400);
      assert.strictEqual(failRes.getData()?.success, false);
      assert.ok(failRes.getData()?.message.includes('Password does not meet company requirements'));

      // Compliant password
      const newUsername = `user_ok_${Date.now()}`;
      const { req: okReq, res: okRes } = createMockReqRes({
        body: {
          username: newUsername,
          email: `${newUsername}@example.com`,
          fullName: 'Valid User',
          password: 'Compliant#2026UserPass',
          roleId: validRoleId,
          companyId: compAId
        }
      });
      await createUser(okReq, okRes, () => {});
      assert.strictEqual(okRes.getStatusCode(), 201);
      assert.strictEqual(okRes.getData()?.success, true);

      // Cleanup
      if (dbActive) {
        await prisma.user.deleteMany({ where: { username: newUsername } }).catch(() => {});
      }
    });

    await st.test('5.3 User Editing: Updates name and details without corrupting credentials', async () => {
      // Pick first user from fallback or DB
      const targetUser = FALLBACK_USERS[0];
      const origName = targetUser.fullName;

      const { req, res } = createMockReqRes({
        params: { id: targetUser.id },
        body: { fullName: 'Updated Administrator Name', phone: '+1 888-555-0199' }
      });
      await updateUser(req, res, () => {});
      assert.strictEqual(res.getStatusCode(), 200);
      assert.strictEqual(res.getData()?.success, true);
      assert.strictEqual(res.getData()?.user?.fullName, 'Updated Administrator Name');

      // Revert name
      targetUser.fullName = origName;
    });

    await st.test('5.4 Admin Password Reset: Generates compliant temporary password matching policy', async () => {
      await savePolicyForCompany(compAId, {
        minLength: 14,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecialChar: true,
        preventSpaces: true
      });

      // Target user
      const targetUser = FALLBACK_USERS[1];
      targetUser.companyId = compAId;

      const { req, res } = createMockReqRes({
        params: { id: targetUser.id },
        body: {} // No password provided -> triggers CSPRNG generator
      });

      await resetUserPassword(req, res, () => {});
      const data = res.getData();

      assert.strictEqual(res.getStatusCode(), 200);
      assert.strictEqual(data.success, true);
      assert.ok(data.tempPassword, 'Must return generated tempPassword');

      // Validate the generated temp password complies with the 14-char policy
      const policy = await getPolicyForCompany(compAId);
      const val = validatePasswordAgainstPolicy(data.tempPassword, policy);
      assert.strictEqual(val.isValid, true, `Generated temp password "${data.tempPassword}" must comply with all rules`);
      assert.strictEqual(targetUser.forcePasswordChange, true, 'forcePasswordChange must be true');
    });

    await st.test('5.5 User Self-Service Password Change: Enforces policy and verifies current password', async () => {
      await savePolicyForCompany(compAId, { minLength: 10, requireSpecialChar: true });

      const testSelfUser = {
        id: `usr-self-${Date.now()}`,
        username: `self_tester_${Date.now()}`,
        companyId: compAId,
        passwordHash: await bcrypt.hash('CurrentValid#123', 10),
        forcePasswordChange: false
      };
      FALLBACK_USERS.push(testSelfUser);

      // Wrong old password
      const { req: wrongOldReq, res: wrongOldRes } = createMockReqRes({
        user: testSelfUser,
        body: {
          oldPassword: 'IncorrectOldPassword1!',
          newPassword: 'BrandNewValid#2026'
        }
      });
      await changePassword(wrongOldReq, wrongOldRes, () => {});
      assert.strictEqual(wrongOldRes.getStatusCode(), 400);

      // Invalid new password (missing special character)
      const { req: invalidNewReq, res: invalidNewRes } = createMockReqRes({
        user: testSelfUser,
        body: {
          oldPassword: 'CurrentValid#123',
          newPassword: 'PlainPasswordWithoutSpecial123'
        }
      });
      await changePassword(invalidNewReq, invalidNewRes, () => {});
      assert.strictEqual(invalidNewRes.getStatusCode(), 400);
      assert.ok(invalidNewRes.getData()?.errors.some(e => e.includes('special character')));

      // Correct change
      const { req: okReq, res: okRes } = createMockReqRes({
        user: testSelfUser,
        body: {
          oldPassword: 'CurrentValid#123',
          newPassword: 'BrandNewValid#2026'
        }
      });
      await changePassword(okReq, okRes, () => {});
      assert.strictEqual(okRes.getStatusCode(), 200);
      assert.strictEqual(okRes.getData()?.success, true);

      // Cleanup
      const sIdx = FALLBACK_USERS.findIndex(u => u.id === testSelfUser.id);
      if (sIdx !== -1) FALLBACK_USERS.splice(sIdx, 1);
    });

    await st.test('5.6 CSPRNG Compliant Password Generator: 100% rule satisfaction across 50 iterations', async () => {
      const strictPolicy = {
        minLength: 16,
        maxLength: 32,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecialChar: true,
        preventSpaces: true
      };

      for (let i = 0; i < 50; i++) {
        const generated = generateCompliantPassword(strictPolicy);
        const check = validatePasswordAgainstPolicy(generated, strictPolicy);
        assert.strictEqual(
          check.isValid,
          true,
          `Generated password #${i} ("${generated}") must satisfy all rules. Failed: ${check.errors.join(', ')}`
        );
        assert.ok(generated.length >= 16 && generated.length <= 32);
        assert.ok(/[A-Z]/.test(generated));
        assert.ok(/[a-z]/.test(generated));
        assert.ok(/\d/.test(generated));
        assert.ok(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(generated));
        assert.ok(!/\s/.test(generated));
      }
    });

  });

  // Revert company policies to default clean state
  await savePolicyForCompany(compAId, DEFAULT_PASSWORD_POLICY);
  await savePolicyForCompany(compBId, DEFAULT_PASSWORD_POLICY);
  await savePolicyForCompany(null, DEFAULT_PASSWORD_POLICY);
  console.log('✅ Cleaned up and restored default policies for test companies.\n');

});
