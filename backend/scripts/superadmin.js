#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

import readline from 'readline';
import { connectDB, isDbConnected } from '../config/db.js';
import {
  ensureMultiTenantTables,
  provisionCompany,
  listCompaniesSummary,
  updateCompanyLicense,
  resetCompanyAdminPassword,
  getOrCreateSuperAdmin,
  deleteCompanyCascade,
  deactivateCompany,
  reactivateCompany,
  getCompanyDeletionAudit
} from '../modules/admin/superAdmin.service.js';

function ask(rl, question, defaultValue = '') {
  return new Promise((resolve) => {
    const promptText = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
    rl.question(promptText, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const command = args[0] || null;
  const options = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.replace(/^--/, '');
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('--')) {
        options[key] = nextArg;
        i++;
      } else {
        options[key] = true;
      }
    }
  }

  return { command, options };
}

function printHeader() {
  console.log('\n========================================================================');
  console.log('🛡️  ASSET360 MULTI-TENANT ENTERPRISE SUPER ADMINISTRATOR BACKEND CLI');
  console.log('    Provision Companies • Manage Licenses • Configure System Admins');
  console.log('========================================================================\n');
}

async function handleProvisionInteractive(rl) {
  console.log('--- STEP 1: COMPANY REGISTRATION ---');
  const companyName = await ask(rl, 'Company Name (e.g. ABC Technologies)');
  if (!companyName) {
    console.error('❌ Error: Company Name is required.');
    return;
  }

  const defaultCode = companyName.replace(/[^A-Za-z0-9]/g, '').slice(0, 5).toUpperCase();
  const companyCode = await ask(rl, 'Company Code', defaultCode);
  const currency = await ask(rl, 'Base Currency (USD, AED, INR, EUR, etc.)', 'AED');
  const taxId = await ask(rl, 'Tax / VAT ID (optional)', '');

  console.log('\n--- STEP 2: ENTERPRISE LICENSE CONFIGURATION ---');
  const maxUsers = await ask(rl, 'Maximum Users Allowed', '100');
  const maxBranches = await ask(rl, 'Maximum Branches Allowed', '5');
  const expiryDays = await ask(rl, 'License Validity (in days)', '365');
  const branchName = await ask(rl, 'Initial Branch / Location Name', 'Head Office');
  const branchCity = await ask(rl, 'Branch City (e.g. Kolkata, Dubai, etc.)', '');

  console.log('\n--- STEP 3: CLIENT SYSTEM ADMINISTRATOR (GENERATED CREDENTIALS) ---');
  const defaultUsername = `admin_${companyCode.toLowerCase()}`;
  const adminUsername = await ask(rl, 'System Administrator Username', defaultUsername);
  const adminEmail = await ask(rl, 'System Administrator Email', `admin@${companyCode.toLowerCase()}.com`);
  const adminFullName = await ask(rl, 'Administrator Full Name', `${companyName} System Administrator`);
  const adminPassword = await ask(rl, 'Initial Password (leave empty to auto-generate secure password)', '');

  console.log('\n⏳ Provisioning tenant company, license, branches and administrator in database...');

  try {
    const result = await provisionCompany({
      companyName,
      companyCode,
      currency,
      taxId: taxId || null,
      maxUsers: Number(maxUsers) || 100,
      maxBranches: Number(maxBranches) || 5,
      expiryDays: Number(expiryDays) || 365,
      branchName,
      branchCity: branchCity || null,
      adminUsername,
      adminEmail,
      adminFullName,
      adminPassword: adminPassword || null
    });

    printProvisionSuccess(result);
  } catch (err) {
    console.error('\n❌ Provisioning Failed:', err.message);
  }
}

