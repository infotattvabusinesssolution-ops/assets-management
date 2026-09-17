import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Lock,
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Filter,
  UserCheck,
  UserX,
  Sliders,
  Check,
  X,
  Copy,
  BadgeCheck,
  Download,
  FileSpreadsheet,
  Layers,
  Info,
  Briefcase,
  HelpCircle,
  MapPin
} from 'lucide-react';

export function UserManagementWorkbench() {
  const { user: currentUser } = useAuth();

  // Data States
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [costCenters, setCostCenters] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Multi-select Checkboxes for Bulk Actions
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Modals & Panels
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRoleMatrixModal, setShowRoleMatrixModal] = useState(false);
  const [showCredentialsCardModal, setShowCredentialsCardModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [registeredAccountInfo, setRegisteredAccountInfo] = useState(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Form State for Registration / Editing
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    roleId: '',
    companyId: '',
    siteId: '',
    departmentId: '',
    costCenterId: '',
    active: true
  });
  const [showPassword, setShowPassword] = useState(false);

  // Password Reset Form State
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

const FALLBACK_USERS = [
  {
    _id: 'usr-1',
    fullName: 'John Doe',
    username: 'jdoe',
    email: 'john.doe@asset360.com',
    phone: '+971 50 111 2233',
    roleId: { _id: 'r-1', name: 'System Administrator', code: 'SYS_ADMIN' },
    companyId: { _id: 'c-1', name: 'Asset360 Holdings' },
    siteId: { _id: 's-1', name: 'Dubai HQ Campus' },
    departmentId: { _id: 'd-1', name: 'Information Technology' },
    active: true,
    lastLogin: '2026-09-17T14:32:10Z'
  },
  {
    _id: 'usr-2',
    fullName: 'Sarah Ahmed',
    username: 'sahmed',
    email: 'sarah.ahmed@asset360.com',
    phone: '+971 52 444 5566',
    roleId: { _id: 'r-2', name: 'Finance Controller', code: 'FINANCE' },
    companyId: { _id: 'c-1', name: 'Asset360 Holdings' },
    siteId: { _id: 's-1', name: 'Dubai HQ Campus' },
    departmentId: { _id: 'd-2', name: 'Finance & Accounts' },
    active: true,
    lastLogin: '2026-09-17T11:15:00Z'
  },
  {
    _id: 'usr-3',
    fullName: 'Ramesh Kumar',
    username: 'rkumar',
    email: 'ramesh.kumar@wavelogix.com',
    phone: '+971 55 777 8899',
    roleId: { _id: 'r-3', name: 'Asset Administrator', code: 'ASSET_ADMIN' },
    companyId: { _id: 'c-2', name: 'Wavelogix FZC' },
    siteId: { _id: 's-2', name: 'Jebel Ali Central Logistics Depot' },
    departmentId: { _id: 'd-3', name: 'Operations' },
    active: true,
    lastLogin: '2026-09-16T16:45:22Z'
  },
  {
    _id: 'usr-4',
    fullName: 'Michael Chang',
    username: 'mchang',
    email: 'michael.chang@dcode.ae',
    phone: '+971 54 333 2211',
    roleId: { _id: 'r-4', name: 'Maintenance Technician', code: 'TECHNICIAN' },
    companyId: { _id: 'c-3', name: 'd.code Solutions LLC' },
    siteId: { _id: 's-3', name: 'Abu Dhabi Regional Office' },
    departmentId: { _id: 'd-4', name: 'Maintenance Engineering' },
    active: true,
    lastLogin: '2026-09-15T18:20:00Z'
  },
  {
    _id: 'usr-5',
    fullName: 'Fatima Al-Mansoori',
    username: 'falmansoori',
    email: 'fatima.m@digitalid.ae',
    phone: '+971 56 888 9900',
    roleId: { _id: 'r-5', name: 'Audit Compliance Officer', code: 'AUDITOR' },
    companyId: { _id: 'c-4', name: 'Digital ID Solutions FZ LLC' },
    siteId: { _id: 's-3', name: 'Abu Dhabi Regional Office' },
    departmentId: { _id: 'd-2', name: 'Finance & Audit' },
    active: true,
    lastLogin: '2026-09-16T10:30:55Z'
  }
];

