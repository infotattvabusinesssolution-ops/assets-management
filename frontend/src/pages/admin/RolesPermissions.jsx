import React, { useState, useEffect } from 'react';
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
  Check
} from 'lucide-react';

export function RolesPermissions() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [roleTypeFilter, setRoleTypeFilter] = useState('All Types');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [createdByFilter, setCreatedByFilter] = useState('All Users');
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Modals
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showAssignUsersModal, setShowAssignUsersModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ name: '', description: '', status: 'Active' });

  // Permissions Matrix State
  const [expandedModules, setExpandedModules] = useState({ assets: true, movements: true, audit: true, administration: true });
  const [rolePermissions, setRolePermissions] = useState({});

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        status: statusFilter,
        roleType: roleTypeFilter,
        createdBy: createdByFilter
      });
      const res = await fetch(`http://localhost:5000/api/v1/admin/roles?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRoles(data.roles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [searchQuery, statusFilter, roleTypeFilter, createdByFilter]);

  // Actions
  const handleCloneRole = async (role) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/admin/roles/${role.id}/clone`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setToastMsg(`Role cloned as "${data.role.name}"`);
        fetchRoles();
      }
    } catch (err) {
      console.error(err);
    }
    setActiveDropdownId(null);
  };

  const handleDeleteRole = async (role) => {
    if (!window.confirm(`Are you sure you want to delete role ${role.name}?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/v1/admin/roles/${role.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setToastMsg('Role deleted successfully');
        fetchRoles();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
    setActiveDropdownId(null);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/v1/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleForm)
      });
      const data = await res.json();
      if (data.success) {
        setToastMsg('Role created successfully');
        setShowAddRoleModal(false);
        fetchRoles();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenPermissions = (role) => {
    setSelectedRole(role);
    setRolePermissions(role.permissions || {});
    setShowPermissionsModal(true);
    setActiveDropdownId(null);
  };

  const handleSavePermissions = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/admin/roles/${selectedRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: rolePermissions })
      });
      const data = await res.json();
      if (data.success) {
        setToastMsg(`Permissions updated for ${selectedRole.name}`);
        setShowPermissionsModal(false);
        fetchRoles();
      }
    } catch (err) {
      console.error(err);
    }
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-[#0F172A] p-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-lg shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-medium">{toastMsg}</span>
          <button onClick={() => setToastMsg('')} className="text-emerald-500 hover:text-emerald-700 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span>Administration</span>
          <span>&gt;</span>
          <span className="text-[#6C2BD9] font-medium">Roles &amp; Permissions</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Roles &amp; Permissions</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Create and manage roles, and assign module-level permissions to control system access.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => alert('Exporting complete Role Matrix to Excel')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export Roles
            </button>

            <button
              onClick={() => {
                setRoleForm({ name: '', description: '', status: 'Active' });
                setShowAddRoleModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Role
            </button>
          </div>
        </div>
      </div>

      {/* Filters Bar (Screenshot 2) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="text-xs font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#6C2BD9]" />
          Filters
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Role Type */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">Role Type</label>
            <select
              value={roleTypeFilter}
              onChange={(e) => setRoleTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
            >
              <option value="All Types">All Types</option>
              <option value="System Role">System Role</option>
              <option value="Custom Role">Custom Role</option>
            </select>
          </div>

          {/* Module */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">Module</label>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
            >
              <option value="All Modules">All Modules</option>
              <option value="Asset Management">Asset Management</option>
              <option value="Inventory">Inventory</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Reports & Analytics">Reports & Analytics</option>
              <option value="Administration">Administration</option>
            </select>
          </div>

          {/* Created By */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">Created By</label>
            <select
              value={createdByFilter}
              onChange={(e) => setCreatedByFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
            >
              <option value="All Users">All Users</option>
              <option value="John Doe">John Doe</option>
              <option value="Sarah Ahmed">Sarah Ahmed</option>
              <option value="Ramesh Kumar">Ramesh Kumar</option>
              <option value="Priya Nair">Priya Nair</option>
              <option value="System">System</option>
            </select>
          </div>

          {/* Date Created */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">Date Created</label>
            <div className="flex items-center gap-1.5">
              <input type="date" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
          <button
            onClick={() => {
              setStatusFilter('All Status');
              setRoleTypeFilter('All Types');
              setModuleFilter('All Modules');
              setCreatedByFilter('All Users');
            }}
            className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-medium"
          >
            Reset
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Advanced filter options: Filter by specific action permission, sensitive permission flags, or user assignment thresholds.')}
              className="text-[#6C2BD9] font-medium hover:underline flex items-center gap-1"
            >
              Advanced Filters &gt;
            </button>

            <button
              onClick={fetchRoles}
              className="px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-semibold rounded-lg transition"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Roles Table (Screenshot 2) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Roles ({roles.length})</h2>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles by name or description..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-[#6C2BD9]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold select-none">
                <th className="p-3 pl-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-[#6C2BD9]" />
                </th>
                <th className="p-3 w-10 text-slate-400">#</th>
                <th className="p-3 font-semibold text-slate-900">Role Name &uarr;&darr;</th>
                <th className="p-3 font-semibold text-slate-900">Description</th>
                <th className="p-3 font-semibold text-slate-900">Role Type &or;</th>
                <th className="p-3 font-semibold text-slate-900">Users &or;</th>
                <th className="p-3 font-semibold text-slate-900">Status &or;</th>
                <th className="p-3 font-semibold text-slate-900">Date Created &or;</th>
                <th className="p-3 font-semibold text-slate-900">Created By &or;</th>
                <th className="p-3 text-right pr-4 font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-slate-400">Loading roles registry...</td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-slate-500">No roles found.</td>
                </tr>
              ) : (
                roles.map((role, idx) => (
                  <tr key={role.id} className="hover:bg-[#F5F3FF]/40 transition">
                    <td className="p-3 pl-4">
                      <input type="checkbox" className="rounded border-slate-300 text-[#6C2BD9]" />
                    </td>
                    <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-900">
                      <span
                        className="cursor-pointer hover:text-[#6C2BD9]"
                        onClick={() => handleOpenPermissions(role)}
                      >
                        {role.name}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{role.description}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                          role.roleType === 'System Role'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {role.roleType}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-mono font-medium">{role.userCount}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          role.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {role.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">{role.dateCreated}</td>
                    <td className="p-3 text-slate-600">{role.createdBy}</td>
                    <td className="p-3 text-right pr-4 relative">
                      <button
                        onClick={() => setActiveDropdownId(activeDropdownId === role.id ? null : role.id)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded border border-slate-200 hover:bg-slate-50"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {/* 8 Row Actions Dropdown */}
                      {activeDropdownId === role.id && (
                        <div className="absolute right-4 top-10 w-44 bg-white border border-slate-200 rounded-lg shadow-xl z-30 py-1 text-left animate-in fade-in duration-100">
                          <button
                            onClick={() => {
                              alert(`Role: ${role.name}\nUsers: ${role.userCount}\nCreated: ${role.dateCreated}`);
                              setActiveDropdownId(null);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#6C2BD9]" />
                            View Details
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRole(role);
                              setRoleForm({ name: role.name, description: role.description, status: role.status });
                              setShowAddRoleModal(true);
                              setActiveDropdownId(null);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#6C2BD9]" />
                            Edit Role
                          </button>
                          <button
                            onClick={() => handleOpenPermissions(role)}
                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2 font-medium"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-[#6C2BD9]" />
                            Manage Permissions
                          </button>
                          <button
                            onClick={() => handleCloneRole(role)}
                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                          >
                            <Copy className="w-3.5 h-3.5 text-[#6C2BD9]" />
                            Clone Role
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRole(role);
                              setShowAssignUsersModal(true);
                              setActiveDropdownId(null);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                          >
                            <Users className="w-3.5 h-3.5 text-[#6C2BD9]" />
                            Assign Users
                          </button>
                          <button
                            onClick={() => {
                              alert(`Exporting ${role.name} security specification`);
                              setActiveDropdownId(null);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                          >
                            <Download className="w-3.5 h-3.5 text-[#6C2BD9]" />
                            Export Role
                          </button>
                          <button
                            onClick={() => {
                              setToastMsg(`Status toggled for ${role.name}`);
                              setActiveDropdownId(null);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-[#6C2BD9]" />
                            {role.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <div className="border-t border-slate-100 my-1"></div>
                          <button
                            onClick={() => handleDeleteRole(role)}
                            className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            Delete Role
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>Showing 1 to {roles.length} of {roles.length} roles</div>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 border border-slate-200 rounded disabled:opacity-40" disabled>&laquo;</button>
            <button className="px-2.5 py-1 bg-[#6C2BD9] text-white rounded font-medium">1</button>
            <button className="px-2 py-1 border border-slate-200 rounded disabled:opacity-40" disabled>&raquo;</button>
            <select className="px-2 py-1 border border-slate-200 rounded text-xs bg-white">
              <option>10 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* ACTION-LEVEL PERMISSION MATRIX MODAL */}
      {showPermissionsModal && selectedRole && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#6C2BD9]" />
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
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center gap-2 shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Impact Notice:</strong> Changes made here will immediately affect{' '}
                  <strong>{selectedRole.userCount} currently active user(s)</strong> assigned to this role.
                </span>
              </div>
            )}

            {/* Matrix Accordions */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
              {MODULE_STRUCTURE.map((mod) => {
                const isExpanded = expandedModules[mod.key];
                const selectedActions = rolePermissions[mod.key] || [];

                return (
                  <div key={mod.key} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div
                      onClick={() => setExpandedModules({ ...expandedModules, [mod.key]: !isExpanded })}
                      className="bg-[#F8FAFC] px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition select-none"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                        <span className="font-semibold text-xs text-slate-900">{mod.name}</span>
                        <span className="text-[11px] text-slate-400">({mod.screens.length} screens)</span>
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
                          className="text-[11px] font-medium text-[#6C2BD9] hover:underline"
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
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                                  checked
                                    ? isSensitive
                                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                                      : 'bg-[#F5F3FF] border-[#DDD6FE] text-[#6C2BD9]'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {checked && <Check className="w-3.5 h-3.5" />}
                                {act}
                                {isSensitive && <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-rose-100 text-rose-800 ml-1">Sensitive</span>}
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
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowPermissionsModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ROLE MODAL */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Role</h3>
              <button onClick={() => setShowAddRoleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Role Name *</label>
                <input
                  type="text"
                  required
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder="e.g. Asset Custodian"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  placeholder="Role responsibilities and intended access..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={roleForm.status}
                  onChange={(e) => setRoleForm({ ...roleForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-semibold rounded-lg shadow-sm"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RolesPermissions;

