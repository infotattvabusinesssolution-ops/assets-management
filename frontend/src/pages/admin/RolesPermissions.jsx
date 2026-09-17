import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Download,
  MoreHorizontal,
  Eye,
  Edit2,
  Copy,
  Users,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronRight,
  Lock,
  Check,
  Calendar,
  XCircle,
  ArrowUpDown,
  FileSpreadsheet,
  CheckSquare
} from 'lucide-react';
import clsx from 'clsx';

const INITIAL_ROLES = [
  {
    id: 1,
    name: 'System Administrator',
    description: 'Full system access and configuration',
    roleType: 'System Role',
    userCount: 5,
    status: 'Active',
    dateCreated: '15 Jan 2025',
    createdBy: 'System'
  },
  {
    id: 2,
    name: 'Asset Manager',
    description: 'Manage assets and asset lifecycle',
    roleType: 'Custom Role',
    userCount: 8,
    status: 'Active',
    dateCreated: '20 Jan 2025',
    createdBy: 'John Doe'
  },
  {
    id: 3,
    name: 'Maintenance Manager',
    description: 'Manage maintenance operations',
    roleType: 'Custom Role',
    userCount: 6,
    status: 'Active',
    dateCreated: '25 Jan 2025',
    createdBy: 'Sarah Ahmed'
  },
  {
    id: 4,
    name: 'Inventory Manager',
    description: 'Manage inventory and spare parts',
    roleType: 'Custom Role',
    userCount: 4,
    status: 'Active',
    dateCreated: '28 Jan 2025',
    createdBy: 'Ramesh Kumar'
  },
  {
    id: 5,
    name: 'Audit Manager',
    description: 'Access to audit and verification modules',
    roleType: 'Custom Role',
    userCount: 3,
    status: 'Active',
    dateCreated: '02 Feb 2025',
    createdBy: 'Priya Nair'
  },
  {
    id: 6,
    name: 'Standard User',
    description: 'Basic access for daily operations',
    roleType: 'System Role',
    userCount: 28,
    status: 'Active',
    dateCreated: '10 Feb 2025',
    createdBy: 'System'
  },
  {
    id: 7,
    name: 'Read Only User',
    description: 'View-only access to assigned data',
    roleType: 'System Role',
    userCount: 12,
    status: 'Active',
    dateCreated: '12 Feb 2025',
    createdBy: 'John Doe'
  },
  {
    id: 8,
    name: 'External Auditor',
    description: 'Limited access for external auditors',
    roleType: 'Custom Role',
    userCount: 2,
    status: 'Inactive',
    dateCreated: '15 Feb 2025',
    createdBy: 'Sarah Ahmed'
  },
  {
    id: 9,
    name: 'Contractor',
    description: 'Access to specific modules',
    roleType: 'Custom Role',
    userCount: 3,
    status: 'Active',
    dateCreated: '18 Feb 2025',
    createdBy: 'Ramesh Kumar'
  },
  {
    id: 10,
    name: 'Guest User',
    description: 'Temporary access',
    roleType: 'System Role',
    userCount: 1,
    status: 'Inactive',
    dateCreated: '20 Feb 2025',
    createdBy: 'System'
  }
];

