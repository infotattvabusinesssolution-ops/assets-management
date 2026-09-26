import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  Users,
  Box,
  MapPin,
  Copy,
  RefreshCw,
  Clock,
  Trash2,
  X,
  FolderTree
} from 'lucide-react';
import clsx from 'clsx';

export const INITIAL_DEPARTMENTS = [
  {
    id: 1,
    code: 'FIN',
    name: 'Finance',
    type: 'Support',
    parentDepartment: '-',
    location: 'Dubai HQ',
    company: 'Wavelogix FZC',
    manager: 'Ahmed Khan',
    email: 'ahmed.khan@wavelogix.com',
    phone: '+971 50 234 5678',
    description: 'Manages corporate financial planning, accounting, budgeting, and audits.',
    employees: 85,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '08 Jan 2025 08:30 AM',
    lastModifiedBy: 'Ahmed Khan',
    lastModifiedOn: '20 Aug 2025 11:15 AM',
    relatedInfo: {
      subDepartments: 3,
      locations: 3,
      assets: 210,
      users: 85
    }
  },
  {
    id: 2,
    code: 'HR',
    name: 'Human Resources',
    type: 'Support',
    parentDepartment: '-',
    location: 'Dubai HQ',
    company: 'Wavelogix FZC',
    manager: 'Priya Nair',
    email: 'priya.nair@wavelogix.com',
    phone: '+971 50 345 6789',
    description: 'Oversees talent acquisition, employee relations, payroll, and corporate training.',
    employees: 28,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '09 Jan 2025 10:15 AM',
    lastModifiedBy: 'Priya Nair',
    lastModifiedOn: '22 Aug 2025 09:40 AM',
    relatedInfo: {
      subDepartments: 2,
      locations: 2,
      assets: 145,
      users: 28
    }
  },
  {
    id: 3,
    code: 'IT',
    name: 'Information Technology',
    type: 'Support',
    parentDepartment: '-',
    location: 'Dubai HQ',
    company: 'Wavelogix FZC',
    manager: 'Khalid Al-Mansoori',
    email: 'khalid@wavelogix.com',
    phone: '+971 50 123 4567',
    description: 'Manages IT infrastructure, systems and support services.',
    employees: 62,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '10 Jan 2025 09:20 AM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '28 Aug 2025 03:15 PM',
    relatedInfo: {
      subDepartments: 4,
      locations: 2,
      assets: 486,
      users: 62
    }
  },
  {
    id: 4,
    code: 'OPS',
    name: 'Operations',
    type: 'Operational',
    parentDepartment: '-',
    location: 'Dubai HQ',
    company: 'Wavelogix FZC',
    manager: 'Hassan Ali',
    email: 'hassan.ali@wavelogix.com',
    phone: '+971 50 456 7890',
    description: 'Directs day-to-day operational logistics, supply chain, and service delivery.',
    employees: 120,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '12 Jan 2025 02:00 PM',
    lastModifiedBy: 'Hassan Ali',
    lastModifiedOn: '25 Aug 2025 01:30 PM',
    relatedInfo: {
      subDepartments: 5,
      locations: 4,
      assets: 950,
      users: 120
    }
  },
  {
    id: 5,
    code: 'MAINT',
    name: 'Maintenance',
    type: 'Operational',
    parentDepartment: 'OPS',
    location: 'Jebel Ali',
    company: 'Wavelogix FZC',
    manager: 'Ramesh Kumar',
    email: 'ramesh.kumar@wavelogix.com',
    phone: '+971 50 567 8901',
    description: 'Responsible for facility preventive maintenance, equipment repairs, and field servicing.',
    employees: 45,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '15 Jan 2025 11:30 AM',
    lastModifiedBy: 'Ramesh Kumar',
    lastModifiedOn: '27 Aug 2025 04:20 PM',
    relatedInfo: {
      subDepartments: 2,
      locations: 3,
      assets: 620,
      users: 45
    }
  },
  {
    id: 6,
    code: 'FAC',
    name: 'Facilities Management',
    type: 'Operational',
    parentDepartment: 'OPS',
    location: 'Dubai HQ',
    company: 'Wavelogix FZC',
    manager: 'Sara Malik',
    email: 'sara.malik@wavelogix.com',
    phone: '+971 50 678 9012',
    description: 'Manages building operations, utilities, security, and space allocation.',
    employees: 38,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '18 Jan 2025 09:00 AM',
    lastModifiedBy: 'Sara Malik',
    lastModifiedOn: '29 Aug 2025 10:15 AM',
    relatedInfo: {
      subDepartments: 2,
      locations: 4,
      assets: 310,
      users: 38
    }
  },
  {
    id: 7,
    code: 'PROC',
    name: 'Procurement',
    type: 'Support',
    parentDepartment: 'FIN',
    location: 'Dubai HQ',
    company: 'Wavelogix FZC',
    manager: 'David Lee',
    email: 'david.lee@wavelogix.com',
    phone: '+971 50 789 0123',
    description: 'Handles vendor management, purchase orders, contracting, and asset sourcing.',
    employees: 22,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '20 Jan 2025 01:45 PM',
    lastModifiedBy: 'David Lee',
    lastModifiedOn: '30 Aug 2025 02:00 PM',
    relatedInfo: {
      subDepartments: 1,
      locations: 2,
      assets: 180,
      users: 22
    }
  },
  {
    id: 8,
    code: 'LEG',
    name: 'Legal',
    type: 'Support',
    parentDepartment: '-',
    location: 'Dubai HQ',
    company: 'Wavelogix FZC',
    manager: 'Fatima Saeed',
    email: 'fatima.saeed@wavelogix.com',
    phone: '+971 50 890 1234',
    description: 'Provides corporate legal counsel, compliance governance, and contract review.',
    employees: 15,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '22 Jan 2025 03:10 PM',
    lastModifiedBy: 'Fatima Saeed',
    lastModifiedOn: '31 Aug 2025 11:50 AM',
    relatedInfo: {
      subDepartments: 1,
      locations: 1,
      assets: 85,
      users: 15
    }
  },
  {
    id: 9,
    code: 'COM',
    name: 'Commercial',
    type: 'Support',
    parentDepartment: '-',
    location: 'Dubai HQ',
    company: 'Wavelogix FZC',
    manager: 'Omar Rahman',
    email: 'omar.rahman@wavelogix.com',
    phone: '+971 50 901 2345',
    description: 'Drives enterprise sales, client relations, business development, and marketing.',
    employees: 40,
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '25 Jan 2025 10:00 AM',
    lastModifiedBy: 'Omar Rahman',
    lastModifiedOn: '01 Sep 2025 09:30 AM',
    relatedInfo: {
      subDepartments: 3,
      locations: 2,
      assets: 240,
      users: 40
    }
  }
];

