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
import { uploadToCloudinary } from '../services/cloudinary';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const emptyLegacyProvider = () => ({
  id: null, providerCode: '', autoGenerateCode: true, providerName: '', providerType: 'Service Provider', status: 'Draft',
  companyRegistrationNo: '', taxRegistrationNo: '', website: '', yearEstablished: '', defaultCurrency: 'AED',
  paymentTermsDays: '30', remarks: '', logoUrl: '', preferredProvider: false, leadTimeDays: '7', rating: '',
  primaryContact: '', designation: '', email: '', phone: '', mobile: '', department: '', isPrimaryChecked: true,
  alternateContact: '', alternatePhone: '', addressLine1: '', addressLine2: '', city: '', emirate: '', country: '', postalCode: '',
  authorizedCategories: [], alternateContacts: [], contacts: [], addresses: [], contracts: [], documents: [], serviceHistory: [], notes: []
});
const prettyType = value => ({ AMC_PROVIDER: 'AMC Provider', SERVICE_PROVIDER: 'Service Provider', OEM_PARTNER: 'OEM Partner', CONSULTANT: 'Consultant', OTHER: 'Other' })[value] || value || 'Service Provider';
const apiType = value => ({ 'AMC Provider': 'AMC_PROVIDER', 'Service Provider': 'SERVICE_PROVIDER', 'OEM Partner': 'OEM_PARTNER', Consultant: 'CONSULTANT', Other: 'OTHER' })[value] || value;
const prettyStatus = value => value === 'ACTIVE' ? 'Active' : value === 'INACTIVE' ? 'Inactive' : 'Draft';
const apiStatus = value => value === 'Active' ? 'ACTIVE' : value === 'Inactive' || value === 'Deactivated' ? 'INACTIVE' : 'DRAFT';
const profileFields = ['yearEstablished', 'logoUrl', 'designation', 'mobile', 'department', 'alternateContact', 'alternatePhone', 'postalCode'];
const readProfile = value => { try { return JSON.parse(value || '{}'); } catch { return {}; } };
const inputDate = value => value ? new Date(value).toISOString().slice(0, 10) : '';
const displayDate = value => value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const dateStatus = item => !item.active ? 'Inactive' : new Date(item.endDate) < new Date() ? 'Expired' : 'Active';
const legacyContract = item => ({
  id: item.id, contractNo: item.contractNumber, contractName: item.title, contractType: item.contractType,
  startDate: displayDate(item.startDate), endDate: displayDate(item.endDate), startDateInput: inputDate(item.startDate), endDateInput: inputDate(item.endDate),
  value: Number(item.cost || 0).toLocaleString(), contractValue: Number(item.cost || 0), status: dateStatus(item),
  description: item.slaDetails || '', sla: item.slaDetails || '', referenceNo: item.referenceNumber || '',
  paymentTerms: item.paymentTermsDays ?? '', currency: item.currency || 'AED', coverage: item.coverageNotes || '',
  visitEntitlements: item.visitEntitlements || '',
  coveredAssets: item.coveredAssets || [], assetIds: (item.coveredAssets || []).map(x => x.assetId)
});
const legacyDocument = item => ({
  id: item.id, name: item.name, type: item.type?.replaceAll('_', ' ') || 'Other', refNo: item.referenceNumber || '—',
  validTill: displayDate(item.validUntil), validTillInput: inputDate(item.validUntil), size: item.fileSize == null ? '—' : (item.fileSize / 1048576).toFixed(1) + ' MB',
  fileSize: item.fileSize, status: item.validUntil && new Date(item.validUntil) < new Date() ? 'Expired' : 'Valid',
  fileType: item.name?.split('.').pop()?.toLowerCase(), issueDate: inputDate(item.issueDate), description: item.description || '', storageUrl: item.storageUrl
});
const legacyHistory = item => ({
  id: item.id, workOrderNo: item.workOrderNumber, serviceDate: displayDate(item.completedDate || item.createdAt),
  asset: [item.asset?.assetId, item.asset?.description].filter(Boolean).join(' — '), assetCategory: item.asset?.category?.name || '—',
  serviceType: ({ PREVENTIVE: 'Preventive Maintenance', CORRECTIVE: 'Corrective Maintenance', INSPECTION: 'Inspection', CERTIFICATION: 'Certification' })[item.workType] || item.workType?.replaceAll('_', ' ') || 'Service',
  description: item.description || '', status: ({ COMPLETED: 'Completed', CLOSED: 'Completed', IN_PROGRESS: 'In Progress', CANCELLED: 'Cancelled' })[item.status] || item.status || '',
  engineer: item.assignedTechnician?.fullName || '—', location: item.asset?.site?.name || '—', duration: '—',
  fullDescription: item.description || '', resolution: item.workPerformed || '', nextDueDate: displayDate(item.completionTargetDate),
  remarks: item.notes || '', attachments: String(item.photoUrls || '').split(',').map(url => url.trim()).filter(Boolean).map((url, index) => ({ id: index, name: `Attachment ${index + 1}`, url }))
});
const legacyNote = item => {
  let fields = {};
  if (item.text?.startsWith('FAMS_NOTE_V1:')) {
    try { fields = JSON.parse(item.text.slice('FAMS_NOTE_V1:'.length)); } catch { fields = {}; }
  }
  const description = fields.description || item.text || '';
  return {
    id: item.id, type: fields.type || 'General', subject: fields.subject || description.slice(0, 64) || 'Note', preview: description.slice(0, 90),
    createdBy: item.authorName || 'System', createdOn: new Date(item.createdAt).toLocaleString(), description,
    relatedTo: fields.relatedTo || 'General', reference: fields.reference || '—',
    lastModifiedBy: item.authorName || 'System', lastModifiedOn: new Date(item.updatedAt || item.createdAt).toLocaleString()
  };
};
const legacyProvider = (detail, categories = []) => ({
  ...emptyLegacyProvider(), ...detail,
  ...Object.fromEntries(profileFields.map(key => [key, readProfile(detail.legacyDetails)[key] || ''])),
  providerType: prettyType(detail.providerType), status: prettyStatus(detail.status),
  primaryContact: detail.primaryContact || '', email: detail.email || '', phone: detail.phone || '',
  defaultCurrency: detail.currency || 'AED', preferredProvider: Boolean(detail.preferred), emirate: detail.state || '',
  rating: detail.rating == null ? '' : Number(detail.rating),
  authorizedCategories: (detail.categories || []).map(x => categories.find(c => c.id === x.categoryId)?.name).filter(Boolean),
  alternateContacts: (detail.contacts || []).filter(x => !x.isPrimary),
  contracts: (detail.contracts || []).map(legacyContract), documents: (detail.documents || []).map(legacyDocument),
  serviceHistory: (detail.serviceHistory || []).map(legacyHistory), notes: (detail.notes || []).map(legacyNote)
});

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
  const [addressDrafts, setAddressDrafts] = useState({});
  const [showAddContactPersonModal, setShowAddContactPersonModal] = useState(false);
  const [mapSearchAddress, setMapSearchAddress] = useState('');
  const [newContactPerson, setNewContactPerson] = useState({
    name: '',
    designation: '',
    email: '',
    phone: '',
    mobile: ''
  });

  // Tab 3 State variables matching screenshot media__1789559215049.png
  const [serviceCategoriesList, setServiceCategoriesList] = useState([]);

  const [categoryForm, setCategoryForm] = useState({
    category: '',
    type: 'PREVENTIVE',
    desc: '',
    coverageType: 'ALL',
    specificLocation: '',
    status: 'Active'
  });

  const [supportedServicesList, setSupportedServicesList] = useState([]);

  const [certificationsList, setCertificationsList] = useState([]);

  // Tab 4 State variables matching screenshot media__1789559333333.png
  const [contractSearchTerm, setContractSearchTerm] = useState('');
  const [contractStatusFilter, setContractStatusFilter] = useState('All');
  const [coverageSubTab, setCoverageSubTab] = useState('Covered Assets'); // 'Covered Assets' | 'Covered Locations' | 'Covered Categories'

  const [amcContractsList, setAmcContractsList] = useState([]);

  const [selectedContractForm, setSelectedContractForm] = useState({});

  // Tab 5 State variables matching screenshot media__1789559468502.png
  const [docSearchTerm, setDocSearchTerm] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('All Document Types');

  const [providerDocumentsList, setProviderDocumentsList] = useState([]);

  const [selectedDocForm, setSelectedDocForm] = useState({});

  // Tab 6 State variables matching screenshot
  const [shDateRange, setShDateRange] = useState('');
  const [shWoQuery, setShWoQuery] = useState('');
  const [shAssetQuery, setShAssetQuery] = useState('');
  const [shTypeFilter, setShTypeFilter] = useState('All');
  const [shStatusFilter, setShStatusFilter] = useState('All');

  const [serviceHistoryRecordsList, setServiceHistoryRecordsList] = useState([]);

  const [selectedServiceRecord, setSelectedServiceRecord] = useState({ attachments: [] });

  // Tab 7 State variables matching screenshot
  const [noteSearchQuery, setNoteSearchQuery] = useState('');
  const [noteTypeFilter, setNoteTypeFilter] = useState('All');
  const [noteAuthorFilter, setNoteAuthorFilter] = useState('All');
  const [noteDateRange, setNoteDateRange] = useState('');

  const [providerNotesList, setProviderNotesList] = useState([]);

  const [selectedNoteForm, setSelectedNoteForm] = useState({});

  const [formData, setFormData] = useState(emptyLegacyProvider);

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

  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeId } = useParams();
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [providerDetail, setProviderDetail] = useState(null);

  const syncProvider = (detail, categories = categoryOptions, sites = siteOptions) => {
    const provider = legacyProvider(detail, categories);
    setProviderDetail(detail);
    setFormData(provider);
    const types = { HEAD_OFFICE: 'Head Office', SERVICE: 'Service Address', BILLING: 'Billing Address', OTHER: 'Other Address' };
    const drafts = {};
    (detail.addresses || []).forEach(item => { drafts[types[item.type] || 'Other Address'] = { id: item.id, addressLine1: item.line1 || '', addressLine2: item.line2 || '', city: item.city || '', emirate: item.state || '', country: item.country || '', postalCode: item.postalCode || '' }; });
    if (!drafts['Head Office']) drafts['Head Office'] = { addressLine1: detail.addressLine1 || '', addressLine2: detail.addressLine2 || '', city: detail.city || '', emirate: detail.state || '', country: detail.country || '', postalCode: readProfile(detail.legacyDetails).postalCode || '' };
    setAddressDrafts(drafts);
    setServiceCategoriesList((detail.categories || []).map(item => ({
      id: item.id, category: categories.find(c => c.id === item.categoryId)?.name || 'Category', categoryId: item.categoryId,
      type: item.serviceType, desc: item.description || '', coverage: item.coverageSiteId ? sites.find(x => x.id === item.coverageSiteId)?.name || 'Site' : 'All Locations',
      coverageSiteId: item.coverageSiteId, status: item.active ? 'Active' : 'Inactive'
    })));
    setSupportedServicesList((detail.services || []).map(item => ({ id: item.id, name: item.name, code: item.serviceCode, sla: item.responseHours, rate: item.rate, status: item.active ? 'Active' : 'Inactive' })));
    setCertificationsList((detail.certifications || []).map(item => ({ id: item.id, name: item.name, certNo: item.certificateNumber || '', validTill: displayDate(item.validUntil), status: item.validUntil && new Date(item.validUntil) < new Date() ? 'Expired' : 'Active' })));
    setAmcContractsList(provider.contracts);
    setProviderDocumentsList(provider.documents);
    setServiceHistoryRecordsList(provider.serviceHistory);
    setSelectedServiceRecord(provider.serviceHistory[0] || { attachments: [] });
    setProviderNotesList(provider.notes);
    setSelectedNoteForm(provider.notes[0] || {});
    setSelectedContractForm(provider.contracts[0] ? { ...provider.contracts[0], startDate: provider.contracts[0].startDateInput, endDate: provider.contracts[0].endDateInput, coverageTarget: 'SPECIFIC' } : {});
    setSelectedDocForm(provider.documents[0] ? { ...provider.documents[0], validTill: provider.documents[0].validTillInput } : {});
  };
  const fetchProviders = async (respectRoute = true) => {
    setLoading(true);
    try {
      const [providerRes, categoryRes, siteRes, assetRes] = await Promise.all([
        api.get('/maintenance/service-providers'), api.get('/master-data/categories'),
        api.get('/master-data/sites'), api.get('/maintenance/assets')
      ]);
      const categories = categoryRes.categories || [];
      setCategoryOptions(categories); setSiteOptions(siteRes.sites || []); setAssetOptions(assetRes.assets || []);
      const details = await Promise.all((providerRes.providers || []).map(p => api.get('/maintenance/service-providers/' + p.id)));
      setProviders(details.map(d => legacyProvider(d.provider, categories)));
      if (respectRoute && routeId) {
        const matching = details.find(d => d.provider?.id === routeId || d.provider?.providerCode === routeId);
        if (matching) { syncProvider(matching.provider, categories, siteRes.sites || []); setFormMode('EDIT'); setViewMode('FORM'); }
      } else if (respectRoute && /\/(add|create)$/.test(location.pathname)) {
        setFormData(emptyLegacyProvider()); setFormMode('CREATE'); setViewMode('FORM');
      } else if (respectRoute) {
        if (details[0]?.provider) {
          syncProvider(details[0].provider, categories, siteRes.sites || []);
          setFormMode('EDIT');
        } else {
          setFormData(emptyLegacyProvider());
          setFormMode('CREATE');
        }
        setViewMode('FORM');
      }
    } catch (err) { showToastMsg(err.message || 'Could not load providers.', 'error'); }
    finally { setLoading(false); }
  };
  const refreshProvider = async id => {
    const result = await api.get('/maintenance/service-providers/' + id);
    syncProvider(result.provider);
    await fetchProviders(false);
  };
  const openProvider = async id => {
    try {
      const result = await api.get('/maintenance/service-providers/' + id);
      syncProvider(result.provider); setFormMode('EDIT'); setViewMode('FORM'); setActiveTab(1);
    } catch (err) { showToastMsg(err.message || 'Could not open provider.', 'error'); }
  };
  useEffect(() => { fetchProviders(); }, [location.pathname]);

  const saveChild = async (section, payload, itemId) => {
    if (!formData.id) { showToastMsg('Save the provider first.', 'error'); return false; }
    try {
      const endpoint = `/maintenance/service-providers/${formData.id}/${section}${itemId ? '/' + itemId : ''}`;
      if (itemId) await api.put(endpoint, payload); else await api.post(endpoint, payload);
      await refreshProvider(formData.id);
      showToastMsg('Saved to database.');
      return true;
    } catch (err) { showToastMsg(err.message || 'Could not save record.', 'error'); return false; }
  };
  const removeChild = async (section, itemId) => {
    if (!formData.id) return;
    try {
      await api.delete(`/maintenance/service-providers/${formData.id}/${section}/${itemId}`);
      await refreshProvider(formData.id);
      showToastMsg('Record removed.');
    } catch (err) { showToastMsg(err.message || 'Could not remove record.', 'error'); }
  };
  const saveCategory = async () => {
    const categoryId = categoryOptions.find(item => item.name === categoryForm.category)?.id;
    const siteId = categoryForm.coverageType === 'SPECIFIC' ? siteOptions.find(item => item.name === categoryForm.specificLocation)?.id : null;
    if (!categoryId) return showToastMsg('Select an asset category.', 'error');
    if (categoryForm.coverageType === 'SPECIFIC' && !siteId) return showToastMsg('Select a site.', 'error');
    const saved = await saveChild('categories', { categoryId, serviceType: categoryForm.type, description: categoryForm.desc, coverageSiteId: siteId, active: categoryForm.status === 'Active' }, categoryForm.id);
    if (saved) setCategoryForm({ category: '', type: 'PREVENTIVE', desc: '', coverageType: 'ALL', specificLocation: '', status: 'Active' });
  };
  const addressValue = key => addressDrafts[addressSubTab]?.[key] || '';
  const updateAddress = (key, value) => setAddressDrafts(old => ({ ...old, [addressSubTab]: { ...old[addressSubTab], [key]: value } }));
  const editService = async item => {
    const name = window.prompt('Service name', item?.name || '');
    if (name == null) return;
    const serviceCode = window.prompt('Service code', item?.code || '');
    if (serviceCode == null) return;
    const responseHours = window.prompt('Response hours', String(item?.sla ?? ''));
    if (responseHours == null) return;
    const rate = window.prompt('Rate', String(item?.rate ?? ''));
    if (rate == null) return;
    await saveChild('services', { name, serviceCode, responseHours, rate, active: true }, item?.id);
  };
  const editCertification = async item => {
    const name = window.prompt('Certification name', item?.name || '');
    if (name == null) return;
    const certificateNumber = window.prompt('Certificate number', item?.certNo || '');
    if (certificateNumber == null) return;
    const validUntil = window.prompt('Valid until (YYYY-MM-DD)', item?.validUntil && item.validUntil !== '—' ? inputDate(item.validUntil) : '');
    if (validUntil == null) return;
    await saveChild('certifications', { name, certificateNumber, validUntil }, item?.id);
  };
  const saveContract = async (draft, draftOnly = false) => {
    if (!formData.id) { showToastMsg('Save the provider first.', 'error'); return false; }
    try {
      const payload = {
        contractNumber: draft.contractNo || draft.contractNumber,
        title: draft.contractName, contractType: draft.contractType || 'ANNUAL_MAINTENANCE',
        startDate: draft.startDate, endDate: draft.endDate,
        cost: Number(String(draft.contractValue || 0).replaceAll(',', '')), slaDetails: draft.description || draft.sla || '',
        referenceNumber: draft.referenceNo || '', paymentTermsDays: draft.paymentTerms ?? null,
        currency: draft.currency || formData.defaultCurrency || 'AED', coverageNotes: draft.coverage || '',
        visitEntitlements: draft.visitEntitlements || '',
        active: !draftOnly && draft.status !== 'Inactive', assetIds: draft.assetIds || []
      };
      const endpoint = `/maintenance/service-providers/${formData.id}/contracts`;
      if (draft.id) await api.put(endpoint + '/' + draft.id, payload); else await api.post(endpoint, payload);
      await refreshProvider(formData.id);
      showToastMsg('Contract saved to database.');
      return true;
    } catch (err) { showToastMsg(err.message || 'Could not save contract.', 'error'); return false; }
  };
  const removeContract = async id => {
    if (!formData.id || !window.confirm('Delete this contract and its asset coverage?')) return;
    try {
      await api.delete(`/maintenance/service-providers/${formData.id}/contracts/${id}`);
      await refreshProvider(formData.id);
      showToastMsg('Contract removed.');
    } catch (err) { showToastMsg(err.message || 'Could not remove contract.', 'error'); }
  };
  const uploadProviderDocument = async file => {
    if (!formData.id) return showToastMsg('Save the provider first.', 'error');
    if (file.size > 10 * 1024 * 1024) return showToastMsg('Choose a file under 10 MB.', 'error');
    try {
      const uploaded = await uploadToCloudinary(file, { folder: 'fams_provider_documents' });
      await saveChild('documents', {
        name: file.name, type: (selectedDocForm.type || 'OTHER').toUpperCase().replaceAll(' ', '_'),
        referenceNumber: selectedDocForm.refNo || '', issueDate: selectedDocForm.issueDate || null,
        validUntil: selectedDocForm.validTill || null, description: selectedDocForm.description || '', fileSize: file.size, storageUrl: uploaded.url
      });
    } catch (err) { showToastMsg(err.message || 'Could not upload document.', 'error'); }
  };
  const uploadLogo = async file => {
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 2 * 1024 * 1024) return showToastMsg('Choose a JPG or PNG under 2 MB.', 'error');
    try {
      const uploaded = await uploadToCloudinary(file, { folder: 'fams_provider_logos' });
      setFormData(old => ({ ...old, logoUrl: uploaded.url }));
      showToastMsg('Logo uploaded. Save the provider to keep it.');
    } catch (err) { showToastMsg(err.message || 'Could not upload logo.', 'error'); }
  };
  const saveDocumentDetails = async () => {
    if (!selectedDocForm.id) return showToastMsg('Select an uploaded document.', 'error');
    await saveChild('documents', {
      name: selectedDocForm.name, type: (selectedDocForm.type || 'OTHER').toUpperCase().replaceAll(' ', '_'),
      referenceNumber: selectedDocForm.refNo || '', issueDate: selectedDocForm.issueDate || null,
      validUntil: selectedDocForm.validTill || null, description: selectedDocForm.description || '', fileSize: selectedDocForm.fileSize,
      storageUrl: selectedDocForm.storageUrl
    }, selectedDocForm.id);
  };
  const exportHistory = () => {
    const rows = [['Work Order', 'Service Date', 'Asset', 'Service Type', 'Status']];
    serviceHistoryRecordsList.forEach(item => rows.push([item.workOrderNo, item.serviceDate, item.asset, item.serviceType, item.status]));
    const csv = rows.map(row => row.map(value => `"${String(value || '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'provider-service-history.csv'; link.click(); URL.revokeObjectURL(url);
  };
  const historyCount = type => serviceHistoryRecordsList.filter(item => item.serviceType === type).length;
  const historyPercent = type => serviceHistoryRecordsList.length ? Math.round(historyCount(type) / serviceHistoryRecordsList.length * 100) : 0;
  const saveNote = async () => {
    if (!selectedNoteForm.subject?.trim() || !selectedNoteForm.description?.trim()) return showToastMsg('Subject and Description are required.', 'error');
    const { type, subject, description, relatedTo, reference } = selectedNoteForm;
    await saveChild('notes', { text: 'FAMS_NOTE_V1:' + JSON.stringify({ type, subject, description, relatedTo, reference }) }, selectedNoteForm.id);
  };

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
    if (!formData.providerName.trim()) return showToastMsg('Provider Name is required.', 'error');
    const status = isDraft ? 'DRAFT' : apiStatus(formData.status);
    if (status === 'ACTIVE' && (!formData.primaryContact || !formData.email || !formData.phone)) {
      return showToastMsg('Active providers need a contact, email, and phone.', 'error');
    }
    setSaving(true);
    try {
      const payload = {
        providerCode: formData.providerCode, autoGenerateCode: formData.autoGenerateCode,
        providerName: formData.providerName, providerType: apiType(formData.providerType), status,
        companyRegistrationNo: formData.companyRegistrationNo, taxRegistrationNo: formData.taxRegistrationNo,
        website: formData.website, currency: formData.defaultCurrency, paymentTermsDays: formData.paymentTermsDays,
        preferred: formData.preferredProvider, leadTimeDays: formData.leadTimeDays, rating: formData.rating,
        remarks: formData.remarks, primaryContact: formData.primaryContact, email: formData.email, phone: formData.phone,
        legacyDetails: Object.fromEntries(profileFields.map(key => [key, key === 'postalCode' ? (addressDrafts['Head Office']?.postalCode || formData.postalCode || '') : (formData[key] || '')])),
        addressLine1: addressDrafts['Head Office']?.addressLine1 || formData.addressLine1,
        addressLine2: addressDrafts['Head Office']?.addressLine2 || formData.addressLine2,
        city: addressDrafts['Head Office']?.city || formData.city,
        state: addressDrafts['Head Office']?.emirate || formData.emirate,
        country: addressDrafts['Head Office']?.country || formData.country
      };
      const endpoint = '/maintenance/service-providers';
      const result = formMode === 'EDIT' && formData.id
        ? await api.put(endpoint + '/' + formData.id, payload)
        : await api.post(endpoint, payload);
      const providerId = result.provider.id;
      const existingCategories = providerDetail?.categories || [];
      const chosenIds = formData.authorizedCategories.map(name => categoryOptions.find(c => c.name === name)?.id).filter(Boolean);
      for (const item of existingCategories.filter(item => !chosenIds.includes(item.categoryId))) {
        await api.delete(endpoint + '/' + providerId + '/categories/' + item.id);
      }
      for (const categoryId of chosenIds.filter(id => !existingCategories.some(item => item.categoryId === id))) {
        await api.post(endpoint + '/' + providerId + '/categories', { categoryId, serviceType: 'PREVENTIVE', active: true });
      }
      const addressTypes = { 'Head Office': 'HEAD_OFFICE', 'Service Address': 'SERVICE', 'Billing Address': 'BILLING', 'Other Address': 'OTHER' };
      for (const [tabName, draft] of Object.entries(addressDrafts)) {
        if (!draft.addressLine1) continue;
        const item = { type: addressTypes[tabName], line1: draft.addressLine1, line2: draft.addressLine2, city: draft.city, state: draft.emirate, country: draft.country, postalCode: draft.postalCode };
        if (draft.id) await api.put(endpoint + '/' + providerId + '/addresses/' + draft.id, item);
        else await api.post(endpoint + '/' + providerId + '/addresses', item);
      }
      await refreshProvider(providerId);
      setFormMode('EDIT');
      showToastMsg(isDraft ? 'Provider saved as Draft.' : 'Provider saved to database.');
    } catch (err) { showToastMsg(err.message || 'Could not save provider.', 'error'); }
    finally { setSaving(false); }
  };

  const handleAddContractSubmit = async e => {
    e.preventDefault();
    const saved = await saveContract({ contractNo: newContractForm.contractNumber, contractName: newContractForm.contractName,
      contractType: 'ANNUAL_MAINTENANCE', startDate: newContractForm.startDate, endDate: newContractForm.endDate,
      contractValue: newContractForm.contractValue, description: newContractForm.sla,
      coverage: newContractForm.coverage, visitEntitlements: newContractForm.visitEntitlements,
      currency: formData.defaultCurrency, assetIds: [] });
    if (!saved) return;
    setShowAddContractModal(false);
    setNewContractForm({ contractNumber: '', contractName: '', startDate: '', endDate: '', contractValue: '', sla: '' });
  };

  const handleResetForm = () => {
    setFormData(emptyLegacyProvider()); setProviderDetail(null); setFormMode('CREATE'); setActiveTab(1);
    setAddressDrafts({});
    setServiceCategoriesList([]); setSupportedServicesList([]); setCertificationsList([]);
    setAmcContractsList([]); setProviderDocumentsList([]); setServiceHistoryRecordsList([]); setProviderNotesList([]);
  };

  const filteredProviders = providers.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesQ = !searchQuery || 
      p.providerCode.toLowerCase().includes(q) ||
      p.providerName.toLowerCase().includes(q) ||
      (p.primaryContact || '').toLowerCase().includes(q);
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
              className="hover:text-[#6C2BD9] font-medium transition-colors"
            >
              Service Providers
            </button>
            {viewMode === 'FORM' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[#6C2BD9] font-semibold">
                  {formMode === 'CREATE' ? 'Add Service Provider' : 'Edit Service Provider'}
                </span>
              </>
            )}
          </div>

          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            {viewMode === 'FORM' ? (
              <>
                <Building2 className="w-5 h-5 text-[#6C2BD9]" />
                {formMode === 'CREATE' ? 'Add Service Provider' : `Edit Service Provider (${formData.providerCode})`}
              </>
            ) : (
              <>
                <Building2 className="w-5 h-5 text-[#6C2BD9]" />
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
              className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#6C2BD9]"
                />
              </div>

              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#6C2BD9] text-slate-800"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#6C2BD9] text-slate-800"
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
                    <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center font-bold text-[#6C2BD9] text-xs uppercase">
                      {p.providerName.substring(0, 2)}
                    </div>
                    <div>
                      <span className="font-mono text-[11px] text-[#6C2BD9] font-bold">{p.providerCode}</span>
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
                      <span className="font-bold text-slate-800">{typeof p.rating === 'number' ? p.rating.toFixed(1) : '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-500 font-medium">
                    {p.contracts?.length || 0} AMC Contract(s) Linked
                  </span>

                  <button
                    onClick={() => {
                       openProvider(p.id);
                    }}
                    className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-[#6C2BD9] font-semibold rounded text-xs transition-colors"
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
                      ? 'bg-purple-100 border-[#6C2BD9] text-black font-extrabold'
                      : 'border-transparent text-black font-semibold hover:text-black hover:bg-purple-50'
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 font-semibold focus:outline-none focus:border-[#6C2BD9] disabled:opacity-60"
                      />
                      <label className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.autoGenerateCode}
                          onChange={(e) => handleInputChange('autoGenerateCode', e.target.checked)}
                          className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] font-medium"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] font-semibold"
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                        <div className="w-24 h-16 mx-auto bg-white border border-slate-200 rounded-lg flex items-center justify-center font-bold text-purple-900 text-sm shadow-2xs mb-2">
                          {formData.logoUrl ? <img src={formData.logoUrl} alt="Provider logo" className="h-full w-full object-contain" /> : formData.providerName ? <span className="text-xs text-center px-1 font-bold text-[#6C2BD9]">{formData.providerName}</span> : 'Logo'}
                        </div>
                        <label className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 hover:bg-slate-50 shadow-2xs cursor-pointer">
                          <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={e => uploadLogo(e.target.files?.[0])} />
                          <Upload className="w-3.5 h-3.5 text-[#6C2BD9]" /> Upload Logo
                        </label>
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
                            className="text-[#6C2BD9] focus:ring-[#6C2BD9]"
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
                          formData.preferredProvider ? 'bg-[#6C2BD9]' : 'bg-slate-300'
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] font-medium"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Emirate <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.emirate}
                        onChange={(e) => handleInputChange('emirate', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] font-medium"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] font-medium"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#6C2BD9]"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Mobile
                    </label>
                    <input
                      type="text"
                          value={formData.mobile || ''}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      placeholder="+971 50 123 4567"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Department
                    </label>
                    <select
                      value={formData.department || ''}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] font-medium"
                    >
                      <option value="">Select department</option>
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
                      className="w-4 h-4 text-[#6C2BD9] rounded focus:ring-[#6C2BD9]"
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
                    className="px-3 py-1.5 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#6C2BD9]" /> Add Contact
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
                          <td className="p-2.5 text-[#6C2BD9]">{alt.email}</td>
                          <td className="p-2.5 font-mono">{alt.phone}</td>
                          <td className="p-2.5 font-mono">{alt.mobile}</td>
                          <td className="p-2.5 text-right space-x-2">
                            <button onClick={() => { setNewContactPerson(alt); setShowAddContactPersonModal(true); }} className="text-slate-400 hover:text-[#6C2BD9] p-1">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => removeChild('contacts', alt.id)}
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
                            ? 'border-[#6C2BD9] text-[#6C2BD9] font-bold'
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
                        value={addressValue('addressLine1')}
                        onChange={(e) => updateAddress('addressLine1', e.target.value)}
                        placeholder="Al Futtaim Building, Sheikh Zayed Road"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={addressValue('addressLine2')}
                        onChange={(e) => updateAddress('addressLine2', e.target.value)}
                        placeholder="P.O. Box 12345"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={addressValue('city')}
                        onChange={(e) => updateAddress('city', e.target.value)}
                        placeholder="Dubai"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Emirate <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={addressValue('emirate')}
                        onChange={(e) => updateAddress('emirate', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] font-medium"
                      >
                        <option value="">Select Emirate</option>
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
                        value={addressValue('country')}
                        onChange={(e) => updateAddress('country', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] font-medium"
                      >
                        <option value="">Select Country</option>
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
                        value={addressValue('postalCode')}
                        onChange={(e) => updateAddress('postalCode', e.target.value)}
                        placeholder="12345"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                    <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6C2BD9]" />
                    <input
                      type="text"
                      placeholder="Search or enter address"
                      value={mapSearchAddress}
                      onChange={(e) => setMapSearchAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9]"
                    />
                  </div>

                  {/* Map Graphic Box */}
                  <div className="relative w-full h-40 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner group">
                    <div className="absolute inset-0 opacity-80 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px]" />
                    <div className="absolute w-full h-3 bg-slate-200 top-1/2 -rotate-12" />
                    <div className="absolute w-2 h-full bg-slate-200 left-1/3 rotate-6" />
                    <span className="absolute left-3 top-3 text-[9px] font-bold text-slate-400 font-mono">Location preview</span>

                    {/* Red Map Pin matching Screenshot */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md font-bold text-xs">
                        📍
                      </div>
                      <span className="bg-slate-900/90 text-white text-[9px] px-2 py-0.5 rounded shadow-md font-semibold mt-0.5 whitespace-nowrap">
                        {addressValue('addressLine1') || 'No address selected'}
                      </span>
                    </div>

                    <button onClick={() => { const address = [addressValue('addressLine1'), addressValue('city'), addressValue('country')].filter(Boolean).join(', '); if (address) window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address), '_blank', 'noopener,noreferrer'); }} className="absolute top-2 right-2 p-1 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 shadow-2xs">
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
                          category: '',
                          type: 'PREVENTIVE',
                          desc: '',
                          coverageType: 'ALL',
                          specificLocation: '',
                          status: 'Active'
                        });
                      }}
                      className="px-3 py-1.5 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#6C2BD9]" /> Add Category
                    </button>
                  </div>

                  <div className="overflow-auto max-h-[350px] border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider shadow-2xs">
                        <tr>
                          <th className="p-2.5 w-8">
                            <input type="checkbox" className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]" />
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
                              <input type="checkbox" className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]" />
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
                                    id: sc.id,
                                    category: sc.category,
                                    type: sc.type,
                                    desc: sc.desc,
                                    coverageType: sc.coverage.includes('All') ? 'ALL' : 'SPECIFIC',
                                    specificLocation: sc.coverage,
                                    status: sc.status
                                  });
                                }}
                                className="text-slate-400 hover:text-[#6C2BD9] p-1"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  removeChild('categories', sc.id);
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

                  <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-slate-600">Showing {serviceCategoriesList.length} records</span>
                    <span className="text-slate-400">Scroll down to view all records</span>
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#6C2BD9]"
                        >
                          <option value="">Select category</option>
                          {categoryOptions.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Service Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={categoryForm.type}
                          onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#6C2BD9]"
                        >
                          <option value="PREVENTIVE">Preventive</option>
                          <option value="CORRECTIVE">Corrective</option>
                          <option value="INSPECTION">Inspection</option>
                          <option value="CERTIFICATION">Certification</option>
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                            className="text-[#6C2BD9] focus:ring-[#6C2BD9]"
                          />
                          <span>All Locations</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="coverageTypeRadio"
                            checked={categoryForm.coverageType === 'SPECIFIC'}
                            onChange={() => setCategoryForm({ ...categoryForm, coverageType: 'SPECIFIC' })}
                            className="text-[#6C2BD9] focus:ring-[#6C2BD9]"
                          />
                          <span>Specific Locations</span>
                        </label>
                      </div>

                      <div className="relative pt-1">
                        <select value={categoryForm.specificLocation} onChange={e => setCategoryForm({ ...categoryForm, specificLocation: e.target.value })} disabled={categoryForm.coverageType !== 'SPECIFIC'} className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#6C2BD9]">
                          <option value="">Select site</option>{siteOptions.map(site => <option key={site.id} value={site.name}>{site.name}</option>)}
                        </select>
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
                          category: '',
                          type: 'PREVENTIVE',
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
                        saveCategory();
                      }}
                      className="px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold transition-all shadow-xs"
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
                      onClick={() => editService()}
                      className="px-3 py-1.5 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#6C2BD9]" /> Add Service
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="p-2.5 w-8">
                            <input type="checkbox" className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]" />
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
                              <input type="checkbox" className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9]" />
                            </td>
                            <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-slate-900">{svc.name}</td>
                            <td className="p-2.5 font-mono text-[#6C2BD9] font-semibold">{svc.code}</td>
                            <td className="p-2.5 font-mono text-slate-700">{svc.sla}</td>
                            <td className="p-2.5 font-bold text-emerald-600">{svc.rate}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                                {svc.status}
                              </span>
                            </td>
                            <td className="p-2.5 text-right space-x-1.5">
                              <button onClick={() => editService(svc)} className="text-slate-400 hover:text-[#6C2BD9] p-1"><Edit3 className="w-3.5 h-3.5" /></button>
                              <button
                                onClick={() => {
                                  removeChild('services', svc.id);
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
                      onClick={() => editCertification()}
                      className="px-3 py-1.5 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#6C2BD9]" /> Add Certification
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
                              <button onClick={() => editService(svc)} className="text-slate-400 hover:text-[#6C2BD9] p-1"><Edit3 className="w-3.5 h-3.5" /></button>
                              <button
                                onClick={() => {
                                  removeChild('certifications', cert.id);
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
                        onClick={() => setSelectedContractForm({ contractNo: '', contractName: '', contractType: 'ANNUAL_MAINTENANCE', status: 'Active', startDate: '', endDate: '', contractValue: '', currency: formData.defaultCurrency || 'AED', description: '', assetIds: [], coverageTarget: 'SPECIFIC' })}
                        className="px-3 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs whitespace-nowrap"
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-medium">Status</span>
                        <select
                          value={contractStatusFilter}
                          onChange={(e) => setContractStatusFilter(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#6C2BD9]"
                        >
                          <option value="All">All</option>
                          <option value="Active">Active</option>
                          <option value="Expiring">Expiring</option>
                          <option value="Expired">Expired</option>
                        </select>

                        <button onClick={() => { setContractSearchTerm(''); setContractStatusFilter('All'); }} title="Clear contract filters" className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100">
                          <Filter className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Contracts Table */}
                    <div className="overflow-auto max-h-[350px] border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider shadow-2xs">
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
                          {amcContractsList.filter(cnt => (!contractSearchTerm || [cnt.contractNo, cnt.contractName, cnt.referenceNo].some(value => String(value || '').toLowerCase().includes(contractSearchTerm.toLowerCase()))) && (contractStatusFilter === 'All' || cnt.status === contractStatusFilter)).map((cnt, idx) => (
                            <tr key={cnt.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                              <td className="p-2.5 font-mono font-bold text-[#6C2BD9]">{cnt.contractNo}</td>
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
                                  onClick={() => setSelectedContractForm({ ...cnt, startDate: cnt.startDateInput, endDate: cnt.endDateInput, assetIds: cnt.assetIds || [], coverageTarget: 'SPECIFIC' })}
                                  className="text-slate-400 hover:text-[#6C2BD9] p-1"
                                  title="View Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => editCertification(cert)} className="text-slate-400 hover:text-[#6C2BD9] p-1">
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => removeContract(cnt.id)}
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

                    {/* Scroll Footer */}
                    <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-medium text-slate-600">Showing {amcContractsList.length} records</span>
                      <span className="text-slate-400">Scroll down to view all records</span>
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
                      <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#6C2BD9] text-white flex items-center justify-center font-bold shadow-2xs">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-600">Assets Covered</p>
                          <p className="text-xl font-bold text-slate-900">{new Set(amcContractsList.flatMap(c => c.assetIds || [])).size}</p>
                        </div>
                      </div>

                      {/* KPI Card 2 */}
                      <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-600">Locations Covered</p>
                          <p className="text-xl font-bold text-slate-900">{new Set(assetOptions.filter(a => amcContractsList.some(c => c.assetIds?.includes(a.id))).map(a => a.siteId).filter(Boolean)).size}</p>
                        </div>
                      </div>

                      {/* KPI Card 3 */}
                      <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold shadow-2xs">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-600">Service Categories</p>
                          <p className="text-xl font-bold text-slate-900">{serviceCategoriesList.length}</p>
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
                          {amcContractsList.filter(c => { const days = (new Date(c.endDateInput) - new Date()) / 86400000; return days >= 0 && days <= 90; }).map(c => (
                            <tr key={c.id} className="hover:bg-amber-50/30 transition-colors">
                              <td className="p-2.5 font-mono font-bold text-[#6C2BD9]">{c.contractNo}</td>
                              <td className="p-2.5 font-bold text-slate-900">{c.contractName}</td>
                              <td className="p-2.5 font-mono text-slate-700">{c.endDate}</td>
                              <td className="p-2.5">{Math.ceil((new Date(c.endDateInput) - new Date()) / 86400000)}</td>
                              <td className="p-2.5 font-semibold text-slate-900">{c.value}</td>
                              <td className="p-2.5 text-right"><button onClick={() => setSelectedContractForm({ ...c, startDate: c.startDateInput, endDate: c.endDateInput })} className="text-slate-400 hover:text-[#6C2BD9] p-1"><Eye className="w-3.5 h-3.5" /></button></td>
                            </tr>
                          ))}
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
                      <h3 className="text-xs font-bold text-[#6C2BD9]">Contract Information</h3>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Contract No. <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={selectedContractForm.contractNo}
                            onChange={(e) => setSelectedContractForm({ ...selectedContractForm, contractNo: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#6C2BD9]"
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
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Currency
                          </label>
                          <select
                            value={selectedContractForm.currency || 'AED'}
                            onChange={(e) => setSelectedContractForm({ ...selectedContractForm, currency: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#6C2BD9]"
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
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                        />
                      </div>
                    </div>

                    {/* SECTION 2: COVERAGE DETAILS */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <h3 className="text-xs font-bold text-[#6C2BD9]">Coverage Details</h3>
                      <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold">
                        {['Covered Assets', 'Covered Locations', 'Covered Categories'].map(ctab => (
                          <button key={ctab} type="button" onClick={() => setCoverageSubTab(ctab)}
                            className={coverageSubTab === ctab ? 'pb-1.5 px-2 border-b-2 border-[#6C2BD9] text-[#6C2BD9] font-bold' : 'pb-1.5 px-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800'}>{ctab}</button>
                        ))}
                      </div>
                      {coverageSubTab === 'Covered Assets' && <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
                          <label className="flex items-center gap-1.5"><input type="radio" name="coverageTargetRadio" checked={selectedContractForm.coverageTarget === 'ALL'} onChange={() => setSelectedContractForm({ ...selectedContractForm, coverageTarget: 'ALL', assetIds: assetOptions.map(a => a.id) })} />All Assets</label>
                          <label className="flex items-center gap-1.5"><input type="radio" name="coverageTargetRadio" checked={selectedContractForm.coverageTarget !== 'ALL'} onChange={() => setSelectedContractForm({ ...selectedContractForm, coverageTarget: 'SPECIFIC' })} />Specific Assets</label>
                        </div>
                        <div className="max-h-36 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2">
                          {assetOptions.map(asset => <label key={asset.id} className="flex items-center gap-2 py-1 text-xs"><input type="checkbox" checked={(selectedContractForm.assetIds || []).includes(asset.id)} onChange={e => setSelectedContractForm(prev => ({ ...prev, coverageTarget: 'SPECIFIC', assetIds: e.target.checked ? [...(prev.assetIds || []), asset.id] : (prev.assetIds || []).filter(id => id !== asset.id) }))} />{asset.assetId} — {asset.description}</label>)}
                          {!assetOptions.length && <span className="text-slate-500">No registered assets available.</span>}
                        </div>
                      </div>}
                      {coverageSubTab === 'Covered Locations' && <div className="text-xs text-slate-700">{[...new Set(assetOptions.filter(a => selectedContractForm.assetIds?.includes(a.id)).map(a => a.site?.name).filter(Boolean))].join(', ') || 'No locations covered.'}</div>}
                      {coverageSubTab === 'Covered Categories' && <div className="text-xs text-slate-700">{[...new Set(assetOptions.filter(a => selectedContractForm.assetIds?.includes(a.id)).map(a => a.category?.name).filter(Boolean))].join(', ') || 'No categories covered.'}</div>}
                    </div>
                  </div>

                  {/* Form Action Buttons matching screenshot */}
                  <div className="flex justify-end items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedContractForm({})}
                      className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => saveContract(selectedContractForm, true)}
                      className="px-3.5 py-1.5 border border-[#6C2BD9] text-[#6C2BD9] rounded-lg text-xs font-semibold hover:bg-purple-50 flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" /> Save as Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => saveContract(selectedContractForm)}
                      className="px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold rounded-lg text-xs transition-all shadow-xs"
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
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#6C2BD9]"
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
                          className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] w-44"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Documents Table */}
                  <div className="overflow-auto max-h-[350px] border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider shadow-2xs">
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
                                    <div className="w-6 h-6 rounded bg-[#6C2BD9] flex items-center justify-center text-white text-[9px] font-bold shrink-0 shadow-2xs font-serif">
                                      W
                                    </div>
                                  )}
                                  <span className="text-[#6C2BD9] font-medium hover:underline cursor-pointer">
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
                                  onClick={() => setSelectedDocForm({ ...doc, validTill: doc.validTillInput })}
                                  className="text-[#6C2BD9] hover:text-purple-900 p-1"
                                  title="View Document Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => window.open(doc.storageUrl, '_blank', 'noopener,noreferrer')}
                                  className="text-[#6C2BD9] hover:text-purple-900 p-1"
                                  title="Download"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => removeChild('documents', doc.id)}
                                  className="text-[#6C2BD9] hover:text-red-600 p-1"
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

                  {/* Scroll Footer */}
                  <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-slate-600">Showing {providerDocumentsList.length} records</span>
                    <span className="text-slate-400">Scroll down to view all records</span>
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
                    <div className="border-2 border-dashed border-purple-200 bg-purple-50/30 hover:bg-purple-50/60 rounded-xl p-6 text-center transition-all cursor-pointer group">
                      <div className="w-12 h-12 rounded-full bg-white border border-purple-200 flex items-center justify-center text-[#6C2BD9] mx-auto mb-2 shadow-2xs group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6 text-[#6C2BD9]" />
                      </div>

                      <p className="text-xs font-bold text-slate-800">
                        Drag and drop files here
                      </p>
                      <p className="text-[11px] text-slate-400 my-1">or</p>

                      <label className="inline-block">
                        <input
                          type="file"
                          className="hidden"
                          onChange={e => { const selected = e.target.files?.[0]; if (selected) uploadProviderDocument(selected); }}
                        />
                        <span className="px-4 py-1.5 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs inline-block">
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#6C2BD9]"
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
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                        />
                      </div>
                      <button type="button" onClick={saveDocumentDetails} className="px-3 py-1.5 bg-[#6C2BD9] text-white rounded-lg text-xs font-bold">Save Document Details</button>
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
                        onClick={exportHistory}
                        className="px-3.5 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 self-start sm:self-auto"
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
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-6 py-1.5 text-[11px] text-slate-900 font-medium focus:outline-none focus:border-[#6C2BD9]"
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                        />
                      </div>

                      {/* Service Type */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Service Type</label>
                        <select
                          value={shTypeFilter}
                          onChange={(e) => setShTypeFilter(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] text-slate-900 font-medium focus:outline-none focus:border-[#6C2BD9]"
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] text-slate-900 font-medium focus:outline-none focus:border-[#6C2BD9]"
                        >
                          <option value="All">All</option>
                          <option value="Completed">Completed</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-auto max-h-[400px] border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider shadow-2xs">
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
                                onClick={() => setSelectedServiceRecord(sh)}
                                className={`cursor-pointer transition-colors ${
                                  selectedServiceRecord.workOrderNo === sh.workOrderNo ? 'bg-purple-50/80 font-bold' : 'hover:bg-slate-50/70'
                                }`}
                              >
                                <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                                <td className="p-2.5 font-mono font-bold text-[#6C2BD9]">{sh.workOrderNo}</td>
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
                                  <button onClick={e => { e.stopPropagation(); navigate('/maintenance?workOrder=' + sh.id); }} className="text-[#6C2BD9] hover:text-purple-900 p-1" title="View Work Order Record">
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Scroll Footer */}
                    <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-medium text-slate-600">Showing {serviceHistoryRecordsList.length} records</span>
                      <span className="text-slate-400">Scroll down to view all records</span>
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
                        <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-purple-100 text-[#6C2BD9] flex items-center justify-center shrink-0">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500">Total Services</p>
                            <p className="text-lg font-extrabold text-slate-900">{serviceHistoryRecordsList.length}</p>
                          </div>
                        </div>

                        {/* Completed */}
                        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500">Completed</p>
                            <p className="text-lg font-extrabold text-slate-900">{serviceHistoryRecordsList.filter(item => item.status === 'Completed').length}</p>
                          </div>
                        </div>

                        {/* In Progress */}
                        <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500">In Progress</p>
                            <p className="text-lg font-extrabold text-slate-900">{serviceHistoryRecordsList.filter(item => item.status === 'In Progress').length}</p>
                          </div>
                        </div>

                        {/* Cancelled */}
                        <div className="bg-red-50/60 border border-red-100 rounded-xl p-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500">Cancelled</p>
                            <p className="text-lg font-extrabold text-slate-900">{serviceHistoryRecordsList.filter(item => item.status === 'Cancelled').length}</p>
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
                              className="text-[#6C2BD9] stroke-current"
                              strokeWidth="4"
                              strokeDasharray={historyPercent('Preventive Maintenance') + ' 100'}
                              strokeDashoffset="0"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            {/* Segment 2: Corrective 31% (Purple) */}
                            <path
                              className="text-purple-500 stroke-current"
                              strokeWidth="4"
                              strokeDasharray={historyPercent('Corrective Maintenance') + ' 100'}
                              strokeDashoffset={-historyPercent('Preventive Maintenance')}
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            {/* Segment 3: Inspection 12% (Green) */}
                            <path
                              className="text-emerald-500 stroke-current"
                              strokeWidth="4"
                              strokeDasharray={historyPercent('Inspection') + ' 100'}
                              strokeDashoffset={-(historyPercent('Preventive Maintenance') + historyPercent('Corrective Maintenance'))}
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            {/* Segment 4: Certification 4% (Amber) */}
                            <path
                              className="text-amber-500 stroke-current"
                              strokeWidth="4"
                              strokeDasharray={historyPercent('Certification') + ' 100'}
                              strokeDashoffset={-(historyPercent('Preventive Maintenance') + historyPercent('Corrective Maintenance') + historyPercent('Inspection'))}
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute text-center">
                            <p className="text-base font-extrabold text-slate-900 leading-none">{serviceHistoryRecordsList.length}</p>
                            <p className="text-[9px] font-semibold text-slate-400">Total</p>
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="space-y-1.5 text-[11px] font-medium text-slate-700 flex-1">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded bg-[#6C2BD9] inline-block" />
                              <span>Preventive Maintenance</span>
                            </div>
                            <span className="font-bold text-slate-900">{historyCount('Preventive Maintenance')} ({historyPercent('Preventive Maintenance')}%)</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded bg-purple-500 inline-block" />
                              <span>Corrective Maintenance</span>
                            </div>
                            <span className="font-bold text-slate-900">{historyCount('Corrective Maintenance')} ({historyPercent('Corrective Maintenance')}%)</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                              <span>Inspection</span>
                            </div>
                            <span className="font-bold text-slate-900">{historyCount('Inspection')} ({historyPercent('Inspection')}%)</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
                              <span>Certification</span>
                            </div>
                            <span className="font-bold text-slate-900">{historyCount('Certification')} ({historyPercent('Certification')}%)</span>
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
                        onClick={() => selectedServiceRecord.id && navigate('/maintenance?workOrder=' + selectedServiceRecord.id)}
                        className="px-3 py-1 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        View Work Order <ExternalLink className="w-3 h-3 text-[#6C2BD9]" />
                      </button>
                    </div>

                    <h2 className="text-sm font-bold text-slate-900">
                      Service Record Details
                    </h2>

                    <div className="space-y-2.5 text-xs">
                      <div className="grid grid-cols-3 text-slate-600">
                        <span className="font-semibold text-slate-500">Work Order No.</span>
                        <span className="col-span-2 font-mono font-bold text-[#6C2BD9]">{selectedServiceRecord.workOrderNo}</span>
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
                        onClick={() => (selectedServiceRecord.attachments || []).forEach(att => window.open(att.url, '_blank', 'noopener,noreferrer'))}
                        disabled={!selectedServiceRecord.attachments?.length}
                        className="text-xs font-semibold text-[#6C2BD9] hover:text-purple-900 flex items-center gap-1"
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
                              <td className="p-2 font-medium text-[#6C2BD9] hover:underline cursor-pointer">{att.name}</td>
                              <td className="p-2 text-slate-500 font-mono text-[11px]">{att.size}</td>
                              <td className="p-2 text-right">
                                <button 
                                  onClick={() => window.open(att.url, '_blank', 'noopener,noreferrer')}
                                  className="text-[#6C2BD9] hover:text-purple-900 p-1"
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
                      onClick={() => setSelectedNoteForm({ type: 'General', subject: '', description: '', relatedTo: 'General', reference: '' })}
                      className="px-3.5 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 self-start sm:self-auto"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
                      />
                    </div>

                    {/* Note Type Filter */}
                    <div>
                      <select
                        value={noteTypeFilter}
                        onChange={(e) => setNoteTypeFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#6C2BD9]"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#6C2BD9]"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] placeholder-slate-400"
                      />
                      <Calendar className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  {/* Notes Table */}
                  <div className="overflow-auto max-h-[350px] border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider shadow-2xs">
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
                                selectedNoteForm.id === n.id ? 'bg-purple-50/80 font-bold' : 'hover:bg-slate-50/70'
                              }`}
                            >
                              <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                              
                              <td className="p-2.5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  n.type === 'General' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                                  n.type === 'Meeting' ? 'bg-purple-50 text-[#6C2BD9] border-purple-200' :
                                  n.type === 'Follow Up' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  n.type === 'Issue' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                                }`}>
                                  {n.type}
                                </span>
                              </td>

                              <td className="p-2.5 font-bold text-[#6C2BD9] hover:underline">
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
                                  className="text-[#6C2BD9] hover:text-purple-900 p-1"
                                  title="View Note Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNoteForm(n);
                                  }}
                                  className="text-[#6C2BD9] hover:text-purple-900 p-1"
                                  title="Edit Note"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeChild('notes', n.id);
                                  }}
                                  className="text-[#6C2BD9] hover:text-red-600 p-1"
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

                  {/* Scroll Footer */}
                  <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-slate-600">Showing {providerNotesList.length} records</span>
                    <span className="text-slate-400">Scroll down to view all records</span>
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#6C2BD9]"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-[#6C2BD9] leading-relaxed"
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#6C2BD9]"
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
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-7 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#6C2BD9]"
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
                          value={selectedNoteForm.createdBy || ''}
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
                            value={selectedNoteForm.createdOn || ''}
                            onChange={(e) => setSelectedNoteForm({ ...selectedNoteForm, createdOn: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-7 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#6C2BD9] font-mono text-[11px]"
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
                          value={selectedNoteForm.lastModifiedBy || ''}
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
                            value={selectedNoteForm.lastModifiedOn || ''}
                            onChange={(e) => setSelectedNoteForm({ ...selectedNoteForm, lastModifiedOn: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-7 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#6C2BD9] font-mono text-[11px]"
                          />
                          <Calendar className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    {/* Purple Info Notice Box matching Screenshot */}
                    <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-start gap-2.5 text-purple-900 text-[11px] font-medium mt-2">
                      <AlertCircle className="w-4 h-4 text-[#6C2BD9] shrink-0 mt-0.5" />
                      <span>
                        Notes are for internal reference only and are not shared with the service provider.
                      </span>
                    </div>

                    {/* Save Note Action */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={saveNote}
                        className="w-full py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
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
                className="px-5 py-2 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-60"
              >
                <FileText className="w-4 h-4 text-[#6C2BD9]" /> Save as Draft
              </button>

              <button
                disabled={saving}
                onClick={() => handleSave(false)}
                className="px-6 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-60"
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
                <FileCheck className="w-4 h-4 text-[#6C2BD9]" /> Link New Service Contract / AMC
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#6C2BD9] font-semibold"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={newContractForm.endDate}
                    onChange={(e) => setNewContractForm({ ...newContractForm, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#6C2BD9]"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Contract Value (AED)</label>
                  <input
                    type="number"
                    value={newContractForm.contractValue}
                    onChange={(e) => setNewContractForm({ ...newContractForm, contractValue: e.target.value })}
                    placeholder="185000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#6C2BD9] font-mono font-bold text-emerald-600"
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
                  className="px-4 py-2 bg-[#6C2BD9] text-white rounded-lg text-xs font-bold hover:bg-[#5B21B6]"
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
                <User className="w-4 h-4 text-[#6C2BD9]" /> Add Alternate Contact Person
              </h3>
              <button onClick={() => setShowAddContactPersonModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form
              onSubmit={async e => { e.preventDefault();
                if (!newContactPerson.name || !newContactPerson.email) return showToastMsg('Name and Email are required.', 'error');
                const saved = await saveChild('contacts', { name: newContactPerson.name, designation: newContactPerson.designation,
                  email: newContactPerson.email, phone: newContactPerson.phone, mobile: newContactPerson.mobile, isPrimary: false }, newContactPerson.id);
                if (!saved) return;
                setShowAddContactPersonModal(false);
                setNewContactPerson({ name: '', designation: '', email: '', phone: '', mobile: '' });
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#6C2BD9] font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={newContactPerson.designation}
                  onChange={(e) => setNewContactPerson({ ...newContactPerson, designation: e.target.value })}
                  placeholder="e.g. Technical Coordinator"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#6C2BD9]"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#6C2BD9]"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-[#6C2BD9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Mobile</label>
                  <input
                    type="text"
                    value={newContactPerson.mobile}
                    onChange={(e) => setNewContactPerson({ ...newContactPerson, mobile: e.target.value })}
                    placeholder="+971 50 999 8877"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-[#6C2BD9]"
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
                  className="px-4 py-2 bg-[#6C2BD9] text-white rounded-lg text-xs font-bold hover:bg-[#5B21B6]"
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
