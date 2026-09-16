import prisma from '../../config/prisma.js';

// Initial rich mock providers dataset matching FSD & screenshot specifications
const MOCK_SERVICE_PROVIDERS = [
  {
    id: 'sp-011',
    providerCode: 'SP-011',
    providerName: 'Al Futtaim AMC',
    providerType: 'AMC Provider',
    status: 'Active',
    companyRegistrationNo: 'CN-458712',
    taxRegistrationNo: '100258741200003',
    website: 'www.alfuttaim.com',
    yearEstablished: 2001,
    defaultCurrency: 'AED',
    paymentTermsDays: 30,
    remarks: 'Authorized service provider for HVAC systems across UAE.',
    logoUrl: '/logos/al-futtaim.png',
    preferredProvider: true,
    leadTimeDays: 7,
    rating: 4.0,
    primaryContact: 'Saeed Ahmed',
    designation: 'Account Manager',
    email: 'saeed.ahmed@alfuttaim.com',
    phone: '+971 50 123 4567',
    alternateContact: 'Fatima Noor',
    alternatePhone: '+971 50 765 4321',
    addressLine1: 'Al Futtaim Building, Sheikh Zayed Road',
    addressLine2: 'P.O. Box 12345',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'UAE',
    authorizedCategories: ['HVAC', 'Lifts & Elevators'],
    contacts: [
      { id: 'c1', name: 'Saeed Ahmed', designation: 'Account Manager', email: 'saeed.ahmed@alfuttaim.com', phone: '+971 50 123 4567', isPrimary: true },
      { id: 'c2', name: 'Fatima Noor', designation: 'Service Coordinator', email: 'fatima.noor@alfuttaim.com', phone: '+971 50 765 4321', isPrimary: false }
    ],
    addresses: [
      { id: 'a1', type: 'Headquarters', addressLine1: 'Al Futtaim Building, Sheikh Zayed Road', addressLine2: 'P.O. Box 12345', city: 'Dubai', emirate: 'Dubai', country: 'UAE' }
    ],
    contracts: [
      {
        id: 'cnt-001',
        contractNumber: 'AMC-2026-HVAC-01',
        contractName: 'HVAC Annual Comprehensive Maintenance 2026',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        status: 'Active',
        coverage: 'Full Parts & Labor',
        sla: '2 Hour Emergency Response / 24 Hour Resolution',
        coveredCategories: 'HVAC',
        coveredLocations: 'All Dubai HQ Buildings',
        visitEntitlements: '4 Visits / Year',
        visitsCompleted: '2 / 4 Visits',
        contractValue: 185000,
        currency: 'AED'
      }
    ],
    documents: [
      { id: 'doc-1', name: 'Trade_License_AlFuttaim_2026.pdf', type: 'Trade License', expiryDate: '2026-12-31', fileSize: '2.4 MB', uploadDate: '2026-01-10' },
      { id: 'doc-2', name: 'HVAC_AMC_Contract_Agreement.pdf', type: 'AMC Contract', expiryDate: '2026-12-31', fileSize: '5.1 MB', uploadDate: '2026-01-12' },
      { id: 'doc-3', name: 'Civil_Defense_Safety_Cert.pdf', type: 'Certification', expiryDate: '2027-04-15', fileSize: '1.8 MB', uploadDate: '2026-02-01' }
    ],
    serviceHistory: [
      { id: 'sh-1', workOrderNo: 'WO-2026-0001', assetTag: 'AS-00087', assetName: 'Chiller Unit #1 - Central Plant', type: 'Preventive', executionDate: '2026-06-15', technician: 'Saeed Ahmed', laborHours: 4.5, partsCost: 2400, totalCost: 3850, rating: 5.0, status: 'Completed' },
      { id: 'sh-2', workOrderNo: 'WO-2026-0004', assetTag: 'AS-00091', assetName: 'Main Elevator Shaft B', type: 'Corrective', executionDate: '2026-07-22', technician: 'Tariq Mansoor', laborHours: 6.0, partsCost: 1500, totalCost: 4100, rating: 4.0, status: 'Completed' }
    ],
    notes: [
      { id: 'n-1', text: 'Authorized vendor agreement renewed for 2026 fiscal year.', author: 'John Doe', timestamp: '2026-01-01 10:30 AM' }
    ]
  },
  {
    id: 'sp-002',
    providerCode: 'SP-002',
    providerName: 'Emirates Facilities Management',
    providerType: 'Service Provider',
    status: 'Active',
    companyRegistrationNo: 'CN-892104',
    taxRegistrationNo: '100349812000002',
    website: 'www.emiratesfm.ae',
    yearEstablished: 2005,
    defaultCurrency: 'AED',
    paymentTermsDays: 45,
    remarks: 'Comprehensive MEP facility maintenance contractor.',
    logoUrl: '/logos/efm.png',
    preferredProvider: true,
    leadTimeDays: 5,
    rating: 4.5,
    primaryContact: 'Rashid Al Mansoori',
    designation: 'Operations Director',
    email: 'rashid.m@emiratesfm.ae',
    phone: '+971 52 444 8899',
    alternateContact: 'Khurram Shah',
    alternatePhone: '+971 52 444 8800',
    addressLine1: 'EFM Tower, Business Bay',
    addressLine2: 'Suite 1402',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'UAE',
    authorizedCategories: ['Electrical', 'Mechanical', 'HVAC'],
    contacts: [
      { id: 'c1', name: 'Rashid Al Mansoori', designation: 'Operations Director', email: 'rashid.m@emiratesfm.ae', phone: '+971 52 444 8899', isPrimary: true }
    ],
    addresses: [
      { id: 'a1', type: 'Headquarters', addressLine1: 'EFM Tower, Business Bay', addressLine2: 'Suite 1402', city: 'Dubai', emirate: 'Dubai', country: 'UAE' }
    ],
    contracts: [
      {
        id: 'cnt-002',
        contractNumber: 'AMC-2026-MEP-02',
        contractName: 'Annual Electrical & Mechanical Service Contract',
        startDate: '2026-02-01',
        endDate: '2027-01-31',
        status: 'Active',
        coverage: 'Labor & Emergency Callouts',
        sla: '1 Hour Response for Critical Failures',
        coveredCategories: 'Electrical, Mechanical',
        coveredLocations: 'All UAE Facilities',
        visitEntitlements: '6 Scheduled Visits / Year',
        visitsCompleted: '3 / 6 Visits',
        contractValue: 240000,
        currency: 'AED'
      }
    ],
    documents: [],
    serviceHistory: [
      { id: 'sh-3', workOrderNo: 'WO-2026-0002', assetTag: 'AS-00104', assetName: 'Main Substation Transformer 2', type: 'Breakdown', executionDate: '2026-08-01', technician: 'Khurram Shah', laborHours: 8.0, partsCost: 8500, totalCost: 14500, rating: 4.5, status: 'Completed' }
    ],
    notes: []
  },
  {
    id: 'sp-003',
    providerCode: 'SP-003',
    providerName: 'Schneider Electric Gulf',
    providerType: 'OEM Partner',
    status: 'Active',
    companyRegistrationNo: 'CN-102938',
    taxRegistrationNo: '100492817000001',
    website: 'www.se.com/ae',
    yearEstablished: 1998,
    defaultCurrency: 'AED',
    paymentTermsDays: 30,
    remarks: 'Original equipment manufacturer for UPS and switchgear.',
    logoUrl: '/logos/schneider.png',
    preferredProvider: true,
    leadTimeDays: 14,
    rating: 4.8,
    primaryContact: 'Antoine Dupont',
    designation: 'Technical Support Lead',
    email: 'antoine.dupont@se.com',
    phone: '+971 4 800 7246',
    alternateContact: 'Zayd Al-Hassan',
    alternatePhone: '+971 50 999 1122',
    addressLine1: 'TechnoPark Industrial Zone',
    addressLine2: 'Plot 45-B',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'UAE',
    authorizedCategories: ['IT Equipment', 'Electrical'],
    contacts: [],
    addresses: [],
    contracts: [
      {
        id: 'cnt-003',
        contractNumber: 'AMC-2026-UPS-03',
        contractName: 'Datacenter UPS & Power Infrastructure AMC',
        startDate: '2025-10-01',
        endDate: '2026-09-30',
        status: 'Expiring Soon',
        coverage: 'Full OEM Spare Replacement',
        sla: '4 Hour Onsite SLA',
        coveredCategories: 'IT Equipment',
        coveredLocations: 'Data Center HQ',
        visitEntitlements: '4 Visits / Year',
        visitsCompleted: '3 / 4 Visits',
        contractValue: 95000,
        currency: 'AED'
      }
    ],
    documents: [],
    serviceHistory: [],
    notes: []
  },
  {
    id: 'sp-004',
    providerCode: 'SP-004',
    providerName: 'Otis Elevator Company',
    providerType: 'AMC Provider',
    status: 'Active',
    companyRegistrationNo: 'CN-551920',
    taxRegistrationNo: '100119283000004',
    website: 'www.otis.com',
    yearEstablished: 1976,
    defaultCurrency: 'AED',
    paymentTermsDays: 30,
    remarks: 'OEM manufacturer and maintenance contractor for elevators.',
    logoUrl: '/logos/otis.png',
    preferredProvider: false,
    leadTimeDays: 3,
    rating: 4.2,
    primaryContact: 'Vikram Singh',
    designation: 'Service Manager',
    email: 'vikram.singh@otis.com',
    phone: '+971 4 333 4455',
    alternateContact: '',
    alternatePhone: '',
    addressLine1: 'Oasis Centre Building',
    addressLine2: 'Office 304',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'UAE',
    authorizedCategories: ['Lifts & Elevators'],
    contacts: [],
    addresses: [],
    contracts: [
      {
        id: 'cnt-004',
        contractNumber: 'AMC-2026-LIFT-04',
        contractName: 'Passenger & Freight Elevator Maintenance',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        status: 'Active',
        coverage: 'Monthly Inspections & Emergency Trapped Passenger Response',
        sla: '30 Minute Emergency Response',
        coveredCategories: 'Lifts & Elevators',
        coveredLocations: 'All Blocks',
        visitEntitlements: '12 Visits / Year',
        visitsCompleted: '8 / 12 Visits',
        contractValue: 120000,
        currency: 'AED'
      }
    ],
    documents: [],
    serviceHistory: [],
    notes: []
  },
  {
    id: 'sp-005',
    providerCode: 'SP-005',
    providerName: 'Transguard Security & Fire',
    providerType: 'Service Provider',
    status: 'Active',
    companyRegistrationNo: 'CN-334120',
    taxRegistrationNo: '100887612000009',
    website: 'www.transguardgroup.com',
    yearEstablished: 2002,
    defaultCurrency: 'AED',
    paymentTermsDays: 30,
    remarks: 'Civil Defense certified fire fighting & alarm maintenance provider.',
    logoUrl: '/logos/transguard.png',
    preferredProvider: true,
    leadTimeDays: 2,
    rating: 3.9,
    primaryContact: 'Salem Al Suwaidi',
    designation: 'Safety Compliance Officer',
    email: 'salem.s@transguard.ae',
    phone: '+971 4 600 5000',
    alternateContact: '',
    alternatePhone: '',
    addressLine1: 'Transguard HQ, DAFZA',
    addressLine2: 'Building 6W',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'UAE',
    authorizedCategories: ['Safety Equipment'],
    contacts: [],
    addresses: [],
    contracts: [
      {
        id: 'cnt-005',
        contractNumber: 'AMC-2026-FIRE-05',
        contractName: 'Fire Alarm & Suppression System Certification',
        startDate: '2026-03-01',
        endDate: '2027-02-28',
        status: 'Active',
        coverage: 'Quarterly Audits & Civil Defense Renewal',
        sla: '2 Hour Response',
        coveredCategories: 'Safety Equipment',
        coveredLocations: 'All HQ & Warehouses',
        visitEntitlements: '4 Visits / Year',
        visitsCompleted: '2 / 4 Visits',
        contractValue: 65000,
        currency: 'AED'
      }
    ],
    documents: [],
    serviceHistory: [],
    notes: []
  },
  {
    id: 'sp-006',
    providerCode: 'SP-006',
    providerName: 'Johnson Controls International',
    providerType: 'OEM Partner',
    status: 'Inactive',
    companyRegistrationNo: 'CN-908123',
    taxRegistrationNo: '100771239000005',
    website: 'www.johnsoncontrols.com',
    yearEstablished: 1995,
    defaultCurrency: 'AED',
    paymentTermsDays: 60,
    remarks: 'BMS building automation system vendor.',
    logoUrl: '/logos/johnson.png',
    preferredProvider: false,
    leadTimeDays: 10,
    rating: 4.6,
    primaryContact: 'Marcus Vance',
    designation: 'Regional Account Lead',
    email: 'marcus.vance@jci.com',
    phone: '+971 4 455 9900',
    alternateContact: '',
    alternatePhone: '',
    addressLine1: 'Internet City, Building 3',
    addressLine2: 'Ground Floor',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'UAE',
    authorizedCategories: ['HVAC'],
    contacts: [],
    addresses: [],
    contracts: [],
    documents: [],
    serviceHistory: [],
    notes: []
  }
];

