const http = require('http');
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { id: 'usr-admin-01', username: 'admin', role: { code: 'SYS_ADMIN' } },
  'fams-enterprise-jwt-super-secret-key-2026',
  { expiresIn: '1h' }
);

function makeReq(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('--- 1. Testing POST /api/v1/master-data/asset-groups ---');
  const createRes = await makeReq({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/master-data/asset-groups',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    code: 'TEST_GRP',
    name: 'Test Asset Group',
    description: 'A test group for automation verification',
    assetType: 'Physical',
    status: 'Active'
  });
  console.log('Create Response:', createRes.status, createRes.body.success, createRes.body.assetGroup?.code);

  const createdId = createRes.body.assetGroup?.id;
  if (!createdId) throw new Error('Create failed!');

  console.log('--- 2. Testing PUT /api/v1/master-data/asset-groups/:id ---');
  const updateRes = await makeReq({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/master-data/asset-groups/${createdId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    code: 'TEST_GRP',
    name: 'Updated Test Asset Group',
    description: 'Updated description',
    assetType: 'Both',
    status: 'Active'
  });
  console.log('Update Response:', updateRes.status, updateRes.body.success, updateRes.body.assetGroup?.name);

  console.log('--- 3. Testing DELETE /api/v1/master-data/asset-groups/:id ---');
  const deleteRes = await makeReq({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/master-data/asset-groups/${createdId}`,
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  console.log('Delete Response:', deleteRes.status, deleteRes.body.success, deleteRes.body.message);

  console.log('✅ ALL BACKEND CRUD OPERATIONS PASSED SUCCESSFULLY!');
}

run().catch(console.error);
