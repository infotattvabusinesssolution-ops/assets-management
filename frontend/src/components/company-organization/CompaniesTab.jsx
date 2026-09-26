import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Edit2,
  Network,
  MapPin,
  Users,
  RotateCcw,
  Trash2,
  CheckCircle2,
  XCircle,
  Calendar,
  ChevronDown,
  ArrowUpDown,
  X
} from 'lucide-react';
import clsx from 'clsx';

export const INITIAL_COMPANIES = [
  {
    id: 1,
    name: 'Asset360 Holdings',
    code: 'A360',
    type: 'Holding',
    region: 'UAE',
    businessUnitsCount: 5,
    locationsCount: 12,
    status: 'Active',
    createdOn: '10 Jan 2025',
    createdBy: 'System',
    parentCompany: 'None',
    description: 'Parent holding entity for regional enterprise software operations'
  },
  {
    id: 2,
    name: 'Wavelogix FZC',
    code: 'WLF',
    type: 'Operating',
    region: 'UAE',
    businessUnitsCount: 3,
    locationsCount: 8,
    status: 'Active',
    createdOn: '12 Jan 2025',
    createdBy: 'John Doe',
    parentCompany: 'Asset360 Holdings',
    description: 'Hardware, RFID & IoT sensor tracking operations'
  },
  {
    id: 3,
    name: 'd.code Solutions LLC',
    code: 'DCS',
    type: 'Operating',
    region: 'UAE',
    businessUnitsCount: 2,
    locationsCount: 5,
    status: 'Active',
    createdOn: '15 Jan 2025',
    createdBy: 'Sarah Ahmed',
    parentCompany: 'Asset360 Holdings',
    description: 'Software development & integration entity'
  },
  {
    id: 4,
    name: 'Digital ID Solutions FZ LLC',
    code: 'DIS',
    type: 'Operating',
    region: 'UAE',
    businessUnitsCount: 2,
    locationsCount: 4,
    status: 'Active',
    createdOn: '18 Jan 2025',
    createdBy: 'Ramesh Kumar',
    parentCompany: 'Asset360 Holdings',
    description: 'Digital identity & smart tagging solutions'
  },
  {
    id: 5,
    name: 'Aasaan Environmental Services',
    code: 'AES',
    type: 'Operating',
    region: 'KSA',
    businessUnitsCount: 3,
    locationsCount: 7,
    status: 'Active',
    createdOn: '22 Jan 2025',
    createdBy: 'Priya Nair',
    parentCompany: 'Asset360 Holdings',
    description: 'Environmental monitoring & waste asset logistics'
  },
  {
    id: 6,
    name: 'CodeIQ Technologies',
    code: 'CIQ',
    type: 'Operating',
    region: 'Qatar',
    businessUnitsCount: 1,
    locationsCount: 3,
    status: 'Inactive',
    createdOn: '25 Jan 2025',
    createdBy: 'John Doe',
    parentCompany: 'Asset360 Holdings',
    description: 'Software testing & Quality Assurance partner'
  },
  {
    id: 7,
    name: 'Middle East Operations',
    code: 'MEO',
    type: 'Region',
    region: 'UAE',
    businessUnitsCount: 0,
    locationsCount: 0,
    status: 'Active',
    createdOn: '28 Jan 2025',
    createdBy: 'System',
    parentCompany: 'Asset360 Holdings',
    description: 'Regional management node'
  },
  {
    id: 8,
    name: 'International Ventures',
    code: 'INV',
    type: 'Region',
    region: 'Other',
    businessUnitsCount: 0,
    locationsCount: 0,
    status: 'Active',
    createdOn: '01 Feb 2025',
    createdBy: 'System',
    parentCompany: 'Asset360 Holdings',
    description: 'Global expansion management entity'
  }
];

