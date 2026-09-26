import React, { useState, useMemo } from 'react';
import {
  GitBranch,
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
  Download,
  X
} from 'lucide-react';
import clsx from 'clsx';

export const INITIAL_BUSINESS_UNITS = [
  {
    id: 1,
    name: 'UAE Operations',
    code: 'UAE-OPS',
    company: 'Asset360 Holdings',
    parentUnit: '-',
    type: 'Operations',
    departmentsCount: 5,
    locationsCount: 12,
    status: 'Active',
    createdOn: '10 Jan 2025',
    createdBy: 'System',
    description: 'Primary operating business unit for UAE region'
  },
  {
    id: 2,
    name: 'KSA Operations',
    code: 'KSA-OPS',
    company: 'Asset360 Holdings',
    parentUnit: '-',
    type: 'Operations',
    departmentsCount: 4,
    locationsCount: 8,
    status: 'Active',
    createdOn: '12 Jan 2025',
    createdBy: 'System',
    description: 'Saudi Arabia operations node'
  },
  {
    id: 3,
    name: 'Qatar Operations',
    code: 'QAT-OPS',
    company: 'Asset360 Holdings',
    parentUnit: '-',
    type: 'Operations',
    departmentsCount: 3,
    locationsCount: 5,
    status: 'Active',
    createdOn: '14 Jan 2025',
    createdBy: 'John Doe',
    description: 'Qatar regional operational hub'
  },
  {
    id: 4,
    name: 'IT Solutions',
    code: 'IT-SOL',
    company: 'Wavelogix FZC',
    parentUnit: '-',
    type: 'Service',
    departmentsCount: 4,
    locationsCount: 6,
    status: 'Active',
    createdOn: '16 Jan 2025',
    createdBy: 'Sarah Ahmed',
    description: 'Enterprise IT software & RFID solutions'
  },
  {
    id: 5,
    name: 'Environmental Services',
    code: 'ENV-SERV',
    company: 'd.code Solutions LLC',
    parentUnit: '-',
    type: 'Service',
    departmentsCount: 6,
    locationsCount: 10,
    status: 'Active',
    createdOn: '18 Jan 2025',
    createdBy: 'Ramesh Kumar',
    description: 'Environmental asset & waste logistics'
  },
  {
    id: 6,
    name: 'Trading & Logistics',
    code: 'TRD-LOG',
    company: 'Wavelogix FZC',
    parentUnit: '-',
    type: 'Trading',
    departmentsCount: 3,
    locationsCount: 4,
    status: 'Inactive',
    createdOn: '20 Jan 2025',
    createdBy: 'Priya Nair',
    description: 'Hardware import & distribution wing'
  },
  {
    id: 7,
    name: 'Support & Projects',
    code: 'SUP-PRJ',
    company: 'd.code Solutions LLC',
    parentUnit: '-',
    type: 'Support',
    departmentsCount: 4,
    locationsCount: 6,
    status: 'Active',
    createdOn: '22 Jan 2025',
    createdBy: 'John Doe',
    description: 'Customer project delivery & SLA support'
  },
  {
    id: 8,
    name: 'Digital ID',
    code: 'DIG-ID',
    company: 'Digital ID Solutions FZ LLC',
    parentUnit: '-',
    type: 'Solutions',
    departmentsCount: 2,
    locationsCount: 3,
    status: 'Active',
    createdOn: '25 Jan 2025',
    createdBy: 'Sarah Ahmed',
    description: 'Smart cards, biometrics & asset tags'
  },
  {
    id: 9,
    name: 'Regional Holding BU',
    code: 'REG-HLD',
    company: 'Asset360 Holdings',
    parentUnit: '-',
    type: 'Operations',
    departmentsCount: 2,
    locationsCount: 4,
    status: 'Active',
    createdOn: '28 Jan 2025',
    createdBy: 'System',
    description: 'Corporate oversight unit'
  },
  {
    id: 10,
    name: 'Infrastructure Services',
    code: 'INF-SRV',
    company: 'Wavelogix FZC',
    parentUnit: '-',
    type: 'Service',
    departmentsCount: 3,
    locationsCount: 5,
    status: 'Active',
    createdOn: '01 Feb 2025',
    createdBy: 'Ramesh Kumar',
    description: 'Data center & network asset management'
  },
  {
    id: 11,
    name: 'Telecom Solutions',
    code: 'TEL-SOL',
    company: 'd.code Solutions LLC',
    parentUnit: '-',
    type: 'Solutions',
    departmentsCount: 2,
    locationsCount: 3,
    status: 'Active',
    createdOn: '05 Feb 2025',
    createdBy: 'Priya Nair',
    description: 'Cell tower & mobile hardware division'
  },
  {
    id: 12,
    name: 'Special Projects',
    code: 'SPC-PRJ',
    company: 'Digital ID Solutions FZ LLC',
    parentUnit: '-',
    type: 'Support',
    departmentsCount: 1,
    locationsCount: 2,
    status: 'Active',
    createdOn: '10 Feb 2025',
    createdBy: 'John Doe',
    description: 'Government contract delivery unit'
  }
];

