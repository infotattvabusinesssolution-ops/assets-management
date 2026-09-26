import React, { useState, useMemo } from 'react';
import {
  Coins,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit2,
  Network,
  MapPin,
  XCircle,
  CheckCircle2,
  Trash2,
  ChevronDown,
  Download,
  Calendar,
  Settings,
  ChevronUp,
  X,
  Building2,
  DollarSign
} from 'lucide-react';
import clsx from 'clsx';

export const INITIAL_COST_CENTERS = [
  {
    id: 1,
    code: '1000',
    name: 'Corporate Services',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate',
    department: 'Finance',
    location: 'Dubai HQ',
    type: 'Support',
    status: 'Active',
    currency: 'AED',
    createdBy: 'System',
    createdOn: '10 Jan 2025',
    description: 'Central corporate financial services'
  },
  {
    id: 2,
    code: '1100',
    name: 'Human Resources',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate',
    department: 'Human Resources',
    location: 'Dubai HQ',
    type: 'Support',
    status: 'Active',
    currency: 'AED',
    createdBy: 'System',
    createdOn: '10 Jan 2025',
    description: 'HR policy and recruitment'
  },
  {
    id: 3,
    code: '1200',
    name: 'IT & Infrastructure',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate',
    department: 'IT',
    location: 'Dubai HQ',
    type: 'Support',
    status: 'Active',
    currency: 'AED',
    createdBy: 'System',
    createdOn: '11 Jan 2025',
    description: 'Enterprise IT infrastructure & hardware'
  },
  {
    id: 4,
    code: '2000',
    name: 'Operations - UAE',
    company: 'Wavelogix FZC',
    businessUnit: 'Operations',
    department: 'Operations',
    location: 'Jebel Ali Warehouse',
    type: 'Operational',
    status: 'Active',
    currency: 'AED',
    createdBy: 'Ramesh Kumar',
    createdOn: '12 Jan 2025',
    description: 'UAE logistical operations and storage'
  },
  {
    id: 5,
    code: '2100',
    name: 'Operations - KSA',
    company: 'd.code Solutions LLC',
    businessUnit: 'Operations',
    department: 'Operations',
    location: 'Riyadh Office',
    type: 'Operational',
    status: 'Active',
    currency: 'SAR',
    createdBy: 'Sarah Ahmed',
    createdOn: '12 Jan 2025',
    description: 'KSA regional operations and transfers'
  },
  {
    id: 6,
    code: '3000',
    name: 'Sales & Marketing',
    company: 'Digital ID Solutions',
    businessUnit: 'Sales',
    department: 'Sales',
    location: 'Dubai HQ',
    type: 'Revenue',
    status: 'Active',
    currency: 'AED',
    createdBy: 'John Doe',
    createdOn: '13 Jan 2025',
    description: 'Commercial client acquisition and campaigns'
  },
  {
    id: 7,
    code: '3100',
    name: 'Customer Support',
    company: 'Asset360 Holdings',
    businessUnit: 'Support',
    department: 'Customer Support',
    location: 'Dubai HQ',
    type: 'Support',
    status: 'Active',
    currency: 'AED',
    createdBy: 'Priya Nair',
    createdOn: '14 Jan 2025',
    description: 'Asset helpdesk and client support'
  },
  {
    id: 8,
    code: '4000',
    name: 'R&D',
    company: 'Asset360 Holdings',
    businessUnit: 'Innovation',
    department: 'Research & Development',
    location: 'Dubai HQ',
    type: 'Capital',
    status: 'Inactive',
    currency: 'AED',
    createdBy: 'System',
    createdOn: '15 Jan 2025',
    description: 'IoT tag research & prototype labs'
  },
  {
    id: 9,
    code: '5000',
    name: 'Facilities Management',
    company: 'Green Arabia LLC',
    businessUnit: 'Administration',
    department: 'Facilities',
    location: 'Fujairah Site',
    type: 'Support',
    status: 'Active',
    currency: 'AED',
    createdBy: 'Mohammed Ali',
    createdOn: '16 Jan 2025',
    description: 'Physical site maintenance and utilities'
  },
  {
    id: 10,
    code: '6000',
    name: 'Regional Office - Qatar',
    company: 'Digital ID Solutions',
    businessUnit: 'Operations',
    department: 'Administration',
    location: 'Doha Office',
    type: 'Operational',
    status: 'Active',
    currency: 'QAR',
    createdBy: 'Sarah Ahmed',
    createdOn: '17 Jan 2025',
    description: 'Qatar regional operational administration'
  },
  {
    id: 11,
    code: '6100',
    name: 'Logistics & Transfers',
    company: 'Asset360 Holdings',
    businessUnit: 'Operations',
    department: 'Logistics',
    location: 'Sharjah Warehouse',
    type: 'Operational',
    status: 'Active',
    currency: 'AED',
    createdBy: 'Ramesh Kumar',
    createdOn: '18 Jan 2025',
    description: 'Inter-warehouse transfers and freight'
  },
  {
    id: 12,
    code: '7000',
    name: 'Quality Assurance',
    company: 'Wavelogix FZC',
    businessUnit: 'Operations',
    department: 'Quality Assurance',
    location: 'Abu Dhabi Office',
    type: 'Support',
    status: 'Active',
    currency: 'AED',
    createdBy: 'System',
    createdOn: '19 Jan 2025',
    description: 'Quality inspection & tag calibration'
  },
  {
    id: 13,
    code: '7100',
    name: 'Procurement & Sourcing',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate',
    department: 'Procurement',
    location: 'Dubai HQ',
    type: 'Support',
    status: 'Active',
    currency: 'AED',
    createdBy: 'John Doe',
    createdOn: '20 Jan 2025',
    description: 'Vendor procurement and purchase orders'
  },
  {
    id: 14,
    code: '8000',
    name: 'HSE & Audit',
    company: 'Green Arabia LLC',
    businessUnit: 'Corporate',
    department: 'HSE',
    location: 'Fujairah Site',
    type: 'Support',
    status: 'Active',
    currency: 'AED',
    createdBy: 'Priya Nair',
    createdOn: '21 Jan 2025',
    description: 'Safety compliance & regulatory audits'
  },
  {
    id: 15,
    code: '8100',
    name: 'Legal & Compliance',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate',
    department: 'Legal',
    location: 'Dubai HQ',
    type: 'Support',
    status: 'Active',
    currency: 'AED',
    createdBy: 'System',
    createdOn: '22 Jan 2025',
    description: 'Corporate governance and contracts'
  },
  {
    id: 16,
    code: '9000',
    name: 'Branch Operations - Oman',
    company: 'Asset360 Holdings',
    businessUnit: 'Operations',
    department: 'Operations',
    location: 'Muscat Service Center',
    type: 'Operational',
    status: 'Active',
    currency: 'OMR',
    createdBy: 'Sarah Ahmed',
    createdOn: '23 Jan 2025',
    description: 'Oman service operations and support'
  },
  {
    id: 17,
    code: '9100',
    name: 'Fleet & Transport',
    company: 'Wavelogix FZC',
    businessUnit: 'Operations',
    department: 'Logistics',
    location: 'Dammam Warehouse',
    type: 'Operational',
    status: 'Active',
    currency: 'SAR',
    createdBy: 'Ramesh Kumar',
    createdOn: '24 Jan 2025',
    description: 'Transport fleet maintenance & fuel'
  },
  {
    id: 18,
    code: '9200',
    name: 'Security & Access Control',
    company: 'Asset360 Holdings',
    businessUnit: 'Administration',
    department: 'Security',
    location: 'Dubai HQ',
    type: 'Support',
    status: 'Active',
    currency: 'AED',
    createdBy: 'John Doe',
    createdOn: '25 Jan 2025',
    description: 'Physical security & RFID barrier access'
  }
];

