import React, { useState, useMemo } from 'react';
import {
  Network,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Edit2,
  Users,
  UserCheck,
  MapPin,
  Coins,
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

export const INITIAL_DEPARTMENTS = [
  {
    id: 1,
    name: 'Information Technology',
    code: 'IT',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate Services',
    departmentHead: 'Ramesh Kumar',
    location: 'Dubai HQ',
    costCenter: 'CC-1001',
    status: 'Active',
    createdOn: '10 Jan 2025',
    createdBy: 'System',
    description: 'IT infrastructure, cloud systems, and software engineering'
  },
  {
    id: 2,
    name: 'Finance',
    code: 'FIN',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate Services',
    departmentHead: 'Sarah Ahmed',
    location: 'Dubai HQ',
    costCenter: 'CC-1002',
    status: 'Active',
    createdOn: '10 Jan 2025',
    createdBy: 'System',
    description: 'Financial accounting, budgeting, and audit reporting'
  },
  {
    id: 3,
    name: 'Human Resources',
    code: 'HR',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate Services',
    departmentHead: 'Priya Nair',
    location: 'Dubai HQ',
    costCenter: 'CC-1003',
    status: 'Active',
    createdOn: '11 Jan 2025',
    createdBy: 'John Doe',
    description: 'Talent management, payroll, and organizational policies'
  },
  {
    id: 4,
    name: 'Operations',
    code: 'OPS',
    company: 'Asset360 Holdings',
    businessUnit: 'Operations',
    departmentHead: 'Ahmed Al Marri',
    location: 'Jebel Ali',
    costCenter: 'CC-2001',
    status: 'Active',
    createdOn: '12 Jan 2025',
    createdBy: 'System',
    description: 'Enterprise asset operations and field logistics'
  },
  {
    id: 5,
    name: 'Maintenance',
    code: 'MNT',
    company: 'Asset360 Holdings',
    businessUnit: 'Operations',
    departmentHead: 'Khalid Hassan',
    location: 'Jebel Ali',
    costCenter: 'CC-2002',
    status: 'Active',
    createdOn: '12 Jan 2025',
    createdBy: 'Sarah Ahmed',
    description: 'Preventive and corrective maintenance work order management'
  },
  {
    id: 6,
    name: 'Procurement',
    code: 'PRC',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate Services',
    departmentHead: 'Lina George',
    location: 'Dubai HQ',
    costCenter: 'CC-1004',
    status: 'Active',
    createdOn: '13 Jan 2025',
    createdBy: 'Ramesh Kumar',
    description: 'Vendor sourcing, asset purchasing, and SLA management'
  },
  {
    id: 7,
    name: 'Sales & Business Development',
    code: 'SBD',
    company: 'Asset360 Holdings',
    businessUnit: 'Commercial',
    departmentHead: 'Omar Rahman',
    location: 'Dubai HQ',
    costCenter: 'CC-3001',
    status: 'Active',
    createdOn: '14 Jan 2025',
    createdBy: 'John Doe',
    description: 'Commercial client relationship & revenue development'
  },
  {
    id: 8,
    name: 'Logistics',
    code: 'LOG',
    company: 'Asset360 Holdings',
    businessUnit: 'Operations',
    departmentHead: 'Fatima Saeed',
    location: 'Sharjah',
    costCenter: 'CC-2003',
    status: 'Active',
    createdOn: '15 Jan 2025',
    createdBy: 'Priya Nair',
    description: 'Warehouse storage, transfers, and asset dispatch'
  },
  {
    id: 9,
    name: 'Health, Safety & Environment',
    code: 'HSE',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate Services',
    departmentHead: 'Mohammed Ali',
    location: 'Dubai HQ',
    costCenter: 'CC-1005',
    status: 'Inactive',
    createdOn: '16 Jan 2025',
    createdBy: 'System',
    description: 'Occupational safety and regulatory compliance audits'
  },
  {
    id: 10,
    name: 'Quality Assurance',
    code: 'QA',
    company: 'Asset360 Holdings',
    businessUnit: 'Operations',
    departmentHead: 'Saeed Al Hashmi',
    location: 'Abu Dhabi',
    costCenter: 'CC-2004',
    status: 'Active',
    createdOn: '17 Jan 2025',
    createdBy: 'Sarah Ahmed',
    description: 'Quality inspection and asset verification standards'
  },
  {
    id: 11,
    name: 'Customer Support',
    code: 'SUP',
    company: 'Asset360 Holdings',
    businessUnit: 'Commercial',
    departmentHead: 'Michael Brown',
    location: 'Dubai HQ',
    costCenter: 'CC-3002',
    status: 'Active',
    createdOn: '18 Jan 2025',
    createdBy: 'John Doe',
    description: 'Helpdesk & SLA support for asset clients'
  },
  {
    id: 12,
    name: 'Research & Development',
    code: 'RND',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate Services',
    departmentHead: 'Priya Nair',
    location: 'Dubai HQ',
    costCenter: 'CC-1006',
    status: 'Active',
    createdOn: '20 Jan 2025',
    createdBy: 'System',
    description: 'IoT asset tracking tech research & prototyping'
  }
];

export function DepartmentsTab({ triggerToast, onSwitchTab }) {
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [selectedDeptIds, setSelectedDeptIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All Companies');
  const [buFilter, setBuFilter] = useState('All Business Units');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [costCenterFilter, setCostCenterFilter] = useState('All Cost Centers');
  const [headFilter, setHeadFilter] = useState('All Users');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & UI State
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate Services',
    departmentHead: 'Ramesh Kumar',
    location: 'Dubai HQ',
    costCenter: 'CC-1001',
    status: 'Active',
    description: ''
  });

  // Filtered List Memo
  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const matchesSearch =
        !searchQuery ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.departmentHead.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCompany =
        companyFilter === 'All Companies' || companyFilter === 'All' || d.company === companyFilter;

      const matchesBu =
        buFilter === 'All Business Units' || buFilter === 'All' || d.businessUnit === buFilter;

      const matchesStatus =
        statusFilter === 'All Status' || statusFilter === 'All' || d.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesLocation =
        locationFilter === 'All Locations' || locationFilter === 'All' || d.location === locationFilter;

      const matchesCostCenter =
        costCenterFilter === 'All Cost Centers' || costCenterFilter === 'All' || d.costCenter === costCenterFilter;

      const matchesHead =
        headFilter === 'All Users' || headFilter === 'All' || d.departmentHead === headFilter;

      return matchesSearch && matchesCompany && matchesBu && matchesStatus && matchesLocation && matchesCostCenter && matchesHead;
    });
  }, [departments, searchQuery, companyFilter, buFilter, statusFilter, locationFilter, costCenterFilter, headFilter]);

  // Paginated List (All departments rendered for scroll-down view)
  const paginatedDepartments = filteredDepartments;

  const totalPages = Math.ceil(filteredDepartments.length / pageSize) || 1;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedDeptIds(paginatedDepartments.map((d) => d.id));
    } else {
      setSelectedDeptIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedDeptIds.includes(id)) {
      setSelectedDeptIds(selectedDeptIds.filter((i) => i !== id));
    } else {
      setSelectedDeptIds([...selectedDeptIds, id]);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCompanyFilter('All Companies');
    setBuFilter('All Business Units');
    setStatusFilter('All Status');
    setTypeFilter('All Types');
    setLocationFilter('All Locations');
    setCostCenterFilter('All Cost Centers');
    setHeadFilter('All Users');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  const handleOpenAddModal = (deptToEdit = null) => {
    if (deptToEdit) {
      setEditingDept(deptToEdit);
      setDeptForm({
        name: deptToEdit.name,
        code: deptToEdit.code,
        company: deptToEdit.company || 'Asset360 Holdings',
        businessUnit: deptToEdit.businessUnit || 'Corporate Services',
        departmentHead: deptToEdit.departmentHead || 'Ramesh Kumar',
        location: deptToEdit.location || 'Dubai HQ',
        costCenter: deptToEdit.costCenter || 'CC-1001',
        status: deptToEdit.status || 'Active',
        description: deptToEdit.description || ''
      });
    } else {
      setEditingDept(null);
      setDeptForm({
        name: '',
        code: '',
        company: 'Asset360 Holdings',
        businessUnit: 'Corporate Services',
        departmentHead: 'Ramesh Kumar',
        location: 'Dubai HQ',
        costCenter: 'CC-1001',
        status: 'Active',
        description: ''
      });
    }
    setShowAddDeptModal(true);
  };

  const handleSaveDept = (e) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) return;

    if (editingDept) {
      setDepartments(
        departments.map((d) =>
          d.id === editingDept.id
            ? {
                ...d,
                name: deptForm.name,
                code: deptForm.code.toUpperCase(),
                company: deptForm.company,
                businessUnit: deptForm.businessUnit,
                departmentHead: deptForm.departmentHead,
                location: deptForm.location,
                costCenter: deptForm.costCenter,
                status: deptForm.status,
                description: deptForm.description
              }
            : d
        )
      );
      triggerToast && triggerToast(`Department "${deptForm.name}" updated.`);
    } else {
      const newDept = {
        id: Date.now(),
        name: deptForm.name,
        code: deptForm.code.toUpperCase(),
        company: deptForm.company,
        businessUnit: deptForm.businessUnit,
        departmentHead: deptForm.departmentHead,
        location: deptForm.location,
        costCenter: deptForm.costCenter,
        status: deptForm.status,
        createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdBy: 'Admin User',
        description: deptForm.description
      };
      setDepartments([newDept, ...departments]);
      triggerToast && triggerToast(`Department "${deptForm.name}" created.`);
    }
    setShowAddDeptModal(false);
  };

  const handleToggleStatus = (dept) => {
    setActiveDropdownId(null);
    const nextStatus = dept.status === 'Active' ? 'Inactive' : 'Active';
    setDepartments(departments.map((d) => (d.id === dept.id ? { ...d, status: nextStatus } : d)));
    triggerToast && triggerToast(`Department "${dept.name}" status set to ${nextStatus}.`);
  };

  const handleDeleteDept = (dept) => {
    setActiveDropdownId(null);
    if (!window.confirm(`Are you sure you want to delete department "${dept.name}"?`)) return;
    setDepartments(departments.filter((d) => d.id !== dept.id));
    triggerToast && triggerToast(`Department "${dept.name}" deleted.`);
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
                <option value="Corporate Services">Corporate Services</option>
                <option value="Operations">Operations</option>
                <option value="Commercial">Commercial</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Department Status */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Department Status</label>
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

          {/* Department Type */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Department Type</label>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
              >
                <option value="All Types">All Types</option>
                <option value="Core">Core</option>
                <option value="Support">Support</option>
                <option value="Operations">Operations</option>
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
                <option value="Jebel Ali">Jebel Ali</option>
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Sharjah">Sharjah</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 2 Filters matching Screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs mt-3 items-end">
          {/* Cost Center */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Cost Center</label>
            <div className="relative">
              <select
                value={costCenterFilter}
                onChange={(e) => setCostCenterFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
              >
                <option value="All Cost Centers">All Cost Centers</option>
                <option value="CC-1001">CC-1001</option>
                <option value="CC-1002">CC-1002</option>
                <option value="CC-1003">CC-1003</option>
                <option value="CC-2001">CC-2001</option>
                <option value="CC-2002">CC-2002</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Department Head */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Department Head</label>
            <div className="relative">
              <select
                value={headFilter}
                onChange={(e) => setHeadFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
              >
                <option value="All Users">All Users</option>
                <option value="Ramesh Kumar">Ramesh Kumar</option>
                <option value="Sarah Ahmed">Sarah Ahmed</option>
                <option value="Priya Nair">Priya Nair</option>
                <option value="Ahmed Al Marri">Ahmed Al Marri</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Created Date */}
          <div className="md:col-span-2">
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
                placeholder="Search by department name, code or description..."
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
            onClick={() => triggerToast && triggerToast('Department filters applied.')}
            className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>

      {/* Departments Table Card matching Screenshot */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900">Departments ({filteredDepartments.length})</h2>
          <button
            onClick={() => triggerToast && triggerToast('Exporting Departments data...')}
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
                    checked={selectedDeptIds.length === paginatedDepartments.length && paginatedDepartments.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-[#6C2BD9] cursor-pointer"
                  />
                </th>
                <th className="p-3 w-10 text-slate-400">#</th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Department Name</span>
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
                    <span>Business Unit</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Department Head</span>
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
                    <span>Cost Center</span>
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
              {paginatedDepartments.length === 0 ? (
                <tr>
                  <td colSpan="11" className="p-8 text-center text-slate-500 font-semibold">
                    No departments match current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedDepartments.map((dept, idx) => {
                  const isSelected = selectedDeptIds.includes(dept.id);
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={dept.id}
                      className={clsx(
                        'transition-colors',
                        isSelected ? 'bg-purple-50/40' : 'hover:bg-slate-50/60'
                      )}
                    >
                      <td className="p-3 pl-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(dept.id)}
                          className="rounded border-slate-300 text-[#6C2BD9] cursor-pointer"
                        />
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">{globalIdx}</td>
                      <td className="p-3 font-bold text-[#6C2BD9]">
                        <span
                          className="cursor-pointer hover:underline"
                          onClick={() => {
                            setSelectedDept(dept);
                            setShowViewDetailsModal(true);
                          }}
                        >
                          {dept.name}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 font-mono font-bold">{dept.code}</td>
                      <td className="p-3 text-slate-700 font-semibold">{dept.businessUnit}</td>
                      <td className="p-3 text-slate-800 font-semibold">{dept.departmentHead}</td>
                      <td className="p-3 text-slate-700">{dept.location}</td>
                      <td className="p-3 font-mono font-bold text-slate-700">{dept.costCenter}</td>
                      <td className="p-3">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold',
                            dept.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          )}
                        >
                          {dept.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{dept.createdOn}</td>
                      <td className="p-3 text-center relative">
                        <button
                          onClick={() => setActiveDropdownId(activeDropdownId === dept.id ? null : dept.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Row Actions Context Dropdown Menu matching Screenshot */}
                        {activeDropdownId === dept.id && (
                          <div className="absolute right-4 top-10 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 text-left animate-fadeIn">
                            <button
                              onClick={() => {
                                setSelectedDept(dept);
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
                                handleOpenAddModal(dept);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <Edit2 className="w-4 h-4 text-[#6C2BD9]" />
                              Edit Department
                            </button>
                            <button
                              onClick={() => {
                                triggerToast && triggerToast(`Manage users for ${dept.name}`);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <Users className="w-4 h-4 text-[#6C2BD9]" />
                              Manage Users
                            </button>
                            <button
                              onClick={() => {
                                triggerToast && triggerToast(`Set department head for ${dept.name}`);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <UserCheck className="w-4 h-4 text-[#6C2BD9]" />
                              Set Department Head
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
                            <button
                              onClick={() => {
                                setActiveDropdownId(null);
                                onSwitchTab && onSwitchTab('costCenters');
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <Coins className="w-4 h-4 text-[#6C2BD9]" />
                              Assign Cost Center
                            </button>

                            <div className="border-t border-slate-100 my-1"></div>

                            <button
                              onClick={() => handleToggleStatus(dept)}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              {dept.status === 'Active' ? (
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
                              onClick={() => handleDeleteDept(dept)}
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
          <div className="font-medium text-slate-600">Showing {filteredDepartments.length} records</div>
          <div className="text-slate-400">Scroll down to view all records</div>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {showViewDetailsModal && selectedDept && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center border border-purple-100">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedDept.name}</h3>
                  <p className="text-xs text-slate-400">Code: {selectedDept.code}</p>
                </div>
              </div>
              <button onClick={() => setShowViewDetailsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Description</span>
                <span className="font-bold text-slate-800">{selectedDept.description || '-'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Business Unit</span>
                  <span className="font-bold text-slate-800">{selectedDept.businessUnit}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Department Head</span>
                  <span className="font-bold text-slate-800">{selectedDept.departmentHead}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Location</span>
                  <span className="font-mono font-bold text-[#6C2BD9]">{selectedDept.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Cost Center</span>
                  <span className="font-mono font-bold text-[#6C2BD9]">{selectedDept.costCenter}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Status</span>
                  <span className={clsx('font-bold', selectedDept.status === 'Active' ? 'text-emerald-600' : 'text-rose-600')}>
                    {selectedDept.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Created On</span>
                  <span className="font-mono font-bold text-slate-700">{selectedDept.createdOn}</span>
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

      {/* CREATE / EDIT DEPARTMENT MODAL */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-fadeIn text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </h3>
              <button onClick={() => setShowAddDeptModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Information Technology"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    placeholder="e.g. IT"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Business Unit</label>
                  <select
                    value={deptForm.businessUnit}
                    onChange={(e) => setDeptForm({ ...deptForm, businessUnit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium cursor-pointer"
                  >
                    <option value="Corporate Services">Corporate Services</option>
                    <option value="Operations">Operations</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department Head</label>
                  <input
                    type="text"
                    value={deptForm.departmentHead}
                    onChange={(e) => setDeptForm({ ...deptForm, departmentHead: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location</label>
                  <select
                    value={deptForm.location}
                    onChange={(e) => setDeptForm({ ...deptForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium cursor-pointer"
                  >
                    <option value="Dubai HQ">Dubai HQ</option>
                    <option value="Jebel Ali">Jebel Ali</option>
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Sharjah">Sharjah</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cost Center</label>
                  <select
                    value={deptForm.costCenter}
                    onChange={(e) => setDeptForm({ ...deptForm, costCenter: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium cursor-pointer"
                  >
                    <option value="CC-1001">CC-1001</option>
                    <option value="CC-1002">CC-1002</option>
                    <option value="CC-1003">CC-1003</option>
                    <option value="CC-2001">CC-2001</option>
                    <option value="CC-2002">CC-2002</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={deptForm.status}
                    onChange={(e) => setDeptForm({ ...deptForm, status: e.target.value })}
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
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  placeholder="Department scope and core responsibilities..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingDept ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartmentsTab;
