const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  console.log('Testing Live Backend Endpoints...');

  // 1. Login with database user 'admin' / 'Password@123'
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'Password@123' });

  console.log('1. Login response status:', loginRes.status, 'Success:', loginRes.data?.success);
  const token = loginRes.data?.token;
  if (!token) throw new Error('No token returned from login: ' + JSON.stringify(loginRes.data));

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 2. Test /api/v1/assets
  const assetsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/assets?limit=5',
    method: 'GET',
    headers: authHeaders
  });
  console.log('2. Assets API count:', assetsRes.data?.assets?.length, 'total:', assetsRes.data?.pagination?.total || assetsRes.data?.total);

  // 3. Test /api/v1/reports/dashboard
  const dashRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/reports/dashboard',
    method: 'GET',
    headers: authHeaders
  });
  console.log('3. Dashboard KPIs totalAssets:', dashRes.data?.totalAssets, 'activeAssets:', dashRes.data?.activeAssets, 'categories:', dashRes.data?.categoryCounts?.length);

  // 4. Test /api/v1/movements/history
  const historyRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/movements/history',
    method: 'GET',
    headers: authHeaders
  });
  console.log('4. Movements History total:', historyRes.data?.total, 'rows:', historyRes.data?.history?.length);

  // 5. Test /api/v1/movement-approvals
  const approvalsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/movement-approvals',
    method: 'GET',
    headers: authHeaders
  });
  console.log('5. Movement Approvals total:', approvalsRes.data?.requests?.length || approvalsRes.data?.pendingApprovals?.length);

  // 6. Test /api/v1/admin/users
  const usersRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/admin/users',
    method: 'GET',
    headers: authHeaders
  });
  console.log('6. Admin Users total:', usersRes.data?.total, 'users returned:', usersRes.data?.users?.length);

  // 7. Test /api/v1/stocktakes/audit-reports/AUD-2026-0008
  const auditRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/stocktakes/audit-reports/AUD-2026-0008',
    method: 'GET',
    headers: authHeaders
  });
  console.log('7. Audit Report summary title:', auditRes.data?.auditInfo?.auditName, 'totalAssets:', auditRes.data?.kpis?.totalAssets);
}

main().catch(console.error);