// In-memory runtime array fallback
let serviceProvidersStore = [...MOCK_SERVICE_PROVIDERS];

export async function getServiceProviders(req, res, next) {
  try {
    const { search, type, status, category, preferred } = req.query;

    let filtered = [...serviceProvidersStore];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.providerCode.toLowerCase().includes(q) ||
        p.providerName.toLowerCase().includes(q) ||
        p.primaryContact.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.companyRegistrationNo && p.companyRegistrationNo.toLowerCase().includes(q)) ||
        (p.taxRegistrationNo && p.taxRegistrationNo.toLowerCase().includes(q))
      );
    }

    if (type && type !== 'ALL') {
      filtered = filtered.filter(p => p.providerType === type);
    }

    if (status && status !== 'ALL') {
      filtered = filtered.filter(p => p.status === status);
    }

    if (category && category !== 'ALL') {
      filtered = filtered.filter(p => p.authorizedCategories && p.authorizedCategories.includes(category));
    }

    if (preferred === 'true') {
      filtered = filtered.filter(p => p.preferredProvider === true);
    }

    res.json({
      success: true,
      count: filtered.length,
      providers: filtered
    });
  } catch (err) {
    next(err);
  }
}

export async function getServiceProviderById(req, res, next) {
  try {
    const { id } = req.params;
    const provider = serviceProvidersStore.find(p => p.id === id || p.providerCode === id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Service Provider record not found'
      });
    }

    res.json({
      success: true,
      provider
    });
  } catch (err) {
    next(err);
  }
}

