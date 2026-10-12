const base = process.env.APPROVAL_API_URL || 'http://localhost:5000/api/v1';
const token = process.env.APPROVAL_API_TOKEN || 'demo-check';
const auth = { Authorization: `Bearer ${token}` };
async function json(method, path, data) {
  const response = await fetch(base + path, { method,
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined });
  const body = await response.json();
  if (!response.ok || body.success === false) throw new Error(`${path}: ${response.status} ${JSON.stringify(body)}`);
  return body;
}
const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL0lQAAAABJRU5ErkJggg==', 'base64');
const form = new FormData();
form.append('files', new Blob([image], { type: 'image/png' }), 'approval-verification.png');
form.append('folder', 'movement_approvals');
const uploadResponse = await fetch(base + '/uploads/files', { method: 'POST', headers: auth, body: form });
const upload = await uploadResponse.json();
if (!uploadResponse.ok || !upload.files?.[0]?.url) throw new Error(`Upload failed: ${JSON.stringify(upload)}`);
const asset = (await json('GET', '/assets/AST-BULK-20261010-02/360')).asset360.asset;
const created = await json('POST', '/custody-transfers/movement-records', {
  assetIds: [asset.id], toSiteId: asset.siteId, transferType: 'Location Transfer',
  reason: 'Approval attachment verification', requiresApproval: true
});
const transferId = created.transfer.id;
await json('POST', `/movement-approvals/${transferId}/decision`, {
  decision: 'REJECT', comments: 'Attachment verification cleanup',
  attachments: [{ name: upload.files[0].name, size: upload.files[0].size,
    url: upload.files[0].url, publicId: upload.files[0].public_id,
    type: upload.files[0].format }]
});
const detail = await json('GET', `/movement-approvals/${transferId}`);
if (!detail.request.supportingDocuments?.some(document => document.name === 'approval-verification.png' && document.url === upload.files[0].url)) {
  throw new Error('Uploaded attachment was not linked to the approval request.');
}
console.log(JSON.stringify({ transferId, status: detail.request.status,
  attachedDocuments: detail.request.supportingDocuments.length }));