function printProvisionSuccess(result) {
  const { company, license, branch, systemAdmin } = result;
  const expiryStr = license.expiryDate ? new Date(license.expiryDate).toLocaleDateString() : 'Never';

  console.log('\n========================================================================');
  console.log('✅ COMPANY & SYSTEM ADMINISTRATOR PROVISIONED SUCCESSFULLY!');
  console.log('========================================================================');
  console.log(`🏢 Company Name   : ${company.name} (${company.code})`);
  console.log(`🆔 Company ID     : ${company.id}`);
  console.log(`💵 Currency       : ${company.currency}`);
  console.log('------------------------------------------------------------------------');
  console.log(`📜 License Key    : ${license.licenseKey}`);
  console.log(`👥 Licensed Users : Maximum ${license.maxUsers} Users`);
  console.log(`🏢 Branches Limit : Maximum ${license.maxBranches} Branches`);
  console.log(`📅 Expiry Date    : ${expiryStr} (Active: ${license.isActive ? 'YES' : 'NO'})`);
  console.log(`📍 Initial Branch : ${branch.name} (${branch.code || 'Default'})`);
  console.log('------------------------------------------------------------------------');
  console.log('🔑 CLIENT SYSTEM ADMINISTRATOR LOGIN CREDENTIALS:');
  console.log(`   Username       : ${systemAdmin.username}`);
  console.log(`   Email          : ${systemAdmin.email}`);
  console.log(`   Initial Pass   : ${systemAdmin.temporaryPassword}`);
  console.log(`   Status         : Force Password Change on first login (ACTIVE)`);
  console.log(`   Portal URL     : https://asset.milkmen.online/login`);
  console.log('========================================================================');
  console.log('👉 Provide the above credentials to the customer\'s System Administrator.');
  console.log('   They can log into Asset360 and manage all company-specific roles and users.\n');
}

async function handleList() {
  console.log('Fetching registered companies and live licenses...\n');
  const companies = await listCompaniesSummary();

  if (companies.length === 0) {
    console.log('ℹ️ No companies found in database.');
    return;
  }

  console.log(`Found ${companies.length} Registered Companies:\n`);
  companies.forEach((c, idx) => {
    const lic = c.license;
    const admin = c.administrator;
    const expiry = lic.expiryDate ? new Date(lic.expiryDate).toLocaleDateString() : 'N/A';
    const status = lic.isExpired ? '🔴 EXPIRED' : (lic.isActive ? '🟢 ACTIVE' : '⚪ INACTIVE');

    console.log(`[${idx + 1}] ${c.name} (${c.code}) - Status: ${status}`);
    console.log(`    Company ID : ${c.id}`);
    console.log(`    License    : ${lic.licenseKey}`);
    console.log(`    Users      : ${lic.activeUsers} / ${lic.maxUsers} max (${lic.availableUsers} available)`);
    console.log(`    Branches   : ${lic.activeBranches} / ${lic.maxBranches} max (${lic.availableBranches} available)`);
    console.log(`    Expires On : ${expiry}`);
    if (admin) {
      console.log(`    System Admin: ${admin.fullName} (${admin.username} / ${admin.email})`);
    } else {
      console.log(`    System Admin: (None assigned)`);
    }
    console.log('');
  });
}

