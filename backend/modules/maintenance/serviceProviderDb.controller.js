import { randomUUID } from 'node:crypto';
import prisma from '../../config/prisma.js';

const scope = req => req.dataScopeFilter?.companyId ? { companyId: req.dataScopeFilter.companyId } : {};
const actor = req => req.user?.fullName || req.user?.username || 'System User';
const trim = value => String(value ?? '').trim();
const include = { categories: true, contacts: true, addresses: true, services: true, certifications: true, documents: true, notes: { orderBy: { createdAt: 'desc' } } };
const models = { categories: 'providerCategory', contacts: 'providerContact', addresses: 'providerAddress', services: 'providerService', certifications: 'providerCertification', documents: 'providerDocument', notes: 'providerNote' };
const fail = (res, message, status = 400) => res.status(status).json({ success: false, message });
const find = req => prisma.serviceProvider.findFirst({ where: { OR: [{ id: req.params.id }, { providerCode: req.params.id }], ...scope(req) }, include });
async function coveredAssetIds(req, res) {
  if (!Array.isArray(req.body.assetIds)) return null;
  const ids = [...new Set(req.body.assetIds.map(String))];
  const count = await prisma.asset.count({ where: { id: { in: ids }, ...req.dataScopeFilter } });
  if (count !== ids.length) { fail(res, 'Some assets are unavailable or outside your access scope.'); return false; }
  return ids;
}

function master(body, old = {}) {
  const data = {
    providerName: trim(body.providerName ?? old.providerName), providerType: trim(body.providerType ?? old.providerType) || 'SERVICE_PROVIDER',
    status: trim(body.status ?? old.status) || 'DRAFT', companyRegistrationNo: trim(body.companyRegistrationNo ?? old.companyRegistrationNo) || null,
    taxRegistrationNo: trim(body.taxRegistrationNo ?? old.taxRegistrationNo) || null, website: trim(body.website ?? old.website) || null,
    currency: trim(body.currency ?? old.currency) || 'AED', paymentTermsDays: Number(body.paymentTermsDays ?? old.paymentTermsDays ?? 30),
    preferred: Boolean(body.preferred ?? old.preferred), leadTimeDays: Number(body.leadTimeDays ?? old.leadTimeDays ?? 7),
    rating: body.rating === '' ? null : Number(body.rating ?? old.rating) || null, remarks: trim(body.remarks ?? old.remarks) || null,
    legacyDetails: body.legacyDetails === undefined ? old.legacyDetails ?? null : body.legacyDetails === null ? null : JSON.stringify(body.legacyDetails),
    primaryContact: trim(body.primaryContact ?? old.primaryContact) || null, email: trim(body.email ?? old.email) || null,
    phone: trim(body.phone ?? old.phone) || null, addressLine1: trim(body.addressLine1 ?? old.addressLine1) || null,
    addressLine2: trim(body.addressLine2 ?? old.addressLine2) || null, city: trim(body.city ?? old.city) || null,
    state: trim(body.state ?? old.state) || null, country: trim(body.country ?? old.country) || null
  };
  if (!data.providerName) return { error: 'Provider name is required.' };
  if (!['DRAFT', 'ACTIVE', 'INACTIVE'].includes(data.status)) return { error: 'Choose Draft, Active, or Inactive.' };
  if (data.status === 'ACTIVE' && (!data.primaryContact || !data.email || !data.phone)) return { error: 'Active providers need a contact, email, and phone.' };
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { error: 'Enter a valid email address.' };
  if (!Number.isInteger(data.paymentTermsDays) || data.paymentTermsDays < 0 || data.paymentTermsDays > 365 || !Number.isInteger(data.leadTimeDays) || data.leadTimeDays < 0 || data.leadTimeDays > 365) return { error: 'Payment terms and lead time must be 0 to 365 days.' };
  return { data };
}