export async function createServiceProvider(req, res, next) {
  try {
    const data = req.body;

    // Mandatory Field Validation per FSD rules:
    if (!data.providerName || !data.providerName.trim()) {
      return res.status(400).json({ success: false, message: 'Provider Name is mandatory.' });
    }
    if (!data.providerType) {
      return res.status(400).json({ success: false, message: 'Provider Type is mandatory.' });
    }
    if (!data.primaryContact || !data.primaryContact.trim()) {
      return res.status(400).json({ success: false, message: 'Primary Contact Name is mandatory.' });
    }
    if (!data.email || !data.email.trim()) {
      return res.status(400).json({ success: false, message: 'Primary Email address is mandatory.' });
    }
    if (!data.phone || !data.phone.trim()) {
      return res.status(400).json({ success: false, message: 'Primary Phone number is mandatory.' });
    }

    // Check Duplicate Identifiers
    const existingName = serviceProvidersStore.find(
      p => p.providerName.toLowerCase() === data.providerName.trim().toLowerCase()
    );
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: `A service provider named "${data.providerName}" already exists.`
      });
    }

    if (data.companyRegistrationNo) {
      const existingReg = serviceProvidersStore.find(
        p => p.companyRegistrationNo && p.companyRegistrationNo === data.companyRegistrationNo.trim()
      );
      if (existingReg) {
        return res.status(400).json({
          success: false,
          message: `Company Registration Number ${data.companyRegistrationNo} is already registered.`
        });
      }
    }

    if (data.taxRegistrationNo) {
      const existingTRN = serviceProvidersStore.find(
        p => p.taxRegistrationNo && p.taxRegistrationNo === data.taxRegistrationNo.trim()
      );
      if (existingTRN) {
        return res.status(400).json({
          success: false,
          message: `Tax Registration Number (TRN) ${data.taxRegistrationNo} is already registered.`
        });
      }
    }

    // Auto-generate code if auto-generate checked or code missing
    let finalCode = data.providerCode;
    if (data.autoGenerateCode || !finalCode || !finalCode.trim()) {
      const nextNum = serviceProvidersStore.length + 12;
      finalCode = `SP-${String(nextNum).padStart(3, '0')}`;
    }

    const newProvider = {
      id: `sp-${Date.now()}`,
      providerCode: finalCode,
      providerName: data.providerName.trim(),
      providerType: data.providerType,
      status: data.status || (data.isDraft ? 'Draft' : 'Active'),
      companyRegistrationNo: data.companyRegistrationNo || '',
      taxRegistrationNo: data.taxRegistrationNo || '',
      website: data.website || '',
      yearEstablished: data.yearEstablished ? parseInt(data.yearEstablished) : null,
      defaultCurrency: data.defaultCurrency || 'AED',
      paymentTermsDays: data.paymentTermsDays ? parseInt(data.paymentTermsDays) : 30,
      remarks: data.remarks || '',
      logoUrl: data.logoUrl || '',
      preferredProvider: Boolean(data.preferredProvider),
      leadTimeDays: data.leadTimeDays ? parseInt(data.leadTimeDays) : 7,
      rating: data.rating || 4.0,
      primaryContact: data.primaryContact.trim(),
      designation: data.designation || '',
      email: data.email.trim(),
      phone: data.phone.trim(),
      alternateContact: data.alternateContact || '',
      alternatePhone: data.alternatePhone || '',
      addressLine1: data.addressLine1 || '',
      addressLine2: data.addressLine2 || '',
      city: data.city || 'Dubai',
      emirate: data.emirate || 'Dubai',
      country: data.country || 'UAE',
      authorizedCategories: data.authorizedCategories || ['HVAC'],
      contacts: data.contacts || [
        { id: `c-${Date.now()}`, name: data.primaryContact, designation: data.designation || 'Account Lead', email: data.email, phone: data.phone, isPrimary: true }
      ],
      addresses: data.addresses || [
        { id: `a-${Date.now()}`, type: 'Headquarters', addressLine1: data.addressLine1 || '', addressLine2: data.addressLine2 || '', city: data.city || 'Dubai', emirate: data.emirate || 'Dubai', country: data.country || 'UAE' }
      ],
      contracts: data.contracts || [],
      documents: data.documents || [],
      serviceHistory: [],
      notes: [
        { id: `n-${Date.now()}`, text: `Provider created as ${data.isDraft ? 'Draft' : 'Active'}.`, author: 'System Admin', timestamp: new Date().toLocaleString() }
      ]
    };

    serviceProvidersStore.unshift(newProvider);

    res.status(201).json({
      success: true,
      message: `Service Provider ${newProvider.providerCode} created successfully!`,
      provider: newProvider
    });
  } catch (err) {
    next(err);
  }
}