export function RolesPermissions() {
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [roleTypeFilter, setRoleTypeFilter] = useState('All Types');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [createdByFilter, setCreatedByFilter] = useState('All Users');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Modals
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showAssignUsersModal, setShowAssignUsersModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ name: '', description: '', roleType: 'Custom Role', status: 'Active' });

  // Permissions Matrix State
  const [expandedModules, setExpandedModules] = useState({ assets: true, movements: true, audit: true, administration: true });
  const [rolePermissions, setRolePermissions] = useState({});

  // Filtered Roles Memo
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch =
        !searchQuery ||
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'All Status' || statusFilter === 'All' || role.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesType =
        roleTypeFilter === 'All Types' || roleTypeFilter === 'All' || role.roleType === roleTypeFilter;

      const matchesCreatedBy =
        createdByFilter === 'All Users' || createdByFilter === 'All' || role.createdBy === createdByFilter;

      return matchesSearch && matchesStatus && matchesType && matchesCreatedBy;
    });
  }, [roles, searchQuery, statusFilter, roleTypeFilter, createdByFilter]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRoleIds(filteredRoles.map((r) => r.id));
    } else {
      setSelectedRoleIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedRoleIds.includes(id)) {
      setSelectedRoleIds(selectedRoleIds.filter((item) => item !== id));
    } else {
      setSelectedRoleIds([...selectedRoleIds, id]);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All Status');
    setRoleTypeFilter('All Types');
    setModuleFilter('All Modules');
    setCreatedByFilter('All Users');
    setFromDate('');
    setToDate('');
  };

  const handleSaveRole = (e) => {
    e.preventDefault();
    if (!roleForm.name) return;

    if (editingRole) {
      setRoles(
        roles.map((r) =>
          r.id === editingRole.id
            ? {
                ...r,
                name: roleForm.name,
                description: roleForm.description,
                roleType: roleForm.roleType || 'Custom Role',
                status: roleForm.status
              }
            : r
        )
      );
      triggerToast(`Role "${roleForm.name}" updated successfully.`);
    } else {
      const newRole = {
        id: Date.now(),
        name: roleForm.name,
        description: roleForm.description,
        roleType: roleForm.roleType || 'Custom Role',
        userCount: 0,
        status: roleForm.status || 'Active',
        dateCreated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdBy: 'Admin User'
      };
      setRoles([newRole, ...roles]);
      triggerToast(`Role "${roleForm.name}" created successfully.`);
    }
    setShowAddRoleModal(false);
    setEditingRole(null);
  };

  const handleCloneRole = (role) => {
    setActiveDropdownId(null);
    const cloned = {
      ...role,
      id: Date.now(),
      name: `${role.name} (Copy)`,
      roleType: 'Custom Role',
      userCount: 0,
      dateCreated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      createdBy: 'Admin User'
    };
    setRoles([cloned, ...roles]);
    triggerToast(`Role "${role.name}" cloned as "${cloned.name}"`);
  };

  const handleToggleStatus = (role) => {
    setActiveDropdownId(null);
    const nextStatus = role.status === 'Active' ? 'Inactive' : 'Active';
    setRoles(roles.map((r) => (r.id === role.id ? { ...r, status: nextStatus } : r)));
    triggerToast(`Role "${role.name}" marked as ${nextStatus}.`);
  };

  const handleDeleteRole = (role) => {
    setActiveDropdownId(null);
    if (!window.confirm(`Are you sure you want to delete role "${role.name}"?`)) return;
    setRoles(roles.filter((r) => r.id !== role.id));
    triggerToast(`Role "${role.name}" deleted.`);
  };

  const handleOpenPermissions = (role) => {
    setSelectedRole(role);
    setRolePermissions(role.permissions || {});
    setShowPermissionsModal(true);
    setActiveDropdownId(null);
  };

  const handleSavePermissions = () => {
    triggerToast(`Permissions updated for "${selectedRole?.name}".`);
    setShowPermissionsModal(false);
  };

  const togglePermission = (moduleKey, action) => {
    const currentActions = rolePermissions[moduleKey] || [];
    const updated = currentActions.includes(action)
      ? currentActions.filter((a) => a !== action)
      : [...currentActions, action];
    setRolePermissions({ ...rolePermissions, [moduleKey]: updated });
  };

  const MODULE_STRUCTURE = [
    {
      key: 'assets',
      name: 'Asset Management',
      screens: ['Asset Register', 'New Asset Registration', 'My Assets', 'Asset Hierarchy', 'Asset Approvals'],
      actions: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Export', 'Import']
    },
    {
      key: 'movements',
      name: 'Assignment & Movement',
      screens: ['Transfer & Movement', 'Assign Asset', 'Movement Approvals', 'Movement History'],
      actions: ['View', 'Create', 'Assign', 'Transfer', 'Approve', 'Export']
    },
    {
      key: 'audit',
      name: 'Verification & Audit',
      screens: ['Audit Management', 'Audit Execution', 'Audit Reports'],
      actions: ['View', 'Create', 'Verify', 'Execute', 'Export', 'Delete']
    },
    {
      key: 'maintenance',
      name: 'Maintenance',
      screens: ['Work Orders', 'Preventive Maintenance'],
      actions: ['View', 'Create', 'Edit', 'Execute', 'Approve', 'Delete']
    },
    {
      key: 'administration',
      name: 'Administration',
      screens: ['User Management', 'Roles & Permissions', 'Company & Organization', 'System Configuration', 'Audit Logs'],
      actions: ['View', 'Create', 'Edit', 'Delete', 'Administer']
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-[#0F172A] p-6 space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-xs font-bold">{toastMsg}</span>
          <button onClick={() => setToastMsg('')} className="text-emerald-500 hover:text-emerald-700 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
          <span>Administration</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#2563EB] font-bold">Roles &amp; Permissions</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Roles &amp; Permissions</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create and manage roles, and assign module-level permissions to control system access.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => triggerToast('Exporting complete Role Matrix to CSV/Excel...')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export Roles
            </button>

            <button
              onClick={() => {
                setEditingRole(null);
                setRoleForm({ name: '', description: '', roleType: 'Custom Role', status: 'Active' });
                setShowAddRoleModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Role
            </button>
          </div>
        </div>
      </div>

      {/* Filters Bar (Matching Screenshot) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-[#2563EB]" />
            <span>Filters</span>
          </div>
          <button
            onClick={() => triggerToast('Advanced filter options loaded.')}
            className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Advanced Filters</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Status</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] appearance-none cursor-pointer"
              >
                <option value="All Status">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Role Type */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Role Type</label>
            <div className="relative">
              <select
                value={roleTypeFilter}
                onChange={(e) => setRoleTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] appearance-none cursor-pointer"
              >
                <option value="All Types">All Types</option>
                <option value="System Role">System Role</option>
                <option value="Custom Role">Custom Role</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Module */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Module</label>
            <div className="relative">
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] appearance-none cursor-pointer"
              >
                <option value="All Modules">All Modules</option>
                <option value="Asset Management">Asset Management</option>
                <option value="Inventory">Inventory</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Reports & Analytics">Reports & Analytics</option>
                <option value="Administration">Administration</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Created By */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Created By</label>
            <div className="relative">
              <select
                value={createdByFilter}
                onChange={(e) => setCreatedByFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] appearance-none cursor-pointer"
              >
                <option value="All Users">All Users</option>
                <option value="John Doe">John Doe</option>
                <option value="Sarah Ahmed">Sarah Ahmed</option>
                <option value="Ramesh Kumar">Ramesh Kumar</option>
                <option value="Priya Nair">Priya Nair</option>
                <option value="System">System</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Date Created */}
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
                  className="w-full pl-8 pr-2 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:border-[#2563EB] focus:outline-hidden"
                />
              </div>
              <span className="text-slate-400 font-bold">→</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="To Date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:border-[#2563EB] focus:outline-hidden"
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
            onClick={() => triggerToast('Filters applied.')}
            className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>

      {/* Main Roles Table Card (Matching Screenshot) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-slate-900">Roles ({filteredRoles.length})</h2>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles by name or description..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold select-none text-[11px] uppercase tracking-wider">
                <th className="p-3 pl-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedRoleIds.length === filteredRoles.length && filteredRoles.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-[#2563EB] cursor-pointer"
                  />
                </th>
                <th className="p-3 w-10 text-slate-400">#</th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#2563EB]">
                    <span>Role Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">Description</th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#2563EB]">
                    <span>Role Type</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#2563EB]">
                    <span>Users</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#2563EB]">
                    <span>Status</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#2563EB]">
                    <span>Date Created</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#2563EB]">
                    <span>Created By</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 text-center font-bold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-slate-500 font-semibold">
                    No roles match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role, idx) => {
                  const isSelected = selectedRoleIds.includes(role.id);
                  return (
                    <tr
                      key={role.id}
                      className={clsx(
                        'transition-colors',
                        isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'
                      )}
                    >
                      <td className="p-3 pl-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(role.id)}
                          className="rounded border-slate-300 text-[#2563EB] cursor-pointer"
                        />
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="p-3 font-bold text-[#2563EB]">
                        <span
                          className="cursor-pointer hover:underline"
                          onClick={() => handleOpenPermissions(role)}
                        >
                          {role.name}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">{role.description}</td>
                      <td className="p-3">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border',
                            role.roleType === 'System Role'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          )}
                        >
                          {role.roleType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-800 font-mono font-bold">{role.userCount}</td>
                      <td className="p-3">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold',
                            role.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          )}
                        >
                          {role.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{role.dateCreated}</td>
                      <td className="p-3 text-slate-700 font-medium">{role.createdBy}</td>
                      <td className="p-3 text-center relative">
                        <button
                          onClick={() => setActiveDropdownId(activeDropdownId === role.id ? null : role.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Row Actions Context Dropdown Menu matching Screenshot */}
                        {activeDropdownId === role.id && (
                          <div className="absolute right-4 top-10 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 text-left animate-fadeIn">
                            <button
                              onClick={() => {
                                setSelectedRole(role);
                                setShowViewDetailsModal(true);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] flex items-center gap-2.5 font-semibold"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                setEditingRole(role);
                                setRoleForm({
                                  name: role.name,
                                  description: role.description,
                                  roleType: role.roleType,
                                  status: role.status
                                });
                                setShowAddRoleModal(true);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] flex items-center gap-2.5 font-semibold"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                              Edit Role
                            </button>
                            <button
                              onClick={() => handleOpenPermissions(role)}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] flex items-center gap-2.5 font-semibold"
                            >
                              <ShieldCheck className="w-4 h-4 text-blue-600" />
                              Manage Permissions
                            </button>
                            <button
                              onClick={() => handleCloneRole(role)}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] flex items-center gap-2.5 font-semibold"
                            >
                              <Copy className="w-4 h-4 text-blue-600" />
                              Clone Role
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRole(role);
                                setShowAssignUsersModal(true);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] flex items-center gap-2.5 font-semibold"
                            >
                              <Users className="w-4 h-4 text-blue-600" />
                              Assign Users
                            </button>
                            <button
                              onClick={() => {
                                triggerToast(`Exporting role "${role.name}" specification...`);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] flex items-center gap-2.5 font-semibold"
                            >
                              <Download className="w-4 h-4 text-blue-600" />
                              Export Role
                            </button>

                            <div className="border-t border-slate-100 my-1"></div>

                            <button
                              onClick={() => handleToggleStatus(role)}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] flex items-center gap-2.5 font-semibold"
                            >
                              {role.status === 'Active' ? (
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
                              onClick={() => handleDeleteRole(role)}
                              className="w-full px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-semibold"
                            >
                              <Trash2 className="w-4 h-4 text-rose-600" />
                              Delete Role
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

        {/* Table Pagination Footer matching Screenshot */}
        <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>Showing 1 to {filteredRoles.length} of {roles.length} roles</div>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 border border-slate-200 rounded-lg disabled:opacity-40 font-bold hover:bg-slate-50 cursor-pointer" disabled>
              «
            </button>
            <button className="px-3 py-1 bg-[#2563EB] text-white rounded-lg font-bold">1</button>
            <button className="px-2.5 py-1 border border-slate-200 rounded-lg disabled:opacity-40 font-bold hover:bg-slate-50 cursor-pointer" disabled>
              »
            </button>
            <select className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs bg-white font-medium focus:outline-hidden cursor-pointer">
              <option>10 / page</option>
              <option>25 / page</option>
              <option>50 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {showViewDetailsModal && selectedRole && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedRole.name}</h3>
                  <p className="text-xs text-slate-400">{selectedRole.roleType}</p>
                </div>
              </div>
              <button onClick={() => setShowViewDetailsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Description</span>
                <span className="font-bold text-slate-800">{selectedRole.description}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Assigned Users</span>
                  <span className="font-mono font-bold text-[#2563EB] text-sm">{selectedRole.userCount} Users</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Status</span>
                  <span className={clsx('font-bold', selectedRole.status === 'Active' ? 'text-emerald-600' : 'text-rose-600')}>
                    {selectedRole.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Date Created</span>
                  <span className="font-mono font-bold text-slate-700">{selectedRole.dateCreated}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Created By</span>
                  <span className="font-bold text-slate-700">{selectedRole.createdBy}</span>
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

      {/* ACTION-LEVEL PERMISSION MATRIX MODAL */}
      {showPermissionsModal && selectedRole && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl p-6 max-h-[90vh] flex flex-col space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
                  Permissions Matrix: {selectedRole.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure granular action-level access across all Asset360 modules &amp; screens.
                </p>
              </div>
              <button onClick={() => setShowPermissionsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning if role has users */}
            {selectedRole.userCount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl flex items-center gap-2 shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Impact Notice:</strong> Changes made here will immediately affect{' '}
                  <strong>{selectedRole.userCount} currently active user(s)</strong> assigned to this role.
                </span>
              </div>
            )}

            {/* Matrix Accordions */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {MODULE_STRUCTURE.map((mod) => {
                const isExpanded = expandedModules[mod.key];
                const selectedActions = rolePermissions[mod.key] || [];

                return (
                  <div key={mod.key} className="border border-slate-200 rounded-2xl overflow-hidden">
                    <div
                      onClick={() => setExpandedModules({ ...expandedModules, [mod.key]: !isExpanded })}
                      className="bg-slate-50/80 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition select-none"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                        <span className="font-bold text-xs text-slate-900">{mod.name}</span>
                        <span className="text-[11px] text-slate-400 font-medium">({mod.screens.length} screens)</span>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            const allActions = mod.actions;
                            const isAllSelected = allActions.every((a) => selectedActions.includes(a));
                            setRolePermissions({
                              ...rolePermissions,
                              [mod.key]: isAllSelected ? [] : [...allActions]
                            });
                          }}
                          className="text-[11px] font-bold text-[#2563EB] hover:underline"
                        >
                          Select All
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-slate-100 space-y-3">
                        <div className="text-[11px] text-slate-500 mb-1">
                          Applicable screens: {mod.screens.join(', ')}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {mod.actions.map((act) => {
                            const checked = selectedActions.includes(act);
                            const isSensitive = ['Delete', 'Approve', 'Administer', 'Export'].includes(act);

                            return (
                              <button
                                key={act}
                                type="button"
                                onClick={() => togglePermission(mod.key, act)}
                                className={clsx(
                                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer',
                                  checked
                                    ? isSensitive
                                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                                      : 'bg-blue-50 border-blue-200 text-[#2563EB]'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                )}
                              >
                                {checked && <Check className="w-3.5 h-3.5" />}
                                {act}
                                {isSensitive && <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-rose-100 text-rose-800 ml-1 font-extrabold">Sensitive</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowPermissionsModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ROLE MODAL */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingRole ? 'Edit Role' : 'Add New Role'}
              </h3>
              <button onClick={() => setShowAddRoleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Name *</label>
                <input
                  type="text"
                  required
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder="e.g. Asset Custodian"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  placeholder="Role responsibilities and intended access..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role Type</label>
                  <select
                    value={roleForm.roleType}
                    onChange={(e) => setRoleForm({ ...roleForm, roleType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium cursor-pointer"
                  >
                    <option value="Custom Role">Custom Role</option>
                    <option value="System Role">System Role</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={roleForm.status}
                    onChange={(e) => setRoleForm({ ...roleForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingRole ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN USERS MODAL */}
      {showAssignUsersModal && selectedRole && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Assign Users to {selectedRole.name}</h3>
                  <p className="text-xs text-slate-400">Select users to associate with this access role</p>
                </div>
              </div>
              <button onClick={() => setShowAssignUsersModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
              {[
                { name: 'John Doe', email: 'john.doe@infotatwaa.com', assigned: true },
                { name: 'Sarah Ahmed', email: 'sarah.ahmed@infotatwaa.com', assigned: true },
                { name: 'Ramesh Kumar', email: 'ramesh.kumar@infotatwaa.com', assigned: false },
                { name: 'Priya Nair', email: 'priya.nair@infotatwaa.com', assigned: false },
                { name: 'Michael Brown', email: 'michael.brown@infotatwaa.com', assigned: false }
              ].map((u, i) => (
                <label key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input type="checkbox" defaultChecked={u.assigned} className="rounded text-[#2563EB]" />
                    <div>
                      <div className="font-bold text-slate-800">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </div>
                  </div>
                  {u.assigned && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Assigned</span>}
                </label>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setShowAssignUsersModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAssignUsersModal(false);
                  triggerToast(`User assignments updated for ${selectedRole.name}.`);
                }}
                className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl shadow-xs"
              >
                Save Assignments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RolesPermissions;