export function CostCentersTab({ triggerToast, onSwitchTab }) {
  const [costCenters, setCostCenters] = useState(INITIAL_COST_CENTERS);
  const [selectedCcIds, setSelectedCcIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All Companies');
  const [buFilter, setBuFilter] = useState('All Business Units');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [currencyFilter, setCurrencyFilter] = useState('All Currencies');
  const [creatorFilter, setCreatorFilter] = useState('All Users');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);

  // Modals & UI State
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [showAddCcModal, setShowAddCcModal] = useState(false);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [selectedCc, setSelectedCc] = useState(null);
  const [editingCc, setEditingCc] = useState(null);

  const [ccForm, setCcForm] = useState({
    code: '',
    name: '',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate',
    department: 'Finance',
    location: 'Dubai HQ',
    type: 'Support',
    status: 'Active',
    currency: 'AED',
    description: ''
  });

  // Filtered List Memo
  const filteredCostCenters = useMemo(() => {
    return costCenters.filter((cc) => {
      const matchesSearch =
        !searchQuery ||
        cc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cc.description && cc.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCompany =
        companyFilter === 'All Companies' || companyFilter === 'All' || cc.company === companyFilter;

      const matchesBu =
        buFilter === 'All Business Units' || buFilter === 'All' || cc.businessUnit === buFilter;

      const matchesDept =
        deptFilter === 'All Departments' || deptFilter === 'All' || cc.department === deptFilter;

      const matchesLoc =
        locationFilter === 'All Locations' || locationFilter === 'All' || cc.location === locationFilter;

      const matchesType =
        typeFilter === 'All Types' || typeFilter === 'All' || cc.type === typeFilter;

      const matchesStatus =
        statusFilter === 'All Statuses' || statusFilter === 'All Status' || statusFilter === 'All' || cc.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesCurrency =
        currencyFilter === 'All Currencies' || currencyFilter === 'All' || cc.currency === currencyFilter;

      const matchesCreator =
        creatorFilter === 'All Users' || creatorFilter === 'All' || cc.createdBy === creatorFilter;

      return (
        matchesSearch &&
        matchesCompany &&
        matchesBu &&
        matchesDept &&
        matchesLoc &&
        matchesType &&
        matchesStatus &&
        matchesCurrency &&
        matchesCreator
      );
    });
  }, [
    costCenters,
    searchQuery,
    companyFilter,
    buFilter,
    deptFilter,
    locationFilter,
    typeFilter,
    statusFilter,
    currencyFilter,
    creatorFilter
  ]);

  // Paginated List (All cost centers rendered for scroll-down view)
  const paginatedCostCenters = filteredCostCenters;

  const totalPages = Math.ceil(filteredCostCenters.length / pageSize) || 1;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCcIds(paginatedCostCenters.map((cc) => cc.id));
    } else {
      setSelectedCcIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedCcIds.includes(id)) {
      setSelectedCcIds(selectedCcIds.filter((i) => i !== id));
    } else {
      setSelectedCcIds([...selectedCcIds, id]);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCompanyFilter('All Companies');
    setBuFilter('All Business Units');
    setDeptFilter('All Departments');
    setLocationFilter('All Locations');
    setTypeFilter('All Types');
    setStatusFilter('All Statuses');
    setCurrencyFilter('All Currencies');
    setCreatorFilter('All Users');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  const handleOpenAddModal = (ccToEdit = null) => {
    if (ccToEdit) {
      setEditingCc(ccToEdit);
      setCcForm({
        code: ccToEdit.code,
        name: ccToEdit.name,
        company: ccToEdit.company || 'Asset360 Holdings',
        businessUnit: ccToEdit.businessUnit || 'Corporate',
        department: ccToEdit.department || 'Finance',
        location: ccToEdit.location || 'Dubai HQ',
        type: ccToEdit.type || 'Support',
        status: ccToEdit.status || 'Active',
        currency: ccToEdit.currency || 'AED',
        description: ccToEdit.description || ''
      });
    } else {
      setEditingCc(null);
      setCcForm({
        code: '',
        name: '',
        company: 'Asset360 Holdings',
        businessUnit: 'Corporate',
        department: 'Finance',
        location: 'Dubai HQ',
        type: 'Support',
        status: 'Active',
        currency: 'AED',
        description: ''
      });
    }
    setShowAddCcModal(true);
  };

  const handleSaveCc = (e) => {
    e.preventDefault();
    if (!ccForm.code || !ccForm.name) return;

    if (editingCc) {
      setCostCenters(
        costCenters.map((cc) =>
          cc.id === editingCc.id
            ? {
                ...cc,
                code: ccForm.code,
                name: ccForm.name,
                company: ccForm.company,
                businessUnit: ccForm.businessUnit,
                department: ccForm.department,
                location: ccForm.location,
                type: ccForm.type,
                status: ccForm.status,
                currency: ccForm.currency,
                description: ccForm.description
              }
            : cc
        )
      );
      triggerToast && triggerToast(`Cost center "${ccForm.code} - ${ccForm.name}" updated.`);
    } else {
      const newCc = {
        id: Date.now(),
        code: ccForm.code,
        name: ccForm.name,
        company: ccForm.company,
        businessUnit: ccForm.businessUnit,
        department: ccForm.department,
        location: ccForm.location,
        type: ccForm.type,
        status: ccForm.status,
        currency: ccForm.currency,
        createdBy: 'Admin User',
        createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        description: ccForm.description
      };
      setCostCenters([newCc, ...costCenters]);
      triggerToast && triggerToast(`Cost center "${ccForm.code} - ${ccForm.name}" created.`);
    }
    setShowAddCcModal(false);
  };

  const handleToggleStatus = (cc) => {
    setActiveDropdownId(null);
    const nextStatus = cc.status === 'Active' ? 'Inactive' : 'Active';
    setCostCenters(costCenters.map((c) => (c.id === cc.id ? { ...c, status: nextStatus } : c)));
    triggerToast && triggerToast(`Cost center "${cc.code}" status set to ${nextStatus}.`);
  };

  const handleDeleteCc = (cc) => {
    setActiveDropdownId(null);
    if (!window.confirm(`Are you sure you want to delete cost center "${cc.code} - ${cc.name}"?`)) return;
    setCostCenters(costCenters.filter((c) => c.id !== cc.id));
    triggerToast && triggerToast(`Cost center "${cc.code}" deleted.`);
  };

  return (
    <div className="space-y-6">
      {/* Filters Card matching Screenshot */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-[#6C2BD9]" />
            <span>Filters</span>
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-xs font-bold text-[#6C2BD9] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Advanced Filters</span>
            {showAdvancedFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Row 1 Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Company */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Company</label>
            <div className="relative">
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
              >
                <option value="All Companies">All Companies</option>
                <option value="Asset360 Holdings">Asset360 Holdings</option>
                <option value="Wavelogix FZC">Wavelogix FZC</option>
                <option value="d.code Solutions LLC">d.code Solutions LLC</option>
                <option value="Digital ID Solutions">Digital ID Solutions</option>
                <option value="Green Arabia LLC">Green Arabia LLC</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Business Unit */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Business Unit</label>
            <div className="relative">
              <select
                value={buFilter}
                onChange={(e) => setBuFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
              >
                <option value="All Business Units">All Business Units</option>
                <option value="Corporate">Corporate</option>
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
                <option value="Support">Support</option>
                <option value="Innovation">Innovation</option>
                <option value="Administration">Administration</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Department</label>
            <div className="relative">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
              >
                <option value="All Departments">All Departments</option>
                <option value="Finance">Finance</option>
                <option value="Human Resources">Human Resources</option>
                <option value="IT">IT</option>
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Research & Development">Research & Development</option>
                <option value="Facilities">Facilities</option>
                <option value="Administration">Administration</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Location</label>
            <div className="relative">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
              >
                <option value="All Locations">All Locations</option>
                <option value="Dubai HQ">Dubai HQ</option>
                <option value="Jebel Ali Warehouse">Jebel Ali Warehouse</option>
                <option value="Riyadh Office">Riyadh Office</option>
                <option value="Fujairah Site">Fujairah Site</option>
                <option value="Doha Office">Doha Office</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Cost Center Type */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Cost Center Type</label>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
              >
                <option value="All Types">All Types</option>
                <option value="Support">Support</option>
                <option value="Operational">Operational</option>
                <option value="Revenue">Revenue</option>
                <option value="Capital">Capital</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 2 Filters matching Screenshot */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs mt-3 items-end animate-fadeIn">
            {/* Status */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Status</label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Currency</label>
              <div className="relative">
                <select
                  value={currencyFilter}
                  onChange={(e) => setCurrencyFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
                >
                  <option value="All Currencies">All Currencies</option>
                  <option value="AED">AED</option>
                  <option value="SAR">SAR</option>
                  <option value="QAR">QAR</option>
                  <option value="OMR">OMR</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Created By */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Created By</label>
              <div className="relative">
                <select
                  value={creatorFilter}
                  onChange={(e) => setCreatorFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
                >
                  <option value="All Users">All Users</option>
                  <option value="System">System</option>
                  <option value="Ramesh Kumar">Ramesh Kumar</option>
                  <option value="Sarah Ahmed">Sarah Ahmed</option>
                  <option value="John Doe">John Doe</option>
                  <option value="Priya Nair">Priya Nair</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Created Date */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Created Date</label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="From Date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full pl-8 pr-2 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:border-[#6C2BD9] focus:outline-hidden"
                  />
                </div>
                <span className="text-slate-400 font-bold">→</span>
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="To Date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:border-[#6C2BD9] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Search</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by cost center name, code, or description..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-700 transition cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={() => triggerToast && triggerToast('Cost Center filters applied.')}
            className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>

      {/* Cost Centers Table Card matching Screenshot */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900">Cost Centers ({filteredCostCenters.length})</h2>
          <button
            onClick={() => triggerToast && triggerToast('Exporting Cost Centers data...')}
            className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        <div className="overflow-auto max-h-[540px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 shadow-2xs">
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold select-none text-[11px] uppercase tracking-wider">
                <th className="p-3 pl-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedCcIds.length === paginatedCostCenters.length && paginatedCostCenters.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-[#6C2BD9] cursor-pointer"
                  />
                </th>
                <th className="p-3 w-10 text-slate-400">#</th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Cost Center Code</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Cost Center Name</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Company</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Business Unit</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Department</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Location</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Type</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Status</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 text-center font-bold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedCostCenters.length === 0 ? (
                <tr>
                  <td colSpan="11" className="p-8 text-center text-slate-500 font-semibold">
                    No cost centers match current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedCostCenters.map((cc, idx) => {
                  const isSelected = selectedCcIds.includes(cc.id);
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={cc.id}
                      className={clsx(
                        'transition-colors',
                        isSelected ? 'bg-purple-50/40' : 'hover:bg-slate-50/60'
                      )}
                    >
                      <td className="p-3 pl-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(cc.id)}
                          className="rounded border-slate-300 text-[#6C2BD9] cursor-pointer"
                        />
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">{globalIdx}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{cc.code}</td>
                      <td className="p-3 font-bold text-[#6C2BD9]">
                        <span
                          className="cursor-pointer hover:underline"
                          onClick={() => {
                            setSelectedCc(cc);
                            setShowViewDetailsModal(true);
                          }}
                        >
                          {cc.name}
                        </span>
                      </td>
                      <td className="p-3 text-slate-800 font-semibold">{cc.company}</td>
                      <td className="p-3 text-slate-700">{cc.businessUnit}</td>
                      <td className="p-3 text-slate-700 font-medium">{cc.department}</td>
                      <td className="p-3 text-slate-700">{cc.location}</td>
                      <td className="p-3 text-slate-700 font-medium">{cc.type}</td>
                      <td className="p-3">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold',
                            cc.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          )}
                        >
                          {cc.status}
                        </span>
                      </td>
                      <td className="p-3 text-center relative">
                        <button
                          onClick={() => setActiveDropdownId(activeDropdownId === cc.id ? null : cc.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Context Dropdown Menu matching Screenshot */}
                        {activeDropdownId === cc.id && (
                          <div className="absolute right-4 top-10 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 text-left animate-fadeIn">
                            <button
                              onClick={() => {
                                setSelectedCc(cc);
                                setShowViewDetailsModal(true);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <Eye className="w-4 h-4 text-[#6C2BD9]" />
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                handleOpenAddModal(cc);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <Edit2 className="w-4 h-4 text-[#6C2BD9]" />
                              Edit Cost Center
                            </button>
                            <button
                              onClick={() => {
                                triggerToast && triggerToast(`Manage budget for Cost Center ${cc.code}`);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <Coins className="w-4 h-4 text-[#6C2BD9]" />
                              Manage Budget
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdownId(null);
                                onSwitchTab && onSwitchTab('departments');
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <Network className="w-4 h-4 text-[#6C2BD9]" />
                              Assign Departments
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdownId(null);
                                onSwitchTab && onSwitchTab('locations');
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <MapPin className="w-4 h-4 text-[#6C2BD9]" />
                              Assign Location
                            </button>

                            <div className="border-t border-slate-100 my-1"></div>

                            <button
                              onClick={() => handleToggleStatus(cc)}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              {cc.status === 'Active' ? (
                                <>
                                  <XCircle className="w-4 h-4 text-rose-500" />
                                  <span>Deactivate</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  <span>Activate</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleDeleteCc(cc)}
                              className="w-full px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-semibold"
                            >
                              <Trash2 className="w-4 h-4 text-rose-600" />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Summary Footer */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="font-medium text-slate-600">Showing {filteredCostCenters.length} records</div>
          <div className="text-slate-400">Scroll down to view all records</div>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {showViewDetailsModal && selectedCc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center border border-purple-100">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedCc.name}</h3>
                  <p className="text-xs text-slate-400">Code: {selectedCc.code}</p>
                </div>
              </div>
              <button onClick={() => setShowViewDetailsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Description</span>
                <span className="font-bold text-slate-800">{selectedCc.description || '-'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Company</span>
                  <span className="font-bold text-slate-800">{selectedCc.company}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Business Unit</span>
                  <span className="font-bold text-slate-800">{selectedCc.businessUnit}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Department</span>
                  <span className="font-bold text-slate-800">{selectedCc.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Location</span>
                  <span className="font-bold text-slate-800">{selectedCc.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Cost Center Type</span>
                  <span className="font-bold text-[#6C2BD9]">{selectedCc.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Currency</span>
                  <span className="font-mono font-bold text-slate-800">{selectedCc.currency}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Status</span>
                  <span className={clsx('font-bold', selectedCc.status === 'Active' ? 'text-emerald-600' : 'text-rose-600')}>
                    {selectedCc.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Created On</span>
                  <span className="font-mono font-bold text-slate-700">{selectedCc.createdOn}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowViewDetailsModal(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT COST CENTER MODAL */}
      {showAddCcModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-fadeIn text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingCc ? 'Edit Cost Center' : 'Add New Cost Center'}
              </h3>
              <button onClick={() => setShowAddCcModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCc} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cost Center Code *</label>
                  <input
                    type="text"
                    required
                    value={ccForm.code}
                    onChange={(e) => setCcForm({ ...ccForm, code: e.target.value })}
                    placeholder="e.g. 1000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cost Center Name *</label>
                  <input
                    type="text"
                    required
                    value={ccForm.name}
                    onChange={(e) => setCcForm({ ...ccForm, name: e.target.value })}
                    placeholder="e.g. Corporate Services"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company</label>
                  <select
                    value={ccForm.company}
                    onChange={(e) => setCcForm({ ...ccForm, company: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium cursor-pointer"
                  >
                    <option value="Asset360 Holdings">Asset360 Holdings</option>
                    <option value="Wavelogix FZC">Wavelogix FZC</option>
                    <option value="d.code Solutions LLC">d.code Solutions LLC</option>
                    <option value="Digital ID Solutions">Digital ID Solutions</option>
                    <option value="Green Arabia LLC">Green Arabia LLC</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Business Unit</label>
                  <select
                    value={ccForm.businessUnit}
                    onChange={(e) => setCcForm({ ...ccForm, businessUnit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium cursor-pointer"
                  >
                    <option value="Corporate">Corporate</option>
                    <option value="Operations">Operations</option>
                    <option value="Sales">Sales</option>
                    <option value="Support">Support</option>
                    <option value="Innovation">Innovation</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={ccForm.department}
                    onChange={(e) => setCcForm({ ...ccForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium cursor-pointer"
                  >
                    <option value="Finance">Finance</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="IT">IT</option>
                    <option value="Operations">Operations</option>
                    <option value="Sales">Sales</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Research & Development">Research & Development</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location</label>
                  <select
                    value={ccForm.location}
                    onChange={(e) => setCcForm({ ...ccForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium cursor-pointer"
                  >
                    <option value="Dubai HQ">Dubai HQ</option>
                    <option value="Jebel Ali Warehouse">Jebel Ali Warehouse</option>
                    <option value="Riyadh Office">Riyadh Office</option>
                    <option value="Fujairah Site">Fujairah Site</option>
                    <option value="Doha Office">Doha Office</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={ccForm.type}
                    onChange={(e) => setCcForm({ ...ccForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium cursor-pointer"
                  >
                    <option value="Support">Support</option>
                    <option value="Operational">Operational</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Capital">Capital</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Currency</label>
                  <select
                    value={ccForm.currency}
                    onChange={(e) => setCcForm({ ...ccForm, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium cursor-pointer"
                  >
                    <option value="AED">AED</option>
                    <option value="SAR">SAR</option>
                    <option value="QAR">QAR</option>
                    <option value="OMR">OMR</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={ccForm.status}
                    onChange={(e) => setCcForm({ ...ccForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={ccForm.description}
                  onChange={(e) => setCcForm({ ...ccForm, description: e.target.value })}
                  placeholder="Cost center scope and accounting details..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCcModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingCc ? 'Save Changes' : 'Create Cost Center'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CostCentersTab;
