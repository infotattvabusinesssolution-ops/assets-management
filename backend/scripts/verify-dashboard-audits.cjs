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
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'Password@123' });

  const token = loginRes.data?.token;
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const dashRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/reports/dashboard',
    method: 'GET',
    headers: authHeaders
  });

  console.log('Dashboard KPIs:', JSON.stringify({
    totalAssets: dashRes.data?.kpis?.totalAssets,
    activeAssets: dashRes.data?.kpis?.activeAssets,
    underMaintenance: dashRes.data?.kpis?.underMaintenance,
    totalAssetValue: dashRes.data?.kpis?.totalAssetValue,
    categoryCounts: dashRes.data?.kpis?.categoryCounts?.length,
    statusCounts: dashRes.data?.kpis?.statusCounts
  }, null, 2));

  const auditRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/stocktakes/audit-reports/summary?auditId=AUD-2026-0008',
    method: 'GET',
    headers: authHeaders
  });

  console.log('Audit Report:', JSON.stringify({
    auditInfo: auditRes.data?.data?.auditInfo || auditRes.data?.auditInfo,
    kpis: auditRes.data?.data?.kpis || auditRes.data?.kpis
  }, null, 2));

  const logsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/admin/audit-logs?limit=5',
    method: 'GET',
    headers: authHeaders
  });

  console.log('Audit Logs from DB count:', logsRes.data?.logs?.length, 'total:', logsRes.data?.total);
}

main().catch(console.error);
