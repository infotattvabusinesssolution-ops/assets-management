import assert from 'node:assert';
import test from 'node:test';
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
  getAllPasswordPolicies
} from '../modules/admin/passwordPolicy.controller.js';
import { resetAdminUserPassword, memoryUsers } from '../modules/admin/adminOrg.controller.js';
import { resetUserPassword } from '../modules/auth/auth.controller.js';

test('Password Policy Verification Suite', async (t) => {

  await t.test('1. Global Default Fallback Policy', async () => {
    // A brand new unconfigured company inherits global default
    const unconfiguredCompanyPolicy = await getPolicyForCompany('COMP-UNCONFIGURED-XYZ');
    assert.strictEqual(unconfiguredCompanyPolicy.minLength, 8, 'Default min length should be 8');
    assert.strictEqual(unconfiguredCompanyPolicy.requireUppercase, true);
    assert.strictEqual(unconfiguredCompanyPolicy.requireLowercase, true);
    assert.strictEqual(unconfiguredCompanyPolicy.requireNumber, true);
    assert.strictEqual(unconfiguredCompanyPolicy.requireSpecialChar, true);
    assert.strictEqual(unconfiguredCompanyPolicy.preventSpaces, true);
    assert.strictEqual(unconfiguredCompanyPolicy.isDefault, true, 'isDefault should be true for unconfigured company');

    // Password adhering to global default
    const validPass = 'Secure@123';
    const checkValid = validatePasswordAgainstPolicy(validPass, unconfiguredCompanyPolicy);
    assert.strictEqual(checkValid.isValid, true, 'Secure@123 should be valid under default policy');

    // Password lacking special character
    const invalidPass = 'Secure12345';
    const checkInvalid = validatePasswordAgainstPolicy(invalidPass, unconfiguredCompanyPolicy);
    assert.strictEqual(checkInvalid.isValid, false, 'Secure12345 should fail due to missing special char');
    assert.ok(checkInvalid.errors.some(e => e.includes('special character')), 'Error should list missing special char');
  });

  await t.test('2. Multi-Company Policy Isolation (Company A vs Company B vs Default)', async () => {
    const compAId = 'COMP-ALPHA-001';
    const compBId = 'COMP-BETA-002';

    // Company A: Strict enterprise policy (minLength: 12, uppercase: true, special: true, preventSpaces: true)
    await savePolicyForCompany(compAId, {
      minLength: 12,
      maxLength: 32,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecialChar: true,
      preventSpaces: true
    });

    // Company B: Relaxed internal policy (minLength: 6, uppercase: false, special: false, preventSpaces: false)
    await savePolicyForCompany(compBId, {
      minLength: 6,
      maxLength: 24,
      requireUppercase: false,
      requireLowercase: true,
      requireNumber: true,
      requireSpecialChar: false,
      preventSpaces: false
    });

    // Fetch effective policies
    const policyA = await getPolicyForCompany(compAId);
    const policyB = await getPolicyForCompany(compBId);
    const policyDefault = await getPolicyForCompany(null);

    // Verify isolation
    assert.strictEqual(policyA.minLength, 12, 'Company A minLength must be 12');
    assert.strictEqual(policyA.isDefault, false, 'Company A is not default');
    assert.strictEqual(policyB.minLength, 6, 'Company B minLength must be 6');
    assert.strictEqual(policyB.requireSpecialChar, false, 'Company B does not require special char');
    assert.strictEqual(policyDefault.minLength, 8, 'Default minLength must remain 8');

    // Test a password: 'simple123'
    // Should be valid for Company B (length 9 >= 6, lowercase, number)
    // Should FAIL for Company A (length 9 < 12, missing uppercase, missing special)
    // Should FAIL for Global Default (missing uppercase, missing special)
    const testPassword = 'simple123';
    assert.strictEqual(validatePasswordAgainstPolicy(testPassword, policyB).isValid, true, 'simple123 must pass Company B');
    assert.strictEqual(validatePasswordAgainstPolicy(testPassword, policyA).isValid, false, 'simple123 must fail Company A');
    assert.strictEqual(validatePasswordAgainstPolicy(testPassword, policyDefault).isValid, false, 'simple123 must fail Default');

    // Test a password with spaces: 'Alpha# 12345678'
    // Has length 16, uppercase, lowercase, number, special char, but HAS A SPACE
    const spacePassword = 'Alpha# 12345678';
    assert.strictEqual(validatePasswordAgainstPolicy(spacePassword, policyA).isValid, false, 'Spaces must be rejected by Company A');
    assert.strictEqual(validatePasswordAgainstPolicy(spacePassword, policyB).isValid, true, 'Spaces are allowed by Company B');
  });

  await t.test('3. Cryptographically Secure Compliant Password Generator', async () => {
    const policiesToTest = [
      DEFAULT_PASSWORD_POLICY,
      { minLength: 14, maxLength: 32, requireUppercase: true, requireLowercase: true, requireNumber: true, requireSpecialChar: true, preventSpaces: true },
      { minLength: 6, maxLength: 16, requireUppercase: false, requireLowercase: true, requireNumber: true, requireSpecialChar: false, preventSpaces: true },
      { minLength: 10, maxLength: 20, requireUppercase: true, requireLowercase: false, requireNumber: true, requireSpecialChar: true, preventSpaces: true }
    ];

    for (let i = 0; i < policiesToTest.length; i++) {
      const pol = policiesToTest[i];
      for (let run = 0; run < 10; run++) {
        const generated = generateCompliantPassword(pol);
        const check = validatePasswordAgainstPolicy(generated, pol);
        assert.strictEqual(check.isValid, true, `Generated password "${generated}" must strictly satisfy policy #${i}`);
        assert.ok(generated.length >= (pol.minLength || 8), `Length ${generated.length} must be >= minLength ${pol.minLength}`);
      }
    }
  });

  await t.test('4. Multi-Tenant Authorization Checks', async () => {
    const sysAdminUser = { id: 'U-SYS-1', role: 'SYS_ADMIN', companyId: null };
    const companyAdminUserA = { id: 'U-ADM-A', role: 'COMPANY_ADMIN', companyId: 'COMP-ALPHA-001' };

    // Check helper
    assert.strictEqual(isUserSysAdmin(sysAdminUser), true, 'SysAdmin should be recognized');
    assert.strictEqual(isUserSysAdmin(companyAdminUserA), false, 'Company admin is not SysAdmin');

    // Company Admin attempting to modify Global Default
    let mockReq = {
      user: companyAdminUserA,
      body: { companyId: null, minLength: 10 }
    };
    let mockRes = {
      statusCode: null,
      jsonPayload: null,
      status(c) { this.statusCode = c; return this; },
      json(p) { this.jsonPayload = p; return this; }
    };

    await savePasswordPolicy(mockReq, mockRes);
    assert.strictEqual(mockRes.statusCode, 403, 'Company Admin cannot modify global default');

    // Company Admin attempting to modify Company B's policy
    mockReq = {
      user: companyAdminUserA,
      body: { companyId: 'COMP-BETA-002', minLength: 10 }
    };
    mockRes = {
      statusCode: null,
      jsonPayload: null,
      status(c) { this.statusCode = c; return this; },
      json(p) { this.jsonPayload = p; return this; }
    };

    await savePasswordPolicy(mockReq, mockRes);
    assert.strictEqual(mockRes.statusCode, 403, 'Company Admin cannot modify another company policy');

    // Company Admin modifying their OWN policy
    mockReq = {
      user: companyAdminUserA,
      body: { companyId: 'COMP-ALPHA-001', minLength: 10, requireUppercase: true, requireLowercase: true, requireNumber: true, requireSpecialChar: true, preventSpaces: true }
    };
    mockRes = {
      statusCode: 200,
      jsonPayload: null,
      status(c) { this.statusCode = c; return this; },
      json(p) { this.jsonPayload = p; return this; }
    };

    await savePasswordPolicy(mockReq, mockRes);
    assert.strictEqual(mockRes.jsonPayload?.success, true, 'Company Admin CAN modify their own company policy');
  });

  await t.test('5. Dynamic Regex Pattern Accuracy', async () => {
    const policy = {
      minLength: 8,
      maxLength: 20,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecialChar: true,
      preventSpaces: true
    };
    const regexStr = buildPasswordRegex(policy);
    const regex = new RegExp(regexStr);

    assert.ok(regex.test('StrongPass@1'), 'StrongPass@1 must match regex');
    assert.ok(!regex.test('weakpass@1'), 'Missing uppercase must not match regex');
    assert.ok(!regex.test('STRONGPASS@1'), 'Missing lowercase must not match regex');
    assert.ok(!regex.test('StrongPass@'), 'Missing number must not match regex');
    assert.ok(!regex.test('StrongPass12'), 'Missing special char must not match regex');
    assert.ok(!regex.test('Strong Pass@1'), 'Space must not match regex');
    assert.ok(!regex.test('P@1s'), 'Too short must not match regex');
  });

  await t.test('6. Admin Password Reset (Manual and Generated Compliance)', async () => {
    const compStrictId = 'COMP-STRICT-999';
    await savePolicyForCompany(compStrictId, {
      minLength: 14,
      maxLength: 32,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecialChar: true,
      preventSpaces: true
    });

    const testUser = {
      id: 'USR-TEST-RESET-1',
      username: 'test_strict_user',
      name: 'Test Strict User',
      companyId: compStrictId,
      company: compStrictId
    };
    memoryUsers.push(testUser);

    // 6a. Reset with auto-generated temporary password
    let mockReq = {
      params: { id: testUser.id },
      body: {}
    };
    let mockRes = {
      statusCode: 200,
      jsonPayload: null,
      status(c) { this.statusCode = c; return this; },
      json(p) { this.jsonPayload = p; return this; }
    };

    await resetAdminUserPassword(mockReq, mockRes);
    assert.strictEqual(mockRes.jsonPayload?.success, true);
    const generatedTemp = mockRes.jsonPayload?.tempPassword;
    assert.ok(generatedTemp, 'Must return a generated tempPassword');
    assert.ok(generatedTemp.length >= 14, `Generated temp password "${generatedTemp}" must have length >= 14`);
    const policy = await getPolicyForCompany(compStrictId);
    assert.strictEqual(validatePasswordAgainstPolicy(generatedTemp, policy).isValid, true, 'Generated temp password must satisfy company policy');

    // 6b. Reset with manual temporary password that FAILS company policy (too short)
    mockReq = {
      params: { id: testUser.id },
      body: { password: 'Short@1' }
    };
    mockRes = {
      statusCode: 200,
      jsonPayload: null,
      status(c) { this.statusCode = c; return this; },
      json(p) { this.jsonPayload = p; return this; }
    };

    await resetAdminUserPassword(mockReq, mockRes);
    assert.strictEqual(mockRes.statusCode, 400, 'Manual reset password that violates policy must be rejected with 400');
    assert.ok(mockRes.jsonPayload?.error.includes('requirements'), 'Error message must specify policy failure');

    // 6c. Reset with manual temporary password that PASSES company policy
    mockReq = {
      params: { id: testUser.id },
      body: { password: 'Compliant#Secret2026' }
    };
    mockRes = {
      statusCode: 200,
      jsonPayload: null,
      status(c) { this.statusCode = c; return this; },
      json(p) { this.jsonPayload = p; return this; }
    };

    await resetAdminUserPassword(mockReq, mockRes);
    assert.strictEqual(mockRes.jsonPayload?.success, true);
    assert.strictEqual(mockRes.jsonPayload?.tempPassword, 'Compliant#Secret2026');
  });

});
