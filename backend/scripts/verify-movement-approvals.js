// Exercises the approval page against the running API using the three bulk sample assets.
const base = process.env.APPROVAL_API_URL || 'http://localhost:5000/api/v1';
const token = process.env.APPROVAL_API_TOKEN || 'demo-check';

async function request(method, path, body, textResponse = false) {
  const response = await fetch(`${base}${path}`, {
    method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const result = textResponse ? await response.text() : await response.json();
  if (!response.ok || (!textResponse && result.success === false)) {
    throw new Error(`${method} ${path}: ${response.status} ${JSON.stringify(result)}`);
  }
  return result;
}

async function makeTransfer(assetCode, suffix) {
  const detail = await request('GET', `/assets/${assetCode}/360`);
  const asset = detail.asset360.asset;
  const result = await request('POST', '/custody-transfers/movement-records', {
    assetIds: [asset.id], toSiteId: asset.siteId, transferType: 'Location Transfer',
    reason: `Movement approval verification ${suffix}`, requiresApproval: true
  });
  if (result.transfer.status !== 'PENDING_APPROVAL') throw new Error('Transfer did not enter approval queue.');
  return { id: result.transfer.id, assetId: asset.id, siteId: asset.siteId };
}

async function verifyStatus(id, expected) {
  const result = await request('GET', `/movement-approvals/${id}`);
  if (result.request.status !== expected) throw new Error(`Expected ${expected}, got ${result.request.status}`);
  if (!result.request.history?.length) throw new Error('Approval history was not recorded.');
}

const monitor = 'AST-BULK-20261010-02';
const rejected = await makeTransfer(monitor, 'reject');
await request('POST', `/movement-approvals/${rejected.id}/decision`, {
  decision: 'REJECT', comments: 'Verification rejection', notifyRequester: true
});
await verifyStatus(rejected.id, 'Rejected');

const changes = await makeTransfer(monitor, 'changes');
await request('POST', `/movement-approvals/${changes.id}/decision`, {
  decision: 'REQUEST_CHANGES', comments: 'Verification needs revised reason', notifyRequester: true
});
await verifyStatus(changes.id, 'Changes Requested');

const approved = await makeTransfer(monitor, 'approve');
await request('POST', `/movement-approvals/${approved.id}/decision`, { decision: 'APPROVE', comments: 'Verified' });
await verifyStatus(approved.id, 'Approved');
const beforeReceipt = await request('GET', `/assets/${monitor}/360`);
if (beforeReceipt.asset360.asset.siteId !== approved.siteId) throw new Error('Approval changed Asset Master before receipt.');
await request('PUT', `/custody-transfers/movement-records/${approved.id}/status`, { action: 'CONFIRM_RECEIPT' });
await verifyStatus(approved.id, 'Completed');

const first = await makeTransfer('AST-BULK-20261010-01', 'bulk one');
const second = await makeTransfer('AST-BULK-20261010-03', 'bulk two');
const bulk = await request('POST', '/movement-approvals/bulk-decision', {
  requestIds: [first.id, second.id], decision: 'REJECT', comments: 'Bulk verification cleanup'
});
if (bulk.processed !== 2 || bulk.failed) throw new Error(`Bulk action failed: ${JSON.stringify(bulk)}`);
await verifyStatus(first.id, 'Rejected');
await verifyStatus(second.id, 'Rejected');

const filtered = await request('GET', `/movement-approvals?status=Rejected&search=${encodeURIComponent(monitor)}&limit=100`);
if (!filtered.requests.some(item => item.id === rejected.id)) throw new Error('Search/filter did not return the rejected test request.');
const csv = await request('POST', '/movement-approvals/export', { status: 'Rejected' }, true);
if (!csv.includes('Request ID') || !csv.includes('AST-BULK-20261010-02')) {
  throw new Error('CSV export did not contain approval records.');
}
const kpis = await request('GET', '/movement-approvals/kpis');
console.log(JSON.stringify({ rejected: rejected.id, changesRequested: changes.id,
  approvedAndReceived: approved.id, bulkProcessed: bulk.processed,
  filteredCount: filtered.pagination.totalRecords, csvBytes: csv.length, kpis: kpis.data }));