const FALLBACK_ROLES = [
  { _id: 'r-1', name: 'System Administrator', code: 'SYS_ADMIN' },
  { _id: 'r-3', name: 'Asset Administrator', code: 'ASSET_ADMIN' },
  { _id: 'r-2', name: 'Finance Controller', code: 'FINANCE' },
  { _id: 'r-6', name: 'IT Systems Manager', code: 'IT_MANAGER' },
  { _id: 'r-7', name: 'Facilities Manager', code: 'FACILITIES' },
  { _id: 'r-8', name: 'Receiving Storekeeper', code: 'RECEIVING' },
  { _id: 'r-4', name: 'Maintenance Technician', code: 'TECHNICIAN' },
  { _id: 'r-5', name: 'Audit Compliance Officer', code: 'AUDITOR' },
  { _id: 'r-9', name: 'Asset Custodian', code: 'CUSTODIAN' }
];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, rolesRes, companiesRes, sitesRes, deptsRes, ccRes] = await Promise.all([
        api.get('/auth/users').catch(() => ({ users: [] })),
        api.get('/auth/roles').catch(() => ({ roles: [] })),
        api.get('/master-data/companies').catch(() => ({ companies: [] })),
        api.get('/master-data/sites').catch(() => ({ sites: [] })),
        api.get('/master-data/departments').catch(() => ({ departments: [] })),
        api.get('/master-data/cost-centers').catch(() => ({ costCenters: [] }))
      ]);

      const usersList = (usersRes.users || usersRes.data || []);
      const rolesList = (rolesRes.roles || rolesRes.data || []);
      const compList = companiesRes.companies || companiesRes.data || [];
      const siteList = sitesRes.sites || sitesRes.data || [];
      const deptList = deptsRes.departments || deptsRes.data || [];
      const ccList = ccRes.costCenters || ccRes.data || [];

      setUsers(usersList.length > 0 ? usersList : FALLBACK_USERS);
      setRoles(rolesList.length > 0 ? rolesList : FALLBACK_ROLES);
      setCompanies(compList);
      setSites(siteList);
      setDepartments(deptList);
      setCostCenters(ccList);

      const finalRoles = rolesList.length > 0 ? rolesList : FALLBACK_ROLES;
      if (finalRoles.length > 0 && !formData.roleId) {
        setFormData(prev => ({ ...prev, roleId: finalRoles[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load system accounts data:', err);
      setUsers(FALLBACK_USERS);
      setRoles(FALLBACK_ROLES);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Generate Random Password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let randPass = '';
    for (let i = 0; i < 12; i++) {
      randPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: randPass }));
    setShowPassword(true);
  };

  const handleGenerateResetPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let randPass = '';
    for (let i = 0; i < 12; i++) {
      randPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setResetPasswordVal(randPass);
    setShowResetPassword(true);
  };

  // Smart Role Recommendation Helper
  const handleAIRoleRecommend = (jobTitle) => {
    const titleLower = jobTitle.toLowerCase();
    let matchedCode = 'CUSTODIAN';

    if (titleLower.includes('admin') || titleLower.includes('system') || titleLower.includes('superuser')) {
      matchedCode = 'SYS_ADMIN';
    } else if (titleLower.includes('asset') || titleLower.includes('register') || titleLower.includes('inventory manager')) {
      matchedCode = 'ASSET_ADMIN';
    } else if (titleLower.includes('finance') || titleLower.includes('accountant') || titleLower.includes('depreciation') || titleLower.includes('controller')) {
      matchedCode = 'FINANCE';
    } else if (titleLower.includes('it') || titleLower.includes('network') || titleLower.includes('compute') || titleLower.includes('discovery')) {
      matchedCode = 'IT_MANAGER';
    } else if (titleLower.includes('facility') || titleLower.includes('building') || titleLower.includes('map')) {
      matchedCode = 'FACILITIES';
    } else if (titleLower.includes('store') || titleLower.includes('receiving') || titleLower.includes('warehouse') || titleLower.includes('procurement')) {
      matchedCode = 'RECEIVING';
    } else if (titleLower.includes('tech') || titleLower.includes('maintenance') || titleLower.includes('repair') || titleLower.includes('engineer')) {
      matchedCode = 'TECHNICIAN';
    } else if (titleLower.includes('audit') || titleLower.includes('compliance') || titleLower.includes('inspector')) {
      matchedCode = 'AUDITOR';
    } else if (titleLower.includes('executive') || titleLower.includes('director') || titleLower.includes('vp') || titleLower.includes('management')) {
      matchedCode = 'MANAGEMENT';
    }

    const matchedRole = roles.find(r => r.code === matchedCode);
    if (matchedRole) {
      setFormData(prev => ({ ...prev, roleId: matchedRole._id }));
    }
  };

  // Handle Account Registration Submission
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.post('/auth/users', formData);
      if (res.success || res.user) {
        const createdObj = res.user || {};
        const assignedRoleObj = roles.find(r => r._id === formData.roleId) || {};

        setRegisteredAccountInfo({
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          roleName: assignedRoleObj.name || 'System User',
          roleCode: assignedRoleObj.code || 'USER'
        });

        setSuccessMsg(`System account for "${formData.fullName}" registered successfully!`);
        setShowCreateModal(false);
        setShowCredentialsCardModal(true);
        resetForm();
        fetchInitialData();
      } else {
        setError(res.message || 'Failed to register account');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error registering account');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Account Submission
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.put(`/auth/users/${selectedUser._id}`, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        roleId: formData.roleId,
        companyId: formData.companyId,
        siteId: formData.siteId,
        departmentId: formData.departmentId,
        costCenterId: formData.costCenterId,
        active: formData.active
      });

      if (res.success || res.user) {
        setSuccessMsg(`Account profile updated for "${formData.fullName}"`);
        setShowEditModal(false);
        setSelectedUser(null);
        resetForm();
        fetchInitialData();
      } else {
        setError(res.message || 'Failed to update account');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error updating account');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !resetPasswordVal) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post(`/auth/users/${selectedUser._id}/reset-password`, {
        newPassword: resetPasswordVal
      });

      if (res.success) {
        setRegisteredAccountInfo({
          fullName: selectedUser.fullName,
          username: selectedUser.username,
          email: selectedUser.email,
          phone: selectedUser.phone,
          password: resetPasswordVal,
          roleName: selectedUser.roleId?.name || 'System Role',
          roleCode: selectedUser.roleId?.code || 'USER'
        });

        setSuccessMsg(`Password reset successfully for @${selectedUser.username}`);
        setShowPasswordModal(false);
        setShowCredentialsCardModal(true);
        setSelectedUser(null);
        setResetPasswordVal('');
      } else {
        setError(res.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error resetting password');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Toggle Account Status (Activate / Suspend)
  const handleToggleUserStatus = async (targetUser) => {
    try {
      const updatedStatus = !targetUser.active;
      const res = await api.put(`/auth/users/${targetUser._id}`, { active: updatedStatus });
      if (res.success || res.user) {
        setSuccessMsg(`Account @${targetUser.username} ${updatedStatus ? 'Activated' : 'Suspended'}`);
        fetchInitialData();
      }
    } catch (err) {
      setError('Failed to update account status');
    }
  };

  // Copy Credentials to Clipboard
  const handleCopyCredentials = () => {
    if (!registeredAccountInfo) return;
    const textToCopy = `Asset 360° System Account Credentials:
Full Name: ${registeredAccountInfo.fullName}
Username: ${registeredAccountInfo.username}
Email: ${registeredAccountInfo.email}
Phone: ${registeredAccountInfo.phone || 'N/A'}
Assigned Role: ${registeredAccountInfo.roleName}
Temporary Password: ${registeredAccountInfo.password}

Login Portal: ${window.location.origin}/login`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  // Export Account Directory to CSV
  const handleExportDirectoryCSV = () => {
    const headers = ['Full Name', 'Username', 'Email', 'Contact Phone', 'Assigned Role', 'Company', 'Site', 'Account Status', 'Last Login'];
    const rows = filteredUsers.map(u => [
      `"${u.fullName || ''}"`,
      `"${u.username || ''}"`,
      `"${u.email || ''}"`,
      `"${u.phone || ''}"`,
      `"${u.roleId?.name || ''}"`,
      `"${u.companyId?.name || 'Infotatwaa Corp'}"`,
      `"${u.siteId?.name || 'Global HQ Campus'}"`,
      `"${u.active ? 'Active' : 'Suspended'}"`,
      `"${u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Asset360_System_Accounts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Checkbox Selection Helpers
  const handleSelectAllUsers = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(filteredUsers.map(u => u._id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (id) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter(i => i !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  // Bulk Activation / Suspension
  const handleBulkStatusChange = async (newStatus) => {
    if (selectedUserIds.length === 0) return;
    setLoading(true);
    try {
      await Promise.all(selectedUserIds.map(id => api.put(`/auth/users/${id}`, { active: newStatus })));
      setSuccessMsg(`Updated status for ${selectedUserIds.length} system accounts to ${newStatus ? 'Active' : 'Suspended'}`);
      setSelectedUserIds([]);
      fetchInitialData();
    } catch (err) {
      setError('Bulk update failed');
      setLoading(false);
    }
  };

  const openEditModal = (targetUser) => {
    setSelectedUser(targetUser);
    setFormData({
      fullName: targetUser.fullName || '',
      username: targetUser.username || '',
      email: targetUser.email || '',
      phone: targetUser.phone || '',
      password: '',
      roleId: targetUser.roleId?._id || targetUser.roleId || '',
      companyId: targetUser.companyId?._id || targetUser.companyId || '',
      siteId: targetUser.siteId?._id || targetUser.siteId || '',
      departmentId: targetUser.departmentId?._id || targetUser.departmentId || '',
      costCenterId: targetUser.costCenterId?._id || targetUser.costCenterId || '',
      active: targetUser.active !== undefined ? targetUser.active : true
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (targetUser) => {
    setSelectedUser(targetUser);
    setResetPasswordVal('');
    setShowPasswordModal(true);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      roleId: roles[0]?._id || '',
      companyId: companies[0]?._id || '',
      siteId: sites[0]?._id || '',
      departmentId: departments[0]?._id || '',
      costCenterId: costCenters[0]?._id || '',
      active: true
    });
    setShowPassword(false);
  };

  // Filtered System Accounts List
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.roleId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.roleId?.code || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      selectedRoleFilter === 'ALL' || (u.roleId?.code || '') === selectedRoleFilter;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.active) ||
      (statusFilter === 'INACTIVE' && !u.active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Role Statistics Calculation
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => u.active).length;
  const sysAdminCount = users.filter((u) => u.roleId?.code === 'SYS_ADMIN').length;

  // Role Badge Styling Helper
  const getRoleBadgeStyle = (code) => {
    switch (code) {
      case 'SYS_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-300 font-extrabold';
      case 'ASSET_ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-extrabold';
      case 'FINANCE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold';
      case 'IT_MANAGER':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300 font-extrabold';
      case 'FACILITIES':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-extrabold';
      case 'RECEIVING':
        return 'bg-teal-100 text-teal-800 border-teal-300 font-extrabold';
      case 'CUSTODIAN':
        return 'bg-slate-100 text-slate-800 border-slate-300 font-extrabold';
      case 'TECHNICIAN':
        return 'bg-orange-100 text-orange-800 border-orange-300 font-extrabold';
      case 'AUDITOR':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 font-semibold';
    }
  };

  return (
    <div className="space-y-6 pb-12 w-full select-none">
      {/* 1. HERO HEADER BANNER */}
      <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-purple-500/25">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-lg tracking-tight block leading-tight">System Administration</span>
                <span className="text-[10px] uppercase tracking-widest text-purple-600 font-bold">SECURITY & ROLE ACCESS CONTROL</span>
              </div>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                System Account & <span className="text-purple-600">Role Administration</span>
              </h1>
              <p className="text-sm font-bold text-slate-600 mt-1">
                Register authorized system accounts, configure role permissions, assign contact details, and enforce least-privilege security.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowRoleMatrixModal(true)}
              className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer"
              title="Inspect System Role Permissions Matrix"
            >
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Role Permissions Matrix</span>
            </button>

            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-sm flex items-center gap-2.5 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <UserPlus className="w-5 h-5 text-white" />
              <span>+ Register System Account</span>
            </button>
          </div>
        </div>

        {/* 4 KPI SUMMARY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 relative z-10">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 text-purple-600 flex items-center justify-center font-bold shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Accounts</p>
              <h3 className="text-xl font-black text-slate-900">{totalUsersCount}</h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Accounts</p>
              <h3 className="text-xl font-black text-slate-900">{activeUsersCount}</h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">System Admins</p>
              <h3 className="text-xl font-black text-slate-900">{sysAdminCount}</h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Configured Roles</p>
              <h3 className="text-xl font-black text-slate-900">{roles.length || 10}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* NOTIFICATION MESSAGES */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 font-black cursor-pointer">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 font-black cursor-pointer">✕</button>
        </div>
      )}

      {/* 2. SEARCH, FILTER & EXPORT BAR */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, username, phone or role..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Suspended Only</option>
              </select>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportDirectoryCSV}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="Export Account Directory to CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Directory</span>
            </button>
          </div>
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-3">
          <button
            onClick={() => setSelectedRoleFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${selectedRoleFilter === 'ALL'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            All Roles ({users.length})
          </button>
          {roles.map((r) => {
            const count = users.filter((u) => u.roleId?.code === r.code).length;
            const isSelected = selectedRoleFilter === r.code;
            return (
              <button
                key={r._id || r.code}
                onClick={() => setSelectedRoleFilter(r.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${isSelected
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
              >
                <span>{r.name}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BULK SELECTION ACTION BAR */}
      {selectedUserIds.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-purple-600 text-white flex items-center justify-between shadow-md animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-lg bg-white/20 font-black text-xs flex items-center justify-center">
              {selectedUserIds.length}
            </span>
            <span className="text-xs font-bold">System accounts selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusChange(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" /> Bulk Activate
            </button>
            <button
              onClick={() => handleBulkStatusChange(false)}
              className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1"
            >
              <UserX className="w-3.5 h-3.5" /> Bulk Suspend
            </button>
            <button
              onClick={() => setSelectedUserIds([])}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* 3. SYSTEM ACCOUNTS DIRECTORY DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-purple-600" />
            <span>Registered System Accounts ({filteredUsers.length})</span>
          </h3>
          <button
            onClick={fetchInitialData}
            className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
            title="Refresh Accounts"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-slate-500 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
            <p>Loading system accounts directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-500 space-y-2">
            <UserX className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-800 text-sm">No System Accounts Found</p>
            <p className="text-slate-400">No account records match the current filter or search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAllUsers}
                      className="w-4 h-4 text-purple-600 rounded-md border-slate-300 focus:ring-purple-500"
                    />
                  </th>
                  <th className="px-6 py-3.5">Account Profile</th>
                  <th className="px-6 py-3.5">Username & Contact</th>
                  <th className="px-6 py-3.5">Assigned Role</th>
                  <th className="px-6 py-3.5">Company / Site</th>
                  <th className="px-6 py-3.5">Access Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                {filteredUsers.map((u) => {
                  const roleCode = u.roleId?.code || 'USER';
                  const roleName = u.roleId?.name || 'Standard User';
                  const isSelf = currentUser?.username === u.username;
                  const isChecked = selectedUserIds.includes(u._id);

                  return (
                    <tr key={u._id} className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-purple-50/40' : ''}`}>
                      {/* Checkbox */}
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectUser(u._id)}
                          className="w-4 h-4 text-purple-600 rounded-md border-slate-300 focus:ring-purple-500"
                        />
                      </td>

                      {/* Account Profile */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                            {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {isSelf && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[9px] font-extrabold">You</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Username & Contact */}
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-slate-900">@{u.username}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{u.phone || 'No contact specified'}</span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[11px] border ${getRoleBadgeStyle(roleCode)}`}>
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>{roleName}</span>
                        </span>
                      </td>

                      {/* Company & Site */}
                      <td className="px-6 py-4">
                        <div className="text-slate-800 font-bold flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{u.companyId?.name || u.companyId?.code || 'Infotatwaa Corp'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {u.siteId?.name || 'Global HQ Campus'}
                        </div>
                      </td>

                      {/* Access Status */}
                      <td className="px-6 py-4">
                        {u.active ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-extrabold">
                            <XCircle className="w-3 h-3 text-rose-600" /> Suspended
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 transition-colors cursor-pointer"
                            title="Edit Account Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openPasswordModal(u)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 transition-colors cursor-pointer"
                            title="Reset Credentials"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${u.active
                                ? 'bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700'
                                : 'bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700'
                              }`}
                            title={u.active ? 'Suspend Account' : 'Activate Account'}
                          >
                            {u.active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTER NEW SYSTEM ACCOUNT MODAL */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative animate-in fade-in zoom-in duration-150 my-8">

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black flex items-center justify-center shadow-xs">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight">Register New System Account</h3>
                  <p className="text-xs text-slate-500">Create system account, select security role, and set credentials.</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, fullName: val });
                      if (val.length > 3) handleAIRoleRecommend(val);
                    }}
                    placeholder="e.g. Bader Al Kaabi"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">Username / Account ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. bader.kaabi"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. bader@infotatwaa.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                {/* Contact Phone */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">Contact Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +971 50 123 4567"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                {/* Password Input & Generator */}
                <div className="space-y-1 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">Access Password *</label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[11px] font-extrabold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-Generate Password
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password or click auto-generate"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Role Selection Dropdown */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">Select Security Role *</label>
                  <select
                    required
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                  >
                    <option value="">-- Choose System Security Role --</option>
                    {roles.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name} ({r.code}) {r.description ? `— ${r.description}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Company Scope */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">Assigned Company Entity</label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Infotatwaa Enterprise Corp (Default)</option>
                    {companies.map(c => (
                      <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>

                {/* Site Scope */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">Assigned Location Site</label>
                  <select
                    value={formData.siteId}
                    onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Global HQ Campus (Default)</option>
                    {sites.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin text-white" />}
                  <span>Register System Account</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT ACCOUNT MODAL */}
      {/* ========================================================================= */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 relative animate-in fade-in zoom-in duration-150 my-8">

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black flex items-center justify-center shadow-xs">
                  <Edit2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight">Edit Account Profile</h3>
                  <p className="text-xs text-slate-500">Update details for @{selectedUser.username}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                {/* Contact Phone */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">Contact Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                {/* Role Selection */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">Assigned Security Role</label>
                  <select
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                  >
                    {roles.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name} ({r.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Toggle */}
                <div className="space-y-1 sm:col-span-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded-md border-slate-300 focus:ring-purple-500"
                    />
                    <span className="text-xs font-extrabold text-slate-800">Account Active (Grant Login Access)</span>
                  </label>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin text-white" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RESET PASSWORD MODAL */}
      {/* ========================================================================= */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 relative animate-in fade-in zoom-in duration-150">

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white font-black flex items-center justify-center shadow-xs">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight">Reset Access Credentials</h3>
                  <p className="text-xs text-slate-500">Assign a new password for @{selectedUser.username}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">New Password *</label>
                  <button
                    type="button"
                    onClick={handleGenerateResetPassword}
                    className="text-[11px] font-extrabold text-amber-600 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={resetPasswordVal}
                    onChange={(e) => setResetPasswordVal(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !resetPasswordVal}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin text-white" />}
                  <span>Reset Password</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CREDENTIALS SUMMARY CARD MODAL (1-CLICK COPY) */}
      {/* ========================================================================= */}
      {showCredentialsCardModal && registeredAccountInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative animate-in fade-in zoom-in duration-150">

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white font-black flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight">Account Access Created</h3>
                  <p className="text-xs text-slate-500">Copy credentials summary to send to personnel.</p>
                </div>
              </div>
              <button
                onClick={() => setShowCredentialsCardModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 font-mono text-xs text-slate-800 relative">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-500">ACCOUNT CREDENTIALS CARD</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getRoleBadgeStyle(registeredAccountInfo.roleCode)}`}>
                  {registeredAccountInfo.roleName}
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div><span className="text-slate-400 font-sans font-bold">Full Name:</span> {registeredAccountInfo.fullName}</div>
                <div><span className="text-slate-400 font-sans font-bold">Username:</span> {registeredAccountInfo.username}</div>
                <div><span className="text-slate-400 font-sans font-bold">Email:</span> {registeredAccountInfo.email}</div>
                <div><span className="text-slate-400 font-sans font-bold">Phone:</span> {registeredAccountInfo.phone || 'N/A'}</div>
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-bold flex items-center justify-between mt-2">
                  <span>Password: <span className="font-mono text-sm tracking-wider">{registeredAccountInfo.password}</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handleCopyCredentials}
                className={`flex-1 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${copiedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
              >
                {copiedSuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSuccess ? 'Credentials Copied!' : 'Copy Credentials Summary'}</span>
              </button>

              <button
                onClick={() => setShowCredentialsCardModal(false)}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ROLE PERMISSIONS MATRIX MODAL */}
      {/* ========================================================================= */}
      {showRoleMatrixModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 relative animate-in fade-in zoom-in duration-150 my-8">

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black flex items-center justify-center shadow-xs">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight">System Security Role Matrix</h3>
                  <p className="text-xs text-slate-500">Overview of configured enterprise security roles & access privileges.</p>
                </div>
              </div>
              <button
                onClick={() => setShowRoleMatrixModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {roles.map((r) => (
                <div key={r._id || r.code} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs border ${getRoleBadgeStyle(r.code)}`}>
                        {r.name}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">({r.code})</span>
                    </div>
                    {r.isSystem && (
                      <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        System Built-in
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{r.description || 'Enterprise system role'}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {r.permissions && r.permissions.map((perm, pIdx) => (
                      <span key={pIdx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-700 font-bold">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowRoleMatrixModal(false)}
                className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-black cursor-pointer shadow-md"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default UserManagementWorkbench;