export async function updateServiceProvider(req, res, next) {
  try {
    const { id } = req.params;
    const data = req.body;

    const idx = serviceProvidersStore.findIndex(p => p.id === id || p.providerCode === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Service Provider not found' });
    }

    const existing = serviceProvidersStore[idx];

    // Maintain change history note
    const updatedNotes = [...(existing.notes || [])];
    updatedNotes.unshift({
      id: `n-${Date.now()}`,
      text: `Master provider information updated. Status: ${data.status || existing.status}.`,
      author: 'System Admin',
      timestamp: new Date().toLocaleString()
    });

    const updatedProvider = {
      ...existing,
      ...data,
      providerName: data.providerName ? data.providerName.trim() : existing.providerName,
      notes: updatedNotes,
      updatedAt: new Date().toISOString()
    };

    serviceProvidersStore[idx] = updatedProvider;

    res.json({
      success: true,
      message: `Service Provider ${updatedProvider.providerCode} updated successfully.`,
      provider: updatedProvider
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleServiceProviderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Active', 'Inactive', 'Deactivated'

    const idx = serviceProvidersStore.findIndex(p => p.id === id || p.providerCode === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Service Provider not found' });
    }

    const provider = serviceProvidersStore[idx];

    // FSD Enforcement: If provider has historical transactions, deactivate instead of delete!
    const hasHistory = provider.serviceHistory && provider.serviceHistory.length > 0;
    const targetStatus = status || (provider.status === 'Active' ? 'Deactivated' : 'Active');

    provider.status = targetStatus;
    provider.notes.unshift({
      id: `n-${Date.now()}`,
      text: `Provider status changed to ${targetStatus}. ${hasHistory ? '(Preserving historical work orders & AMC references)' : ''}`,
      author: 'System Admin',
      timestamp: new Date().toLocaleString()
    });

    res.json({
      success: true,
      message: `Service Provider ${provider.providerCode} is now ${targetStatus}.`,
      provider
    });
  } catch (err) {
    next(err);
  }
}

export async function addProviderContract(req, res, next) {
  try {
    const { id } = req.params;
    const contractData = req.body;

    const idx = serviceProvidersStore.findIndex(p => p.id === id || p.providerCode === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Service Provider not found' });
    }

    const provider = serviceProvidersStore[idx];

    const newContract = {
      id: `cnt-${Date.now()}`,
      contractNumber: contractData.contractNumber || `AMC-2026-${Date.now().toString().slice(-4)}`,
      contractName: contractData.contractName || 'Service Agreement',
      startDate: contractData.startDate,
      endDate: contractData.endDate,
      status: new Date(contractData.endDate) < new Date() ? 'Expired' : 'Active',
      coverage: contractData.coverage || 'Full Coverage',
      sla: contractData.sla || 'Standard SLA',
      coveredCategories: contractData.coveredCategories || 'All',
      coveredLocations: contractData.coveredLocations || 'All Facilities',
      visitEntitlements: contractData.visitEntitlements || '4 Visits / Year',
      visitsCompleted: contractData.visitsCompleted || '0 / 4 Visits',
      contractValue: parseFloat(contractData.contractValue || 0),
      currency: contractData.currency || 'AED'
    };

    provider.contracts.unshift(newContract);

    res.status(201).json({
      success: true,
      message: `Contract ${newContract.contractNumber} added to provider ${provider.providerName}!`,
      contract: newContract,
      provider
    });
  } catch (err) {
    next(err);
  }
}