export function DepartmentsTab({ triggerToast, activeRowMenuId, setActiveRowMenuId, setShowAuditHistoryModal }) {
  const [departmentsList, setDepartmentsList] = useState(INITIAL_DEPARTMENTS);
  const [selectedDepartment, setSelectedDepartment] = useState(INITIAL_DEPARTMENTS[2]);
  const [selectedDeptIds, setSelectedDeptIds] = useState([]);

  // Filter state
  const [deptSearchQuery, setDeptSearchQuery] = useState('');
  const [deptTypeFilter, setDeptTypeFilter] = useState('All Types');
  const [deptStatusFilter, setDeptStatusFilter] = useState('All');
  const [deptLocationFilter, setDeptLocationFilter] = useState('All Locations');
  const [deptCompanyFilter, setDeptCompanyFilter] = useState('All Companies');

  // Modal state
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [deptFormState, setDeptFormState] = useState({
    code: '',
    name: '',
    type: 'Support',
    parentDepartment: '-',
    location: 'Dubai HQ',
    company: 'Wavelogix FZC',
    manager: '',
    email: '',
    phone: '',
    description: '',
    status: 'Active'
  });

  const filteredDepartments = useMemo(() => {
    return departmentsList.filter((dept) => {
      const matchesSearch =
        !deptSearchQuery ||
        dept.code.toLowerCase().includes(deptSearchQuery.toLowerCase()) ||
        dept.name.toLowerCase().includes(deptSearchQuery.toLowerCase()) ||
        (dept.manager && dept.manager.toLowerCase().includes(deptSearchQuery.toLowerCase())) ||
        (dept.description && dept.description.toLowerCase().includes(deptSearchQuery.toLowerCase()));

      const matchesType =
        deptTypeFilter === 'All Types' || deptTypeFilter === 'All' || dept.type === deptTypeFilter;

      const matchesStatus =
        deptStatusFilter === 'All' || dept.status.toLowerCase() === deptStatusFilter.toLowerCase();

      const matchesLoc =
        deptLocationFilter === 'All Locations' || deptLocationFilter === 'All' || dept.location === deptLocationFilter;

      const matchesCompany =
        deptCompanyFilter === 'All Companies' || deptCompanyFilter === 'All' || dept.company === deptCompanyFilter;

      return matchesSearch && matchesType && matchesStatus && matchesLoc && matchesCompany;
    });
  }, [departmentsList, deptSearchQuery, deptTypeFilter, deptStatusFilter, deptLocationFilter, deptCompanyFilter]);

  const handleResetDeptFilters = () => {
    setDeptSearchQuery('');
    setDeptTypeFilter('All Types');
    setDeptStatusFilter('All');
    setDeptLocationFilter('All Locations');
    setDeptCompanyFilter('All Companies');
  };

  const handleOpenAddDeptModal = (deptToEdit = null) => {
    if (deptToEdit) {
      setEditingDepartment(deptToEdit);
      setDeptFormState({
        code: deptToEdit.code,
        name: deptToEdit.name,
        type: deptToEdit.type || 'Support',
        parentDepartment: deptToEdit.parentDepartment || '-',
        location: deptToEdit.location || 'Dubai HQ',
        company: deptToEdit.company || 'Wavelogix FZC',
        manager: deptToEdit.manager || '',
        email: deptToEdit.email || '',
        phone: deptToEdit.phone || '',
        description: deptToEdit.description || '',
        status: deptToEdit.status || 'Active'
      });
    } else {
      setEditingDepartment(null);
      setDeptFormState({
        code: '',
        name: '',
        type: 'Support',
        parentDepartment: '-',
        location: 'Dubai HQ',
        company: 'Wavelogix FZC',
        manager: '',
        email: '',
        phone: '',
        description: '',
        status: 'Active'
      });
    }
    setShowAddDeptModal(true);
  };

  const handleSaveDept = (e) => {
    e.preventDefault();
    if (!deptFormState.code || !deptFormState.name) return;

    if (editingDepartment) {
      const updated = departmentsList.map((d) =>
        d.id === editingDepartment.id
          ? {
              ...d,
              code: deptFormState.code.toUpperCase(),
              name: deptFormState.name,
              type: deptFormState.type,
              parentDepartment: deptFormState.parentDepartment,
              location: deptFormState.location,
              company: deptFormState.company,
              manager: deptFormState.manager,
              email: deptFormState.email,
              phone: deptFormState.phone,
              description: deptFormState.description,
              status: deptFormState.status,
              lastModifiedBy: 'Logged In User',
              lastModifiedOn: new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }) + ' 03:15 PM'
            }
          : d
      );
      setDepartmentsList(updated);
      if (selectedDepartment?.id === editingDepartment.id) {
        setSelectedDepartment(updated.find((item) => item.id === editingDepartment.id));
      }
      triggerToast && triggerToast(`Department "${deptFormState.name}" updated successfully.`);
    } else {
      const newDept = {
        id: Date.now(),
        code: deptFormState.code.toUpperCase(),
        name: deptFormState.name,
        type: deptFormState.type,
        parentDepartment: deptFormState.parentDepartment,
        location: deptFormState.location,
        company: deptFormState.company,
        manager: deptFormState.manager,
        email: deptFormState.email,
        phone: deptFormState.phone,
        description: deptFormState.description,
        employees: 0,
        status: deptFormState.status,
        createdBy: 'Admin User',
        createdOn: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ' 10:00 AM',
        lastModifiedBy: 'Admin User',
        lastModifiedOn: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ' 10:00 AM',
        relatedInfo: {
          subDepartments: 0,
          locations: 1,
          assets: 0,
          users: 0
        }
      };
      setDepartmentsList([newDept, ...departmentsList]);
      setSelectedDepartment(newDept);
      triggerToast && triggerToast(`Department "${deptFormState.name}" created successfully.`);
    }
    setShowAddDeptModal(false);
  };

  const handleDuplicateDepartment = (dept) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const duplicated = {
      ...dept,
      id: Date.now(),
      code: `${dept.code}-COPY`,
      name: `${dept.name} (Copy)`,
      employees: 0,
      createdOn: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ' 10:00 AM'
    };
    setDepartmentsList([duplicated, ...departmentsList]);
    setSelectedDepartment(duplicated);
    triggerToast && triggerToast(`Department "${dept.name}" duplicated as "${duplicated.code}".`);
  };

  const handleToggleDepartmentStatus = (dept) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const newStatus = dept.status === 'Active' ? 'Inactive' : 'Active';
    const updated = departmentsList.map((d) =>
      d.id === dept.id ? { ...d, status: newStatus } : d
    );
    setDepartmentsList(updated);
    if (selectedDepartment?.id === dept.id) {
      setSelectedDepartment({ ...selectedDepartment, status: newStatus });
    }
    triggerToast && triggerToast(`Department "${dept.code}" status changed to ${newStatus}.`);
  };

  const handleDeleteDepartment = (dept) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    if (window.confirm(`Are you sure you want to delete Department "${dept.name}" (${dept.code})?`)) {
      const remaining = departmentsList.filter((d) => d.id !== dept.id);
      setDepartmentsList(remaining);
      if (remaining.length > 0) setSelectedDepartment(remaining[0]);
      triggerToast && triggerToast(`Department "${dept.code}" deleted successfully.`);
    }
  };

  const handleToggleSelectAllDepts = () => {
    if (selectedDeptIds.length === filteredDepartments.length) {
      setSelectedDeptIds([]);
    } else {
      setSelectedDeptIds(filteredDepartments.map((d) => d.id));
    }
  };

  const handleToggleSelectDept = (id, e) => {
    if (e) e.stopPropagation();
    if (selectedDeptIds.includes(id)) {
      setSelectedDeptIds(selectedDeptIds.filter((item) => item !== id));
    } else {
      setSelectedDeptIds([...selectedDeptIds, id]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px] relative">
            <span className="text-[10px] font-semibold text-slate-400 absolute left-3 top-1">Search</span>
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 bottom-2.5" />
            <input
              type="text"
              placeholder="Search by department code, name, manager..."
              value={deptSearchQuery}
              onChange={(e) => setDeptSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 pt-4 pb-1.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="w-full md:w-36 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Department Type</span>
            <select
              value={deptTypeFilter}
              onChange={(e) => setDeptTypeFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All Types">All Types</option>
              <option value="Support">Support</option>
              <option value="Operational">Operational</option>
              <option value="Management">Management</option>
            </select>
          </div>

          <div className="w-full md:w-28 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Status</span>
            <select
              value={deptStatusFilter}
              onChange={(e) => setDeptStatusFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="w-full md:w-36 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Location</span>
            <select
              value={deptLocationFilter}
              onChange={(e) => setDeptLocationFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All Locations">All Locations</option>
              <option value="Dubai HQ">Dubai HQ</option>
              <option value="Jebel Ali">Jebel Ali</option>
            </select>
          </div>

          <div className="w-full md:w-40 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Company</span>
            <select
              value={deptCompanyFilter}
              onChange={(e) => setDeptCompanyFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All Companies">All Companies</option>
              <option value="Wavelogix FZC">Wavelogix FZC</option>
            </select>
          </div>

          <div className="pt-4 md:pt-0">
            <button
              onClick={handleResetDeptFilters}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
            >
              Reset
            </button>
          </div>

          <div className="pt-4 md:pt-0">
            <button
              className="px-4 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Table Container */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Departments List</h2>
              <p className="text-xs text-slate-500">Showing all departments.</p>
            </div>
            <span className="text-xs font-bold text-[#6C2BD9] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              {filteredDepartments.length} Departments Loaded
            </span>
          </div>

          <div className="overflow-auto max-h-[540px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedDeptIds.length === filteredDepartments.length && filteredDepartments.length > 0}
                      onChange={handleToggleSelectAllDepts}
                      className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-2 text-center">#</th>
                  <th className="py-3 px-3">Dept Code</th>
                  <th className="py-3 px-3">Dept Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Manager</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3 text-right">Employees</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDepartments.map((dept, index) => {
                  const isSelected = selectedDepartment?.id === dept.id;
                  const isChecked = selectedDeptIds.includes(dept.id);
                  const isMenuOpen = activeRowMenuId === `dept-${dept.id}`;

                  return (
                    <tr
                      key={dept.id}
                      onClick={() => setSelectedDepartment(dept)}
                      className={clsx(
                        'cursor-pointer transition-colors relative',
                        isSelected ? 'bg-purple-50/60 font-semibold' : 'hover:bg-slate-50/70'
                      )}
                    >
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleToggleSelectDept(dept.id, e)}
                          className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-400 text-[11px]">{index + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#6C2BD9]">{dept.code}</td>
                      <td className="py-2.5 px-3 text-[#1E1B4B] font-bold">{dept.name}</td>
                      <td className="py-2.5 px-3 text-slate-700">{dept.type}</td>
                      <td className="py-2.5 px-3 text-slate-800">{dept.manager}</td>
                      <td className="py-2.5 px-3 text-slate-700">{dept.location}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{dept.employees}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold',
                            dept.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          )}
                        >
                          {dept.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center relative" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedDepartment(dept)}
                            title="View Details"
                            className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-[#6C2BD9] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenAddDeptModal(dept)}
                            title="Edit Department"
                            className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-[#6C2BD9] transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setActiveRowMenuId && setActiveRowMenuId(isMenuOpen ? null : `dept-${dept.id}`)}
                            title="More Actions"
                            className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 transition-colors cursor-pointer"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>

                        {isMenuOpen && (
                          <div className="absolute right-2 top-8 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 text-left space-y-0.5">
                            <button
                              onClick={() => {
                                setSelectedDepartment(dept);
                                setActiveRowMenuId && setActiveRowMenuId(null);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Details</span>
                            </button>
                            <button
                              onClick={() => handleOpenAddDeptModal(dept)}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit Department</span>
                            </button>
                            <button
                              onClick={() => handleDuplicateDepartment(dept)}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Duplicate</span>
                            </button>
                            <button
                              onClick={() => handleToggleDepartmentStatus(dept)}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>{dept.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteDepartment(dept)}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/40">
            <span className="text-slate-600 font-medium">
              Showing {filteredDepartments.length} records
            </span>
            <span className="text-slate-400">
              Scroll down to view all records
            </span>
          </div>
        </div>

        {/* Right Column: Department Details Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Department Details</h3>
            <button
              onClick={() => handleOpenAddDeptModal(selectedDepartment)}
              className="px-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#6C2BD9] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          {selectedDepartment && (
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-1 py-1">
                <span className="text-slate-500 font-medium">Dept Code</span>
                <span className="col-span-2 font-bold font-mono text-slate-900">{selectedDepartment.code}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Dept Name</span>
                <span className="col-span-2 font-semibold text-slate-900">{selectedDepartment.name}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Type</span>
                <span className="col-span-2 font-semibold text-slate-800">{selectedDepartment.type}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Manager</span>
                <span className="col-span-2 font-semibold text-slate-900">{selectedDepartment.manager}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Email / Phone</span>
                <span className="col-span-2 text-slate-700 font-mono text-[11px]">{selectedDepartment.email}<br/>{selectedDepartment.phone}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Location</span>
                <span className="col-span-2 text-slate-700">{selectedDepartment.location}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Company</span>
                <span className="col-span-2 text-slate-700">{selectedDepartment.company}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Description</span>
                <span className="col-span-2 text-slate-700 leading-relaxed">{selectedDepartment.description}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="col-span-2">
                  <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold', selectedDepartment.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>
                    {selectedDepartment.status}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Employees</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">{selectedDepartment.employees}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Related Information</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <FolderTree className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Sub Departments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedDepartment.relatedInfo.subDepartments}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <MapPin className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Locations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedDepartment.relatedInfo.locations}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Box className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Assets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedDepartment.relatedInfo.assets.toLocaleString()}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Users className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Assigned Users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedDepartment.relatedInfo.users}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add / Edit Department */}
      {showAddDeptModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#6C2BD9]" />
                <span>{editingDepartment ? 'Edit Department' : 'Add New Department'}</span>
              </h3>
              <button onClick={() => setShowAddDeptModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department Code *</label>
                  <input
                    type="text"
                    required
                    value={deptFormState.code}
                    onChange={(e) => setDeptFormState({ ...deptFormState, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. IT, HR, FIN"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    value={deptFormState.name}
                    onChange={(e) => setDeptFormState({ ...deptFormState, name: e.target.value })}
                    placeholder="e.g. Information Technology"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department Type</label>
                  <select
                    value={deptFormState.type}
                    onChange={(e) => setDeptFormState({ ...deptFormState, type: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="Support">Support</option>
                    <option value="Operational">Operational</option>
                    <option value="Management">Management</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Department</label>
                  <select
                    value={deptFormState.parentDepartment}
                    onChange={(e) => setDeptFormState({ ...deptFormState, parentDepartment: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="-">- (None / Top Level)</option>
                    <option value="FIN">FIN (Finance)</option>
                    <option value="OPS">OPS (Operations)</option>
                    <option value="IT">IT (Information Technology)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <select
                    value={deptFormState.location}
                    onChange={(e) => setDeptFormState({ ...deptFormState, location: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="Dubai HQ">Dubai HQ</option>
                    <option value="Jebel Ali">Jebel Ali</option>
                    <option value="Abu Dhabi Office">Abu Dhabi Office</option>
                    <option value="Riyadh Office">Riyadh Office</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company</label>
                  <select
                    value={deptFormState.company}
                    onChange={(e) => setDeptFormState({ ...deptFormState, company: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="Wavelogix FZC">Wavelogix FZC</option>
                    <option value="Wavelogix KSA">Wavelogix KSA</option>
                    <option value="Wavelogix Qatar">Wavelogix Qatar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manager</label>
                  <input
                    type="text"
                    value={deptFormState.manager}
                    onChange={(e) => setDeptFormState({ ...deptFormState, manager: e.target.value })}
                    placeholder="Manager Name"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={deptFormState.email}
                    onChange={(e) => setDeptFormState({ ...deptFormState, email: e.target.value })}
                    placeholder="email@wavelogix.com"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={deptFormState.phone}
                    onChange={(e) => setDeptFormState({ ...deptFormState, phone: e.target.value })}
                    placeholder="+971 50..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={deptFormState.description}
                  onChange={(e) => setDeptFormState({ ...deptFormState, description: e.target.value })}
                  placeholder="Enter detailed description..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={deptFormState.status}
                  onChange={(e) => setDeptFormState({ ...deptFormState, status: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddDeptModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold cursor-pointer shadow-sm">
                  {editingDepartment ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