async function main() {
  printHeader();

  console.log('Connecting to database...');
  await connectDB();

  if (!isDbConnected()) {
    console.error('❌ Error: Could not connect to database. Check DATABASE_URL in .env');
    process.exit(1);
  }

  await ensureMultiTenantTables();
  await getOrCreateSuperAdmin();

  const { command, options } = parseCliArgs();

  // 1. Direct CLI Command: CREATE
  if (command === 'create' || command === 'provision') {
    const name = options.name || options.company;
    const code = options.code;
    const username = options['admin-username'] || options.admin;
    const email = options['admin-email'] || options.email;
    const password = options['admin-password'] || options.password;
    const maxUsers = options['max-users'] || options.users || 100;
    const maxBranches = options['max-branches'] || options.branches || 5;
    const branch = options.branch || 'Head Office';
    const currency = options.currency || 'USD';
    const days = options.days || options['expiry-days'] || 365;

    if (!name || !code || !username || !email) {
      console.error('❌ Missing required parameters.');
      console.log('Usage: node scripts/superadmin.js create --name "Company Name" --code "CODE" --admin-username "admin" --admin-email "admin@example.com" [--admin-password "Pass123"] [--max-users 100] [--max-branches 5]');
      process.exit(1);
    }

    try {
      const result = await provisionCompany({
        companyName: name,
        companyCode: code,
        currency,
        maxUsers: Number(maxUsers),
        maxBranches: Number(maxBranches),
        expiryDays: Number(days),
        branchName: branch,
        adminUsername: username,
        adminEmail: email,
        adminPassword: password || null
      });
      printProvisionSuccess(result);
    } catch (err) {
      console.error('❌ Provisioning failed:', err.message);
      process.exit(1);
    }
    process.exit(0);
  }

  // 2. Direct CLI Command: LIST
  if (command === 'list') {
    await handleList();
    process.exit(0);
  }

  // 3. Direct CLI Command: UPDATE LICENSE
  if (command === 'update-license') {
    const code = options.code || options.company;
    if (!code) {
      console.error('❌ Error: --code is required (e.g. --code ABCT)');
      process.exit(1);
    }
    try {
      const res = await updateCompanyLicense(code, {
        maxUsers: options['max-users'],
        maxBranches: options['max-branches'],
        extendDays: options['extend-days'],
        isActive: options.active !== undefined ? options.active === 'true' || options.active === true : undefined
      });
      console.log('✅ License updated successfully for company:', res.company.name);
      console.log('Updated License Limits:', res.license);
    } catch (err) {
      console.error('❌ Failed updating license:', err.message);
      process.exit(1);
    }
    process.exit(0);
  }

  // 4. Direct CLI Command: RESET ADMIN PASSWORD
  if (command === 'reset-password') {
    const code = options.code || options.company;
    const newPass = options.password || options['new-password'];
    if (!code) {
      console.error('❌ Error: --code is required (e.g. --code ABCT)');
      process.exit(1);
    }
    try {
      const res = await resetCompanyAdminPassword(code, newPass);
      console.log('✅ System Administrator password reset successfully!');
      console.log(`Company       : ${res.company.name}`);
      console.log(`Admin Username: ${res.administrator.username}`);
      console.log(`New Password  : ${res.administrator.temporaryPassword}`);
    } catch (err) {
      console.error('❌ Failed resetting password:', err.message);
      process.exit(1);
    }
    process.exit(0);
  }

  // 5. Direct CLI Command: DELETE / PURGE COMPANY
  if (command === 'delete' || command === 'remove' || command === 'purge') {
    const code = options.code || options.company || options.id;
    const force = options.force === true || options.force === 'true';
    if (!code) {
      console.error('❌ Error: --code is required (e.g. --code ABCT or --code 897)');
      process.exit(1);
    }
    try {
      const audit = await getCompanyDeletionAudit(code);
      if (audit.counts.assets > 0 && !force) {
        console.log(`\n========================================================================`);
        console.log(`⚠️  DEPENDENCY PROTECTION NOTICE`);
        console.log(`========================================================================`);
        console.log(`🏢 Company        : ${audit.company.name} (${audit.company.code})`);
        console.log(`📦 Active Assets  : ${audit.counts.assets}`);
        console.log(`👥 Users/Admins   : ${audit.counts.users}`);
        console.log(`📁 Departments    : ${audit.counts.departments}`);
        console.log(`🏷️ Cost Centers   : ${audit.counts.costCenters}`);
        console.log(`------------------------------------------------------------------------`);
        console.log(`❌ Permanent deletion blocked to protect historical audit & financial trails.`);
        console.log(`👉 Recommended: Run 'node scripts/superadmin.js deactivate --code ${audit.company.code}' to block access safely.`);
        console.log(`👉 Or pass '--force' to permanently destroy all assets and master data.`);
        console.log(`========================================================================\n`);
        process.exit(1);
      }

      const res = await deleteCompanyCascade(code, { force });
      console.log(`\n========================================================================`);
      console.log(`🗑️  COMPANY & ASSOCIATED ENTITIES PERMANENTLY DELETED!`);
      console.log(`========================================================================`);
      console.log(`🏢 Company Name   : ${res.deletedCompany.name} (${res.deletedCompany.code})`);
      console.log(`🆔 Company ID     : ${res.deletedCompany.id}`);
      console.log(`👤 System Admins/Users Deleted : ${res.deletedCounts.users}`);
      console.log(`📍 Branches Deleted            : ${res.deletedCounts.branches}`);
      console.log(`🏢 Sites Deleted               : ${res.deletedCounts.sites}`);
      console.log(`📜 License Removed             : ${res.deletedCounts.hasLicense ? 'YES' : 'NO'}`);
      console.log(`========================================================================\n`);
    } catch (err) {
      console.error('❌ Deletion failed:', err.message);
      process.exit(1);
    }
    process.exit(0);
  }

  // 6. Direct CLI Command: DEACTIVATE / SUSPEND COMPANY
  if (command === 'deactivate' || command === 'suspend') {
    const code = options.code || options.company || options.id;
    if (!code) {
      console.error('❌ Error: --code is required (e.g. --code ABCT)');
      process.exit(1);
    }
    try {
      const res = await deactivateCompany(code);
      console.log(`✅ Company "${res.company.name}" (${res.company.code}) and all its licenses, branches, and user credentials deactivated.`);
    } catch (err) {
      console.error('❌ Deactivation failed:', err.message);
      process.exit(1);
    }
    process.exit(0);
  }

  // 7. Direct CLI Command: REACTIVATE COMPANY
  if (command === 'reactivate' || command === 'activate') {
    const code = options.code || options.company || options.id;
    if (!code) {
      console.error('❌ Error: --code is required (e.g. --code ABCT)');
      process.exit(1);
    }
    try {
      const res = await reactivateCompany(code);
      console.log(`✅ Company "${res.company.name}" (${res.company.code}) and all its licenses, branches, and user credentials reactivated.`);
    } catch (err) {
      console.error('❌ Reactivation failed:', err.message);
      process.exit(1);
    }
    process.exit(0);
  }

  // 8. Interactive Mode (Default when no subcommands)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  while (true) {
    console.log('\nSelect an operation:');
    console.log('1. Provision New Company & Client System Administrator');
    console.log('2. List All Companies & Licenses');
    console.log('3. Update / Extend Company License');
    console.log('4. Reset Client System Administrator Password');
    console.log('5. Delete Company & All Associated Data (License, Branches, Admin)');
    console.log('6. Deactivate / Suspend Company & License');
    console.log('7. Reactivate Company & License');
    console.log('8. Exit');

    const choice = await ask(rl, 'Enter option (1-8)');

    if (choice === '1') {
      await handleProvisionInteractive(rl);
    } else if (choice === '2') {
      await handleList();
    } else if (choice === '3') {
      const code = await ask(rl, 'Enter Company Code to update (e.g. ABCT)');
      const maxUsers = await ask(rl, 'New Max Users (leave empty to keep unchanged)', '');
      const maxBranches = await ask(rl, 'New Max Branches (leave empty to keep unchanged)', '');
      const extendDays = await ask(rl, 'Extend validity by days (e.g. 365, leave empty to skip)', '');
      try {
        const res = await updateCompanyLicense(code, {
          maxUsers: maxUsers ? Number(maxUsers) : undefined,
          maxBranches: maxBranches ? Number(maxBranches) : undefined,
          extendDays: extendDays ? Number(extendDays) : undefined
        });
        console.log('✅ License updated successfully:', res);
      } catch (e) {
        console.error('❌ Error:', e.message);
      }
    } else if (choice === '4') {
      const code = await ask(rl, 'Enter Company Code');
      const pass = await ask(rl, 'New Temporary Password (leave empty to auto-generate)', '');
      try {
        const res = await resetCompanyAdminPassword(code, pass);
        console.log('✅ Admin Password Reset:');
        console.log(`   Username : ${res.administrator.username}`);
        console.log(`   Password : ${res.administrator.temporaryPassword}`);
      } catch (e) {
        console.error('❌ Error:', e.message);
      }
    } else if (choice === '5') {
      const code = await ask(rl, 'Enter Company Code or ID to DELETE (e.g. 897, ABCT)');
      if (!code) {
        console.log('⚠️ Operation cancelled: No company code provided.');
        continue;
      }
      try {
        const audit = await getCompanyDeletionAudit(code);
        console.log(`\n========================================================================`);
        console.log(`🔍 COMPANY AUDIT & DEPENDENCY INSPECTION`);
        console.log(`========================================================================`);
        console.log(`🏢 Company Name   : ${audit.company.name} (${audit.company.code})`);
        console.log(`🆔 Company ID     : ${audit.company.id}`);
        console.log(`📦 Active Assets  : ${audit.counts.assets}`);
        console.log(`👥 Users/Admins   : ${audit.counts.users}`);
        console.log(`📍 Branches       : ${audit.counts.branches}`);
        console.log(`📁 Departments    : ${audit.counts.departments}`);
        console.log(`🏷️ Cost Centers   : ${audit.counts.costCenters}`);
        console.log(`👤 Employees      : ${audit.counts.employees}`);
        if (audit.externalUsers.length > 0) {
          const extUsers = audit.externalUsers.map(u => `${u.username} (${u.company?.code || 'External'})`).join(', ');
          console.log(`⚠️ External Users Linked to this Company's master data: ${extUsers}`);
        }
        console.log(`------------------------------------------------------------------------`);

        if (audit.counts.assets > 0) {
          console.log(`⚠️ ATTENTION: This company has ${audit.counts.assets} active asset(s)!`);
          console.log(`👉 Enterprise Recommendation: Use Option 6 (Deactivate / Suspend) instead`);
          console.log(`   to disable access while preserving historical and financial audit trails.`);
          console.log(`------------------------------------------------------------------------`);
          const confirm = await ask(rl, `If you still want to destroy all data and permanently purge this company, type 'FORCE PURGE'`);
          if (confirm === 'FORCE PURGE') {
            const res = await deleteCompanyCascade(code, { force: true });
            console.log(`\n========================================================================`);
            console.log(`🗑️  COMPANY & ASSOCIATED ENTITIES PERMANENTLY PURGED!`);
            console.log(`========================================================================`);
            console.log(`🏢 Company Name   : ${res.deletedCompany.name} (${res.deletedCompany.code})`);
            console.log(`👤 Users Deleted  : ${res.deletedCounts.users}`);
            console.log(`📍 Branches Deleted: ${res.deletedCounts.branches}`);
            console.log(`========================================================================\n`);
          } else {
            console.log('❌ Deletion cancelled.');
          }
        } else {
          console.log(`ℹ️ This company has 0 assets (Safe Empty / Test Tenant).`);
          const confirm = await ask(rl, `Permanently delete company, license, branches, and admin credentials? (type 'yes' to confirm)`);
          if (confirm.toLowerCase() === 'yes' || confirm === 'DELETE') {
            const res = await deleteCompanyCascade(code, { force: true });
            console.log(`\n========================================================================`);
            console.log(`🗑️  COMPANY & ASSOCIATED ENTITIES PERMANENTLY DELETED!`);
            console.log(`========================================================================`);
            console.log(`🏢 Company Name   : ${res.deletedCompany.name} (${res.deletedCompany.code})`);
            console.log(`👤 Users Deleted  : ${res.deletedCounts.users}`);
            console.log(`📍 Branches Deleted: ${res.deletedCounts.branches}`);
            console.log(`📜 License Removed: ${res.deletedCounts.hasLicense ? 'YES' : 'NO'}`);
            console.log(`========================================================================\n`);
          } else {
            console.log('❌ Deletion cancelled.');
          }
        }
      } catch (e) {
        console.error('❌ Deletion Error:', e.message);
      }
    } else if (choice === '6') {
      const code = await ask(rl, 'Enter Company Code or ID to Deactivate (e.g. 897, ABCT)');
      if (!code) {
        console.log('⚠️ Operation cancelled: No company code provided.');
        continue;
      }
      try {
        const res = await deactivateCompany(code);
        console.log(`✅ Company "${res.company.name}" (${res.company.code}) and its license deactivated successfully!`);
      } catch (e) {
        console.error('❌ Error:', e.message);
      }
    } else if (choice === '7') {
      const code = await ask(rl, 'Enter Company Code or ID to Reactivate (e.g. 897, ABCT)');
      if (!code) {
        console.log('⚠️ Operation cancelled: No company code provided.');
        continue;
      }
      try {
        const res = await reactivateCompany(code);
        console.log(`✅ Company "${res.company.name}" (${res.company.code}) and its license reactivated successfully!`);
      } catch (e) {
        console.error('❌ Error:', e.message);
      }
    } else if (choice === '8' || choice.toLowerCase() === 'exit') {
      console.log('👋 Goodbye!');
      rl.close();
      process.exit(0);
    } else {
      console.log('Invalid option. Please enter 1 to 8.');
    }
  }
}

main().catch(err => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
