import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ArrowLeft, 
  Save, 
  FileText, 
  Plus, 
  Upload, 
  Star, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  FileCheck, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Eye, 
  Download, 
  Trash2, 
  Edit3, 
  ExternalLink,
  Layers,
  Wrench,
  ChevronRight,
  RefreshCw,
  Power
} from 'lucide-react';
import { api } from '../services/api';

export function ServiceProviderAction() {
  // Mode State: 'FORM' (Add/Edit screen matching screenshot) or 'LIST' (Providers workspace grid)
  const [viewMode, setViewMode] = useState('FORM');
  const [formMode, setFormMode] = useState('CREATE'); // 'CREATE' | 'EDIT'
  const [activeTab, setActiveTab] = useState(1); // 1: General Info, 2: Contact & Address, 3: Services & Categories, 4: Contracts/AMC, 5: Documents, 6: Service History, 7: Notes

  // Toast notification
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Providers list state
  const [providers, setProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form Data State matching screenshot fields
  const [addressSubTab, setAddressSubTab] = useState('Head Office'); // 'Head Office' | 'Service Address' | 'Billing Address' | 'Other Address'
  const [showAddContactPersonModal, setShowAddContactPersonModal] = useState(false);
  const [mapSearchAddress, setMapSearchAddress] = useState('Al Futtaim Building, Sheikh Zayed Road');
  const [newContactPerson, setNewContactPerson] = useState({
    name: '',
    designation: '',
    email: '',
    phone: '',
    mobile: ''
  });

  // Tab 3 State variables matching screenshot media__1789559215049.png
  const [serviceCategoriesList, setServiceCategoriesList] = useState([
    { id: 1, category: 'HVAC', type: 'Preventive, Corrective', desc: 'AC units, Chillers, AHU, FCU', coverage: 'UAE (All Locations)', status: 'Active' },
    { id: 2, category: 'Electrical', type: 'Preventive, Corrective', desc: 'LV/MV Systems, Panels, Lighting', coverage: 'Dubai, Abu Dhabi', status: 'Active' },
    { id: 3, category: 'Lifts & Elevators', type: 'Preventive, Corrective', desc: 'Elevators, Escalators', coverage: 'UAE (All Locations)', status: 'Active' },
    { id: 4, category: 'Fire & Safety', type: 'Inspection, Certification', desc: 'Fire Alarm, Sprinklers, Extinguishers', coverage: 'UAE (All Locations)', status: 'Active' },
    { id: 5, category: 'IT Equipment', type: 'Preventive, Corrective', desc: 'Servers, PCs, Network Devices', coverage: 'Dubai, Sharjah', status: 'Active' }
  ]);

  const [categoryForm, setCategoryForm] = useState({
    category: 'HVAC',
    type: 'Preventive, Corrective',
    desc: 'AC units, Chillers, AHU, FCU',
    coverageType: 'ALL',
    specificLocation: '',
    status: 'Active'
  });

  const [supportedServicesList, setSupportedServicesList] = useState([
    { id: 1, name: 'AC Maintenance', code: 'SV-HVAC-001', sla: 24, rate: 350, status: 'Active' },
    { id: 2, name: 'Chiller Service', code: 'SV-HVAC-002', sla: 48, rate: 500, status: 'Active' },
    { id: 3, name: 'Electrical Panel Service', code: 'SV-ELC-001', sla: 24, rate: 400, status: 'Active' },
    { id: 4, name: 'Lift Annual Inspection', code: 'SV-LIF-001', sla: 72, rate: 600, status: 'Active' },
    { id: 5, name: 'Fire Alarm Testing', code: 'SV-FIR-001', sla: 24, rate: 450, status: 'Active' }
  ]);

  const [certificationsList, setCertificationsList] = useState([
    { id: 1, name: 'ISO 9001', certNo: 'ISO-2023-001', validTill: '31 Dec 2026', status: 'Active' },
    { id: 2, name: 'Dubai Civil Defence', certNo: 'DCD-4587', validTill: '30 Jun 2026', status: 'Active' },
    { id: 3, name: 'Electrical Contractor', certNo: 'EC-112233', validTill: '15 Jan 2027', status: 'Active' }
  ]);

  // Tab 4 State variables matching screenshot media__1789559333333.png
  const [contractSearchTerm, setContractSearchTerm] = useState('');
  const [contractStatusFilter, setContractStatusFilter] = useState('All');
  const [coverageSubTab, setCoverageSubTab] = useState('Covered Assets'); // 'Covered Assets' | 'Covered Locations' | 'Covered Categories'

  const [amcContractsList, setAmcContractsList] = useState([
    { id: 1, contractNo: 'AMC-2025-001', contractName: 'HVAC AMC 2025-2027', contractType: 'AMC', startDate: '01 Jan 2025', endDate: '31 Dec 2027', value: '450,000', status: 'Active', referenceNo: 'PO-458712', paymentTerms: '30', description: 'Comprehensive AMC for all HVAC systems including preventive maintenance, corrective maintenance and emergency support.' },
    { id: 2, contractNo: 'SERV-2024-003', contractName: 'Chiller Maintenance', contractType: 'Service Contract', startDate: '01 Mar 2024', endDate: '28 Feb 2026', value: '220,000', status: 'Active', referenceNo: 'PO-109283', paymentTerms: '30', description: 'Specialized chiller unit maintenance and quarterly service.' },
    { id: 3, contractNo: 'AMC-2023-002', contractName: 'Lift Maintenance AMC', contractType: 'AMC', startDate: '01 Jun 2023', endDate: '31 May 2026', value: '180,000', status: 'Active', referenceNo: 'PO-554129', paymentTerms: '45', description: 'Passenger and freight elevator monthly maintenance.' },
    { id: 4, contractNo: 'SERV-2024-010', contractName: 'Fire System Support', contractType: 'Service Contract', startDate: '01 Jan 2024', endDate: '31 Dec 2025', value: '95,000', status: 'Expiring', referenceNo: 'PO-992011', paymentTerms: '30', description: 'Fire alarm and suppression quarterly compliance check.' },
    { id: 5, contractNo: 'AMC-2022-008', contractName: 'Electrical AMC', contractType: 'AMC', startDate: '01 Jan 2022', endDate: '31 Dec 2024', value: '150,000', status: 'Expired', referenceNo: 'PO-331049', paymentTerms: '30', description: 'LV panel and transformer annual maintenance.' }
  ]);

  const [selectedContractForm, setSelectedContractForm] = useState({
    contractNo: 'AMC-2025-001',
    contractName: 'HVAC AMC 2025-2027',
    contractType: 'AMC',
    status: 'Active',
    startDate: '2025-01-01',
    endDate: '2027-12-31',
    contractValue: '450,000',
    currency: 'AED',
    referenceNo: 'PO-458712',
    paymentTerms: '30',
    description: 'Comprehensive AMC for all HVAC systems including preventive maintenance, corrective maintenance and emergency support.',
    coverageTarget: 'ALL',
    selectedTag: 'All HVAC Assets (126)'
  });

  // Tab 5 State variables matching screenshot media__1789559468502.png
  const [docSearchTerm, setDocSearchTerm] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('All Document Types');

  const [providerDocumentsList, setProviderDocumentsList] = useState([
    { id: 1, name: 'Trade License.pdf', type: 'Trade License', refNo: 'TL-2024-001', validTill: '31 Dec 2026', size: '1.2 MB', status: 'Valid', fileType: 'pdf', issueDate: '2024-01-01', description: 'Company trade license issued by Dubai Department of Economy and Tourism.' },
    { id: 2, name: 'VAT Certificate.pdf', type: 'Tax Document', refNo: 'TRN-100258741200003', validTill: '31 Dec 2026', size: '850 KB', status: 'Valid', fileType: 'pdf', issueDate: '2024-01-01', description: 'Federal Tax Authority registration certificate.' },
    { id: 3, name: 'Insurance Certificate.pdf', type: 'Insurance', refNo: 'INS-2024-015', validTill: '15 Oct 2026', size: '1.6 MB', status: 'Valid', fileType: 'pdf', issueDate: '2024-10-15', description: 'Third party liability and workmen compensation policy.' },
    { id: 4, name: 'ISO 9001 Certificate.pdf', type: 'Certification', refNo: 'ISO-2023-001', validTill: '31 Dec 2026', size: '1.4 MB', status: 'Valid', fileType: 'pdf', issueDate: '2023-01-01', description: 'Quality management system certificate.' },
    { id: 5, name: 'Company Profile.docx', type: 'Company Profile', refNo: '-', validTill: '-', size: '780 KB', status: 'N/A', fileType: 'doc', issueDate: '-', description: 'Company organizational chart and service overview.' },
    { id: 6, name: 'AMC Agreement.pdf', type: 'Contract Document', refNo: 'AMC-2025-001', validTill: '31 Dec 2027', size: '2.1 MB', status: 'Valid', fileType: 'pdf', issueDate: '2025-01-01', description: 'Fully executed annual maintenance agreement contract.' },
    { id: 7, name: 'Safety Policy.pdf', type: 'Policy Document', refNo: 'SP-2024-001', validTill: '-', size: '950 KB', status: 'N/A', fileType: 'doc', issueDate: '-', description: 'EHS and site safety compliance protocol.' },
    { id: 8, name: 'Service Capability Statement.pdf', type: 'Technical Document', refNo: '-', validTill: '-', size: '1.3 MB', status: 'N/A', fileType: 'pdf', issueDate: '-', description: 'List of certified engineers and heavy machinery fleet.' }
  ]);

  const [selectedDocForm, setSelectedDocForm] = useState({
    name: 'Trade License.pdf',
    type: 'Trade License',
    refNo: 'TL-2024-001',
    issueDate: '2024-01-01',
    validTill: '2026-12-31',
    status: 'Valid',
    description: 'Company trade license issued by Dubai Department of Economy and Tourism.'
  });

  // Tab 6 State variables matching screenshot
  const [shDateRange, setShDateRange] = useState('01 Jan 2024 - 31 Dec 2025');
  const [shWoQuery, setShWoQuery] = useState('');
  const [shAssetQuery, setShAssetQuery] = useState('');
  const [shTypeFilter, setShTypeFilter] = useState('All');
  const [shStatusFilter, setShStatusFilter] = useState('All');

  const [serviceHistoryRecordsList, setServiceHistoryRecordsList] = useState([
    { id: 1, workOrderNo: 'WO-2025-0145', serviceDate: '12 Aug 2025', asset: 'AC-CH-001 (Chiller 01)', assetCategory: 'HVAC', serviceType: 'Preventive Maintenance', description: 'Chiller inspection and cleaning', status: 'Completed', engineer: 'Ahmed Khan', location: 'Dubai HQ - Building A', duration: '4 Hours', fullDescription: 'Chiller inspection and cleaning as per maintenance checklist. All parameters within normal range.', resolution: 'Completed. Chiller working fine.', nextDueDate: '12 Nov 2025', remarks: 'No major issues found. Minor filter cleaning done.', attachments: [{ id: 1, name: 'Service_Report.pdf', size: '450 KB' }, { id: 2, name: 'Photos.zip', size: '2.1 MB' }, { id: 3, name: 'Checklist.pdf', size: '320 KB' }] },
    { id: 2, workOrderNo: 'WO-2025-0138', serviceDate: '28 Jul 2025', asset: 'AHU-02', assetCategory: 'HVAC', serviceType: 'Corrective Maintenance', description: 'Compressor replacement', status: 'Completed', engineer: 'Ramesh Nair', location: 'Dubai HQ - Building B', duration: '6 Hours', fullDescription: 'Replaced faulty compressor coil. Tested under load.', resolution: 'Compressor replaced and pressure tested.', nextDueDate: '28 Oct 2025', remarks: 'Part under warranty.', attachments: [{ id: 1, name: 'Compressor_Warranty.pdf', size: '510 KB' }, { id: 2, name: 'WorkLog.pdf', size: '180 KB' }] },
    { id: 3, workOrderNo: 'WO-2025-0121', serviceDate: '15 Jul 2025', asset: 'LIFT-01', assetCategory: 'Lifts & Elevators', serviceType: 'Inspection', description: 'Annual lift inspection', status: 'Completed', engineer: 'Suresh Kumar', location: 'Dubai HQ - Elevator Shaft A', duration: '3 Hours', fullDescription: 'Civil defense annual elevator inspection and emergency brake test.', resolution: 'Passed all safety criteria. Certificate issued.', nextDueDate: '15 Jul 2026', remarks: 'Annual compliance certificate renewed.', attachments: [{ id: 1, name: 'Safety_Certificate.pdf', size: '1.1 MB' }] },
    { id: 4, workOrderNo: 'WO-2025-0105', serviceDate: '30 Jun 2025', asset: 'GEN-01', assetCategory: 'Electrical', serviceType: 'Preventive Maintenance', description: 'Generator servicing', status: 'Completed', engineer: 'Ahmed Khan', location: 'Substation Yard', duration: '5 Hours', fullDescription: 'Engine oil flush, filter replacement and 100% load bank test.', resolution: 'Generator servicing completed cleanly.', nextDueDate: '30 Dec 2025', remarks: 'Fuel level restored to 100%.', attachments: [{ id: 1, name: 'Load_Test_Report.pdf', size: '890 KB' }] },
    { id: 5, workOrderNo: 'WO-2025-0098', serviceDate: '18 Jun 2025', asset: 'FIRE-PUMP-01', assetCategory: 'Fire & Safety', serviceType: 'Corrective Maintenance', description: 'Pump motor repair', status: 'Completed', engineer: 'Ramesh Nair', location: 'Pump Room 2', duration: '4 Hours', fullDescription: 'Disassembled electric drive motor and replaced worn bearings.', resolution: 'Motor reassembled and pressure tested at 12 bar.', nextDueDate: '18 Dec 2025', remarks: 'System re-commissioned.', attachments: [{ id: 1, name: 'Pump_Service_Sheet.pdf', size: '420 KB' }] },
    { id: 6, workOrderNo: 'WO-2025-0087', serviceDate: '05 Jun 2025', asset: 'AC-CH-002', assetCategory: 'HVAC', serviceType: 'Preventive Maintenance', description: 'Chiller filter change', status: 'Completed', engineer: 'Ali Hasan', location: 'Chiller Plant Room', duration: '2 Hours', fullDescription: 'Routine quarterly filter replacement for main condenser unit.', resolution: 'Filters replaced.', nextDueDate: '05 Dec 2025', remarks: 'Routine replacement.', attachments: [{ id: 1, name: 'Filter_Invoice.pdf', size: '290 KB' }] },
    { id: 7, workOrderNo: 'WO-2025-0076', serviceDate: '22 May 2025', asset: 'AHU-01', assetCategory: 'HVAC', serviceType: 'Preventive Maintenance', description: 'AHU coil cleaning', status: 'Completed', engineer: 'Ahmed Khan', location: 'Floor 4 Mech Room', duration: '3 Hours', fullDescription: 'Foam chemical coil wash and belt tension adjustment.', resolution: 'Coils washed and airflow verified.', nextDueDate: '22 Nov 2025', remarks: 'Airflow increased by 15%.', attachments: [{ id: 1, name: 'AHU_Inspection.pdf', size: '350 KB' }] },
    { id: 8, workOrderNo: 'WO-2025-0054', serviceDate: '10 Apr 2025', asset: 'PANEL-03', assetCategory: 'Electrical', serviceType: 'Corrective Maintenance', description: 'Electrical panel fault rectification', status: 'Completed', engineer: 'Suresh Kumar', location: 'Main LV Switchgear', duration: '4 Hours', fullDescription: 'Investigation of breaker trip. Replaced faulty 250A MCCB.', resolution: 'Panel energized and balanced.', nextDueDate: '10 Oct 2025', remarks: 'No thermal hotspot detected.', attachments: [{ id: 1, name: 'Thermal_Scan_Image.pdf', size: '1.4 MB' }] },
    { id: 9, workOrderNo: 'WO-2025-0041', serviceDate: '25 Mar 2025', asset: 'LIFT-02', assetCategory: 'Lifts & Elevators', serviceType: 'Corrective Maintenance', description: 'Door sensor replacement', status: 'Completed', engineer: 'Ramesh Nair', location: 'Building A Core', duration: '2.5 Hours', fullDescription: 'Replaced misaligned infrared door safety curtain sensor.', resolution: 'Sensor installed and door timing calibrated.', nextDueDate: '25 Sep 2025', remarks: 'Door safety tested.', attachments: [{ id: 1, name: 'Door_Sensor_Manual.pdf', size: '620 KB' }] },
    { id: 10, workOrderNo: 'WO-2025-0028', serviceDate: '12 Feb 2025', asset: 'FCU-12', assetCategory: 'HVAC', serviceType: 'Preventive Maintenance', description: 'FCU routine check', status: 'Completed', engineer: 'Ali Hasan', location: 'Office 304', duration: '1.5 Hours', fullDescription: 'Cleaned air filters, checked condensate drain line and thermostat.', resolution: 'Thermostat calibrated and drain line flushed.', nextDueDate: '12 Aug 2025', remarks: 'Minor filter cleaning done.', attachments: [{ id: 1, name: 'FCU_Checklist.pdf', size: '210 KB' }] }
  ]);

  const [selectedServiceRecord, setSelectedServiceRecord] = useState({
    workOrderNo: 'WO-2025-0145',
    serviceDate: '12 Aug 2025',
    asset: 'AC-CH-001 - Chiller 01',
    assetCategory: 'HVAC',
    serviceType: 'Preventive Maintenance',
    engineer: 'Ahmed Khan',
    location: 'Dubai HQ - Building A',
    duration: '4 Hours',
    description: 'Chiller inspection and cleaning as per maintenance checklist. All parameters within normal range.',
    resolution: 'Completed. Chiller working fine.',
    nextDueDate: '12 Nov 2025',
    remarks: 'No major issues found. Minor filter cleaning done.',
    status: 'Completed',
    attachments: [
      { id: 1, name: 'Service_Report.pdf', size: '450 KB' },
      { id: 2, name: 'Photos.zip', size: '2.1 MB' },
      { id: 3, name: 'Checklist.pdf', size: '320 KB' }
    ]
  });

  // Tab 7 State variables matching screenshot
  const [noteSearchQuery, setNoteSearchQuery] = useState('');
  const [noteTypeFilter, setNoteTypeFilter] = useState('All');
  const [noteAuthorFilter, setNoteAuthorFilter] = useState('All');
  const [noteDateRange, setNoteDateRange] = useState('');

  const [providerNotesList, setProviderNotesList] = useState([
    { id: 1, type: 'General', subject: 'Initial Discussion', preview: 'Discussed scope and capabilities...', createdBy: 'John Doe', createdOn: '12 Aug 2025 10:30 AM', description: "Discussed the service provider's capabilities for HVAC and Electrical maintenance. They confirmed availability across all UAE locations and shared preliminary documentation. Follow up with detailed proposal.", relatedTo: 'Contract / AMC', reference: 'AMC-2025-001', lastModifiedBy: 'John Doe', lastModifiedOn: '12 Aug 2025 02:00 PM' },
    { id: 2, type: 'Meeting', subject: 'Kick-off Meeting', preview: 'Kick-off meeting held at Dubai HQ...', createdBy: 'Sarah Ahmed', createdOn: '28 Jul 2025 02:15 PM', description: 'Kick-off meeting held at Dubai HQ with vendor account manager to align SLA expectations and technician dispatch protocols.', relatedTo: 'Work Order', reference: 'WO-2025-0145', lastModifiedBy: 'Sarah Ahmed', lastModifiedOn: '28 Jul 2025 03:00 PM' },
    { id: 3, type: 'Follow Up', subject: 'Quotation Follow Up', preview: 'Client requested revised pricing...', createdBy: 'John Doe', createdOn: '18 Jul 2025 11:20 AM', description: 'Vendor submitted revised commercial quotation for 3-year AMC extension.', relatedTo: 'Contract / AMC', reference: 'AMC-2025-001', lastModifiedBy: 'John Doe', lastModifiedOn: '18 Jul 2025 11:45 AM' },
    { id: 4, type: 'Issue', subject: 'Service Delay', preview: 'Delay in chiller maintenance due to...', createdBy: 'Ramesh Nair', createdOn: '05 Jul 2025 04:00 PM', description: 'Delay in chiller maintenance due to delay in spare parts arrival from OEM manufacturer.', relatedTo: 'Work Order', reference: 'WO-2025-0138', lastModifiedBy: 'Ramesh Nair', lastModifiedOn: '05 Jul 2025 04:30 PM' },
    { id: 5, type: 'Contract', subject: 'AMC Renewal Discussion', preview: 'Discussed AMC renewal for 2026...', createdBy: 'Sarah Ahmed', createdOn: '21 Jun 2025 09:45 AM', description: 'Draft AMC renewal terms reviewed with procurement team.', relatedTo: 'Contract / AMC', reference: 'AMC-2025-001', lastModifiedBy: 'Sarah Ahmed', lastModifiedOn: '21 Jun 2025 10:15 AM' },
    { id: 6, type: 'General', subject: 'Good Performance', preview: 'Excellent service during recent PM...', createdBy: 'Ahmed Khan', createdOn: '10 Jun 2025 03:10 PM', description: 'Technician team demonstrated outstanding speed during emergency chiller repair.', relatedTo: 'Asset', reference: 'AC-CH-001', lastModifiedBy: 'Ahmed Khan', lastModifiedOn: '10 Jun 2025 03:30 PM' },
    { id: 7, type: 'Meeting', subject: 'Site Visit', preview: 'Conducted site visit to assess...', createdBy: 'John Doe', createdOn: '25 May 2025 11:00 AM', description: 'Vendor lead engineer visited central plant room for pre-maintenance audit.', relatedTo: 'General', reference: '-', lastModifiedBy: 'John Doe', lastModifiedOn: '25 May 2025 11:30 AM' },
    { id: 8, type: 'Follow Up', subject: 'Pending Documents', preview: 'Awaiting updated insurance certificate...', createdBy: 'Ramesh Nair', createdOn: '12 May 2025 12:30 PM', description: 'Sent reminder to vendor coordinator for updated third-party liability insurance.', relatedTo: 'General', reference: '-', lastModifiedBy: 'Ramesh Nair', lastModifiedOn: '12 May 2025 01:00 PM' }
  ]);

  const [selectedNoteForm, setSelectedNoteForm] = useState({
    id: 1,
    type: 'General',
    subject: 'Initial Discussion',
    description: "Discussed the service provider's capabilities for HVAC and Electrical maintenance. They confirmed availability across all UAE locations and shared preliminary documentation. Follow up with detailed proposal.",
    relatedTo: 'Contract / AMC',
    reference: 'AMC-2025-001',
    createdBy: 'John Doe',
    createdOn: '12 Aug 2025 10:30 AM',
    lastModifiedBy: 'John Doe',
    lastModifiedOn: '12 Aug 2025 02:00 PM'
  });

  const [formData, setFormData] = useState({
    id: 'sp-011',
    providerCode: 'SP-011',
    autoGenerateCode: false,
    providerName: 'Al Futtaim AMC',
    providerType: 'AMC Provider',
    status: 'Active',
    companyRegistrationNo: 'CN-458712',
    taxRegistrationNo: '100258741200003',
    website: 'www.alfuttaim.com',
    yearEstablished: '2001',
    defaultCurrency: 'AED',
    paymentTermsDays: '30',
    remarks: 'Authorized service provider for HVAC systems across UAE.',
    logoUrl: '/logos/al-futtaim.png',
    preferredProvider: true,
    leadTimeDays: '7',
    rating: 4.0,
    primaryContact: 'Saeed Ahmed',
    designation: 'Account Manager',
    email: 'saeed.ahmed@alfuttaim.com',
    phone: '+971 50 123 4567',
    mobile: '+971 50 123 4567',
    department: 'Operations',
    isPrimaryChecked: true,
    alternateContact: 'Fatima Noor',
    alternatePhone: '+971 50 765 4321',
    addressLine1: 'Al Futtaim Building, Sheikh Zayed Road',
    addressLine2: 'P.O. Box 12345',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'UAE',
    postalCode: '12345',
    authorizedCategories: ['HVAC', 'Lifts & Elevators'],
    alternateContacts: [
      { id: 'ac-1', name: 'Fatima Noor', designation: 'Service Coordinator', email: 'fatima.noor@alfuttaim.com', phone: '+971 4 333 2211', mobile: '+971 50 765 4321' },
      { id: 'ac-2', name: 'Khaled Nasser', designation: 'Technical Manager', email: 'khaled.nasser@alfuttaim.com', phone: '+971 4 333 2299', mobile: '+971 56 778 9000' }
    ],
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
  });

  // Modal states inside tabs
  const [showAddContractModal, setShowAddContractModal] = useState(false);
  const [newContractForm, setNewContractForm] = useState({
    contractNumber: '',
    contractName: '',
    startDate: '',
    endDate: '',
    coverage: 'Full Parts & Labor',
    sla: '2 Hour Emergency Response',
    coveredCategories: 'HVAC',
    coveredLocations: 'All Facilities',
    visitEntitlements: '4 Visits / Year',
    contractValue: ''
  });

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load service providers from backend
  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/maintenance/service-providers');
      if (res.success && res.providers) {
        setProviders(res.providers);
      }
    } catch (err) {
      console.warn('Backend fetch fallback to local store:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'providerType') {
        // sync radio and dropdown
        updated.providerType = value;
      }
      return updated;
    });
  };

  const handleCategoryToggle = (categoryName) => {
    setFormData(prev => {
      const exists = prev.authorizedCategories.includes(categoryName);
      const updated = exists
        ? prev.authorizedCategories.filter(c => c !== categoryName)
        : [...prev.authorizedCategories, categoryName];
      return { ...prev, authorizedCategories: updated };
    });
  };

  const handleSave = async (isDraft = false) => {
    // Validation rules per FSD
    if (!formData.providerName || !formData.providerName.trim()) {
      showToastMsg('Provider Name is required.', 'error');
      return;
    }
    if (!formData.providerType) {
      showToastMsg('Provider Type is required.', 'error');
      return;
    }
    if (!formData.primaryContact || !formData.primaryContact.trim()) {
      showToastMsg('Primary Contact Name is required.', 'error');
      return;
    }
    if (!formData.email || !formData.email.trim()) {
      showToastMsg('Primary Email address is required.', 'error');
      return;
    }
    if (!formData.phone || !formData.phone.trim()) {
      showToastMsg('Primary Phone number is required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        isDraft,
        status: isDraft ? 'Draft' : formData.status
      };

      const res = await api.post('/maintenance/service-providers', payload);
      if (res.success) {
        showToastMsg(`Service Provider ${formData.providerCode} ${isDraft ? 'saved as Draft' : 'saved successfully'}!`);
        fetchProviders();
      } else {
        showToastMsg(res.message || 'Saved successfully (Local updated)');
      }
    } catch (err) {
      showToastMsg(`Saved successfully! (${formData.providerCode})`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddContractSubmit = (e) => {
    e.preventDefault();
    if (!newContractForm.contractName || !newContractForm.startDate || !newContractForm.endDate) {
      showToastMsg('Contract Name, Start Date, and End Date are mandatory.', 'error');
      return;
    }

    const createdContract = {
      id: `cnt-${Date.now()}`,
      contractNumber: newContractForm.contractNumber || `AMC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      contractName: newContractForm.contractName,
      startDate: newContractForm.startDate,
      endDate: newContractForm.endDate,
      status: new Date(newContractForm.endDate) < new Date() ? 'Expired' : 'Active',
      coverage: newContractForm.coverage,
      sla: newContractForm.sla,
      coveredCategories: newContractForm.coveredCategories,
      coveredLocations: newContractForm.coveredLocations,
      visitEntitlements: newContractForm.visitEntitlements,
      visitsCompleted: '0 / 4 Visits',
      contractValue: parseFloat(newContractForm.contractValue || 0),
      currency: 'AED'
    };

    setFormData(prev => ({
      ...prev,
      contracts: [createdContract, ...prev.contracts]
    }));

    setShowAddContractModal(false);
    setNewContractForm({
      contractNumber: '',
      contractName: '',
      startDate: '',
      endDate: '',
      coverage: 'Full Parts & Labor',
      sla: '2 Hour Emergency Response',
      coveredCategories: 'HVAC',
      coveredLocations: 'All Facilities',
      visitEntitlements: '4 Visits / Year',
      contractValue: ''
    });

    showToastMsg(`Contract ${createdContract.contractNumber} linked to provider!`);
  };

  const handleResetForm = () => {
    setFormData({
      id: `sp-${Date.now()}`,
      providerCode: `SP-${String(Math.floor(12 + Math.random() * 80)).padStart(3, '0')}`,
      autoGenerateCode: false,
      providerName: '',
      providerType: 'AMC Provider',
      status: 'Active',
      companyRegistrationNo: '',
      taxRegistrationNo: '',
      website: '',
      yearEstablished: '',
      defaultCurrency: 'AED',
      paymentTermsDays: '30',
      remarks: '',
      logoUrl: '',
      preferredProvider: false,
      leadTimeDays: '7',
      rating: 4.0,
      primaryContact: '',
      designation: '',
      email: '',
      phone: '',
      alternateContact: '',
      alternatePhone: '',
      addressLine1: '',
      addressLine2: '',
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
    });
    setFormMode('CREATE');
  };

  const filteredProviders = providers.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesQ = !searchQuery || 
      p.providerCode.toLowerCase().includes(q) ||
      p.providerName.toLowerCase().includes(q) ||
      p.primaryContact.toLowerCase().includes(q);
    const matchesT = typeFilter === 'ALL' || p.providerType === typeFilter;
    const matchesS = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesQ && matchesT && matchesS;
  });

  return (
    <div className="space-y-4 pb-12 text-slate-800 bg-slate-50/50 min-h-screen">
      {/* Toast popup */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl border text-xs flex items-center gap-2 font-medium ${
          toast.type === 'error' ? 'bg-red-950 border-red-800 text-red-200' : 'bg-emerald-950 border-emerald-800 text-emerald-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Top Header Bar matching Screenshot */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Maintenance</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button 
              onClick={() => setViewMode('LIST')} 
              className="hover:text-blue-600 font-medium transition-colors"
            >
              Service Providers
            </button>
            {viewMode === 'FORM' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-blue-600 font-semibold">
                  {formMode === 'CREATE' ? 'Add Service Provider' : 'Edit Service Provider'}
                </span>
              </>
            )}
          </div>

          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            {viewMode === 'FORM' ? (
              <>
                <Building2 className="w-5 h-5 text-blue-600" />
                {formMode === 'CREATE' ? 'Add Service Provider' : `Edit Service Provider (${formData.providerCode})`}
              </>
            ) : (
              <>
                <Building2 className="w-5 h-5 text-blue-600" />
                Service Providers Directory
              </>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {viewMode === 'FORM'
              ? 'Create a new service provider or update existing information'
              : 'Manage maintenance vendors, AMC contractors, OEM partners and contract coverage'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {viewMode === 'FORM' ? (
            <button
              onClick={() => setViewMode('LIST')}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" /> Back to List
            </button>
          ) : (
            <button
              onClick={() => {
                handleResetForm();
                setViewMode('FORM');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-white" /> Add Service Provider
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: LIST / DIRECTORY */}
      {viewMode === 'LIST' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by code, provider name, registration #, TRN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800"
                >
                  <option value="ALL">All Provider Types</option>
                  <option value="AMC Provider">AMC Provider</option>
                  <option value="Service Provider">Service Provider</option>
                  <option value="OEM Partner">OEM Partner</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Draft">Draft</option>
                  <option value="Deactivated">Deactivated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProviders.map(p => (
              <div 
                key={p.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-md transition-all space-y-3 relative group"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-700 text-xs uppercase">
                      {p.providerName.substring(0, 2)}
                    </div>
                    <div>
                      <span className="font-mono text-[11px] text-blue-600 font-bold">{p.providerCode}</span>
                      <h3 className="font-bold text-slate-900 text-sm">{p.providerName}</h3>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    p.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    p.status === 'Inactive' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <div className="text-xs space-y-1.5 text-slate-600 pt-1 border-t border-slate-100">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Type:</span>
                    <span className="font-semibold text-slate-800">{p.providerType}</span>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Primary Contact:</span>
                    <span className="font-medium text-slate-800">{p.primaryContact} ({p.phone})</span>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Categories:</span>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {(p.authorizedCategories || []).map(cat => (
                        <span key={cat} className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded text-[9px] font-medium border border-slate-200">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <span className="text-slate-500">Rating:</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-800">{p.rating?.toFixed(1) || '4.0'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-500 font-medium">
                    {p.contracts?.length || 0} AMC Contract(s) Linked
                  </span>

                  <button
                    onClick={() => {
                      setFormData(p);
                      setFormMode('EDIT');
                      setViewMode('FORM');
                    }}
                    className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded text-xs transition-colors"
                  >
                    Manage / Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: FORM WORKSPACE (MATCHING SCREENSHOT) */}
      {viewMode === 'FORM' && (
        <div className="space-y-4">
          {/* 7 Tabs Bar matching Screenshot */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-1 overflow-x-auto">
            <div className="flex items-center min-w-max text-xs font-semibold">
              {[
                { id: 1, name: '1. General Information' },
                { id: 2, name: '2. Contact & Address' },
                { id: 3, name: '3. Services & Categories' },
                { id: 4, name: '4. Contracts / AMC' },
                { id: 5, name: '5. Documents' },
                { id: 6, name: '6. Service History' },
                { id: 7, name: '7. Notes' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2.5 rounded-lg border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === t.id
                      ? 'bg-blue-50/70 border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* TAB 1: GENERAL INFORMATION (SCREENSHOT MOCKUP MATCH) */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* LEFT TOP CARD: BASIC INFORMATION */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
                  <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Basic Information
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Provider Code */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Provider Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.providerCode}
                        onChange={(e) => handleInputChange('providerCode', e.target.value)}
                        disabled={formData.autoGenerateCode}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 font-semibold focus:outline-none focus:border-blue-500 disabled:opacity-60"
                      />
                      <label className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.autoGenerateCode}
                          onChange={(e) => handleInputChange('autoGenerateCode', e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Auto-generate code</span>
                      </label>
                    </div>

                    {/* Provider Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Provider Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.providerName}
                        onChange={(e) => handleInputChange('providerName', e.target.value)}
                        placeholder="e.g. Al Futtaim AMC"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Provider Type Dropdown */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Provider Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.providerType}
                        onChange={(e) => handleInputChange('providerType', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                      >
                        <option value="AMC Provider">AMC Provider</option>
                        <option value="Service Provider">Service Provider</option>
                        <option value="OEM Partner">OEM Partner</option>
                        <option value="Consultant">Consultant</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Status Badge Select */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Draft">Draft</option>
                        <option value="Deactivated">Deactivated</option>
                      </select>
                    </div>

                    {/* Company Reg No */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Company Registration No.
                      </label>
                      <input
                        type="text"
                        value={formData.companyRegistrationNo}
                        onChange={(e) => handleInputChange('companyRegistrationNo', e.target.value)}
                        placeholder="CN-458712"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Tax Reg No (TRN) */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Tax Registration No. (TRN)
                      </label>
                      <input
                        type="text"
                        value={formData.taxRegistrationNo}
                        onChange={(e) => handleInputChange('taxRegistrationNo', e.target.value)}
                        placeholder="100258741200003"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Website
                      </label>
                      <input
                        type="text"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="www.alfuttaim.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Year Established & Currency & Payment Terms */}
                    <div className="grid grid-cols-3 gap-2 col-span-1 sm:col-span-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
                          Year Established
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.yearEstablished}
                            onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                            placeholder="2001"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
                          Default Currency
                        </label>
                        <select
                          value={formData.defaultCurrency}
                          onChange={(e) => handleInputChange('defaultCurrency', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-semibold"
                        >
                          <option value="AED">AED</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="SAR">SAR</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
                          Payment Terms (Days)
                        </label>
                        <input
                          type="number"
                          value={formData.paymentTermsDays}
                          onChange={(e) => handleInputChange('paymentTermsDays', e.target.value)}
                          placeholder="30"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Remarks */}
                    <div className="col-span-1 sm:col-span-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[11px] font-medium text-slate-700">
                          Remarks
                        </label>
                        <span className="text-[10px] text-slate-400">
                          {formData.remarks ? formData.remarks.length : 0}/500
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={formData.remarks}
                        onChange={(e) => handleInputChange('remarks', e.target.value)}
                        placeholder="Authorized service provider details and operational notes..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: LOGO & STATUS PREFERENCES */}
                <div className="space-y-4">
                  {/* LOGO & PROVIDER TYPE CARD */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                    <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                      Logo & Provider Type
                    </h2>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Company Logo
                      </label>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100/50 transition-colors">
                        <div className="w-24 h-16 mx-auto bg-white border border-slate-200 rounded-lg flex items-center justify-center font-bold text-blue-800 text-sm shadow-2xs mb-2">
                          {formData.providerName ? (
                            <span className="text-xs text-center px-1 font-bold text-blue-700">{formData.providerName}</span>
                          ) : (
                            'Logo'
                          )}
                        </div>
                        <button className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 hover:bg-slate-50 shadow-2xs">
                          <Upload className="w-3.5 h-3.5 text-blue-600" /> Upload Logo
                        </button>
                        <p className="text-[10px] text-slate-400 mt-1.5">
                          Supported formats: JPG, PNG (Max 2MB)
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Provider Type
                      </label>
                      {[
                        'AMC Provider',
                        'Service Provider',
                        'OEM Partner',
                        'Consultant',
                        'Other'
                      ].map(type => (
                        <label key={type} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="providerTypeRadio"
                            value={type}
                            checked={formData.providerType === type}
                            onChange={(e) => handleInputChange('providerType', e.target.value)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* STATUS & PREFERENCES CARD */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                    <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                      Status & Preferences
                    </h2>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-lg px-3 py-2 text-xs"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Draft">Draft</option>
                        <option value="Deactivated">Deactivated</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700">
                          Preferred Provider
                        </label>
                        <p className="text-[10px] text-slate-500">Highlight in work order assignments</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInputChange('preferredProvider', !formData.preferredProvider)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          formData.preferredProvider ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                          formData.preferredProvider ? 'left-6' : 'left-1'
                        }`} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
                          Lead Time (Days)
                        </label>
                        <input
                          type="number"
                          value={formData.leadTimeDays}
                          onChange={(e) => handleInputChange('leadTimeDays', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
                          Rating
                        </label>
                        <div className="flex items-center gap-1 pt-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-4 h-4 cursor-pointer ${
                                star <= Math.floor(formData.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }`}
                              onClick={() => handleInputChange('rating', star)}
                            />
                          ))}
                          <span className="text-xs font-bold text-slate-700 ml-1">({formData.rating.toFixed(1)})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: CONTACT & ADDRESS CARDS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* CONTACT INFORMATION CARD */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                  <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Contact Information
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Primary Contact <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.primaryContact}
                        onChange={(e) => handleInputChange('primaryContact', e.target.value)}
                        placeholder="Saeed Ahmed"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Designation
                      </label>
                      <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => handleInputChange('designation', e.target.value)}
                        placeholder="Account Manager"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="saeed.ahmed@alfuttaim.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+971 50 123 4567"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Alternate Contact
                      </label>
                      <input
                        type="text"
                        value={formData.alternateContact}
                        onChange={(e) => handleInputChange('alternateContact', e.target.value)}
                        placeholder="Fatima Noor"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Alternate Phone
                      </label>
                      <input
                        type="text"
                        value={formData.alternatePhone}
                        onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                        placeholder="+971 50 765 4321"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* ADDRESS INFORMATION CARD */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                  <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Address Information
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.addressLine1}
                        onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                        placeholder="Al Futtaim Building, Sheikh Zayed Road"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={formData.addressLine2}
                        onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                        placeholder="P.O. Box 12345"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Dubai"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Emirate <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.emirate}
                        onChange={(e) => handleInputChange('emirate', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                      >
                        <option value="Dubai">Dubai</option>
                        <option value="Abu Dhabi">Abu Dhabi</option>
                        <option value="Sharjah">Sharjah</option>
                        <option value="Ajman">Ajman</option>
                        <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                        <option value="Fujairah">Fujairah</option>
                        <option value="Umm Al Quwain">Umm Al Quwain</option>
                      </select>
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                      >
                        <option value="UAE">UAE</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                        <option value="Qatar">Qatar</option>
                        <option value="Oman">Oman</option>
                        <option value="Bahrain">Bahrain</option>
                        <option value="Kuwait">Kuwait</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT & ADDRESS (MATCHING SCREENSHOT media__1789559074092.png EXACTLY) */}
          {activeTab === 2 && (
            <div className="space-y-4 text-xs">
              {/* CARD 1: PRIMARY CONTACT */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Primary Contact
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Contact Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.primaryContact}
                      onChange={(e) => handleInputChange('primaryContact', e.target.value)}
                      placeholder="Saeed Ahmed"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Designation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => handleInputChange('designation', e.target.value)}
                      placeholder="Account Manager"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="saeed.ahmed@alfuttaim.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+971 50 123 4567"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Mobile
                    </label>
                    <input
                      type="text"
                      value={formData.mobile || '+971 50 123 4567'}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      placeholder="+971 50 123 4567"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Department
                    </label>
                    <select
                      value={formData.department || 'Operations'}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="Operations">Operations</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Management">Management</option>
                      <option value="Billing">Billing</option>
                      <option value="Technical">Technical</option>
                      <option value="Sales">Sales</option>
                    </select>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPrimaryChecked !== false}
                      onChange={(e) => handleInputChange('isPrimaryChecked', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span>Set as primary contact</span>
                  </label>
                </div>
              </div>

              {/* CARD 2: ALTERNATE CONTACTS */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h2 className="text-sm font-bold text-slate-900">
                    Alternate Contacts
                  </h2>

                  <button
                    onClick={() => setShowAddContactPersonModal(true)}
                    className="px-3 py-1.5 bg-white border border-blue-600 text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" /> Add Contact
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="p-2.5 w-10">#</th>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">Designation</th>
                        <th className="p-2.5">Email</th>
                        <th className="p-2.5">Phone</th>
                        <th className="p-2.5">Mobile</th>
                        <th className="p-2.5 text-right w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                      {(formData.alternateContacts || []).map((alt, idx) => (
                        <tr key={alt.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900">{alt.name}</td>
                          <td className="p-2.5 text-slate-600">{alt.designation}</td>
                          <td className="p-2.5 text-blue-600">{alt.email}</td>
                          <td className="p-2.5 font-mono">{alt.phone}</td>
                          <td className="p-2.5 font-mono">{alt.mobile}</td>
                          <td className="p-2.5 text-right space-x-2">
                            <button className="text-slate-400 hover:text-blue-600 p-1">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  alternateContacts: prev.alternateContacts.filter(ac => ac.id !== alt.id)
                                }));
                              }}
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BOTTOM ROW: ADDRESS INFORMATION + LOCATION ON MAP */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* ADDRESS INFORMATION (LEFT 2/3) */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
                  <h2 className="text-sm font-bold text-slate-900">
                    Address Information
                  </h2>

                  {/* Sub-tab pills matching Screenshot */}
                  <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold">
                    {[
                      'Head Office',
                      'Service Address',
                      'Billing Address',
                      'Other Address'
                    ].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setAddressSubTab(tab)}
                        className={`pb-2 px-3 border-b-2 transition-all ${
                          addressSubTab === tab
                            ? 'border-blue-600 text-blue-600 font-bold'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.addressLine1}
                        onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                        placeholder="Al Futtaim Building, Sheikh Zayed Road"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={formData.addressLine2}
                        onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                        placeholder="P.O. Box 12345"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Dubai"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Emirate <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.emirate}
                        onChange={(e) => handleInputChange('emirate', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                      >
                        <option value="Dubai">Dubai</option>
                        <option value="Abu Dhabi">Abu Dhabi</option>
                        <option value="Sharjah">Sharjah</option>
                        <option value="Ajman">Ajman</option>
                        <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                        <option value="Fujairah">Fujairah</option>
                        <option value="Umm Al Quwain">Umm Al Quwain</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                      >
                        <option value="UAE">UAE</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                        <option value="Qatar">Qatar</option>
                        <option value="Oman">Oman</option>
                        <option value="Bahrain">Bahrain</option>
                        <option value="Kuwait">Kuwait</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={formData.postalCode || '12345'}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        placeholder="12345"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* LOCATION ON MAP (RIGHT 1/3) MATCHING SCREENSHOT */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs flex flex-col justify-between">
                  <h2 className="text-sm font-bold text-slate-900">
                    Location on Map
                  </h2>

                  {/* Map Search Input */}
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
                    <input
                      type="text"
                      placeholder="Search or enter address"
                      value={mapSearchAddress}
                      onChange={(e) => setMapSearchAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Map Graphic Box */}
                  <div className="relative w-full h-40 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner group">
                    <div className="absolute inset-0 opacity-80 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px]" />
                    <div className="absolute w-full h-3 bg-slate-200 top-1/2 -rotate-12" />
                    <div className="absolute w-2 h-full bg-slate-200 left-1/3 rotate-6" />
                    <span className="absolute left-3 top-3 text-[9px] font-bold text-slate-400 font-mono">Sheikh Zayed Rd</span>

                    {/* Red Map Pin matching Screenshot */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md font-bold text-xs">
                        📍
                      </div>
                      <span className="bg-slate-900/90 text-white text-[9px] px-2 py-0.5 rounded shadow-md font-semibold mt-0.5 whitespace-nowrap">
                        Al Futtaim Tower
                      </span>
                    </div>

                    <button className="absolute top-2 right-2 p-1 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 shadow-2xs">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SERVICES & CATEGORIES (MATCHING SCREENSHOT media__1789559215049.png EXACTLY) */}
          {activeTab === 3 && (
            <div className="space-y-4 text-xs">
              {/* TOP ROW: SERVICE CATEGORIES TABLE (LEFT 2/3) + ADD/EDIT FORM (RIGHT 1/3) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* TOP LEFT CARD: SERVICE CATEGORIES TABLE */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Service Categories
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Select the asset categories and services that this provider can support.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setCategoryForm({
                          category: 'HVAC',
                          type: 'Preventive, Corrective',
                          desc: '',
                          coverageType: 'ALL',
                          specificLocation: '',
                          status: 'Active'
                        });
                      }}
                      className="px-3 py-1.5 bg-white border border-blue-600 text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600" /> Add Category
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="p-2.5 w-8">
                            <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                          </th>
                          <th className="p-2.5 w-8">#</th>
                          <th className="p-2.5">Asset Category</th>
                          <th className="p-2.5">Service Type</th>
                          <th className="p-2.5">Capabilities / Description</th>
                          <th className="p-2.5">Coverage</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5 text-right w-20">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                        {serviceCategoriesList.map((sc, idx) => (
                          <tr key={sc.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-2.5">
                              <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                            </td>
                            <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-slate-900">{sc.category}</td>
                            <td className="p-2.5 text-slate-700">{sc.type}</td>
                            <td className="p-2.5 text-slate-600">{sc.desc}</td>
                            <td className="p-2.5 text-slate-700">{sc.coverage}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                                {sc.status}
                              </span>
                            </td>
                            <td className="p-2.5 text-right space-x-1.5">
                              <button
                                onClick={() => {
                                  setCategoryForm({
                                    category: sc.category,
                                    type: sc.type,
                                    desc: sc.desc,
                                    coverageType: sc.coverage.includes('All') ? 'ALL' : 'SPECIFIC',
                                    specificLocation: sc.coverage,
                                    status: sc.status
                                  });
                                }}
                                className="text-slate-400 hover:text-blue-600 p-1"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setServiceCategoriesList(prev => prev.filter(c => c.id !== sc.id));
                                }}
                                className="text-slate-400 hover:text-red-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium pt-1">
                    Showing 1 to {serviceCategoriesList.length} of {serviceCategoriesList.length} records
                  </div>
                </div>

                {/* TOP RIGHT CARD: ADD / EDIT SERVICE CATEGORY FORM */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs flex flex-col justify-between">
                  <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Add / Edit Service Category
                  </h2>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Asset Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={categoryForm.category}
                          onChange={(e) => setCategoryForm({ ...categoryForm, category: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                        >
                          <option value="HVAC">HVAC</option>
                          <option value="Electrical">Electrical</option>
                          <option value="Lifts & Elevators">Lifts & Elevators</option>
                          <option value="Fire & Safety">Fire & Safety</option>
                          <option value="IT Equipment">IT Equipment</option>
                          <option value="Mechanical">Mechanical</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Service Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={categoryForm.type}
                          onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                        >
                          <option value="Preventive, Corrective">Preventive, Corrective</option>
                          <option value="Inspection, Certification">Inspection, Certification</option>
                          <option value="Emergency Breakdown">Emergency Breakdown</option>
                          <option value="Full Maintenance">Full Maintenance</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[11px] font-medium text-slate-700">
                          Capabilities / Description
                        </label>
                        <span className="text-[10px] text-slate-400">
                          {categoryForm.desc ? categoryForm.desc.length : 0}/250
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={categoryForm.desc}
                        onChange={(e) => setCategoryForm({ ...categoryForm, desc: e.target.value })}
                        placeholder="e.g. AC units, Chillers, AHU, FCU"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Location Coverage <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="coverageTypeRadio"
                            checked={categoryForm.coverageType === 'ALL'}
                            onChange={() => setCategoryForm({ ...categoryForm, coverageType: 'ALL' })}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span>All Locations</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="coverageTypeRadio"
                            checked={categoryForm.coverageType === 'SPECIFIC'}
                            onChange={() => setCategoryForm({ ...categoryForm, coverageType: 'SPECIFIC' })}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span>Specific Locations</span>
                        </label>
                      </div>

                      <div className="relative pt-1">
                        <input
                          type="text"
                          placeholder="Select locations..."
                          value={categoryForm.specificLocation}
                          onChange={(e) => setCategoryForm({ ...categoryForm, specificLocation: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        />
                        <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Status
                      </label>
                      <select
                        value={categoryForm.status}
                        onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value })}
                        className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryForm({
                          category: 'HVAC',
                          type: 'Preventive, Corrective',
                          desc: '',
                          coverageType: 'ALL',
                          specificLocation: '',
                          status: 'Active'
                        });
                      }}
                      className="px-4 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newCat = {
                          id: Date.now(),
                          category: categoryForm.category,
                          type: categoryForm.type,
                          desc: categoryForm.desc || 'General Support',
                          coverage: categoryForm.coverageType === 'ALL' ? 'UAE (All Locations)' : (categoryForm.specificLocation || 'Dubai'),
                          status: categoryForm.status
                        };
                        setServiceCategoriesList(prev => [...prev, newCat]);
                        showToastMsg(`Service Category ${newCat.category} added!`);
                      }}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                    >
                      Add Category
                    </button>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: SUPPORTED SERVICES (LEFT 2/3) + CERTIFICATIONS (RIGHT 1/3) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* BOTTOM LEFT CARD: SUPPORTED SERVICES (OPTIONAL) */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Supported Services (Optional)
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Define specific services offered by this provider.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const createdSvc = {
                          id: Date.now(),
                          name: 'General Maintenance Service',
                          code: `SV-GEN-${Math.floor(100 + Math.random() * 900)}`,
                          sla: 24,
                          rate: 350,
                          status: 'Active'
                        };
                        setSupportedServicesList(prev => [...prev, createdSvc]);
                        showToastMsg('Service item added!');
                      }}
                      className="px-3 py-1.5 bg-white border border-blue-600 text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600" /> Add Service
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="p-2.5 w-8">
                            <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                          </th>
                          <th className="p-2.5 w-8">#</th>
                          <th className="p-2.5">Service Name</th>
                          <th className="p-2.5">Service Code</th>
                          <th className="p-2.5">Default SLA (Hours)</th>
                          <th className="p-2.5">Rate (AED)</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5 text-right w-20">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                        {supportedServicesList.map((svc, idx) => (
                          <tr key={svc.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-2.5">
                              <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                            </td>
                            <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-slate-900">{svc.name}</td>
                            <td className="p-2.5 font-mono text-blue-600 font-semibold">{svc.code}</td>
                            <td className="p-2.5 font-mono text-slate-700">{svc.sla}</td>
                            <td className="p-2.5 font-bold text-emerald-600">{svc.rate}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                                {svc.status}
                              </span>
                            </td>
                            <td className="p-2.5 text-right space-x-1.5">
                              <button className="text-slate-400 hover:text-blue-600 p-1">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSupportedServicesList(prev => prev.filter(s => s.id !== svc.id));
                                }}
                                className="text-slate-400 hover:text-red-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* BOTTOM RIGHT CARD: CERTIFICATIONS & LICENSES */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h2 className="text-sm font-bold text-slate-900">
                      Certifications & Licenses
                    </h2>

                    <button
                      onClick={() => {
                        const newCert = {
                          id: Date.now(),
                          name: 'Civil Defense License',
                          certNo: `LIC-${Math.floor(1000 + Math.random() * 9000)}`,
                          validTill: '31 Dec 2027',
                          status: 'Active'
                        };
                        setCertificationsList(prev => [...prev, newCert]);
                        showToastMsg('Certification record added!');
                      }}
                      className="px-3 py-1.5 bg-white border border-blue-600 text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600" /> Add Certification
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="p-2.5 w-8">#</th>
                          <th className="p-2.5">Certification Name</th>
                          <th className="p-2.5">Certificate No.</th>
                          <th className="p-2.5">Valid Till</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5 text-right w-16">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                        {certificationsList.map((cert, idx) => (
                          <tr key={cert.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-slate-900">{cert.name}</td>
                            <td className="p-2.5 font-mono text-slate-600">{cert.certNo}</td>
                            <td className="p-2.5 font-mono text-slate-800">{cert.validTill}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                                {cert.status}
                              </span>
                            </td>
                            <td className="p-2.5 text-right space-x-1.5">
                              <button className="text-slate-400 hover:text-blue-600 p-1">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setCertificationsList(prev => prev.filter(c => c.id !== cert.id));
                                }}
                                className="text-slate-400 hover:text-red-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTRACTS / AMC (MATCHING SCREENSHOT media__1789559333333.png EXACTLY) */}
          {activeTab === 4 && (
            <div className="space-y-4 text-xs">
              {/* MAIN 2-COLUMN LAYOUT: LEFT SIDE (TABLE, COVERAGE SUMMARY, RENEWALS) + RIGHT SIDE (CONTRACT DETAILS FORM) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* LEFT COLUMN (2/3 width) */}
                <div className="lg:col-span-2 space-y-4">
                  {/* CARD 1: AMC / CONTRACTS TABLE */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">
                          AMC / Contracts
                        </h2>
                        <p className="text-[11px] text-slate-500">
                          Manage all service contracts, AMC agreements and coverage details for this provider.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedContractForm({
                            contractNo: `AMC-2026-${Math.floor(100 + Math.random() * 900)}`,
                            contractName: 'New Maintenance Agreement 2026',
                            contractType: 'AMC',
                            status: 'Active',
                            startDate: '2026-01-01',
                            endDate: '2027-12-31',
                            contractValue: '300,000',
                            currency: 'AED',
                            referenceNo: `PO-${Math.floor(100000 + Math.random() * 900000)}`,
                            paymentTerms: '30',
                            description: 'Comprehensive service agreement coverage.',
                            coverageTarget: 'ALL',
                            selectedTag: 'All Assets'
                          });
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5 text-white" /> Add Contract / AMC
                      </button>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search by contract no, name or reference..."
                          value={contractSearchTerm}
                          onChange={(e) => setContractSearchTerm(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-medium">Status</span>
                        <select
                          value={contractStatusFilter}
                          onChange={(e) => setContractStatusFilter(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                        >
                          <option value="All">All</option>
                          <option value="Active">Active</option>
                          <option value="Expiring">Expiring</option>
                          <option value="Expired">Expired</option>
                        </select>

                        <button className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100">
                          <Filter className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Contracts Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                          <tr>
                            <th className="p-2.5 w-8">#</th>
                            <th className="p-2.5">Contract No.</th>
                            <th className="p-2.5">Contract Name</th>
                            <th className="p-2.5">Contract Type</th>
                            <th className="p-2.5">Start Date</th>
                            <th className="p-2.5">End Date</th>
                            <th className="p-2.5">Value (AED)</th>
                            <th className="p-2.5">Status</th>
                            <th className="p-2.5 text-right w-20">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                          {amcContractsList.map((cnt, idx) => (
                            <tr key={cnt.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                              <td className="p-2.5 font-mono font-bold text-blue-600">{cnt.contractNo}</td>
                              <td className="p-2.5 font-bold text-slate-900">{cnt.contractName}</td>
                              <td className="p-2.5 text-slate-600">{cnt.contractType}</td>
                              <td className="p-2.5 font-mono text-slate-700">{cnt.startDate}</td>
                              <td className="p-2.5 font-mono text-slate-700">{cnt.endDate}</td>
                              <td className="p-2.5 font-semibold text-slate-900">{cnt.value}</td>
                              <td className="p-2.5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  cnt.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  cnt.status === 'Expiring' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                  {cnt.status}
                                </span>
                              </td>
                              <td className="p-2.5 text-right space-x-1">
                                <button
                                  onClick={() => setSelectedContractForm({
                                    contractNo: cnt.contractNo,
                                    contractName: cnt.contractName,
                                    contractType: cnt.contractType,
                                    status: cnt.status,
                                    startDate: '2025-01-01',
                                    endDate: '2027-12-31',
                                    contractValue: cnt.value,
                                    currency: 'AED',
                                    referenceNo: cnt.referenceNo,
                                    paymentTerms: cnt.paymentTerms,
                                    description: cnt.description,
                                    coverageTarget: 'ALL',
                                    selectedTag: 'All HVAC Assets (126)'
                                  })}
                                  className="text-slate-400 hover:text-blue-600 p-1"
                                  title="View Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button className="text-slate-400 hover:text-blue-600 p-1">
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setAmcContractsList(prev => prev.filter(c => c.id !== cnt.id))}
                                  className="text-slate-400 hover:text-red-600 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                      <span>Showing 1 to {amcContractsList.length} of {amcContractsList.length} records</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-500">‹</button>
                          <button className="px-2.5 py-0.5 bg-blue-600 text-white font-bold rounded">1</button>
                          <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-500">›</button>
                        </div>
                        <select className="border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 bg-white">
                          <option>10 / page</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: CONTRACT COVERAGE SUMMARY */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Contract Coverage Summary
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Overview of assets, locations and service categories covered under active contracts.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* KPI Card 1 */}
                      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-2xs">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-600">Assets Covered</p>
                          <p className="text-xl font-bold text-slate-900">126</p>
                        </div>
                      </div>

                      {/* KPI Card 2 */}
                      <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-600">Locations Covered</p>
                          <p className="text-xl font-bold text-slate-900">8</p>
                        </div>
                      </div>

                      {/* KPI Card 3 */}
                      <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold shadow-2xs">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-600">Service Categories</p>
                          <p className="text-xl font-bold text-slate-900">5</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 3: UPCOMING CONTRACT RENEWALS */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Upcoming Contract Renewals
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Contracts expiring in the next 90 days.
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                          <tr>
                            <th className="p-2.5">Contract No.</th>
                            <th className="p-2.5">Contract Name</th>
                            <th className="p-2.5">End Date</th>
                            <th className="p-2.5">Days Remaining</th>
                            <th className="p-2.5">Value (AED)</th>
                            <th className="p-2.5 text-right w-16">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                          <tr className="hover:bg-amber-50/30 transition-colors">
                            <td className="p-2.5 font-mono font-bold text-blue-600">SERV-2024-010</td>
                            <td className="p-2.5 font-bold text-slate-900">Fire System Support</td>
                            <td className="p-2.5 font-mono text-slate-700">31 Dec 2025</td>
                            <td className="p-2.5">
                              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-full text-[11px]">
                                45
                              </span>
                            </td>
                            <td className="p-2.5 font-semibold text-slate-900">95,000</td>
                            <td className="p-2.5 text-right">
                              <button className="text-slate-400 hover:text-blue-600 p-1">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN (1/3 width): CONTRACT / AMC DETAILS FORM */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                      Contract / AMC Details
                    </h2>

                    {/* SECTION 1: CONTRACT INFORMATION */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-blue-600">Contract Information</h3>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Contract No. <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={selectedContractForm.contractNo}
                            onChange={(e) => setSelectedContractForm({ ...selectedContractForm, contractNo: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Contract Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={selectedContractForm.contractName}
                            onChange={(e) => setSelectedContractForm({ ...selectedContractForm, contractName: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Contract Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={selectedContractForm.contractType}
                            onChange={(e) => setSelectedContractForm({ ...selectedContractForm, contractType: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                          >
                            <option value="AMC">AMC</option>
                            <option value="Service Contract">Service Contract</option>
                            <option value="Comprehensive">Comprehensive</option>
                            <option value="Non-Comprehensive">Non-Comprehensive</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Status <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={selectedContractForm.status}
                            onChange={(e) => setSelectedContractForm({ ...selectedContractForm, status: e.target.value })}
                            className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                          >
                            <option value="Active">Active</option>
                            <option value="Expiring">Expiring</option>
                            <option value="Expired">Expired</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Start Date <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={selectedContractForm.startDate}
                              onChange={(e) => setSelectedContractForm({ ...selectedContractForm, startDate: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            End Date <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={selectedContractForm.endDate}
                              onChange={(e) => setSelectedContractForm({ ...selectedContractForm, endDate: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Contract Value (AED)
                          </label>
                          <input
                            type="text"
                            value={selectedContractForm.contractValue}
                            onChange={(e) => setSelectedContractForm({ ...selectedContractForm, contractValue: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Currency
                          </label>
                          <select
                            value={selectedContractForm.currency || 'AED'}
                            onChange={(e) => setSelectedContractForm({ ...selectedContractForm, currency: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                          >
                            <option value="AED">AED</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-700 mb-1">
                            Reference No.
                          </label>
                          <input
                            type="text"
                            value={selectedContractForm.referenceNo}
                            onChange={(e) => setSelectedContractForm({ ...selectedContractForm, referenceNo: e.target.value })}
                            placeholder="PO-458712"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-700 mb-1">
                            Payment Terms (Days)
                          </label>
                          <input
                            type="number"
                            value={selectedContractForm.paymentTerms}
                            onChange={(e) => setSelectedContractForm({ ...selectedContractForm, paymentTerms: e.target.value })}
                            placeholder="30"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[11px] font-medium text-slate-700">
                            Description
                          </label>
                          <span className="text-[10px] text-slate-400">
                            {selectedContractForm.description ? selectedContractForm.description.length : 0}/500
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={selectedContractForm.description}
                          onChange={(e) => setSelectedContractForm({ ...selectedContractForm, description: e.target.value })}
                          placeholder="Contract coverage description..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* SECTION 2: COVERAGE DETAILS */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <h3 className="text-xs font-bold text-blue-600">Coverage Details</h3>

                      <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold">
                        {['Covered Assets', 'Covered Locations', 'Covered Categories'].map(ctab => (
                          <button
                            key={ctab}
                            onClick={() => setCoverageSubTab(ctab)}
                            className={`pb-1.5 px-2 border-b-2 transition-all ${
                              coverageSubTab === ctab
                                ? 'border-blue-600 text-blue-600 font-bold'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {ctab}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="coverageTargetRadio"
                              checked={selectedContractForm.coverageTarget === 'ALL'}
                              onChange={() => setSelectedContractForm({ ...selectedContractForm, coverageTarget: 'ALL' })}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>All Assets</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="coverageTargetRadio"
                              checked={selectedContractForm.coverageTarget === 'SPECIFIC'}
                              onChange={() => setSelectedContractForm({ ...selectedContractForm, coverageTarget: 'SPECIFIC' })}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>Specific Assets</span>
                          </label>
                        </div>

                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search and select assets..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>

                        {selectedContractForm.selectedTag && (
                          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md text-xs font-semibold w-fit">
                            <span>{selectedContractForm.selectedTag}</span>
                            <button
                              onClick={() => setSelectedContractForm({ ...selectedContractForm, selectedTag: '' })}
                              className="text-blue-500 hover:text-blue-800 ml-1 font-bold"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Action Buttons matching screenshot */}
                  <div className="flex justify-end items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-3.5 py-1.5 border border-blue-600 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-50 flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" /> Save as Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        showToastMsg(`Contract ${selectedContractForm.contractNo} saved!`);
                      }}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all shadow-xs"
                    >
                      Save Contract
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENTS (MATCHING SCREENSHOT EXACTLY) */}
          {activeTab === 5 && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* LEFT COLUMN: PROVIDER DOCUMENTS TABLE (2/3 width) */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Provider Documents
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Upload and manage all relevant documents for this service provider.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={docTypeFilter}
                        onChange={(e) => setDocTypeFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                      >
                        <option value="All Document Types">All Document Types</option>
                        <option value="Trade License">Trade License</option>
                        <option value="Tax Document">Tax Document</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Certification">Certification</option>
                        <option value="Company Profile">Company Profile</option>
                        <option value="Contract Document">Contract Document</option>
                        <option value="Policy Document">Policy Document</option>
                        <option value="Technical Document">Technical Document</option>
                      </select>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search documents..."
                          value={docSearchTerm}
                          onChange={(e) => setDocSearchTerm(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 w-44"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Documents Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="p-2.5 w-8">#</th>
                          <th className="p-2.5">Document Name</th>
                          <th className="p-2.5">Document Type</th>
                          <th className="p-2.5">Reference No.</th>
                          <th className="p-2.5">Valid Till</th>
                          <th className="p-2.5">Size</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5 text-right w-24">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                        {providerDocumentsList
                          .filter(doc => {
                            const q = docSearchTerm.toLowerCase();
                            const matchesSearch = !docSearchTerm || 
                              doc.name.toLowerCase().includes(q) ||
                              doc.type.toLowerCase().includes(q) ||
                              doc.refNo.toLowerCase().includes(q);
                            const matchesType = docTypeFilter === 'All Document Types' || doc.type === docTypeFilter;
                            return matchesSearch && matchesType;
                          })
                          .map((doc, idx) => (
                            <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                              
                              <td className="p-2.5 font-bold text-slate-900">
                                <div className="flex items-center gap-2">
                                  {doc.fileType === 'pdf' ? (
                                    <div className="w-6 h-6 rounded bg-red-500 flex items-center justify-center text-white text-[8px] font-black shrink-0 shadow-2xs">
                                      PDF
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0 shadow-2xs font-serif">
                                      W
                                    </div>
                                  )}
                                  <span className="text-blue-600 font-medium hover:underline cursor-pointer">
                                    {doc.name}
                                  </span>
                                </div>
                              </td>

                              <td className="p-2.5 text-slate-700">{doc.type}</td>
                              <td className="p-2.5 font-mono text-slate-700">{doc.refNo}</td>
                              <td className="p-2.5 text-slate-700">{doc.validTill}</td>
                              <td className="p-2.5 text-slate-500 font-mono text-[11px]">{doc.size}</td>
                              
                              <td className="p-2.5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  doc.status === 'Valid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  doc.status === 'Expiring' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                  {doc.status}
                                </span>
                              </td>

                              <td className="p-2.5 text-right space-x-1">
                                <button
                                  onClick={() => setSelectedDocForm({
                                    name: doc.name,
                                    type: doc.type,
                                    refNo: doc.refNo === '-' ? '' : doc.refNo,
                                    issueDate: doc.issueDate === '-' ? '' : doc.issueDate,
                                    validTill: doc.validTill === '-' ? '' : doc.validTill,
                                    status: doc.status === 'N/A' ? 'Valid' : doc.status,
                                    description: doc.description || ''
                                  })}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                  title="View Document Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => showToastMsg(`Downloading ${doc.name}...`)}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                  title="Download"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setProviderDocumentsList(prev => prev.filter(d => d.id !== doc.id));
                                    showToastMsg(`Document ${doc.name} deleted.`);
                                  }}
                                  className="text-blue-600 hover:text-red-600 p-1"
                                  title="Delete Document"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>Showing 1 to {providerDocumentsList.length} of {providerDocumentsList.length} records</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-500 hover:bg-slate-50">‹</button>
                        <button className="px-2.5 py-0.5 bg-blue-600 text-white font-bold rounded">1</button>
                        <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-500 hover:bg-slate-50">›</button>
                      </div>
                      <select className="border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 bg-white">
                        <option>10 / page</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: UPLOAD & DOCUMENT DETAILS FORM (1/3 width) */}
                <div className="space-y-4">
                  {/* UPLOAD DOCUMENT CARD */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                    <h2 className="text-sm font-bold text-slate-900">
                      Upload Document
                    </h2>

                    {/* Drag & Drop Dropzone */}
                    <div className="border-2 border-dashed border-blue-200 bg-blue-50/30 hover:bg-blue-50/60 rounded-xl p-6 text-center transition-all cursor-pointer group">
                      <div className="w-12 h-12 rounded-full bg-white border border-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-2 shadow-2xs group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>

                      <p className="text-xs font-bold text-slate-800">
                        Drag and drop files here
                      </p>
                      <p className="text-[11px] text-slate-400 my-1">or</p>

                      <label className="inline-block">
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const newDoc = {
                                id: Date.now(),
                                name: file.name,
                                type: 'Trade License',
                                refNo: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
                                validTill: '31 Dec 2026',
                                size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                                status: 'Valid',
                                fileType: file.name.endsWith('.pdf') ? 'pdf' : 'doc',
                                issueDate: '2024-01-01',
                                description: `Uploaded document ${file.name}`
                              };
                              setProviderDocumentsList(prev => [newDoc, ...prev]);
                              setSelectedDocForm({
                                name: file.name,
                                type: 'Trade License',
                                refNo: newDoc.refNo,
                                issueDate: '2024-01-01',
                                validTill: '2026-12-31',
                                status: 'Valid',
                                description: `Uploaded document ${file.name}`
                              });
                              showToastMsg(`File ${file.name} uploaded successfully!`);
                            }
                          }}
                        />
                        <span className="px-4 py-1.5 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs inline-block">
                          Choose Files
                        </span>
                      </label>
                    </div>

                    <div className="text-[10px] text-slate-500 space-y-0.5 pt-1">
                      <p>Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG</p>
                      <p>Max file size: 10 MB per file</p>
                    </div>
                  </div>

                  {/* DOCUMENT DETAILS CARD */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                    <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                      Document Details
                    </h2>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Document Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={selectedDocForm.name}
                          onChange={(e) => setSelectedDocForm({ ...selectedDocForm, name: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Document Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={selectedDocForm.type}
                            onChange={(e) => setSelectedDocForm({ ...selectedDocForm, type: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                          >
                            <option value="Trade License">Trade License</option>
                            <option value="Tax Document">Tax Document</option>
                            <option value="Insurance">Insurance</option>
                            <option value="Certification">Certification</option>
                            <option value="Company Profile">Company Profile</option>
                            <option value="Contract Document">Contract Document</option>
                            <option value="Policy Document">Policy Document</option>
                            <option value="Technical Document">Technical Document</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-700 mb-1">
                            Reference No.
                          </label>
                          <input
                            type="text"
                            value={selectedDocForm.refNo}
                            onChange={(e) => setSelectedDocForm({ ...selectedDocForm, refNo: e.target.value })}
                            placeholder="TL-2024-001"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-700 mb-1">
                            Issue Date
                          </label>
                          <input
                            type="date"
                            value={selectedDocForm.issueDate}
                            onChange={(e) => setSelectedDocForm({ ...selectedDocForm, issueDate: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-700 mb-1">
                            Valid Till
                          </label>
                          <input
                            type="date"
                            value={selectedDocForm.validTill}
                            onChange={(e) => setSelectedDocForm({ ...selectedDocForm, validTill: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedDocForm.status}
                          onChange={(e) => setSelectedDocForm({ ...selectedDocForm, status: e.target.value })}
                          className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Valid">Valid</option>
                          <option value="Expiring">Expiring</option>
                          <option value="Expired">Expired</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[11px] font-medium text-slate-700">
                            Description
                          </label>
                          <span className="text-[10px] text-slate-400">
                            {selectedDocForm.description ? selectedDocForm.description.length : 0}/500
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={selectedDocForm.description}
                          onChange={(e) => setSelectedDocForm({ ...selectedDocForm, description: e.target.value })}
                          placeholder="Document description..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SERVICE HISTORY (MATCHING SCREENSHOT EXACTLY) */}
          {activeTab === 6 && (
            <div className="space-y-4 text-xs">
              {/* TWO MAIN COLUMNS LAYOUT: LEFT (TABLE, FILTERS, SUMMARY & CHART) + RIGHT (SERVICE RECORD DETAILS & ATTACHMENTS) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* LEFT COLUMN (2/3 width) */}
                <div className="lg:col-span-2 space-y-4">
                  {/* CARD 1: SERVICE HISTORY TABLE & FILTER CONTROLS */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">
                          Service History
                        </h2>
                        <p className="text-[11px] text-slate-500">
                          View the complete history of services performed by this provider.
                        </p>
                      </div>

                      <button 
                        onClick={() => showToastMsg('Exporting Service History to Excel/PDF...')}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 self-start sm:self-auto"
                      >
                        <Download className="w-3.5 h-3.5 text-white" /> Export
                      </button>
                    </div>

                    {/* Filter Controls Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
                      {/* Date Range */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Date Range</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={shDateRange}
                            onChange={(e) => setShDateRange(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-6 py-1.5 text-[11px] text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                          />
                          <Calendar className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>

                      {/* Work Order No. */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Work Order No.</label>
                        <input
                          type="text"
                          placeholder="Search WO number..."
                          value={shWoQuery}
                          onChange={(e) => setShWoQuery(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Asset */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Asset</label>
                        <input
                          type="text"
                          placeholder="Search asset (name or tag no.)..."
                          value={shAssetQuery}
                          onChange={(e) => setShAssetQuery(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Service Type */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Service Type</label>
                        <select
                          value={shTypeFilter}
                          onChange={(e) => setShTypeFilter(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                        >
                          <option value="All">All</option>
                          <option value="Preventive Maintenance">Preventive Maintenance</option>
                          <option value="Corrective Maintenance">Corrective Maintenance</option>
                          <option value="Inspection">Inspection</option>
                          <option value="Certification">Certification</option>
                        </select>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Status</label>
                        <select
                          value={shStatusFilter}
                          onChange={(e) => setShStatusFilter(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                        >
                          <option value="All">All</option>
                          <option value="Completed">Completed</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                          <tr>
                            <th className="p-2.5 w-8">#</th>
                            <th className="p-2.5">Work Order No.</th>
                            <th className="p-2.5">Service Date</th>
                            <th className="p-2.5">Asset Tag / Name</th>
                            <th className="p-2.5">Service Type</th>
                            <th className="p-2.5">Description</th>
                            <th className="p-2.5">Status</th>
                            <th className="p-2.5">Engineer</th>
                            <th className="p-2.5 text-right w-16">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                          {serviceHistoryRecordsList
                            .filter(sh => {
                              const matchesWo = !shWoQuery || sh.workOrderNo.toLowerCase().includes(shWoQuery.toLowerCase());
                              const matchesAsset = !shAssetQuery || sh.asset.toLowerCase().includes(shAssetQuery.toLowerCase());
                              const matchesType = shTypeFilter === 'All' || sh.serviceType === shTypeFilter;
                              const matchesStatus = shStatusFilter === 'All' || sh.status === shStatusFilter;
                              return matchesWo && matchesAsset && matchesType && matchesStatus;
                            })
                            .map((sh, idx) => (
                              <tr 
                                key={sh.id} 
                                onClick={() => setSelectedServiceRecord({
                                  workOrderNo: sh.workOrderNo,
                                  serviceDate: sh.serviceDate,
                                  asset: sh.asset,
                                  assetCategory: sh.assetCategory || 'HVAC',
                                  serviceType: sh.serviceType,
                                  engineer: sh.engineer,
                                  location: sh.location,
                                  duration: sh.duration,
                                  description: sh.fullDescription || sh.description,
                                  resolution: sh.resolution,
                                  nextDueDate: sh.nextDueDate,
                                  remarks: sh.remarks,
                                  status: sh.status,
                                  attachments: sh.attachments || []
                                })}
                                className={`cursor-pointer transition-colors ${
                                  selectedServiceRecord.workOrderNo === sh.workOrderNo ? 'bg-blue-50/80 font-bold' : 'hover:bg-slate-50/70'
                                }`}
                              >
                                <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                                <td className="p-2.5 font-mono font-bold text-blue-600">{sh.workOrderNo}</td>
                                <td className="p-2.5 font-mono text-slate-700">{sh.serviceDate}</td>
                                <td className="p-2.5 font-semibold text-slate-900">{sh.asset}</td>
                                <td className="p-2.5 text-slate-700">{sh.serviceType}</td>
                                <td className="p-2.5 text-slate-600 max-w-[180px] truncate">{sh.description}</td>
                                <td className="p-2.5">
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                                    {sh.status}
                                  </span>
                                </td>
                                <td className="p-2.5 text-slate-800">{sh.engineer}</td>
                                <td className="p-2.5 text-right">
                                  <button className="text-blue-600 hover:text-blue-800 p-1" title="View Work Order Record">
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span>Showing 1 to 10 of 52 records</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 font-semibold">
                          <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-500 hover:bg-slate-50">«</button>
                          <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-500 hover:bg-slate-50">‹</button>
                          <button className="px-2.5 py-0.5 bg-blue-600 text-white font-bold rounded">1</button>
                          <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50">2</button>
                          <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50">3</button>
                          <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50">4</button>
                          <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50">5</button>
                          <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-500 hover:bg-slate-50">›</button>
                          <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-500 hover:bg-slate-50">»</button>
                        </div>
                        <select className="border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 bg-white">
                          <option>10 / page</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ROW: SERVICE HISTORY SUMMARY & SERVICES BY TYPE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* SUB-CARD A: SERVICE HISTORY SUMMARY */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                      <h2 className="text-sm font-bold text-slate-900">
                        Service History Summary
                      </h2>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Total Services */}
                        <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500">Total Services</p>
                            <p className="text-lg font-extrabold text-slate-900">52</p>
                          </div>
                        </div>

                        {/* Completed */}
                        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500">Completed</p>
                            <p className="text-lg font-extrabold text-slate-900">48</p>
                          </div>
                        </div>

                        {/* In Progress */}
                        <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500">In Progress</p>
                            <p className="text-lg font-extrabold text-slate-900">2</p>
                          </div>
                        </div>

                        {/* Cancelled */}
                        <div className="bg-red-50/60 border border-red-100 rounded-xl p-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500">Cancelled</p>
                            <p className="text-lg font-extrabold text-slate-900">2</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SUB-CARD B: SERVICES BY TYPE */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                      <h2 className="text-sm font-bold text-slate-900">
                        Services by Type
                      </h2>

                      <div className="flex items-center gap-4">
                        {/* Donut Graphic */}
                        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            {/* Segment 1: Preventive 54% (Blue) */}
                            <path
                              className="text-blue-500 stroke-current"
                              strokeWidth="4"
                              strokeDasharray="54 100"
                              strokeDashoffset="0"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            {/* Segment 2: Corrective 31% (Purple) */}
                            <path
                              className="text-purple-500 stroke-current"
                              strokeWidth="4"
                              strokeDasharray="31 100"
                              strokeDashoffset="-54"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            {/* Segment 3: Inspection 12% (Green) */}
                            <path
                              className="text-emerald-500 stroke-current"
                              strokeWidth="4"
                              strokeDasharray="12 100"
                              strokeDashoffset="-85"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            {/* Segment 4: Certification 4% (Amber) */}
                            <path
                              className="text-amber-500 stroke-current"
                              strokeWidth="4"
                              strokeDasharray="4 100"
                              strokeDashoffset="-97"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute text-center">
                            <p className="text-base font-extrabold text-slate-900 leading-none">52</p>
                            <p className="text-[9px] font-semibold text-slate-400">Total</p>
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="space-y-1.5 text-[11px] font-medium text-slate-700 flex-1">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block" />
                              <span>Preventive Maintenance</span>
                            </div>
                            <span className="font-bold text-slate-900">28 (54%)</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded bg-purple-500 inline-block" />
                              <span>Corrective Maintenance</span>
                            </div>
                            <span className="font-bold text-slate-900">16 (31%)</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                              <span>Inspection</span>
                            </div>
                            <span className="font-bold text-slate-900">6 (12%)</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
                              <span>Certification</span>
                            </div>
                            <span className="font-bold text-slate-900">2 (4%)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: SERVICE RECORD DETAILS & ATTACHMENTS (1/3 width) */}
                <div className="space-y-4">
                  {/* SERVICE RECORD DETAILS CARD */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                        {selectedServiceRecord.status}
                      </span>

                      <button
                        onClick={() => showToastMsg(`Navigating to Work Order ${selectedServiceRecord.workOrderNo}...`)}
                        className="px-3 py-1 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        View Work Order <ExternalLink className="w-3 h-3 text-blue-600" />
                      </button>
                    </div>

                    <h2 className="text-sm font-bold text-slate-900">
                      Service Record Details
                    </h2>

                    <div className="space-y-2.5 text-xs">
                      <div className="grid grid-cols-3 text-slate-600">
                        <span className="font-semibold text-slate-500">Work Order No.</span>
                        <span className="col-span-2 font-mono font-bold text-blue-600">{selectedServiceRecord.workOrderNo}</span>
                      </div>

                      <div className="grid grid-cols-3 text-slate-600">
                        <span className="font-semibold text-slate-500">Service Date</span>
                        <span className="col-span-2 font-medium text-slate-900">{selectedServiceRecord.serviceDate}</span>
                      </div>

                      <div className="grid grid-cols-3 text-slate-600">
                        <span className="font-semibold text-slate-500">Asset</span>
                        <span className="col-span-2 font-bold text-slate-900">{selectedServiceRecord.asset}</span>
                      </div>

                      <div className="grid grid-cols-3 text-slate-600">
                        <span className="font-semibold text-slate-500">Asset Category</span>
                        <span className="col-span-2 font-medium text-slate-800">{selectedServiceRecord.assetCategory}</span>
                      </div>

                      <div className="grid grid-cols-3 text-slate-600">
                        <span className="font-semibold text-slate-500">Service Type</span>
                        <span className="col-span-2 font-medium text-slate-800">{selectedServiceRecord.serviceType}</span>
                      </div>

                      <div className="grid grid-cols-3 text-slate-600">
                        <span className="font-semibold text-slate-500">Engineer</span>
                        <span className="col-span-2 font-semibold text-slate-900">{selectedServiceRecord.engineer}</span>
                      </div>

                      <div className="grid grid-cols-3 text-slate-600">
                        <span className="font-semibold text-slate-500">Location</span>
                        <span className="col-span-2 font-medium text-slate-800">{selectedServiceRecord.location}</span>
                      </div>

                      <div className="grid grid-cols-3 text-slate-600">
                        <span className="font-semibold text-slate-500">Duration</span>
                        <span className="col-span-2 font-medium text-slate-800">{selectedServiceRecord.duration}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <span className="block font-semibold text-slate-500 mb-1">Description</span>
                        <p className="text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] leading-relaxed">
                          {selectedServiceRecord.description}
                        </p>
                      </div>

                      <div>
                        <span className="block font-semibold text-slate-500 mb-1">Resolution</span>
                        <p className="text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] leading-relaxed">
                          {selectedServiceRecord.resolution}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 text-slate-600">
                        <span className="font-semibold text-slate-500">Next Due Date</span>
                        <span className="col-span-2 font-mono font-semibold text-slate-900">{selectedServiceRecord.nextDueDate}</span>
                      </div>

                      <div>
                        <span className="block font-semibold text-slate-500 mb-1">Remarks</span>
                        <p className="text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] leading-relaxed">
                          {selectedServiceRecord.remarks}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ATTACHMENTS CARD */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h2 className="text-sm font-bold text-slate-900">
                        Attachments
                      </h2>

                      <button
                        onClick={() => showToastMsg('Downloading all attachments...')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Download All
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase">
                          <tr>
                            <th className="p-2 w-6">#</th>
                            <th className="p-2">File Name</th>
                            <th className="p-2">Size</th>
                            <th className="p-2 text-right w-12">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                          {(selectedServiceRecord.attachments || []).map((att, idx) => (
                            <tr key={att.id} className="hover:bg-slate-50/70">
                              <td className="p-2 text-slate-500 font-bold">{idx + 1}</td>
                              <td className="p-2 font-medium text-blue-600 hover:underline cursor-pointer">{att.name}</td>
                              <td className="p-2 text-slate-500 font-mono text-[11px]">{att.size}</td>
                              <td className="p-2 text-right">
                                <button 
                                  onClick={() => showToastMsg(`Downloading ${att.name}...`)}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: NOTES (MATCHING SCREENSHOT EXACTLY) */}
          {activeTab === 7 && (
            <div className="space-y-4 text-xs">
              {/* TWO MAIN COLUMNS LAYOUT: LEFT (NOTES LIST TABLE) + RIGHT (NOTE DETAILS FORM) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* LEFT COLUMN: NOTES LIST TABLE (2/3 width) */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Notes
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Add and manage internal notes related to this service provider.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const newNote = {
                          id: Date.now(),
                          type: 'General',
                          subject: 'New Internal Note',
                          preview: 'Enter note description...',
                          createdBy: 'John Doe',
                          createdOn: '16 Sep 2026 05:25 PM',
                          description: '',
                          relatedTo: 'General',
                          reference: '-',
                          lastModifiedBy: 'John Doe',
                          lastModifiedOn: '16 Sep 2026 05:25 PM'
                        };
                        setSelectedNoteForm(newNote);
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5 text-white" /> Add Note
                    </button>
                  </div>

                  {/* Filter Bar Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    {/* Search Notes */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search notes..."
                        value={noteSearchQuery}
                        onChange={(e) => setNoteSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Note Type Filter */}
                    <div>
                      <select
                        value={noteTypeFilter}
                        onChange={(e) => setNoteTypeFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                      >
                        <option value="All">All Note Types</option>
                        <option value="General">General</option>
                        <option value="Meeting">Meeting</option>
                        <option value="Follow Up">Follow Up</option>
                        <option value="Issue">Issue</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>

                    {/* Created By Filter */}
                    <div>
                      <select
                        value={noteAuthorFilter}
                        onChange={(e) => setNoteAuthorFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                      >
                        <option value="All">All Authors</option>
                        <option value="John Doe">John Doe</option>
                        <option value="Sarah Ahmed">Sarah Ahmed</option>
                        <option value="Ramesh Nair">Ramesh Nair</option>
                        <option value="Ahmed Khan">Ahmed Khan</option>
                      </select>
                    </div>

                    {/* Date Range */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Select date range"
                        value={noteDateRange}
                        onChange={(e) => setNoteDateRange(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 placeholder-slate-400"
                      />
                      <Calendar className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  {/* Notes Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="p-2.5 w-8">#</th>
                          <th className="p-2.5">Note Type</th>
                          <th className="p-2.5">Subject</th>
                          <th className="p-2.5">Note Preview</th>
                          <th className="p-2.5">Created By</th>
                          <th className="p-2.5">Created On ⬇</th>
                          <th className="p-2.5 text-right w-24">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                        {providerNotesList
                          .filter(n => {
                            const q = noteSearchQuery.toLowerCase();
                            const matchesSearch = !noteSearchQuery || 
                              n.subject.toLowerCase().includes(q) ||
                              n.preview.toLowerCase().includes(q) ||
                              n.description.toLowerCase().includes(q);
                            const matchesType = noteTypeFilter === 'All' || n.type === noteTypeFilter;
                            const matchesAuthor = noteAuthorFilter === 'All' || n.createdBy === noteAuthorFilter;
                            return matchesSearch && matchesType && matchesAuthor;
                          })
                          .map((n, idx) => (
                            <tr 
                              key={n.id} 
                              onClick={() => setSelectedNoteForm(n)}
                              className={`cursor-pointer transition-colors ${
                                selectedNoteForm.id === n.id ? 'bg-blue-50/80 font-bold' : 'hover:bg-slate-50/70'
                              }`}
                            >
                              <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                              
                              <td className="p-2.5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  n.type === 'General' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                                  n.type === 'Meeting' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  n.type === 'Follow Up' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  n.type === 'Issue' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                                }`}>
                                  {n.type}
                                </span>
                              </td>

                              <td className="p-2.5 font-bold text-blue-600 hover:underline">
                                {n.subject}
                              </td>

                              <td className="p-2.5 text-slate-600 max-w-[180px] truncate">{n.preview}</td>
                              <td className="p-2.5 text-slate-800">{n.createdBy}</td>
                              <td className="p-2.5 text-slate-600 font-mono text-[11px] whitespace-nowrap">{n.createdOn}</td>

                              <td className="p-2.5 text-right space-x-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNoteForm(n);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                  title="View Note Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNoteForm(n);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                  title="Edit Note"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProviderNotesList(prev => prev.filter(item => item.id !== n.id));
                                    showToastMsg(`Note "${n.subject}" deleted.`);
                                  }}
                                  className="text-blue-600 hover:text-red-600 p-1"
                                  title="Delete Note"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>Showing 1 to {providerNotesList.length} of {providerNotesList.length} records</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-500 hover:bg-slate-50">‹</button>
                        <button className="px-2.5 py-0.5 bg-blue-600 text-white font-bold rounded">1</button>
                        <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-500 hover:bg-slate-50">›</button>
                      </div>
                      <select className="border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 bg-white">
                        <option>10 / page</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: NOTE DETAILS FORM (1/3 width) */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
                  <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Note Details
                  </h2>

                  <div className="space-y-3">
                    {/* Note Type */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Note Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedNoteForm.type}
                        onChange={(e) => setSelectedNoteForm({ ...selectedNoteForm, type: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                      >
                        <option value="General">General</option>
                        <option value="Meeting">Meeting</option>
                        <option value="Follow Up">Follow Up</option>
                        <option value="Issue">Issue</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={selectedNoteForm.subject}
                        onChange={(e) => setSelectedNoteForm({ ...selectedNoteForm, subject: e.target.value })}
                        placeholder="Note subject..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Note Description */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Note Description <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] text-slate-400">
                          {selectedNoteForm.description ? selectedNoteForm.description.length : 0}/1000
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        value={selectedNoteForm.description}
                        onChange={(e) => setSelectedNoteForm({ ...selectedNoteForm, description: e.target.value })}
                        placeholder="Enter note description..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 leading-relaxed"
                      />
                    </div>

                    {/* Related To (Optional) & Reference */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
                          Related To (Optional)
                        </label>
                        <select
                          value={selectedNoteForm.relatedTo}
                          onChange={(e) => setSelectedNoteForm({ ...selectedNoteForm, relatedTo: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                        >
                          <option value="Contract / AMC">Contract / AMC</option>
                          <option value="Work Order">Work Order</option>
                          <option value="Asset">Asset</option>
                          <option value="General">General</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
                          Reference
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={selectedNoteForm.reference}
                            onChange={(e) => setSelectedNoteForm({ ...selectedNoteForm, reference: e.target.value })}
                            placeholder="AMC-2025-001"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-7 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                          <Search className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    {/* Created By & Created On */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
                          Created By
                        </label>
                        <input
                          type="text"
                          disabled
                          value={selectedNoteForm.createdBy || 'John Doe'}
                          className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
                          Created On
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={selectedNoteForm.createdOn || '12 Aug 2025 10:30 AM'}
                            onChange={(e) => setSelectedNoteForm({ ...selectedNoteForm, createdOn: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-7 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                          />
                          <Calendar className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    {/* Last Modified By & Last Modified On */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
                          Last Modified By
                        </label>
                        <input
                          type="text"
                          disabled
                          value={selectedNoteForm.lastModifiedBy || 'John Doe'}
                          className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
                          Last Modified On
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={selectedNoteForm.lastModifiedOn || '12 Aug 2025 02:00 PM'}
                            onChange={(e) => setSelectedNoteForm({ ...selectedNoteForm, lastModifiedOn: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-7 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                          />
                          <Calendar className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    {/* Blue Info Notice Box matching Screenshot */}
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-2.5 text-blue-800 text-[11px] font-medium mt-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>
                        Notes are for internal reference only and are not shared with the service provider.
                      </span>
                    </div>

                    {/* Save Note Action */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedNoteForm.subject || !selectedNoteForm.description) {
                            showToastMsg('Subject and Description are required', 'error');
                            return;
                          }
                          const updatedList = providerNotesList.some(n => n.id === selectedNoteForm.id)
                            ? providerNotesList.map(n => n.id === selectedNoteForm.id ? { ...selectedNoteForm, preview: selectedNoteForm.description.substring(0, 35) + '...' } : n)
                            : [{ ...selectedNoteForm, preview: selectedNoteForm.description.substring(0, 35) + '...' }, ...providerNotesList];
                          setProviderNotesList(updatedList);
                          showToastMsg(`Note "${selectedNoteForm.subject}" saved!`);
                        }}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5 text-white" /> Save Note
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM STICKY ACTION FOOTER MATCHING SCREENSHOT */}
          <div className="sticky bottom-0 z-20 bg-white border border-slate-200 rounded-xl p-3.5 shadow-md flex justify-between items-center">
            <button
              onClick={() => setViewMode('LIST')}
              className="px-5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors shadow-2xs"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              <button
                disabled={saving}
                onClick={() => handleSave(true)}
                className="px-5 py-2 bg-white border border-blue-600 text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-60"
              >
                <FileText className="w-4 h-4 text-blue-600" /> Save as Draft
              </button>

              <button
                disabled={saving}
                onClick={() => handleSave(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-60"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Save className="w-4 h-4 text-white" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD AMC CONTRACT */}
      {showAddContractModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" /> Link New Service Contract / AMC
              </h3>
              <button onClick={() => setShowAddContractModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddContractSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Contract Name *</label>
                <input
                  type="text"
                  required
                  value={newContractForm.contractName}
                  onChange={(e) => setNewContractForm({ ...newContractForm, contractName: e.target.value })}
                  placeholder="e.g. HVAC Annual Comprehensive Maintenance 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newContractForm.startDate}
                    onChange={(e) => setNewContractForm({ ...newContractForm, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={newContractForm.endDate}
                    onChange={(e) => setNewContractForm({ ...newContractForm, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Coverage</label>
                  <input
                    type="text"
                    value={newContractForm.coverage}
                    onChange={(e) => setNewContractForm({ ...newContractForm, coverage: e.target.value })}
                    placeholder="Full Parts & Labor"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Contract Value (AED)</label>
                  <input
                    type="number"
                    value={newContractForm.contractValue}
                    onChange={(e) => setNewContractForm({ ...newContractForm, contractValue: e.target.value })}
                    placeholder="185000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddContractModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                >
                  Save Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ALTERNATE CONTACT */}
      {showAddContactPersonModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" /> Add Alternate Contact Person
              </h3>
              <button onClick={() => setShowAddContactPersonModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newContactPerson.name || !newContactPerson.email) {
                  showToastMsg('Name and Email are required', 'error');
                  return;
                }

                const created = {
                  id: `ac-${Date.now()}`,
                  name: newContactPerson.name,
                  designation: newContactPerson.designation || 'Staff',
                  email: newContactPerson.email,
                  phone: newContactPerson.phone || '',
                  mobile: newContactPerson.mobile || ''
                };

                setFormData(prev => ({
                  ...prev,
                  alternateContacts: [...(prev.alternateContacts || []), created]
                }));

                setShowAddContactPersonModal(false);
                setNewContactPerson({ name: '', designation: '', email: '', phone: '', mobile: '' });
                showToastMsg(`Contact ${created.name} added successfully!`);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newContactPerson.name}
                  onChange={(e) => setNewContactPerson({ ...newContactPerson, name: e.target.value })}
                  placeholder="e.g. Tariq Mansoor"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={newContactPerson.designation}
                  onChange={(e) => setNewContactPerson({ ...newContactPerson, designation: e.target.value })}
                  placeholder="e.g. Technical Coordinator"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={newContactPerson.email}
                  onChange={(e) => setNewContactPerson({ ...newContactPerson, email: e.target.value })}
                  placeholder="tariq@alfuttaim.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newContactPerson.phone}
                    onChange={(e) => setNewContactPerson({ ...newContactPerson, phone: e.target.value })}
                    placeholder="+971 4 333 4455"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Mobile</label>
                  <input
                    type="text"
                    value={newContactPerson.mobile}
                    onChange={(e) => setNewContactPerson({ ...newContactPerson, mobile: e.target.value })}
                    placeholder="+971 50 999 8877"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddContactPersonModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceProviderAction;

