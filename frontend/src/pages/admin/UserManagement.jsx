import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  X,
  Plus,
  Download,
  Upload,
  MoreHorizontal,
  Eye,
  Edit2,
  Lock,
  Key,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  XCircle,
  Mail,
  LogIn,
  Trash2,
  Calendar,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  Briefcase,
  AlertTriangle
} from 'lucide-react';

export default function UserManagement() {
  // State
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active'); // Default screenshot filter
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showAssignRolesModal, setShowAssignRolesModal] = useState(false);
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Advanced Filters Form State
  const [advancedFilters, setAdvancedFilters] = useState({
    userType: 'All Users',
    status: 'Active',
    role: 'All Roles',
    department: 'All Departments',
    location: 'All Locations',
    company: 'All Companies',
    accountStatus: 'All',
    searchKeyword: '',
    permissionType: 'All Permissions',
    mfaEnabled: 'All',
    fromLastLogin: '',
    toLastLogin: '',
    fromCreatedDate: '',
    toCreatedDate: ''
  });

  // New/Edit User Form State
  const [userFormData, setUserFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    employeeId: '',
    role: 'Standard User',
    department: 'Information Technology',
    location: 'Dubai HQ',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate Services',
    userType: 'System User',
    status: 'Active',
    mfaEnabled: false
  });

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        search: searchQuery,
        status: statusFilter,
        userType: advancedFilters.userType,
        role: advancedFilters.role,
        department: advancedFilters.department,
        location: advancedFilters.location,
        company: advancedFilters.company,
        accountStatus: advancedFilters.accountStatus,
        mfaEnabled: advancedFilters.mfaEnabled
      });

      const res = await fetch(`http://localhost:5000/api/v1/admin/users?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setTotalUsers(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit, statusFilter, searchQuery]);

  // Handle Search Input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  // Apply Advanced Filters
  const handleApplyAdvancedFilters = () => {
    setStatusFilter(advancedFilters.status);
    setShowAdvancedFilters(false);
    setPage(1);
    fetchUsers();
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setAdvancedFilters({
      userType: 'All Users',
      status: 'All',
      role: 'All Roles',
      department: 'All Departments',
      location: 'All Locations',
      company: 'All Companies',
      accountStatus: 'All',
      searchKeyword: '',
      permissionType: 'All Permissions',
      mfaEnabled: 'All',
      fromLastLogin: '',
      toLastLogin: '',
      fromCreatedDate: '',
      toCreatedDate: ''
    });
    setPage(1);
  };

  // Actions
  const handleToggleStatus = async (user) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/admin/users/${user.id}/toggle-status`, {
        method: 'PATCH'
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(`Status updated for ${user.name}`);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
    setActiveDropdownId(null);
  };

  const handleResetPassword = async (user) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/admin/users/${user.id}/reset-password`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(`Password reset temporary code: ${data.tempPassword}`);
      }
    } catch (err) {
      console.error(err);
    }
    setActiveDropdownId(null);
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.name}? This action will verify that no active transactions are held.`)) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/v1/admin/users/${user.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(`User ${user.name} removed successfully.`);
        fetchUsers();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
    setActiveDropdownId(null);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const endpoint = showEditModal
        ? `http://localhost:5000/api/v1/admin/users/${selectedUser.id}`
        : 'http://localhost:5000/api/v1/admin/users';
      const method = showEditModal ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userFormData)
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(showEditModal ? 'User updated successfully' : 'User created successfully');
        setShowAddModal(false);
        setShowEditModal(false);
        fetchUsers();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(totalUsers / limit) || 1;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-[#0F172A] p-6">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-lg shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-medium">{actionSuccessMsg}</span>
          <button onClick={() => setActionSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Breadcrumb & Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span>&larr; Administration</span>
          <span>&gt;</span>
          <span className="text-[#6C2BD9] font-medium">User Management</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">User Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage system users, roles and access permissions</p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => alert('Import Users Wizard: Select an Excel or CSV template to upload user records.')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition shadow-sm"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              Import Users
            </button>

            <div className="relative group">
              <button className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition shadow-sm">
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Export &or;
              </button>
            </div>

            <button
              onClick={() => {
                setUserFormData({
                  name: '',
                  username: '',
                  email: '',
                  phone: '',
                  employeeId: '',
                  role: 'Standard User',
                  department: 'Information Technology',
                  location: 'Dubai HQ',
                  company: 'Asset360 Holdings',
                  businessUnit: 'Corporate Services',
                  userType: 'System User',
                  status: 'Active',
                  mfaEnabled: false
                });
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Main Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Global Search Input */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by name, email or username..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] transition placeholder:text-slate-400"
            />
          </div>

          {/* Filter Popover Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition ${
                showAdvancedFilters
                  ? 'bg-[#F5F3FF] border-[#6C2BD9] text-[#6C2BD9]'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-[#6C2BD9]" />
              Filter &and;
            </button>
          </div>

          {/* Active Filter Pill */}
          {statusFilter && (
            <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F5F3FF] border border-[#DDD6FE] text-[#6C2BD9] text-xs font-medium rounded-full">
              <span>Status: {statusFilter}</span>
              <button
                onClick={() => setStatusFilter('')}
                className="hover:text-purple-900 ml-1 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Reset Button */}
          <button
            onClick={handleResetFilters}
            className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium ml-auto rounded-lg hover:bg-slate-100 transition"
          >
            Reset
          </button>
        </div>

        {/* ADVANCED FILTERS MODAL POPUP (EXACT MATCH SCREENSHOT 1) */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-lg relative">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F5F3FF] text-[#6C2BD9] flex items-center justify-center">
                    <Filter className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Advanced Filters</h3>
                    <p className="text-xs text-slate-500">Refine your user search using one or more filters</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setAdvancedFilters({
                        userType: 'All Users',
                        status: 'All',
                        role: 'All Roles',
                        department: 'All Departments',
                        location: 'All Locations',
                        company: 'All Companies',
                        accountStatus: 'All',
                        searchKeyword: '',
                        permissionType: 'All Permissions',
                        mfaEnabled: 'All',
                        fromLastLogin: '',
                        toLastLogin: '',
                        fromCreatedDate: '',
                        toCreatedDate: ''
                      });
                    }}
                    className="inline-flex items-center gap-1 text-xs text-[#6C2BD9] hover:underline font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowAdvancedFilters(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* User Type */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">User Type</label>
                  <select
                    value={advancedFilters.userType}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, userType: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                  >
                    <option value="All Users">All Users</option>
                    <option value="System User">System User</option>
                    <option value="Portal User">Portal User</option>
                    <option value="Mobile User">Mobile User</option>
                    <option value="Contractor">Contractor</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={advancedFilters.status}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, status: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="All">All</option>
                  </select>
                </div>

                {/* Role */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Role</label>
                  <select
                    value={advancedFilters.role}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, role: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                  >
                    <option value="All Roles">All Roles</option>
                    <option value="System Administrator">System Administrator</option>
                    <option value="Asset Manager">Asset Manager</option>
                    <option value="Maintenance Manager">Maintenance Manager</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Audit Manager">Audit Manager</option>
                    <option value="Standard User">Standard User</option>
                    <option value="Read Only User">Read Only User</option>
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Department</label>
                  <select
                    value={advancedFilters.department}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, department: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                  >
                    <option value="All Departments">All Departments</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Operations">Operations</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Location</label>
                  <select
                    value={advancedFilters.location}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, location: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                  >
                    <option value="All Locations">All Locations</option>
                    <option value="Dubai HQ">Dubai HQ</option>
                    <option value="Jebel Ali Warehouse">Jebel Ali Warehouse</option>
                    <option value="Abu Dhabi Office">Abu Dhabi Office</option>
                    <option value="Sharjah Warehouse">Sharjah Warehouse</option>
                    <option value="Riyadh Office">Riyadh Office</option>
                    <option value="Doha Office">Doha Office</option>
                  </select>
                </div>

                {/* Company */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Company</label>
                  <select
                    value={advancedFilters.company}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, company: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                  >
                    <option value="All Companies">All Companies</option>
                    <option value="Asset360 Holdings">Asset360 Holdings</option>
                    <option value="Wavelogix FZC">Wavelogix FZC</option>
                    <option value="d.code Solutions LLC">d.code Solutions LLC</option>
                    <option value="Digital ID Solutions FZ LLC">Digital ID Solutions FZ LLC</option>
                  </select>
                </div>

                {/* Last Login Range */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Last Login Date Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={advancedFilters.fromLastLogin}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, fromLastLogin: e.target.value })}
                      className="w-1/2 px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                    <span className="text-slate-400">&rarr;</span>
                    <input
                      type="date"
                      value={advancedFilters.toLastLogin}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, toLastLogin: e.target.value })}
                      className="w-1/2 px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Created Date Range */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Created Date Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={advancedFilters.fromCreatedDate}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, fromCreatedDate: e.target.value })}
                      className="w-1/2 px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                    <span className="text-slate-400">&rarr;</span>
                    <input
                      type="date"
                      value={advancedFilters.toCreatedDate}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, toCreatedDate: e.target.value })}
                      className="w-1/2 px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Account Status */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Account Status</label>
                  <select
                    value={advancedFilters.accountStatus}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, accountStatus: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                  >
                    <option value="All">All</option>
                    <option value="Active">Active</option>
                    <option value="Locked">Locked</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                {/* Search Keyword */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Search Keyword</label>
                  <input
                    type="text"
                    value={advancedFilters.searchKeyword}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, searchKeyword: e.target.value })}
                    placeholder="Search by name, email, phone..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                  />
                </div>

                {/* Permission Type */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Permission Type</label>
                  <select
                    value={advancedFilters.permissionType}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, permissionType: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                  >
                    <option value="All Permissions">All Permissions</option>
                    <option value="Full Access">Full Access</option>
                    <option value="Operational">Operational</option>
                    <option value="Read-Only">Read-Only</option>
                  </select>
                </div>

                {/* MFA Enabled */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">MFA Enabled</label>
                  <select
                    value={advancedFilters.mfaEnabled}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, mfaEnabled: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                  >
                    <option value="All">All</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters(false)}
                  className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium"
                >
                  &and; Less Filters
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedFilters(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyAdvancedFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg transition shadow-sm"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Users List Grid (Screenshot 1) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Users List</h2>
          <span className="text-xs text-slate-500 font-normal">
            Total {totalUsers} registered accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold select-none">
                <th className="p-3 pl-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]" />
                </th>
                <th className="p-3 w-12 text-slate-400 font-normal">#</th>
                <th className="p-3 font-semibold text-slate-900 cursor-pointer">Name &uarr;&darr;</th>
                <th className="p-3 font-semibold text-slate-900">Role</th>
                <th className="p-3 font-semibold text-slate-900">Department</th>
                <th className="p-3 font-semibold text-slate-900">Location</th>
                <th className="p-3 font-semibold text-slate-900">Company</th>
                <th className="p-3 font-semibold text-slate-900">Status</th>
                <th className="p-3 font-semibold text-slate-900">Last Login</th>
                <th className="p-3 text-right pr-4 font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-slate-400">
                    Loading users registry...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-slate-500">
                    No users found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => {
                  const initials = user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-[#F5F3FF]/40 transition group"
                    >
                      <td className="p-3 pl-4">
                        <input type="checkbox" className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]" />
                      </td>
                      <td className="p-3 text-slate-400 font-mono">{(page - 1) * limit + idx + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#EDE9FE] text-[#6C2BD9] font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 hover:text-[#6C2BD9] cursor-pointer"
                              onClick={() => { setSelectedUser(user); setShowDetailsDrawer(true); }}
                            >
                              {user.name}
                            </div>
                            <div className="text-[11px] text-slate-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-slate-800">{user.role}</span>
                      </td>
                      <td className="p-3 text-slate-600">{user.department}</td>
                      <td className="p-3 text-slate-600">{user.location}</td>
                      <td className="p-3 text-slate-600 font-medium">{user.company}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            user.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {user.lastLogin}
                      </td>
                      <td className="p-3 text-right pr-4 relative">
                        <button
                          onClick={() =>
                            setActiveDropdownId(activeDropdownId === user.id ? null : user.id)
                          }
                          className="p-1 text-slate-400 hover:text-slate-700 rounded border border-slate-200 hover:bg-slate-50 transition"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* 10-ACTION ROW DROPDOWN (EXACT MATCH SCREENSHOT 1) */}
                        {activeDropdownId === user.id && (
                          <div className="absolute right-4 top-10 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-30 py-1 text-left animate-in fade-in duration-100">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDetailsDrawer(true);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              View Details
                            </button>

                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setUserFormData({ ...user });
                                setShowEditModal(true);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              Edit User
                            </button>

                            <button
                              onClick={() => handleResetPassword(user)}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                            >
                              <Lock className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              Reset Password
                            </button>

                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowAssignRolesModal(true);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                            >
                              <Users className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              Assign Roles
                            </button>

                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                alert(`Opening Granular Permissions Matrix for ${user.name}`);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              Manage Permissions
                            </button>

                            <button
                              onClick={() => {
                                alert(`MFA has been ${user.mfaEnabled ? 'Disabled' : 'Enabled'} for ${user.name}`);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                            >
                              <Smartphone className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              Enable / Disable MFA
                            </button>

                            <button
                              onClick={() => handleToggleStatus(user)}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>

                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowSendEmailModal(true);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                            >
                              <Mail className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              Send Email
                            </button>

                            <button
                              onClick={() => {
                                alert(`Simulating Administrator Impersonation: Logged in as ${user.name} (${user.role})`);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                            >
                              <LogIn className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              Login As User
                            </button>

                            <div className="border-t border-slate-100 my-1"></div>

                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              Delete User
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

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalUsers)} of {totalUsers} records
          </div>

          <div className="flex items-center gap-3">
            {/* Page Buttons */}
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                &laquo;
              </button>
              {[1, 2, 3, 4, 5].slice(0, totalPages).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition ${
                    page === p
                      ? 'bg-[#6C2BD9] text-white'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                &raquo;
              </button>
            </div>

            {/* Page Size Dropdown */}
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:ring-1 focus:ring-[#6C2BD9]"
            >
              <option value="10">10 / page</option>
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW DETAILS DRAWER */}
      {showDetailsDrawer && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">User Profile & Access Scope</h3>
              <button onClick={() => setShowDetailsDrawer(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#EDE9FE] text-[#6C2BD9] text-xl font-bold flex items-center justify-center">
                {selectedUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{selectedUser.name}</h4>
                <p className="text-xs text-slate-500 font-mono">@{selectedUser.username} &bull; {selectedUser.employeeId}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedUser.status}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-2">Security & Identity</span>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-slate-400">Email:</span> <span className="font-medium text-slate-800 block">{selectedUser.email}</span></div>
                  <div><span className="text-slate-400">Phone:</span> <span className="font-medium text-slate-800 block">{selectedUser.phone}</span></div>
                  <div><span className="text-slate-400">User Type:</span> <span className="font-medium text-slate-800 block">{selectedUser.userType}</span></div>
                  <div><span className="text-slate-400">MFA:</span> <span className="font-medium text-slate-800 block">{selectedUser.mfaEnabled ? 'Enabled' : 'Disabled'}</span></div>
                  <div><span className="text-slate-400">Last Login:</span> <span className="font-medium text-slate-800 block">{selectedUser.lastLogin}</span></div>
                  <div><span className="text-slate-400">Created:</span> <span className="font-medium text-slate-800 block">{selectedUser.createdDate}</span></div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-2">Organizational Scope</span>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-slate-400">Company:</span> <span className="font-medium text-slate-800 block">{selectedUser.company}</span></div>
                  <div><span className="text-slate-400">Business Unit:</span> <span className="font-medium text-slate-800 block">{selectedUser.businessUnit}</span></div>
                  <div><span className="text-slate-400">Department:</span> <span className="font-medium text-slate-800 block">{selectedUser.department}</span></div>
                  <div><span className="text-slate-400">Cost Center:</span> <span className="font-medium text-slate-800 block">{selectedUser.costCenter}</span></div>
                  <div className="col-span-2"><span className="text-slate-400">Primary Location:</span> <span className="font-medium text-slate-800 block">{selectedUser.location}</span></div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-2">Assigned Roles & Boundary</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 bg-[#F5F3FF] border border-[#DDD6FE] text-[#6C2BD9] font-medium rounded-md">
                    {selectedUser.role} (Primary)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowDetailsDrawer(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT USER MODAL */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {showEditModal ? `Edit User: ${selectedUser?.name}` : 'Add New System User'}
              </h3>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Role *</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="System Administrator">System Administrator</option>
                    <option value="Asset Manager">Asset Manager</option>
                    <option value="Maintenance Manager">Maintenance Manager</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Audit Manager">Audit Manager</option>
                    <option value="Standard User">Standard User</option>
                    <option value="Read Only User">Read Only User</option>
                    <option value="Contractor">Contractor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">User Type</label>
                  <select
                    value={userFormData.userType}
                    onChange={(e) => setUserFormData({ ...userFormData, userType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="System User">System User</option>
                    <option value="Portal User">Portal User</option>
                    <option value="Mobile User">Mobile User</option>
                    <option value="Contractor">Contractor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Company *</label>
                  <select
                    value={userFormData.company}
                    onChange={(e) => setUserFormData({ ...userFormData, company: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Asset360 Holdings">Asset360 Holdings</option>
                    <option value="Wavelogix FZC">Wavelogix FZC</option>
                    <option value="d.code Solutions LLC">d.code Solutions LLC</option>
                    <option value="Digital ID Solutions FZ LLC">Digital ID Solutions FZ LLC</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Department</label>
                  <select
                    value={userFormData.department}
                    onChange={(e) => setUserFormData({ ...userFormData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Information Technology">Information Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Operations">Operations</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Primary Location *</label>
                  <select
                    value={userFormData.location}
                    onChange={(e) => setUserFormData({ ...userFormData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Dubai HQ">Dubai HQ</option>
                    <option value="Jebel Ali Warehouse">Jebel Ali Warehouse</option>
                    <option value="Abu Dhabi Office">Abu Dhabi Office</option>
                    <option value="Sharjah Warehouse">Sharjah Warehouse</option>
                    <option value="Riyadh Office">Riyadh Office</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={userFormData.status}
                    onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="mfaCheck"
                  checked={userFormData.mfaEnabled}
                  onChange={(e) => setUserFormData({ ...userFormData, mfaEnabled: e.target.checked })}
                  className="rounded border-slate-300 text-[#6C2BD9]"
                />
                <label htmlFor="mfaCheck" className="text-slate-700">Enforce Multi-Factor Authentication (MFA)</label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-semibold rounded-lg shadow-sm"
                >
                  {showEditModal ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
