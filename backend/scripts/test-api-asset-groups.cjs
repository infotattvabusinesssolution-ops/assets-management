const http = require('http');
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { id: 'usr-admin-01', username: 'admin', role: { code: 'SYS_ADMIN' } },
  'fams-enterprise-jwt-super-secret-key-2026',
  { expiresIn: '1h' }
);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/master-data/asset-groups?includeInactive=true',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`HTTP Status: ${res.statusCode}`);
    try {
      const json = JSON.parse(data);
      console.log('Result count:', json.assetGroups ? json.assetGroups.length : 'none');
      if (json.assetGroups) {
        console.log('First group:', json.assetGroups[0].code, json.assetGroups[0].name);
      } else {
        console.log('Response body:', data);
      }
    } catch (e) {
      console.log('Raw output:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.end();
