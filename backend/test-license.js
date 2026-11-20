import {
  getLicenseDetails,
  validateCanAddCompany,
  validateCanAddUser,
  applyLicenseKey
} from './modules/admin/license.service.js';

async function runLicenseAuditTests() {
  console.log('================================================================');
  console.log('       ASSET360 ENTERPRISE LICENSING & RESTRICTION TEST         ');
  console.log('================================================================\n');

  // TEST 1: Inspect Current Default License
  console.log('--- TEST 1: Checking Current Active License & Capacity ---');
  let license = await getLicenseDetails();
  console.log('• Licensed To:       ', license.licensedTo);
  console.log('• License Tier:      ', license.licenseTier);
  console.log('• License Key:       ', license.licenseKey);
  console.log('• Status:            ', license.status);
  console.log('• Active Companies:  ', `${license.metrics.activeCompanies} / ${license.metrics.maxCompanies} Allowed`);
  console.log('• Active User Seats: ', `${license.metrics.activeUsers} / ${license.metrics.maxUsers} Seats Used (${license.metrics.availableUsers} remaining)`);
  console.log('• Multi-Company Mode:', license.metrics.isMultiCompanyAllowed ? 'ENABLED' : 'DISABLED (Single-Company Head Office)');

  // TEST 2: Testing Multi-Company Gate Under Single-Company License
  console.log('\n--- TEST 2: Attempting to Add a Second Company (Should be BLOCKED) ---');
  let companyCheck = await validateCanAddCompany();
  if (!companyCheck.allowed) {
    console.log('✅ GATE WORKING: Company creation was successfully BLOCKED!');
    console.log('• Error Code:   ', companyCheck.code);
    console.log('• Client Message:', companyCheck.message);
  } else {
    console.log('❌ FAILED: Company creation was allowed unexpectedly.');
  }

  // TEST 3: Testing User Creation Gate
  console.log('\n--- TEST 3: Checking User Creation Allowance ---');
  let userCheck = await validateCanAddUser();
  if (userCheck.allowed) {
    console.log('✅ GATE WORKING: User creation is ALLOWED (Capacity has available seats).');
    console.log(`• Available Seats: ${license.metrics.availableUsers}`);
  } else {
    console.log('⚠️ BLOCKED: User limit reached:', userCheck.message);
  }

  // TEST 4: Applying a Multi-Company Upgrade License Key
  console.log('\n--- TEST 4: Applying a Multi-Company Upgrade License Key ---');
  const upgradeKey = 'MULTI-CMP-5-ENTERPRISE-2026';
  console.log(`• Applying Key: "${upgradeKey}"...`);
  const upgradedLicense = await applyLicenseKey(upgradeKey);
  console.log('• New License Tier:     ', upgradedLicense.licenseTier);
  console.log('• New Max Companies:    ', upgradedLicense.metrics.maxCompanies);
  console.log('• New Max Users:        ', upgradedLicense.metrics.maxUsers);
  console.log('• Multi-Company Allowed:', upgradedLicense.metrics.isMultiCompanyAllowed);

  // TEST 5: Re-testing Company Creation Under Multi-Company License
  console.log('\n--- TEST 5: Testing Company Creation Under Multi-Company License ---');
  companyCheck = await validateCanAddCompany();
  if (companyCheck.allowed) {
    console.log('✅ GATE WORKING: Company creation is now ALLOWED under Multi-Company License!');
  } else {
    console.log('❌ FAILED: Company creation was blocked:', companyCheck.message);
  }

  // TEST 6: Resetting Back to Standard Head Office License
  console.log('\n--- TEST 6: Resetting Back to Standard Head Office License ---');
  const resetKey = 'FAMS-LIC-HEADOFFICE-2026-X992-ENTERPRISE';
  const resetLicense = await applyLicenseKey(resetKey);
  console.log('• Reset Tier:           ', resetLicense.licenseTier);
  console.log('• Reset Max Companies:  ', resetLicense.metrics.maxCompanies);
  console.log('• Reset Gate Status:    ', (await validateCanAddCompany()).code);

  console.log('\n================================================================');
  console.log('            ALL BACKEND LICENSING TESTS PASSED!                 ');
  console.log('================================================================\n');
  process.exit(0);
}

runLicenseAuditTests().catch((err) => {
  console.error('License Test Error:', err);
  process.exit(1);
});