function child(section, body, req) {
  if (section === 'categories') return body.categoryId ? { data: { categoryId: body.categoryId, serviceType: trim(body.serviceType) || 'PREVENTIVE', coverageSiteId: body.coverageSiteId || null, description: trim(body.description) || null, active: body.active !== false } } : { error: 'Select an asset category.' };
  if (section === 'contacts') return trim(body.name) ? { data: { name: trim(body.name), designation: trim(body.designation) || null, email: trim(body.email) || null, phone: trim(body.phone) || null, mobile: trim(body.mobile) || null, isPrimary: Boolean(body.isPrimary) } } : { error: 'Contact name is required.' };
  if (section === 'addresses') return trim(body.line1) ? { data: { type: trim(body.type) || 'HEAD_OFFICE', line1: trim(body.line1), line2: trim(body.line2) || null, city: trim(body.city) || null, state: trim(body.state) || null, country: trim(body.country) || null, postalCode: trim(body.postalCode) || null } } : { error: 'Address line 1 is required.' };
  if (section === 'services') {
    if (!trim(body.name) || !trim(body.serviceCode)) return { error: 'Service name and code are required.' };
    const responseHours = body.responseHours === '' || body.responseHours == null ? null : Number(body.responseHours);
    const rate = body.rate === '' || body.rate == null ? null : Number(body.rate);
    if ((responseHours !== null && (!Number.isInteger(responseHours) || responseHours < 0)) || (rate !== null && (!Number.isFinite(rate) || rate < 0))) return { error: 'Enter valid response hours and rate.' };
    return { data: { name: trim(body.name), serviceCode: trim(body.serviceCode), responseHours, rate, active: body.active !== false } };
  }
  if (section === 'certifications') {
    if (!trim(body.name)) return { error: 'Certification name is required.' };
    const validUntil = body.validUntil ? new Date(body.validUntil) : null;
    if (validUntil && Number.isNaN(validUntil.getTime())) return { error: 'Enter a valid certification expiry date.' };
    return { data: { name: trim(body.name), certificateNumber: trim(body.certificateNumber) || null, issuingAuthority: trim(body.issuingAuthority) || null, validUntil } };
  }
  if (section === 'documents') {
    if (!trim(body.name) || !trim(body.storageUrl)) return { error: 'Upload a file and enter its name.' };
    const validUntil = body.validUntil ? new Date(body.validUntil) : null;
    if (validUntil && Number.isNaN(validUntil.getTime())) return { error: 'Enter a valid document expiry date.' };
    const issueDate = body.issueDate ? new Date(body.issueDate) : null;
    if (issueDate && Number.isNaN(issueDate.getTime())) return { error: 'Enter a valid document issue date.' };
    const fileSize = body.fileSize == null ? null : Number(body.fileSize);
    if (fileSize != null && (!Number.isInteger(fileSize) || fileSize < 0)) return { error: 'Enter a valid file size.' };
    return { data: { name: trim(body.name), type: trim(body.type) || 'OTHER', referenceNumber: trim(body.referenceNumber) || null, issueDate, validUntil, description: trim(body.description) || null, fileSize, storageUrl: trim(body.storageUrl) } };
  }
  if (section === 'notes') return trim(body.text) ? { data: { text: trim(body.text), authorName: actor(req) } } : { error: 'Enter a note.' };
  return { error: 'Unknown provider section.' };
}

export async function getServiceProviders(req, res, next) {
  try {
    const where = { ...scope(req) };
    if (req.query.search) where.OR = [{ providerName: { contains: String(req.query.search) } }, { providerCode: { contains: String(req.query.search) } }];
    if (req.query.type && req.query.type !== 'ALL') where.providerType = String(req.query.type);
    if (req.query.status && req.query.status !== 'ALL') where.status = String(req.query.status);
    const providers = await prisma.serviceProvider.findMany({ where, orderBy: { providerName: 'asc' } });
    res.json({ success: true, count: providers.length, providers });
  } catch (error) { next(error); }
}