export function CompaniesTab({ triggerToast, onSwitchTab }) {
  const [companies, setCompanies] = useState(INITIAL_COMPANIES);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [regionFilter, setRegionFilter] = useState('All Regions');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [parentFilter, setParentFilter] = useState('All');
  const [createdByFilter, setCreatedByFilter] = useState('All Users');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // UI States
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    code: '',
    type: 'Operating',
    region: 'UAE',
    parentCompany: 'Asset360 Holdings',
    status: 'Active',
    description: ''
  });

  // Filter Memo
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'All Status' || statusFilter === 'All' || c.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesRegion =
        regionFilter === 'All Regions' || regionFilter === 'All' || c.region === regionFilter;

      const matchesType =
        typeFilter === 'All Types' || typeFilter === 'All' || c.type === typeFilter;

      const matchesParent =
        parentFilter === 'All' || c.parentCompany === parentFilter;

      const matchesCreatedBy =
        createdByFilter === 'All Users' || createdByFilter === 'All' || c.createdBy === createdByFilter;

      return matchesSearch && matchesStatus && matchesRegion && matchesType && matchesParent && matchesCreatedBy;
    });
  }, [companies, searchQuery, statusFilter, regionFilter, typeFilter, parentFilter, createdByFilter]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCompanyIds(filteredCompanies.map((c) => c.id));
    } else {
      setSelectedCompanyIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedCompanyIds.includes(id)) {
      setSelectedCompanyIds(selectedCompanyIds.filter((i) => i !== id));
    } else {
      setSelectedCompanyIds([...selectedCompanyIds, id]);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All Status');
    setRegionFilter('All Regions');
    setTypeFilter('All Types');
    setParentFilter('All');
    setCreatedByFilter('All Users');
    setFromDate('');
    setToDate('');
  };

  const handleOpenAddModal = (companyToEdit = null) => {
    if (companyToEdit) {
      setEditingCompany(companyToEdit);
      setCompanyForm({
        name: companyToEdit.name,
        code: companyToEdit.code,
        type: companyToEdit.type || 'Operating',
        region: companyToEdit.region || 'UAE',
        parentCompany: companyToEdit.parentCompany || 'Asset360 Holdings',
        status: companyToEdit.status || 'Active',
        description: companyToEdit.description || ''
      });
    } else {
      setEditingCompany(null);
      setCompanyForm({
        name: '',
        code: '',
        type: 'Operating',
        region: 'UAE',
        parentCompany: 'Asset360 Holdings',
        status: 'Active',
        description: ''
      });
    }
    setShowAddCompanyModal(true);
  };

  const handleSaveCompany = (e) => {
    e.preventDefault();
    if (!companyForm.name || !companyForm.code) return;

    if (editingCompany) {
      setCompanies(
        companies.map((c) =>
          c.id === editingCompany.id
            ? {
                ...c,
                name: companyForm.name,
                code: companyForm.code.toUpperCase(),
                type: companyForm.type,
                region: companyForm.region,
                parentCompany: companyForm.parentCompany,
                status: companyForm.status,
                description: companyForm.description
              }
            : c
        )
      );
      triggerToast && triggerToast(`Company "${companyForm.name}" updated successfully.`);
    } else {
      const newCompany = {
        id: Date.now(),
        name: companyForm.name,
        code: companyForm.code.toUpperCase(),
        type: companyForm.type,
        region: companyForm.region,
        businessUnitsCount: 0,
        locationsCount: 0,
        status: companyForm.status,
        createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdBy: 'Admin User',
        parentCompany: companyForm.parentCompany,
        description: companyForm.description
      };
      setCompanies([newCompany, ...companies]);
      triggerToast && triggerToast(`Company "${companyForm.name}" created successfully.`);
    }
    setShowAddCompanyModal(false);
  };

  const handleToggleStatus = (company) => {
    setActiveDropdownId(null);
    const nextStatus = company.status === 'Active' ? 'Inactive' : 'Active';
    setCompanies(
      companies.map((c) => (c.id === company.id ? { ...c, status: nextStatus } : c))
    );
    triggerToast && triggerToast(`Company "${company.name}" status set to ${nextStatus}.`);
  };

  const handleDeleteCompany = (company) => {
    setActiveDropdownId(null);
    if (company.businessUnitsCount > 0 || company.locationsCount > 0) {
      alert(`Dependency Notice: "${company.name}" has ${company.businessUnitsCount} Business Units and ${company.locationsCount} Locations attached. Please reassign or remove child entities before deleting.`);
      return;
    }
    if (!window.confirm(`Are you sure you want to delete company "${company.name}"?`)) return;
    setCompanies(companies.filter((c) => c.id !== company.id));
    triggerToast && triggerToast(`Company "${company.name}" deleted.`);
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
            type="button"
            onClick={() => triggerToast && triggerToast('More filter parameters toggled.')}
            className="text-xs font-bold text-[#6C2BD9] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>More Filters</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Company Status */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Company Status</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
              >
                <option value="All Status">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Region</label>
            <div className="relative">
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
              >
                <option value="All Regions">All Regions</option>
                <option value="UAE">UAE</option>
                <option value="KSA">KSA</option>
                <option value="Qatar">Qatar</option>
                <option value="Bahrain">Bahrain</option>
                <option value="Oman">Oman</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Company Type */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Company Type</label>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
              >
                <option value="All Types">All Types</option>
                <option value="Holding">Holding</option>
                <option value="Operating">Operating</option>
                <option value="Region">Region</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Parent Company */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Parent Company</label>
            <div className="relative">
              <select
                value={parentFilter}
                onChange={(e) => setParentFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
              >
                <option value="All">All</option>
                <option value="Asset360 Holdings">Asset360 Holdings</option>
                <option value="None">None</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                placeholder="Search by name, code or description..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
              />
            </div>
          </div>
        </div>

        {/* Second Row of Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs mt-3">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Created By</label>
            <div className="relative">
              <select
                value={createdByFilter}
                onChange={(e) => setCreatedByFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
              >
                <option value="All Users">All Users</option>
                <option value="System">System</option>
                <option value="John Doe">John Doe</option>
                <option value="Sarah Ahmed">Sarah Ahmed</option>
                <option value="Ramesh Kumar">Ramesh Kumar</option>
                <option value="Priya Nair">Priya Nair</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-700 font-bold mb-1">Date Created</label>
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
        </div>

        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-700 transition cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={() => triggerToast && triggerToast('Company filters applied.')}
            className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>

      {/* Companies List Table Card matching Screenshot */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900">Companies ({filteredCompanies.length})</h2>
        </div>

        <div className="overflow-auto max-h-[540px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 shadow-2xs">
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold select-none text-[11px] uppercase tracking-wider">
                <th className="p-3 pl-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedCompanyIds.length === filteredCompanies.length && filteredCompanies.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-[#6C2BD9] cursor-pointer"
                  />
                </th>
                <th className="p-3 w-10 text-slate-400">#</th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Company Name</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Code</span>
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
                    <span>Region</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>No. of Business Units</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>No. of Locations</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Status</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Created On</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 text-center font-bold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan="11" className="p-8 text-center text-slate-500 font-semibold">
                    No companies match current filter parameters.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((comp, idx) => {
                  const isSelected = selectedCompanyIds.includes(comp.id);
                  return (
                    <tr
                      key={comp.id}
                      className={clsx(
                        'transition-colors',
                        isSelected ? 'bg-purple-50/40' : 'hover:bg-slate-50/60'
                      )}
                    >
                      <td className="p-3 pl-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(comp.id)}
                          className="rounded border-slate-300 text-[#6C2BD9] cursor-pointer"
                        />
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="p-3 font-bold text-[#6C2BD9]">
                        <span
                          className="cursor-pointer hover:underline"
                          onClick={() => {
                            setSelectedCompany(comp);
                            setShowViewDetailsModal(true);
                          }}
                        >
                          {comp.name}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 font-mono font-bold">{comp.code}</td>
                      <td className="p-3 text-slate-700 font-medium">{comp.type}</td>
                      <td className="p-3 text-slate-700 font-medium">{comp.region}</td>
                      <td className="p-3 text-slate-800 font-mono font-bold">{comp.businessUnitsCount}</td>
                      <td className="p-3 text-slate-800 font-mono font-bold">{comp.locationsCount}</td>
                      <td className="p-3">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold',
                            comp.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          )}
                        >
                          {comp.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{comp.createdOn}</td>
                      <td className="p-3 text-center relative">
                        <button
                          onClick={() => setActiveDropdownId(activeDropdownId === comp.id ? null : comp.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Row Actions Dropdown Menu matching Screenshot */}
                        {activeDropdownId === comp.id && (
                          <div className="absolute right-4 top-10 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 text-left animate-fadeIn">
                            <button
                              onClick={() => {
                                setSelectedCompany(comp);
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
                                handleOpenAddModal(comp);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <Edit2 className="w-4 h-4 text-[#6C2BD9]" />
                              Edit Company
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdownId(null);
                                onSwitchTab && onSwitchTab('departments');
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <Network className="w-4 h-4 text-[#6C2BD9]" />
                              Manage Organization
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdownId(null);
                                onSwitchTab && onSwitchTab('businessUnits');
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <Plus className="w-4 h-4 text-[#6C2BD9]" />
                              Add Business Unit
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdownId(null);
                                onSwitchTab && onSwitchTab('locations');
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <MapPin className="w-4 h-4 text-[#6C2BD9]" />
                              Add Location
                            </button>
                            <button
                              onClick={() => {
                                triggerToast && triggerToast(`Assign Users window opened for ${comp.name}.`);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <Users className="w-4 h-4 text-[#6C2BD9]" />
                              Assign Users
                            </button>

                            <div className="border-t border-slate-100 my-1"></div>

                            <button
                              onClick={() => handleToggleStatus(comp)}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              {comp.status === 'Active' ? (
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
                              onClick={() => handleDeleteCompany(comp)}
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
          <div className="font-medium text-slate-600">Showing {filteredCompanies.length} records</div>
          <div className="text-slate-400">Scroll down to view all records</div>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {showViewDetailsModal && selectedCompany && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center border border-purple-100">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedCompany.name}</h3>
                  <p className="text-xs text-slate-400">Code: {selectedCompany.code}</p>
                </div>
              </div>
              <button onClick={() => setShowViewDetailsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Description</span>
                <span className="font-bold text-slate-800">{selectedCompany.description || '-'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Company Type</span>
                  <span className="font-bold text-slate-800">{selectedCompany.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Region</span>
                  <span className="font-bold text-slate-800">{selectedCompany.region}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Business Units</span>
                  <span className="font-mono font-bold text-[#6C2BD9]">{selectedCompany.businessUnitsCount} Units</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Locations</span>
                  <span className="font-mono font-bold text-[#6C2BD9]">{selectedCompany.locationsCount} Sites</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Status</span>
                  <span className={clsx('font-bold', selectedCompany.status === 'Active' ? 'text-emerald-600' : 'text-rose-600')}>
                    {selectedCompany.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Created On</span>
                  <span className="font-mono font-bold text-slate-700">{selectedCompany.createdOn}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowViewDetailsModal(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT COMPANY MODAL */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-fadeIn text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingCompany ? 'Edit Company' : 'Add New Company'}
              </h3>
              <button onClick={() => setShowAddCompanyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  placeholder="e.g. Asset360 Holdings"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company Code *</label>
                  <input
                    type="text"
                    required
                    value={companyForm.code}
                    onChange={(e) => setCompanyForm({ ...companyForm, code: e.target.value })}
                    placeholder="e.g. A360"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company Type</label>
                  <select
                    value={companyForm.type}
                    onChange={(e) => setCompanyForm({ ...companyForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium cursor-pointer"
                  >
                    <option value="Holding">Holding</option>
                    <option value="Operating">Operating</option>
                    <option value="Region">Region</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Region</label>
                  <select
                    value={companyForm.region}
                    onChange={(e) => setCompanyForm({ ...companyForm, region: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium cursor-pointer"
                  >
                    <option value="UAE">UAE</option>
                    <option value="KSA">KSA</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Bahrain">Bahrain</option>
                    <option value="Oman">Oman</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={companyForm.status}
                    onChange={(e) => setCompanyForm({ ...companyForm, status: e.target.value })}
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
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                  placeholder="Primary business purpose and operational scope..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCompanyModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingCompany ? 'Save Changes' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompaniesTab;