export function BusinessUnitsTab({ triggerToast, onSwitchTab }) {
  const [units, setUnits] = useState(INITIAL_BUSINESS_UNITS);
  const [selectedUnitIds, setSelectedUnitIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All Companies');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [regionFilter, setRegionFilter] = useState('All Regions');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [parentFilter, setParentFilter] = useState('All');
  const [createdByFilter, setCreatedByFilter] = useState('All Users');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modals & UI State
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [unitForm, setUnitForm] = useState({
    name: '',
    code: '',
    company: 'Asset360 Holdings',
    parentUnit: '-',
    type: 'Operations',
    status: 'Active',
    description: ''
  });

  // Filtered List Memo
  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      const matchesSearch =
        !searchQuery ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.description && u.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCompany =
        companyFilter === 'All Companies' || companyFilter === 'All' || u.company === companyFilter;

      const matchesStatus =
        statusFilter === 'All Status' || statusFilter === 'All' || u.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesType =
        typeFilter === 'All Types' || typeFilter === 'All' || u.type === typeFilter;

      const matchesParent =
        parentFilter === 'All' || u.parentUnit === parentFilter;

      const matchesCreatedBy =
        createdByFilter === 'All Users' || createdByFilter === 'All' || u.createdBy === createdByFilter;

      return matchesSearch && matchesCompany && matchesStatus && matchesType && matchesParent && matchesCreatedBy;
    });
  }, [units, searchQuery, companyFilter, statusFilter, typeFilter, parentFilter, createdByFilter]);

  // Paginated List (All units rendered for scroll-down view)
  const paginatedUnits = filteredUnits;

  const totalPages = Math.ceil(filteredUnits.length / pageSize) || 1;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUnitIds(paginatedUnits.map((u) => u.id));
    } else {
      setSelectedUnitIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedUnitIds.includes(id)) {
      setSelectedUnitIds(selectedUnitIds.filter((i) => i !== id));
    } else {
      setSelectedUnitIds([...selectedUnitIds, id]);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCompanyFilter('All Companies');
    setStatusFilter('All Status');
    setRegionFilter('All Regions');
    setTypeFilter('All Types');
    setParentFilter('All');
    setCreatedByFilter('All Users');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  const handleOpenAddModal = (unitToEdit = null) => {
    if (unitToEdit) {
      setEditingUnit(unitToEdit);
      setUnitForm({
        name: unitToEdit.name,
        code: unitToEdit.code,
        company: unitToEdit.company || 'Asset360 Holdings',
        parentUnit: unitToEdit.parentUnit || '-',
        type: unitToEdit.type || 'Operations',
        status: unitToEdit.status || 'Active',
        description: unitToEdit.description || ''
      });
    } else {
      setEditingUnit(null);
      setUnitForm({
        name: '',
        code: '',
        company: 'Asset360 Holdings',
        parentUnit: '-',
        type: 'Operations',
        status: 'Active',
        description: ''
      });
    }
    setShowAddUnitModal(true);
  };

  const handleSaveUnit = (e) => {
    e.preventDefault();
    if (!unitForm.name || !unitForm.code) return;

    if (editingUnit) {
      setUnits(
        units.map((u) =>
          u.id === editingUnit.id
            ? {
                ...u,
                name: unitForm.name,
                code: unitForm.code.toUpperCase(),
                company: unitForm.company,
                parentUnit: unitForm.parentUnit,
                type: unitForm.type,
                status: unitForm.status,
                description: unitForm.description
              }
            : u
        )
      );
      triggerToast && triggerToast(`Business Unit "${unitForm.name}" updated.`);
    } else {
      const newUnit = {
        id: Date.now(),
        name: unitForm.name,
        code: unitForm.code.toUpperCase(),
        company: unitForm.company,
        parentUnit: unitForm.parentUnit,
        type: unitForm.type,
        departmentsCount: 0,
        locationsCount: 0,
        status: unitForm.status,
        createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdBy: 'Admin User',
        description: unitForm.description
      };
      setUnits([newUnit, ...units]);
      triggerToast && triggerToast(`Business Unit "${unitForm.name}" created.`);
    }
    setShowAddUnitModal(false);
  };

  const handleToggleStatus = (unit) => {
    setActiveDropdownId(null);
    const nextStatus = unit.status === 'Active' ? 'Inactive' : 'Active';
    setUnits(units.map((u) => (u.id === unit.id ? { ...u, status: nextStatus } : u)));
    triggerToast && triggerToast(`Business Unit "${unit.name}" status set to ${nextStatus}.`);
  };

  const handleDeleteUnit = (unit) => {
    setActiveDropdownId(null);
    if (unit.departmentsCount > 0 || unit.locationsCount > 0) {
      alert(`Dependency Notice: "${unit.name}" has ${unit.departmentsCount} Departments and ${unit.locationsCount} Locations assigned. Reassign child entities before deletion.`);
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${unit.name}"?`)) return;
    setUnits(units.filter((u) => u.id !== unit.id));
    triggerToast && triggerToast(`Business Unit "${unit.name}" deleted.`);
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
        </div>

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
                <option value="Digital ID Solutions FZ LLC">Digital ID Solutions FZ LLC</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Business Unit Status */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Business Unit Status</label>
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
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Business Unit Type */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Business Unit Type</label>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
              >
                <option value="All Types">All Types</option>
                <option value="Operations">Operations</option>
                <option value="Service">Service</option>
                <option value="Trading">Trading</option>
                <option value="Support">Support</option>
                <option value="Solutions">Solutions</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Parent Business Unit */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Parent Business Unit</label>
            <div className="relative">
              <select
                value={parentFilter}
                onChange={(e) => setParentFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
              >
                <option value="All">All</option>
                <option value="UAE Operations">UAE Operations</option>
                <option value="KSA Operations">KSA Operations</option>
                <option value="None">None</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Second Row of Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mt-3 items-end">
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
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
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

        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-700 transition cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={() => triggerToast && triggerToast('Business Unit filters applied.')}
            className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>

      {/* Business Units Table Card matching Screenshot */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900">Business Units ({filteredUnits.length})</h2>
          <button
            onClick={() => triggerToast && triggerToast('Exporting Business Units data...')}
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
                    checked={selectedUnitIds.length === paginatedUnits.length && paginatedUnits.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-[#6C2BD9] cursor-pointer"
                  />
                </th>
                <th className="p-3 w-10 text-slate-400">#</th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Business Unit Name</span>
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
                    <span>Company</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Parent Business Unit</span>
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
                    <span>No. of Departments</span>
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
                <th className="p-3 text-center font-bold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedUnits.length === 0 ? (
                <tr>
                  <td colSpan="11" className="p-8 text-center text-slate-500 font-semibold">
                    No business units match current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedUnits.map((unit, idx) => {
                  const isSelected = selectedUnitIds.includes(unit.id);
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={unit.id}
                      className={clsx(
                        'transition-colors',
                        isSelected ? 'bg-purple-50/40' : 'hover:bg-slate-50/60'
                      )}
                    >
                      <td className="p-3 pl-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(unit.id)}
                          className="rounded border-slate-300 text-[#6C2BD9] cursor-pointer"
                        />
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">{globalIdx}</td>
                      <td className="p-3 font-bold text-[#6C2BD9]">
                        <span
                          className="cursor-pointer hover:underline"
                          onClick={() => {
                            setSelectedUnit(unit);
                            setShowViewDetailsModal(true);
                          }}
                        >
                          {unit.name}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 font-mono font-bold">{unit.code}</td>
                      <td className="p-3 text-slate-700 font-semibold">{unit.company}</td>
                      <td className="p-3 text-slate-500 font-mono">{unit.parentUnit}</td>
                      <td className="p-3 text-slate-700 font-medium">{unit.type}</td>
                      <td className="p-3 text-slate-800 font-mono font-bold text-center">{unit.departmentsCount}</td>
                      <td className="p-3 text-slate-800 font-mono font-bold text-center">{unit.locationsCount}</td>
                      <td className="p-3">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold',
                            unit.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          )}
                        >
                          {unit.status}
                        </span>
                      </td>
                      <td className="p-3 text-center relative">
                        <button
                          onClick={() => setActiveDropdownId(activeDropdownId === unit.id ? null : unit.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Row Actions Context Dropdown Menu matching Screenshot */}
                        {activeDropdownId === unit.id && (
                          <div className="absolute right-4 top-10 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 text-left animate-fadeIn">
                            <button
                              onClick={() => {
                                setSelectedUnit(unit);
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
                                handleOpenAddModal(unit);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <Edit2 className="w-4 h-4 text-[#6C2BD9]" />
                              Edit Business Unit
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdownId(null);
                                onSwitchTab && onSwitchTab('departments');
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <Network className="w-4 h-4 text-[#6C2BD9]" />
                              Manage Departments
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdownId(null);
                                onSwitchTab && onSwitchTab('locations');
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <MapPin className="w-4 h-4 text-[#6C2BD9]" />
                              Manage Locations
                            </button>
                            <button
                              onClick={() => {
                                triggerToast && triggerToast(`Assign users to ${unit.name}`);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <Users className="w-4 h-4 text-[#6C2BD9]" />
                              Assign Users
                            </button>
                            <button
                              onClick={() => {
                                triggerToast && triggerToast(`Set ${unit.name} as Parent Business Unit.`);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <GitBranch className="w-4 h-4 text-[#6C2BD9]" />
                              Set as Parent
                            </button>

                            <div className="border-t border-slate-100 my-1"></div>

                            <button
                              onClick={() => handleToggleStatus(unit)}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              {unit.status === 'Active' ? (
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
                              onClick={() => handleDeleteUnit(unit)}
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
          <div className="font-medium text-slate-600">Showing {filteredUnits.length} records</div>
          <div className="text-slate-400">Scroll down to view all records</div>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {showViewDetailsModal && selectedUnit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center border border-purple-100">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedUnit.name}</h3>
                  <p className="text-xs text-slate-400">Code: {selectedUnit.code}</p>
                </div>
              </div>
              <button onClick={() => setShowViewDetailsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Description</span>
                <span className="font-bold text-slate-800">{selectedUnit.description || '-'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Company</span>
                  <span className="font-bold text-slate-800">{selectedUnit.company}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Unit Type</span>
                  <span className="font-bold text-slate-800">{selectedUnit.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Departments</span>
                  <span className="font-mono font-bold text-[#6C2BD9]">{selectedUnit.departmentsCount} Departments</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Locations</span>
                  <span className="font-mono font-bold text-[#6C2BD9]">{selectedUnit.locationsCount} Locations</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Status</span>
                  <span className={clsx('font-bold', selectedUnit.status === 'Active' ? 'text-emerald-600' : 'text-rose-600')}>
                    {selectedUnit.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Created On</span>
                  <span className="font-mono font-bold text-slate-700">{selectedUnit.createdOn}</span>
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

      {/* CREATE / EDIT BUSINESS UNIT MODAL */}
      {showAddUnitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-fadeIn text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingUnit ? 'Edit Business Unit' : 'Add New Business Unit'}
              </h3>
              <button onClick={() => setShowAddUnitModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Unit Name *</label>
                <input
                  type="text"
                  required
                  value={unitForm.name}
                  onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                  placeholder="e.g. UAE Operations"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={unitForm.code}
                    onChange={(e) => setUnitForm({ ...unitForm, code: e.target.value })}
                    placeholder="e.g. UAE-OPS"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company</label>
                  <select
                    value={unitForm.company}
                    onChange={(e) => setUnitForm({ ...unitForm, company: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium cursor-pointer"
                  >
                    <option value="Asset360 Holdings">Asset360 Holdings</option>
                    <option value="Wavelogix FZC">Wavelogix FZC</option>
                    <option value="d.code Solutions LLC">d.code Solutions LLC</option>
                    <option value="Digital ID Solutions FZ LLC">Digital ID Solutions FZ LLC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Type</label>
                  <select
                    value={unitForm.type}
                    onChange={(e) => setUnitForm({ ...unitForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium cursor-pointer"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Service">Service</option>
                    <option value="Trading">Trading</option>
                    <option value="Support">Support</option>
                    <option value="Solutions">Solutions</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={unitForm.status}
                    onChange={(e) => setUnitForm({ ...unitForm, status: e.target.value })}
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
                  value={unitForm.description}
                  onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
                  placeholder="Business unit scope and operational focus..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUnitModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingUnit ? 'Save Changes' : 'Create Business Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BusinessUnitsTab;