export async function getServiceProviderById(req, res, next) {
  try {
    const provider = await find(req);
    if (!provider) return fail(res, 'Provider not found.', 404);
    const [contracts, serviceHistory] = await Promise.all([
      prisma.contract.findMany({ where: { providerName: provider.providerName }, orderBy: { endDate: 'desc' }, include: { coveredAssets: { include: { asset: { select: { id: true, assetId: true, description: true } } } } } }),
      prisma.maintenanceWorkOrder.findMany({ where: { asset: { is: req.dataScopeFilter || {} }, OR: [{ vendorId: provider.id }, { vendorName: provider.providerName }] }, include: { asset: { select: { assetId: true, description: true, category: { select: { name: true } }, site: { select: { name: true } } } }, assignedTechnician: { select: { fullName: true } } }, orderBy: { createdAt: 'desc' } })
    ]);
    res.json({ success: true, provider: { ...provider, contracts, serviceHistory } });
  } catch (error) { next(error); }
}

export async function createServiceProvider(req, res, next) {
  try {
    const parsed = master(req.body);
    if (parsed.error) return fail(res, parsed.error);
    if (await prisma.serviceProvider.findFirst({ where: { providerName: parsed.data.providerName, ...scope(req) } })) return fail(res, 'A provider with this name already exists.', 409);
    const requestedCode = req.body.autoGenerateCode === false ? trim(req.body.providerCode) : '';
    if (req.body.autoGenerateCode === false && !requestedCode) return fail(res, 'Provider code is required when automatic generation is off.');
    if (requestedCode && await prisma.serviceProvider.findUnique({ where: { providerCode: requestedCode } })) return fail(res, 'Provider code already exists.', 409);
    const provider = await prisma.serviceProvider.create({ data: { ...parsed.data, companyId: scope(req).companyId || req.user?.companyId || null, providerCode: requestedCode || 'SP-' + new Date().getUTCFullYear() + '-' + randomUUID().slice(0, 8).toUpperCase(), notes: { create: { text: 'Provider created', authorName: actor(req) } } } });
    res.status(201).json({ success: true, provider });
  } catch (error) { next(error); }
}

export async function updateServiceProvider(req, res, next) {
  try {
    const old = await find(req);
    if (!old) return fail(res, 'Provider not found.', 404);
    const parsed = master(req.body, old);
    if (parsed.error) return fail(res, parsed.error);
    if (parsed.data.providerName !== old.providerName) {
      const [contracts, workOrders] = await Promise.all([
        prisma.contract.count({ where: { providerName: old.providerName } }),
        prisma.maintenanceWorkOrder.count({ where: { vendorName: old.providerName } })
      ]);
      if (contracts || workOrders) return fail(res, 'This provider has linked contracts or work orders. Keep its name so those records remain connected.', 409);
    }
    if (await prisma.serviceProvider.findFirst({ where: { providerName: parsed.data.providerName, id: { not: old.id }, ...scope(req) } })) return fail(res, 'A provider with this name already exists.', 409);
    const requestedCode = req.body.autoGenerateCode === false ? trim(req.body.providerCode) : old.providerCode;
    if (!requestedCode) return fail(res, 'Provider code is required.');
    if (requestedCode !== old.providerCode && await prisma.serviceProvider.findUnique({ where: { providerCode: requestedCode } })) return fail(res, 'Provider code already exists.', 409);
    const provider = await prisma.serviceProvider.update({ where: { id: old.id }, data: { ...parsed.data, providerCode: requestedCode, notes: { create: { text: 'Provider information updated', authorName: actor(req) } } } });
    res.json({ success: true, provider });
  } catch (error) { next(error); }
}

export async function toggleServiceProviderStatus(req, res, next) {
  try {
    const old = await find(req);
    if (!old) return fail(res, 'Provider not found.', 404);
    const status = old.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const parsed = master({ status }, old);
    if (parsed.error) return fail(res, parsed.error);
    const provider = await prisma.serviceProvider.update({ where: { id: old.id }, data: { status, notes: { create: { text: 'Status changed to ' + status, authorName: actor(req) } } } });
    res.json({ success: true, provider });
  } catch (error) { next(error); }
}

