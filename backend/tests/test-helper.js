import app from '../app.js';
import { connectDB, isDbConnected } from '../config/db.js';
import { seedDynamicAssets } from '../scripts/seed-dynamic-assets.js';

import prisma from '../config/prisma.js';

let server = null;
let baseUrl = '';

export async function setupTestEnvironment() {
  await connectDB();
  if (!isDbConnected()) {
    throw new Error('Database connection failed in test setup');
  }

  // Ensure dynamic seed data is present if table is sparse
  const existingCount = await prisma.asset.count().catch(() => 0);
  if (existingCount < 10) {
    console.log('Seeding initial dynamic test data...');
    await seedDynamicAssets();
  }

  // Start HTTP server on an ephemeral port (port 0)
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`🧪 Test server started on ${baseUrl}`);
      resolve();
    });
  });

  return { baseUrl };
}

export async function teardownTestEnvironment() {
  if (server) {
    server.closeIdleConnections?.();
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
    console.log('🧪 Test server closed.');
  }
}

export async function apiRequest(method, path, body = null, headers = {}) {
  const url = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer demo-admin-token',
      ...headers
    }
  };

  if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const response = await fetch(url, options);
  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return {
    status: response.status,
    ok: response.ok,
    headers: response.headers,
    data
  };
}