export async function saveProviderChild(req, res, next) {
  try {
    const provider = await find(req);
    if (!provider) return fail(res, 'Provider not found.', 404);
    const section = req.params.section;
    if (!models[section]) return fail(res, 'Unknown provider section.', 404);
    const parsed = child(section, req.body, req);
    if (parsed.error) return fail(res, parsed.error);
    if (section === 'categories') {
      if (!await prisma.category.findUnique({ where: { id: parsed.data.categoryId } })) return fail(res, 'Asset category not found.');
      if (parsed.data.coverageSiteId && !await prisma.site.findUnique({ where: { id: parsed.data.coverageSiteId } })) return fail(res, 'Site not found.');
    }
    const model = prisma[models[section]];
    const old = req.params.itemId ? await model.findFirst({ where: { id: req.params.itemId, providerId: provider.id } }) : null;
    if (req.params.itemId && !old) return fail(res, 'Item not found.', 404);
    const item = old ? await model.update({ where: { id: old.id }, data: parsed.data }) : await model.create({ data: { ...parsed.data, providerId: provider.id } });
    if (section === 'contacts' && parsed.data.isPrimary) {
      await prisma.providerContact.updateMany({ where: { providerId: provider.id, id: { not: item.id } }, data: { isPrimary: false } });
      await prisma.serviceProvider.update({ where: { id: provider.id }, data: { primaryContact: item.name, email: item.email, phone: item.phone } });
    }
    if (section === 'addresses' && parsed.data.type === 'HEAD_OFFICE') {
      await prisma.serviceProvider.update({ where: { id: provider.id }, data: { addressLine1: item.line1, addressLine2: item.line2, city: item.city, state: item.state, country: item.country } });
    }
    res.status(old ? 200 : 201).json({ success: true, item });
  } catch (error) { next(error); }
}

export async function deleteProviderChild(req, res, next) {
  try {
    const provider = await find(req);
    if (!provider) return fail(res, 'Provider not found.', 404);
    const section = req.params.section;
    if (!models[section]) return fail(res, 'Unknown provider section.', 404);
    const model = prisma[models[section]];
    const item = await model.findFirst({ where: { id: req.params.itemId, providerId: provider.id } });
    if (!item) return fail(res, 'Item not found.', 404);
    await model.delete({ where: { id: item.id } });
    res.json({ success: true });
  } catch (error) { next(error); }
}

export async function addProviderContract(req, res, next) {
  try {
    const provider = await find(req);
    if (!provider) return fail(res, 'Provider not found.', 404);
    const { contractNumber, title, contractType, startDate, endDate, cost, slaDetails } = req.body;
    if (!trim(contractNumber) || !trim(title)) return fail(res, 'Contract number and title are required.');
    const start = new Date(startDate), end = new Date(endDate), amount = Number(cost || 0);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start || !Number.isFinite(amount) || amount < 0) return fail(res, 'Enter valid dates and value. End date must follow start date.');
    const paymentTermsDays = req.body.paymentTermsDays === '' || req.body.paymentTermsDays == null ? null : Number(req.body.paymentTermsDays);
    if (paymentTermsDays != null && (!Number.isInteger(paymentTermsDays) || paymentTermsDays < 0 || paymentTermsDays > 365)) return fail(res, 'Payment terms must be 0 to 365 days.');
    const assetIds = await coveredAssetIds(req, res);
    if (assetIds === false) return;
    const contract = await prisma.$transaction(async tx => {
      const created = await tx.contract.create({ data: { contractNumber: trim(contractNumber), title: trim(title), contractType: trim(contractType) || 'ANNUAL_MAINTENANCE', providerName: provider.providerName, startDate: start, endDate: end, cost: amount, slaDetails: trim(slaDetails) || null, active: req.body.active === undefined ? true : Boolean(req.body.active), referenceNumber: trim(req.body.referenceNumber) || null, paymentTermsDays, currency: trim(req.body.currency) || 'AED', coverageNotes: trim(req.body.coverageNotes) || null, visitEntitlements: trim(req.body.visitEntitlements) || null } });
      if (assetIds?.length) await tx.contractAsset.createMany({ data: assetIds.map(assetId => ({ contractId: created.id, assetId })) });
      return created;
    });
    res.status(201).json({ success: true, contract });
  } catch (error) { next(error); }
}

export async function updateProviderContract(req, res, next) {
  try {
    const provider = await find(req);
    if (!provider) return fail(res, 'Provider not found.', 404);
    const old = await prisma.contract.findFirst({ where: { id: req.params.contractId, providerName: provider.providerName } });
    if (!old) return fail(res, 'Contract not found.', 404);
    const start = req.body.startDate ? new Date(req.body.startDate) : old.startDate;
    const end = req.body.endDate ? new Date(req.body.endDate) : old.endDate;
    const cost = Number(req.body.cost ?? old.cost);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start || !Number.isFinite(cost) || cost < 0) return fail(res, 'Enter valid dates and value. End date must follow start date.');
    const paymentTermsDays = req.body.paymentTermsDays === '' ? null : req.body.paymentTermsDays == null ? old.paymentTermsDays : Number(req.body.paymentTermsDays);
    if (paymentTermsDays != null && (!Number.isInteger(paymentTermsDays) || paymentTermsDays < 0 || paymentTermsDays > 365)) return fail(res, 'Payment terms must be 0 to 365 days.');
    const assetIds = await coveredAssetIds(req, res);
    if (assetIds === false) return;
    const contract = await prisma.$transaction(async tx => {
      const updated = await tx.contract.update({ where: { id: old.id }, data: { title: trim(req.body.title ?? old.title), contractType: trim(req.body.contractType ?? old.contractType), startDate: start, endDate: end, cost, slaDetails: trim(req.body.slaDetails ?? old.slaDetails) || null, active: req.body.active === undefined ? old.active : Boolean(req.body.active), referenceNumber: trim(req.body.referenceNumber ?? old.referenceNumber) || null, paymentTermsDays, currency: trim(req.body.currency ?? old.currency) || 'AED', coverageNotes: trim(req.body.coverageNotes ?? old.coverageNotes) || null, visitEntitlements: trim(req.body.visitEntitlements ?? old.visitEntitlements) || null } });
      if (assetIds) {
        await tx.contractAsset.deleteMany({ where: { contractId: old.id } });
        if (assetIds.length) await tx.contractAsset.createMany({ data: assetIds.map(assetId => ({ contractId: old.id, assetId })) });
      }
      return updated;
    });
    res.json({ success: true, contract });
  } catch (error) { next(error); }
}

export async function saveProviderContractCoverage(req, res, next) {
  try {
    const provider = await find(req);
    if (!provider) return fail(res, 'Provider not found.', 404);
    const contract = await prisma.contract.findFirst({ where: { id: req.params.contractId, providerName: provider.providerName } });
    if (!contract) return fail(res, 'Contract not found.', 404);
    if (!Array.isArray(req.body.assetIds)) return fail(res, 'Select a list of assets.');
    const assetIds = [...new Set(req.body.assetIds.map(String))];
    const count = await prisma.asset.count({ where: { id: { in: assetIds }, ...req.dataScopeFilter } });
    if (count !== assetIds.length) return fail(res, 'Some assets are unavailable or outside your access scope.');
    await prisma.$transaction(async tx => {
      await tx.contractAsset.deleteMany({ where: { contractId: contract.id } });
      if (assetIds.length) await tx.contractAsset.createMany({ data: assetIds.map(assetId => ({ contractId: contract.id, assetId })) });
    });
    res.json({ success: true, coveredAssets: assetIds.length });
  } catch (error) { next(error); }
}

export async function deleteProviderContract(req, res, next) {
  try {
    const provider = await find(req);
    if (!provider) return fail(res, 'Provider not found.', 404);
    const contract = await prisma.contract.findFirst({ where: { id: req.params.contractId, providerName: provider.providerName } });
    if (!contract) return fail(res, 'Contract not found.', 404);
    await prisma.$transaction(async tx => {
      await tx.contractAsset.deleteMany({ where: { contractId: contract.id } });
      await tx.contract.delete({ where: { id: contract.id } });
    });
    res.json({ success: true });
  } catch (error) { next(error); }
}
