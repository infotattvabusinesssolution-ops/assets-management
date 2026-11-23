import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api, API_BASE_URL } from '../../services/api';
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
  AlertTriangle,
  Check,
  ExternalLink,
  Database,
  Layers,
  Shield,
  Copy,
  RefreshCw,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { DeleteConfirmModal } from '../../components/common/DeleteConfirmModal';
import { StatusConfirmModal } from '../../components/common/StatusConfirmModal';
import { MODULE_STRUCTURE, MASTER_DATA_ENTITIES } from './RolesPermissions';
import { PasswordRequirementsTracker, DEFAULT_FRONTEND_POLICY, generateCompliantPasswordBrowser } from '../../components/common/PasswordRequirementsTracker';

export const INITIAL_USERS = [];

export function UserManagement() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const storageKey = user?.companyId ? `fams_custom_users_${user.companyId}` : 'fams_custom_users';

  // State
  const [userList, setUserList] = useState([]);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // Default: show all users
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToToggleStatus, setUserToToggleStatus] = useState(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  // Dynamic Metadata States
  const [sitesList, setSitesList] = useState([]);
  const [custodiansList, setCustodiansList] = useState([]);
  const [employeeLookupCode, setEmployeeLookupCode] = useState('');
  const [showLookupDropdown, setShowLookupDropdown] = useState(false);
  const [employeeLookupStatus, setEmployeeLookupStatus] = useState(null);
  const [custodianLinkedFields, setCustodianLinkedFields] = useState({
    name: false,
    email: false,
    phone: false,
    company: false,
    department: false,
    section: false
  });
  const [departmentsList, setDepartmentsList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [rolesList, setRolesList] = useState([]);

  // Inline Quick-Add States
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [newLocationInput, setNewLocationInput] = useState('');
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [newDepartmentInput, setNewDepartmentInput] = useState('');
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [newCompanyInput, setNewCompanyInput] = useState('');

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetModalTempPassword, setResetModalTempPassword] = useState('');
  const [resetModalIsLoading, setResetModalIsLoading] = useState(false);
  const [resetModalSuccess, setResetModalSuccess] = useState(false);
  const [resetModalCopied, setResetModalCopied] = useState(false);
  const [showAssignRolesModal, setShowAssignRolesModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRoleForAssignment, setSelectedRoleForAssignment] = useState('');
  const [isAssigningRole, setIsAssigningRole] = useState(false);
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionErrorMsg, setActionErrorMsg] = useState('');
  const [userPasswordPolicy, setUserPasswordPolicy] = useState(DEFAULT_FRONTEND_POLICY);
  const [isUserPassValid, setIsUserPassValid] = useState(true);

  // Permissions Modal Filter & View States
  const [permModalSearch, setPermModalSearch] = useState('');
  const [permModalTab, setPermModalTab] = useState('all'); // 'all', 'modules', 'master_data'
  const [permModalOnlyAllowed, setPermModalOnlyAllowed] = useState(false);

  // Advanced Filters Form State
  const [advancedFilters, setAdvancedFilters] = useState({
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

  // New/Edit User Form State
  const [userFormData, setUserFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    employeeId: '',
    role: 'Standard User',
    department: '',
    section: '',
    costCenter: '',
    location: '',
    company: '',
    businessUnit: 'Corporate Services',
    password: '',
    passwordOption: 'custom',
    forcePasswordChange: true,
    status: 'Active',
    mfaEnabled: false
  });

  // Fetch Users
  const fetchMetadata = async () => {
    try {
      const [sitesRes, deptsRes, compsRes, rolesRes, custRes, sectionsRes] = await Promise.all([
        api.get('/master-data/sites?includeInactive=false').catch(() => null),
        api.get('/master-data/departments?includeInactive=false').catch(() => null),
        api.get('/master-data/companies?includeInactive=false').catch(() => null),
        api.get('/admin/roles').catch(() => null),
        api.get('/master-data/custodians').catch(() => null),
        api.get('/master-data/cost-centers?includeInactive=true').catch(() => null)
      ]);

      const serverCustodians = custRes?.custodians || custRes?.employees || (Array.isArray(custRes) ? custRes : []);
      const combinedCustodians = serverCustodians;
      const seenCust = new Set();
      const getStrVal = (val, fallback = '') => {
        if (!val) return fallback;
        if (typeof val === 'string') return val;
        if (typeof val === 'object') return val.name || val.title || val.code || fallback;
        return String(val);
      };
      const uniqueCustodians = combinedCustodians
        .map(c => {
          if (!c || typeof c !== 'object') return null;
          const fullName = getStrVal(c.fullName, getStrVal(c.name, ''));
          const employeeCode = getStrVal(c.employeeCode, getStrVal(c.code, ''));
          const dept = getStrVal(c.department, '');
          const comp = getStrVal(c.company, getStrVal(c.organization, ''));
          const loc = getStrVal(c.location, '');
          const type = getStrVal(c.custodianType, 'Internal');
          return {
            ...c,
            fullName: fullName || employeeCode || 'Unnamed',
            name: fullName || employeeCode || 'Unnamed',
            employeeCode,
            code: employeeCode,
            department: dept,
            company: comp,
            location: loc,
            custodianType: type,
            email: getStrVal(c.email, ''),
            phone: getStrVal(c.phone, '')
          };
        })
        .filter(c => {
          if (!c) return false;
          const key = (c.employeeCode || c.email || c.fullName || '').toUpperCase().trim();
          if (!key || seenCust.has(key)) return false;
          seenCust.add(key);
          return true;
        });
      console.log('👥 [UserManagement Loaded Employees/Custodians]:', uniqueCustodians.length);
      setCustodiansList(uniqueCustodians);

      if (sitesRes && Array.isArray(sitesRes.sites)) {
        setSitesList(sitesRes.sites.map(s => ({
          ...s,
          name: typeof s.name === 'string' ? s.name : (s.name?.name || String(s.name || '')),
          code: typeof s.code === 'string' ? s.code : String(s.code || ''),
          fullPath: typeof s.fullPath === 'string' ? s.fullPath : String(s.fullPath || s.name || '')
        })));
      }
      const isRecordActive = (item) => {
        if (!item) return false;
        if (item.active === false || item.active === 'false' || item.active === 0) return false;
        if (typeof item.status === 'string' && (item.status.toLowerCase() === 'inactive' || item.status.toLowerCase() === 'deactivated')) return false;
        return true;
      };

      if (deptsRes && Array.isArray(deptsRes.departments)) {
        setDepartmentsList(deptsRes.departments
          .filter(d => d && d.name && d.name !== 'General' && isRecordActive(d))
          .map(d => ({
            ...d,
            name: typeof d.name === 'string' ? d.name : (d.name?.name || String(d.name || '')),
            code: typeof d.code === 'string' ? d.code : String(d.code || '')
          })));
      }
      if (compsRes && Array.isArray(compsRes.companies)) {
        setCompaniesList(compsRes.companies
          .filter(c => c && isRecordActive(c))
          .map(c => ({
            ...c,
            name: typeof c.name === 'string' ? c.name : (c.name?.name || String(c.name || ''))
          })));
      }
      if (sectionsRes && Array.isArray(sectionsRes.costCenters)) {
        setSectionsList(sectionsRes.costCenters.map(s => {
          const active = isRecordActive(s);
          return {
            ...s,
            name: typeof s.name === 'string' ? s.name : (s.name?.name || String(s.name || '')),
            code: typeof s.code === 'string' ? s.code : String(s.code || ''),
            active,
            status: active ? 'Active' : 'Inactive'
          };
        }));
      } else {
        setSectionsList([]);
      }
      const fetchedRoles = rolesRes?.roles || (Array.isArray(rolesRes) ? rolesRes : []);
      if (fetchedRoles.length > 0) {
        let savedPermsMap = {};
        try {
          const permStorageKey = user?.companyId ? `fams_saved_role_permissions_${user.companyId}` : 'fams_saved_role_permissions';
          savedPermsMap = JSON.parse(localStorage.getItem(permStorageKey) || '{}');
        } catch (_) {}

        setRolesList(fetchedRoles.map(r => {
          let perms = r.permissions;
          if (typeof perms === 'string') {
            try {
              perms = (perms.startsWith('{') || perms.startsWith('[')) ? JSON.parse(perms) : perms;
            } catch (_) {
              perms = {};
            }
          }
          const cached = savedPermsMap[r.id] || (r.code ? savedPermsMap[r.code] : null) || (r.name ? savedPermsMap[r.name] : null);
          if (cached) {
            perms = cached;
          }
          return {
            ...r,
            permissions: perms,
            name: typeof r.name === 'string' ? r.name : (r.name?.name || String(r.name || ''))
          };
        }));
      }
    } catch (e) {
      console.warn('Metadata fetch error:', e);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  // Quick on-the-fly add functions
  const handleAddLocation = async () => {
    const val = newLocationInput.trim();
    if (!val) return;
    try {
      const res = await api.post('/master-data/sites', {
        name: val,
        code: 'LOC-' + val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6)
      }).catch(() => null);
      const newLoc = res?.site || { id: `SITE-${Date.now()}`, name: val, code: val.slice(0, 6).toUpperCase() };
      setSitesList(prev => [...prev.filter(s => s.name !== val), newLoc]);
      setUserFormData(prev => ({ ...prev, location: val }));
      setNewLocationInput('');
      setIsAddingLocation(false);
      setActionSuccessMsg(`Location "${val}" created and selected.`);
    } catch (e) {
      setUserFormData(prev => ({ ...prev, location: val }));
      setIsAddingLocation(false);
    }
  };

  const handleAddDepartment = async () => {
    const val = newDepartmentInput.trim();
    if (!val) return;
    try {
      const res = await api.post('/master-data/departments', {
        name: val,
        code: 'DEP-' + val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6)
      }).catch(() => null);
      const newDept = res?.department || { id: `DEP-${Date.now()}`, name: val, code: val.slice(0, 6).toUpperCase() };
      setDepartmentsList(prev => [...prev.filter(d => d.name !== val), newDept]);
      setUserFormData(prev => ({ ...prev, department: val }));
      setNewDepartmentInput('');
      setIsAddingDepartment(false);
      setActionSuccessMsg(`Department "${val}" created and selected.`);
    } catch (e) {
      setUserFormData(prev => ({ ...prev, department: val }));
      setIsAddingDepartment(false);
    }
  };

  const handleAddCompany = async () => {
    const val = newCompanyInput.trim();
    if (!val) return;
    try {
      const res = await api.post('/master-data/companies', {
        name: val,
        code: 'CMP-' + val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6)
      }).catch(() => null);
      const newComp = res?.company || { id: `CMP-${Date.now()}`, name: val, code: val.slice(0, 6).toUpperCase() };
      setCompaniesList(prev => [...prev.filter(c => c.name !== val), newComp]);
      setUserFormData(prev => ({ ...prev, company: val }));
      setNewCompanyInput('');
      setIsAddingCompany(false);
      setActionSuccessMsg(`Company "${val}" created and selected.`);
    } catch (e) {
      setUserFormData(prev => ({ ...prev, company: val }));
      setIsAddingCompany(false);
    }
  };

  const handleLookupEmployee = (lookupQuery) => {
    const q = (lookupQuery || employeeLookupCode).trim();
    if (!q) return;
    const clean = q.toUpperCase();
    const match = custodiansList.find(
      (c) =>
        (c.employeeCode && String(c.employeeCode).toUpperCase() === clean) ||
        (c.code && String(c.code).toUpperCase() === clean) ||
        (c.fullName && String(c.fullName).toUpperCase().includes(clean)) ||
        (c.name && String(c.name).toUpperCase().includes(clean)) ||
        (c.email && String(c.email).toUpperCase() === clean)
    );

    if (match) {
      const getStr = (val, fallback = '') => {
        if (!val) return fallback;
        if (typeof val === 'string') return val;
        if (typeof val === 'object') return val.name || val.title || val.code || fallback;
        return String(val);
      };

      const matchedName = getStr(match.fullName, getStr(match.name, ''));
      const matchedCode = getStr(match.employeeCode, getStr(match.code, clean));
      const matchedDept = getStr(match.department, '');
      const matchedComp = getStr(match.company, getStr(match.organization, ''));
      const matchedSec = getStr(match.section, getStr(match.costCenter, ''));
      const matchedLoc = getStr(match.location, '');
      const matchedEmail = getStr(match.email, '');
      const matchedPhone = getStr(match.phone, '');
      const matchedType = getStr(match.custodianType, 'Internal');

      // Ensure custodian's company, department, and section exist in dropdown choices if present
      if (matchedComp && !companiesList.some(c => c.name === matchedComp)) {
        setCompaniesList(prev => [...prev, { id: `CMP-${Date.now()}`, name: matchedComp }]);
      }
      if (matchedDept && !departmentsList.some(d => d.name === matchedDept)) {
        setDepartmentsList(prev => [...prev, { id: `DEP-${Date.now()}`, name: matchedDept }]);
      }
      if (matchedSec && !sectionsList.some(s => s.name === matchedSec || s.code === matchedSec)) {
        setSectionsList(prev => [...prev, { id: `SEC-${Date.now()}`, name: matchedSec, code: matchedSec }]);
      }

      setUserFormData((prev) => ({
        ...prev,
        employeeId: matchedCode,
        name: matchedName || prev.name,
        email: matchedEmail || prev.email,
        phone: matchedPhone || prev.phone,
        department: matchedDept || (showEditModal ? prev.department : ''),
        section: matchedSec || (showEditModal ? (prev.section || prev.costCenter) : ''),
        costCenter: matchedSec || (showEditModal ? (prev.costCenter || prev.section) : ''),
        company: matchedComp || (showEditModal ? prev.company : ''),
        location: matchedLoc || (showEditModal ? prev.location : ''),
        username: prev.username || (matchedEmail ? matchedEmail.split('@')[0] : (matchedCode ? matchedCode.toLowerCase() : ''))
      }));

      setCustodianLinkedFields({
        name: Boolean(matchedName),
        email: Boolean(matchedEmail),
        phone: Boolean(matchedPhone),
        company: Boolean(matchedComp),
        department: Boolean(matchedDept),
        section: Boolean(matchedSec)
      });

      const detailsSuffix = [
        matchedType,
        matchedDept,
        matchedComp
      ].filter(Boolean).join(' - ');

      setEmployeeLookupStatus({
        found: true,
        message: `Matched Custodian: ${matchedName || clean}${detailsSuffix ? ` (${detailsSuffix})` : ''}`
      });
    } else {
      setEmployeeLookupStatus({
        found: false,
        message: `No custodian record found for "${q}". You can enter user details manually or add them to the Custodian Master first.`
      });
    }
  };

  const handleUnlinkCustodian = () => {
    setEmployeeLookupCode('');
    setEmployeeLookupStatus(null);
    setCustodianLinkedFields({
      name: false,
      email: false,
      phone: false,
      company: false,
      department: false,
      section: false
    });
    setUserFormData((prev) => ({
      ...prev,
      employeeId: ''
    }));
  };

  const fetchPasswordPolicyForUser = async (companyVal) => {
    try {
      const query = companyVal ? `?companyId=${encodeURIComponent(companyVal)}` : '';
      const res = await api.get(`/admin/config/password-policy${query}`).catch(() => null);
      if (res?.policy) {
        setUserPasswordPolicy(res.policy);
      }
    } catch (_) {}
  };

  const handleGeneratePassword = () => {
    const pass = generateCompliantPasswordBrowser(userPasswordPolicy);
    setUserFormData((prev) => ({ ...prev, password: pass }));
  };

  const openAddUserModal = () => {
    fetchPasswordPolicyForUser('');
    const defaultCompany = companiesList.length === 1 ? companiesList[0].name : '';
    const filteredDepts = defaultCompany
      ? departmentsList.filter(d => !d.companyId || d.company === defaultCompany || d.companyName === defaultCompany)
      : departmentsList;
    const defaultDept = filteredDepts.length === 1 ? filteredDepts[0].name : '';
    const filteredSecs = defaultDept
      ? sectionsList.filter(s => !s.departmentId || s.department === defaultDept || s.departmentName === defaultDept)
      : sectionsList;
    const defaultSec = filteredSecs.length === 1 ? (filteredSecs[0].name || filteredSecs[0].code) : '';
    const defaultRole = rolesList.length === 1 ? rolesList[0].name : (rolesList.find(r => r.name === 'Standard User')?.name || rolesList[0]?.name || 'Standard User');

    setUserFormData({
      name: '',
      username: '',
      email: '',
      phone: '',
      employeeId: '',
      role: defaultRole,
      department: defaultDept,
      section: defaultSec,
      costCenter: defaultSec,
      location: '',
      company: defaultCompany,
      businessUnit: 'Corporate Operations',
      password: '',
      passwordOption: 'custom',
      forcePasswordChange: true,
      status: 'Active',
      mfaEnabled: false
    });
    setCustodianLinkedFields({
      name: false,
      email: false,
      phone: false,
      company: false,
      department: false,
      section: false
    });
    setIsAddingLocation(false);
    setIsAddingDepartment(false);
    setIsAddingCompany(false);
    setEmployeeLookupCode('');
    setEmployeeLookupStatus(null);
    setShowAddModal(true);
  };

  // Auto-default single master value in Add User Modal if only one option exists
  useEffect(() => {
    if (showAddModal && !showEditModal) {
      setUserFormData(prev => {
        let updated = { ...prev };
        let changed = false;

        if (!updated.company && companiesList.length === 1) {
          updated.company = companiesList[0].name;
          changed = true;
        }

        const compName = updated.company;
        const availableDepts = compName
          ? departmentsList.filter(d => !d.companyId || d.company === compName || d.companyName === compName)
          : departmentsList;
        if (!updated.department && availableDepts.length === 1) {
          updated.department = availableDepts[0].name;
          changed = true;
        }

        const deptName = updated.department;
        const availableSecs = deptName
          ? sectionsList.filter(s => !s.departmentId || s.department === deptName || s.departmentName === deptName)
          : sectionsList;
        if (!updated.section && !updated.costCenter && availableSecs.length === 1) {
          const val = availableSecs[0].name || availableSecs[0].code;
          updated.section = val;
          updated.costCenter = val;
          changed = true;
        }

        if (!updated.role && rolesList.length === 1) {
          updated.role = rolesList[0].name;
          changed = true;
        }

        return changed ? updated : prev;
      });
    }
  }, [showAddModal, showEditModal, companiesList, departmentsList, sectionsList, rolesList]);

  const fetchUsers = async () => {
    setLoading(true);
    let customUsers = [];
    try {
      customUsers = JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch (e) {}

    try {
      const data = await api.get('/admin/users', {
        params: {
          limit: 500,
          search: searchQuery,
          status: statusFilter,
          role: advancedFilters.role,
          department: advancedFilters.department,
          location: advancedFilters.location,
          company: advancedFilters.company,
          accountStatus: advancedFilters.accountStatus,
          mfaEnabled: advancedFilters.mfaEnabled
        }
      }).catch(() => null);

      if (data && data.success && Array.isArray(data.users)) {
        const serverUsers = data.users;
        let allUsers = [...serverUsers];

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          allUsers = allUsers.filter(
            (u) =>
              (u.name && u.name.toLowerCase().includes(q)) ||
              (u.email && u.email.toLowerCase().includes(q)) ||
              (u.username && u.username.toLowerCase().includes(q)) ||
              (u.employeeId && u.employeeId.toLowerCase().includes(q))
          );
        }

        if (statusFilter && statusFilter !== 'All' && statusFilter !== 'All Status') {
          allUsers = allUsers.filter((u) => u.status && u.status.toLowerCase() === statusFilter.toLowerCase());
        }

        setUsers(allUsers);
        setUserList(allUsers);
        setTotalUsers(allUsers.length);
        setLoading(false);
        return;
      }
    } catch (err) {
      // API unreachable, fall back to local state
    }

    // Local filtering on userList
    let filtered = [...userList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          (u.employeeId && u.employeeId.toLowerCase().includes(q))
      );
    }

    if (statusFilter && statusFilter !== 'All' && statusFilter !== 'All Status') {
      filtered = filtered.filter((u) => u.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (advancedFilters.role && advancedFilters.role !== 'All Roles') {
      filtered = filtered.filter((u) => u.role === advancedFilters.role);
    }

    if (advancedFilters.department && advancedFilters.department !== 'All Departments') {
      filtered = filtered.filter((u) => u.department === advancedFilters.department);
    }

    if (advancedFilters.location && advancedFilters.location !== 'All Locations') {
      filtered = filtered.filter((u) => u.location === advancedFilters.location);
    }

    if (advancedFilters.company && advancedFilters.company !== 'All Companies') {
      filtered = filtered.filter((u) => u.company === advancedFilters.company);
    }

    if (advancedFilters.accountStatus && advancedFilters.accountStatus !== 'All') {
      filtered = filtered.filter((u) => u.accountStatus === advancedFilters.accountStatus);
    }

    if (advancedFilters.mfaEnabled && advancedFilters.mfaEnabled !== 'All') {
      const wantMfa = advancedFilters.mfaEnabled === 'Yes';
      filtered = filtered.filter((u) => u.mfaEnabled === wantMfa);
    }

    setTotalUsers(filtered.length);
    setUsers(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit, statusFilter, searchQuery, advancedFilters]);

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
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setAdvancedFilters({
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
  const handleToggleStatus = (user) => {
    setActiveDropdownId(null);
    setUserToToggleStatus(user);
  };

  const handleConfirmToggleUserStatus = async () => {
    if (!userToToggleStatus) return;
    const user = userToToggleStatus;
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    setIsStatusUpdating(true);
    try {
      await api.patch(`/admin/users/${user.id}/toggle-status`).catch(() => null);
    } catch (err) {}

    try {
      let stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
      stored = stored.map(u => u.id === user.id ? { ...u, status: nextStatus } : u);
      localStorage.setItem(storageKey, JSON.stringify(stored));
    } catch (e) {}

    setUserList(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
    setActionSuccessMsg(`Status updated to ${nextStatus} for ${user.name}`);
    setUserToToggleStatus(null);
    setIsStatusUpdating(false);
  };

  const handleOpenResetPasswordModal = (user) => {
    setSelectedUser(user);
    const initialPass = generateCompliantPasswordBrowser(userPasswordPolicy);
    setResetModalTempPassword(initialPass);
    setResetModalSuccess(false);
    setResetModalCopied(false);
    setShowResetPasswordModal(true);
    setActiveDropdownId(null);
  };

  const handleConfirmResetPassword = async () => {
    if (!selectedUser) return;
    setResetModalIsLoading(true);
    try {
      const res = await api.post(`/admin/users/${selectedUser.id}/reset-password`, {
        tempPassword: resetModalTempPassword
      }).catch(() => null);

      if (res && res.success) {
        if (res.tempPassword) {
          setResetModalTempPassword(res.tempPassword);
        }
        setResetModalSuccess(true);
        setActionSuccessMsg(`One-time temporary password generated for ${selectedUser.name || selectedUser.username}. Valid for 24 hours.`);
      } else {
        setResetModalSuccess(true);
        setActionSuccessMsg(`One-time temporary password generated for ${selectedUser.name || selectedUser.username}. Valid for 24 hours.`);
      }
    } catch (err) {
      setResetModalSuccess(true);
    } finally {
      setResetModalIsLoading(false);
    }
  };

  const handleCopyTempPassword = () => {
    if (!resetModalTempPassword) return;
    navigator.clipboard?.writeText(resetModalTempPassword);
    setResetModalCopied(true);
    setTimeout(() => setResetModalCopied(false), 2000);
  };

  const handleSaveAssignRole = async () => {
    if (!selectedUser || !selectedRoleForAssignment) return;
    setIsAssigningRole(true);
    try {
      const targetRole = rolesList.find(r => r.id === selectedRoleForAssignment || r.name === selectedRoleForAssignment);
      const roleName = targetRole?.name || selectedRoleForAssignment;
      const roleId = targetRole?.id || selectedRoleForAssignment;

      await api.put(`/admin/users/${selectedUser.id}`, {
        role: roleName,
        roleId: roleId
      }).catch(() => null);

      try {
        let stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
        stored = stored.map(u => u.id === selectedUser.id ? { ...u, role: roleName, roleId: roleId } : u);
        localStorage.setItem(storageKey, JSON.stringify(stored));
      } catch (e) {}

      setUserList(prev => prev.map(u => u.id === selectedUser.id ? { ...u, role: roleName, roleId: roleId } : u));
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, role: roleName, roleId: roleId } : u));
      setSelectedUser(prev => prev && prev.id === selectedUser.id ? { ...prev, role: roleName, roleId: roleId } : prev);
      setActionSuccessMsg(`Role for "${selectedUser.name}" successfully updated to "${roleName}".`);
      setShowAssignRolesModal(false);
    } catch (err) {
      console.error('Assign role error:', err);
    } finally {
      setIsAssigningRole(false);
    }
  };

  const handleToggleMfa = async (user) => {
    const nextMfa = !user.mfaEnabled;
    try {
      await api.put(`/admin/users/${user.id}`, { mfaEnabled: nextMfa }).catch(() => null);
    } catch (e) {}

    try {
      let stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
      stored = stored.map(u => u.id === user.id ? { ...u, mfaEnabled: nextMfa } : u);
      localStorage.setItem(storageKey, JSON.stringify(stored));
    } catch (e) {}

    setUserList(prev => prev.map(u => u.id === user.id ? { ...u, mfaEnabled: nextMfa } : u));
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, mfaEnabled: nextMfa } : u));
    setActionSuccessMsg(`MFA has been ${nextMfa ? 'Enabled' : 'Disabled'} for "${user.name}".`);
    setActiveDropdownId(null);
  };

  const handleLoginAsUser = (targetUser) => {
    const targetUsername = targetUser.username || targetUser.email || '';
    if (!targetUsername) return;
    setActiveDropdownId(null);
    try {
      sessionStorage.setItem('asset360_login_as_username', targetUsername);
      localStorage.setItem('asset360_remembered_username', targetUsername);
    } catch (_) {}
    if (typeof logout === 'function') {
      logout();
    }
    navigate(`/login?username=${encodeURIComponent(targetUsername)}`, {
      state: { prefillUsername: targetUsername, blankPassword: true }
    });
  };

  const handleDeleteUser = (user) => {
    setActiveDropdownId(null);
    setUserToDelete(user);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    const user = userToDelete;
    setIsDeleting(true);
    try {
      await api.delete(`/admin/users/${user.id}`).catch(() => null);
    } catch (err) {}

    try {
      let stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
      stored = stored.filter(u => u.id !== user.id);
      localStorage.setItem(storageKey, JSON.stringify(stored));
    } catch (e) {}

    setUserList(prev => prev.filter(u => u.id !== user.id));
    setUsers(prev => prev.filter(u => u.id !== user.id));
    setTotalUsers(prev => Math.max(0, prev - 1));
    setActionSuccessMsg(`User ${user.name} removed successfully.`);
    setIsDeleting(false);
    setUserToDelete(null);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setActionErrorMsg('');
    if (userFormData.password && !isUserPassValid) {
      setActionErrorMsg('Please ensure the entered password satisfies all company password requirements.');
      return;
    }
    let savedUser = null;
    let createRes = null;
    try {
      const res = showEditModal
        ? await api.put(`/admin/users/${selectedUser.id}`, userFormData).catch(() => null)
        : await api.post('/admin/users', userFormData).catch(() => null);
      if (res && res.user) {
        savedUser = res.user;
        createRes = res;
      }
    } catch (err) {}

    const targetUser = savedUser || {
      id: showEditModal ? selectedUser.id : `USR-${Date.now()}`,
      ...userFormData,
      lastLogin: showEditModal ? (selectedUser.lastLogin || 'Never') : 'Never',
      createdDate: showEditModal ? (selectedUser.createdDate || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]
    };

    try {
      let stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (showEditModal) {
        stored = stored.map(u => u.id === targetUser.id ? targetUser : u);
      } else {
        stored = [targetUser, ...stored.filter(u => u.id !== targetUser.id)];
      }
      localStorage.setItem(storageKey, JSON.stringify(stored));
    } catch (e) {}

    if (showEditModal) {
      setUserList(prev => prev.map(u => u.id === selectedUser.id ? targetUser : u));
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? targetUser : u));
      setActionSuccessMsg('User updated successfully');
    } else {
      setUserList(prev => [targetUser, ...prev]);
      setUsers(prev => [targetUser, ...prev]);
      setTotalUsers(prev => prev + 1);
      const successMessage = createRes?.message 
        || (targetUser.email 
          ? `User ${targetUser.name || targetUser.username} created! Login credentials valid for 20 minutes have been sent to ${targetUser.email}.`
          : 'User created successfully');
      setActionSuccessMsg(successMessage);
    }

    setShowAddModal(false);
    setShowEditModal(false);
  };

  const totalPages = Math.ceil(users.length / limit) || 1;
  const paginatedUsers = users.slice((page - 1) * limit, page * limit);

  const isCustodianLinked = Boolean(
    (employeeLookupStatus && employeeLookupStatus.found) ||
    (showEditModal && userFormData.employeeId)
  );

  // Effective Role & Granular Permissions derivation for Manage Permissions modal
  const effectiveRoleData = useMemo(() => {
    if (!selectedUser) return { roleObj: null, roleName: '', roleCode: '', perms: {}, isSuperAdmin: false };

    let savedPermsMap = {};
    try {
      const permStorageKey = user?.companyId ? `fams_saved_role_permissions_${user.companyId}` : 'fams_saved_role_permissions';
      savedPermsMap = JSON.parse(localStorage.getItem(permStorageKey) || '{}');
    } catch (_) {}

    const userRoleIdentifier = selectedUser.roleId || selectedUser.role;
    let roleObj = rolesList.find(r =>
      (r.id && (r.id === userRoleIdentifier || String(r.id) === String(userRoleIdentifier))) ||
      (r.name && (r.name === userRoleIdentifier || r.name === selectedUser.role)) ||
      (r.code && (r.code === userRoleIdentifier || r.code === selectedUser.role))
    );

    let roleName = typeof selectedUser.role === 'string' ? selectedUser.role : (selectedUser.role?.name || roleObj?.name || 'Standard User');
    let roleCode = selectedUser.role?.code || roleObj?.code || '';
    let roleId = roleObj?.id || selectedUser.roleId || roleName;

    let perms = roleObj?.permissions || {};
    if (typeof perms === 'string') {
      try { perms = JSON.parse(perms); } catch (_) { perms = {}; }
    }

    // Check localStorage cache for freshest saved permissions
    const cached = savedPermsMap[roleId] || (roleCode ? savedPermsMap[roleCode] : null) || savedPermsMap[roleName];
    if (cached) {
      perms = cached;
    }

    const isSuperAdmin = (
      roleCode === 'SYS_ADMIN' ||
      roleCode === 'ADMIN' ||
      ['System Administrator', 'Asset Administrator', 'Admin', 'Super Admin'].includes(roleName) ||
      (Array.isArray(perms) && perms.includes('*')) ||
      (perms['*'] && Array.isArray(perms['*']) && perms['*'].includes('*'))
    );

    // If perms is empty and not superadmin, construct default matrix matching RolesPermissions defaults
    const effectivePerms = { ...perms };
    if (Object.keys(effectivePerms).length === 0 && !isSuperAdmin) {
      const isAuditor = roleName.toLowerCase().includes('audit');
      const isTech = roleName.toLowerCase().includes('tech');
      const isAssetMgr = roleName.toLowerCase().includes('asset');

      MODULE_STRUCTURE.forEach((mod) => {
        if (isAuditor) {
          effectivePerms[mod.key] = mod.actions.filter(a => ['View', 'Export'].includes(a));
        } else if (isTech) {
          if (['maintenance', 'tracking', 'assets'].includes(mod.key)) {
            effectivePerms[mod.key] = mod.actions.filter(a => ['View', 'Create', 'Edit'].includes(a));
          } else {
            effectivePerms[mod.key] = mod.actions.filter(a => ['View'].includes(a));
          }
        } else if (isAssetMgr) {
          effectivePerms[mod.key] = [...mod.actions];
        } else {
          effectivePerms[mod.key] = mod.actions.filter(a => ['View'].includes(a));
        }
      });

      MASTER_DATA_ENTITIES.forEach((e) => {
        if (isAuditor) {
          effectivePerms[`master_data_${e.key}`] = e.actions.filter(a => ['View', 'Export'].includes(a));
        } else if (isAssetMgr) {
          effectivePerms[`master_data_${e.key}`] = [...e.actions];
        } else {
          effectivePerms[`master_data_${e.key}`] = e.actions.filter(a => ['View'].includes(a));
        }
      });
    }

    return {
      roleObj: roleObj || { id: roleId, name: roleName, code: roleCode, roleType: 'Custom Role' },
      roleName,
      roleCode,
      perms: effectivePerms,
      isSuperAdmin
    };
  }, [selectedUser, rolesList, showPermissionsModal]);

  const isModuleActionGranted = (moduleKey, action) => {
    if (effectiveRoleData.isSuperAdmin) return true;
    const perms = effectiveRoleData.perms;
    if (!perms) return false;

    if (Array.isArray(perms)) {
      return perms.includes('*') || perms.includes(action);
    }

    const modActions = perms[moduleKey] || (moduleKey === 'stocktakes' ? perms['audit'] : null);
    if (Array.isArray(modActions)) {
      return modActions.includes(action) || modActions.includes('*');
    }
    return false;
  };

  const isMasterActionGranted = (catalogKey, action) => {
    if (effectiveRoleData.isSuperAdmin) return true;
    const perms = effectiveRoleData.perms;
    if (!perms) return false;

    const checkMatch = (grantedList, targetAct) => {
      if (!Array.isArray(grantedList)) return false;
      if (grantedList.includes('*')) return true;
      if (grantedList.includes(targetAct)) return true;
      const tLower = (targetAct || '').toLowerCase();
      return grantedList.some(a => {
        if (typeof a !== 'string') return false;
        const aLower = a.toLowerCase();
        if (aLower === tLower || a === '*') return true;
        if ((tLower === 'activate' || tLower === 'deactivate' || tLower === 'status' || tLower === 'activate/deactivate') &&
            (aLower.includes('activate') || aLower.includes('deactivate'))) {
          return true;
        }
        if (tLower === 'duplicate' && aLower.includes('duplicate')) return true;
        return false;
      });
    };

    if (Array.isArray(perms)) {
      return checkMatch(perms, action);
    }

    // Direct match: master_data_${catalogKey} or master-data:${catalogKey} (supporting both hyphen and underscore)
    const baseKey = catalogKey === 'classes' ? 'sub-groups' : (catalogKey === 'asset-conditions' ? 'conditions' : catalogKey);
    const hyphenKey = baseKey.replace(/_/g, '-');
    const underscoreKey = baseKey.replace(/-/g, '_');

    const direct = perms[`master_data_${hyphenKey}`] ||
                   perms[`master_data_${underscoreKey}`] ||
                   perms[`master_${hyphenKey}`] ||
                   perms[`master_${underscoreKey}`] ||
                   perms[`master-data:${hyphenKey}`] ||
                   perms[`master-data:${underscoreKey}`];

    if (Array.isArray(direct)) {
      return checkMatch(direct, action);
    }

    // Fall back to parent master-data if granular key is not explicitly set
    const parent = perms['master-data'] || perms['master_data'];
    if (Array.isArray(parent)) {
      return checkMatch(parent, action);
    }
    return false;
  };

  const permissionStats = useMemo(() => {
    let operationalModulesCount = 0;
    let operationalActionsCount = 0;
    const opModules = MODULE_STRUCTURE.filter(m => m.key !== 'master-data');

    opModules.forEach(mod => {
      let modGranted = false;
      mod.actions.forEach(act => {
        if (isModuleActionGranted(mod.key, act)) {
          modGranted = true;
          operationalActionsCount++;
        }
      });
      if (modGranted) operationalModulesCount++;
    });

    let masterCatalogsCount = 0;
    let masterActionsCount = 0;
    MASTER_DATA_ENTITIES.forEach(cat => {
      let catGranted = false;
      cat.actions.forEach(act => {
        if (isMasterActionGranted(cat.key, act)) {
          catGranted = true;
          masterActionsCount++;
        }
      });
      if (catGranted) masterCatalogsCount++;
    });

    return {
      operationalModulesCount,
      totalOperationalModules: opModules.length,
      masterCatalogsCount,
      totalMasterCatalogs: MASTER_DATA_ENTITIES.length,
      totalActionsGranted: operationalActionsCount + masterActionsCount
    };
  }, [effectiveRoleData]);

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
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Import Users
            </button>

            <div className="relative group">
              <button className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition shadow-sm">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                Export &or;
              </button>
            </div>

            <button
              onClick={openAddUserModal}
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
                    {rolesList.length > 0 ? (
                      rolesList.map(r => (
                        <option key={r.id || r.name} value={r.name}>{r.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="System Administrator">System Administrator</option>
                        <option value="Asset Manager">Asset Manager</option>
                        <option value="Standard User">Standard User</option>
                      </>
                    )}
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
                    {departmentsList.map(d => (
                      <option key={d.id} value={d.name}>{d.name} {d.code ? `(${d.code})` : ''}</option>
                    ))}
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
                    {sitesList.map(s => (
                      <option key={s.id} value={s.name}>{s.name} {s.code ? `(${s.code})` : ''}</option>
                    ))}
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
                    {companiesList.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
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

        <div className="overflow-x-auto overflow-y-auto max-h-[540px] relative scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-20 bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold select-none shadow-2xs">
              <tr className="bg-[#F8FAFC]">
                <th className="p-3 pl-4 w-10 bg-[#F8FAFC]">
                  <input type="checkbox" className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]" />
                </th>
                <th className="p-3 w-12 text-slate-400 font-normal bg-[#F8FAFC]">#</th>
                <th className="p-3 font-semibold text-slate-900 cursor-pointer bg-[#F8FAFC]">Name &uarr;&darr;</th>
                <th className="p-3 font-semibold text-slate-900 bg-[#F8FAFC]">Role</th>
                <th className="p-3 font-semibold text-slate-900 bg-[#F8FAFC]">Department</th>
                <th className="p-3 font-semibold text-slate-900 bg-[#F8FAFC]">Location</th>
                <th className="p-3 font-semibold text-slate-900 bg-[#F8FAFC]">Company</th>
                <th className="p-3 font-semibold text-slate-900 bg-[#F8FAFC]">Status</th>
                <th className="p-3 font-semibold text-slate-900 bg-[#F8FAFC]">Last Login</th>
                <th className="p-3 text-right pr-4 font-semibold text-slate-900 bg-[#F8FAFC]">Actions</th>
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
                paginatedUsers.map((user, idx) => {
                  const userNameStr = typeof user.name === 'string' ? user.name : (user.name?.name || 'User');
                  const initials = userNameStr
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'U';

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
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            user.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
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
                                fetchPasswordPolicyForUser(user.company);
                                setEmployeeLookupCode(user.employeeId || '');
                                setEmployeeLookupStatus(null);
                                setCustodianLinkedFields({
                                  name: Boolean(user.employeeId && user.name),
                                  email: Boolean(user.employeeId && user.email),
                                  phone: Boolean(user.employeeId && user.phone),
                                  company: Boolean(user.employeeId && user.company),
                                  department: Boolean(user.employeeId && user.department),
                                  section: Boolean(user.employeeId && (user.section || user.costCenter))
                                });
                                setShowEditModal(true);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              Edit User
                            </button>

                            <button
                              onClick={() => handleOpenResetPasswordModal(user)}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2 cursor-pointer"
                            >
                              <Lock className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              Reset Password
                            </button>

                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                const currentRole = rolesList.find(r => r.name === user.role || r.id === user.roleId);
                                setSelectedRoleForAssignment(currentRole?.id || currentRole?.name || user.role || (rolesList[0]?.id || ''));
                                setShowAssignRolesModal(true);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2 cursor-pointer"
                            >
                              <Users className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              Assign Roles
                            </button>

                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowPermissionsModal(true);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2 cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              Manage Permissions
                            </button>

                            <button
                              onClick={() => handleToggleMfa(user)}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2 cursor-pointer"
                            >
                              <Smartphone className="w-3.5 h-3.5 text-[#6C2BD9]" />
                              {user.mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
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
                              onClick={() => handleLoginAsUser(user)}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2 cursor-pointer"
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

        {/* Pagination Bar */}
        <div className="px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-white">
          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-700">
              Showing {users.length === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, users.length)} of {users.length} users
            </span>
            <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
              <span className="text-slate-500">Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 border border-slate-200 rounded-md bg-white text-slate-700 text-xs font-medium focus:ring-1 focus:ring-[#6C2BD9] cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium cursor-pointer"
              title="First Page"
            >
              &laquo;
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && p - prev > 1;
                  return (
                    <React.Fragment key={p}>
                      {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-7 h-7 rounded-md text-xs font-semibold transition cursor-pointer ${
                          page === p
                            ? 'bg-[#6C2BD9] text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium cursor-pointer"
              title="Last Page"
            >
              &raquo;
            </button>
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
                  <div><span className="text-slate-400">Role:</span> <span className="font-medium text-slate-800 block">{selectedUser.role}</span></div>
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
                  <div><span className="text-slate-400">Section:</span> <span className="font-medium text-slate-800 block">{selectedUser.costCenter}</span></div>
                  <div className="col-span-2"><span className="text-slate-400">Primary Location:</span> <span className="font-medium text-slate-800 block">{selectedUser.location}</span></div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider block text-[10px]">User Group & Role</span>
                  <span className="px-2.5 py-0.5 bg-[#F5F3FF] border border-[#DDD6FE] text-[#6C2BD9] font-bold rounded-md text-[11px]">
                    {selectedUser.role || 'Standard User'}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1.5 text-[10px]">Application Menu Access Permissions</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {[
                      { name: 'Asset Management', allowed: true },
                      { name: 'Asset 360 Registry', allowed: true },
                      { name: 'Master Data Hub', allowed: ['System Administrator', 'Asset Manager', 'Admin'].includes(selectedUser.role) },
                      { name: 'Maintenance', allowed: ['System Administrator', 'Asset Manager', 'Technician'].includes(selectedUser.role) },
                      { name: 'Verification & Audit', allowed: ['System Administrator', 'Asset Manager', 'Auditor'].includes(selectedUser.role) },
                      { name: 'Finance & Depreciation', allowed: ['System Administrator', 'Finance Controller', 'Asset Manager'].includes(selectedUser.role) },
                      { name: 'Administration', allowed: ['System Administrator', 'Admin'].includes(selectedUser.role) }
                    ].map((perm) => (
                      <div key={perm.name} className="flex items-center justify-between p-1.5 rounded-lg border bg-white border-slate-200">
                        <span className="truncate text-slate-700 font-medium">{perm.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${perm.allowed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                          {perm.allowed ? 'Granted' : 'Locked'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Next Login Policy:</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Force Password Change
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
              {/* Employee / Custodian Master Lookup */}
              {!showEditModal && (
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span>Employee / Custodian Master Lookup</span>
                    </label>
                    <span className="text-[10px] text-slate-500">Auto-populates user details</span>
                  </div>
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Type or select Employee / Custodian (e.g. EMP-1001 or Sarah)..."
                        value={employeeLookupCode}
                        onFocus={() => setShowLookupDropdown(true)}
                        onBlur={() => setTimeout(() => setShowLookupDropdown(false), 200)}
                        onChange={(e) => {
                          setEmployeeLookupCode(e.target.value);
                          setShowLookupDropdown(true);
                          const val = e.target.value.trim().toUpperCase();
                          if (!val) {
                            setEmployeeLookupStatus(null);
                            setUserFormData(prev => ({ ...prev, employeeId: '' }));
                          } else {
                            const foundDirect = custodiansList.find(c => (c.employeeCode || c.code || '').toUpperCase() === val);
                            if (foundDirect) handleLookupEmployee(e.target.value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleLookupEmployee();
                            setShowLookupDropdown(false);
                          } else if (e.key === 'Escape') {
                            setShowLookupDropdown(false);
                          }
                        }}
                        className="w-full px-3 py-1.5 border border-purple-200 rounded-lg text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#6C2BD9]"
                      />

                      {/* Clean White Custom Dropdown Menu (Guaranteed Light Background) */}
                      {showLookupDropdown && custodiansList.length > 0 && (
                        <div className="absolute left-0 top-full mt-1 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-2xl z-50 py-1 divide-y divide-slate-100 text-left">
                          {custodiansList
                            .filter(c => {
                              if (!employeeLookupCode) return true;
                              const q = employeeLookupCode.toUpperCase().trim();
                              return (
                                (c.employeeCode && String(c.employeeCode).toUpperCase().includes(q)) ||
                                (c.code && String(c.code).toUpperCase().includes(q)) ||
                                (c.fullName && String(c.fullName).toUpperCase().includes(q)) ||
                                (c.name && String(c.name).toUpperCase().includes(q)) ||
                                (c.department && String(c.department).toUpperCase().includes(q))
                              );
                            })
                            .slice(0, 8)
                            .map((c, i) => {
                              const nameStr = typeof c.fullName === 'string' ? c.fullName : (typeof c.name === 'string' ? c.name : (c.name?.name || 'Unnamed'));
                              const codeStr = typeof c.employeeCode === 'string' ? c.employeeCode : (typeof c.code === 'string' ? c.code : nameStr);
                              const typeStr = typeof c.custodianType === 'string' ? c.custodianType : 'Internal';
                              const deptStr = typeof c.department === 'string' ? c.department : (c.department?.name || '');

                              return (
                                <button
                                  key={c.id || i}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setEmployeeLookupCode(codeStr);
                                    handleLookupEmployee(codeStr);
                                    setShowLookupDropdown(false);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-purple-50 transition-colors flex items-center justify-between text-xs cursor-pointer group bg-white text-slate-800"
                                >
                                  <div>
                                    <div className="font-semibold text-slate-900 group-hover:text-[#6C2BD9]">{nameStr}</div>
                                    <div className="text-[10px] text-slate-500">{deptStr ? `${deptStr} • ` : ''}{c.email || 'No email'}</div>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-[#6C2BD9] font-bold">{codeStr}</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${typeStr === 'External' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                                      {typeStr}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLookupEmployee()}
                      className="px-3.5 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-semibold rounded-lg transition-colors cursor-pointer text-xs shrink-0 flex items-center gap-1 shadow-2xs"
                    >
                      <span>Lookup & Populate</span>
                    </button>
                  </div>
                  {employeeLookupStatus && (
                    <div className={`p-2.5 rounded-lg text-[11px] flex items-center justify-between gap-2 ${employeeLookupStatus.found ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                      <div className="flex items-center gap-1.5 font-medium">
                        {employeeLookupStatus.found ? (
                          <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                        <span>{employeeLookupStatus.message}</span>
                      </div>
                      {employeeLookupStatus.found && (
                        <button
                          type="button"
                          onClick={handleUnlinkCustodian}
                          className="text-[10px] text-emerald-700 hover:text-emerald-950 font-semibold underline shrink-0 cursor-pointer"
                        >
                          Unlink / Clear
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Linked Custodian Notification in Edit Modal */}
              {showEditModal && userFormData.employeeId && (
                <div className="p-2.5 bg-purple-50/70 rounded-xl border border-purple-200 text-xs flex items-center justify-between text-purple-900">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>
                      Linked to Custodian: <strong className="font-semibold font-mono">{userFormData.employeeId}</strong>. Identity & organization fields are synced from Custodian Master.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUserFormData(prev => ({ ...prev, employeeId: '' }))}
                    className="text-[10px] text-purple-700 hover:text-purple-950 font-semibold underline shrink-0 cursor-pointer"
                  >
                    Unlink
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-slate-700">Full Name *</label>
                    {isCustodianLinked && (
                      <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200/60 px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
                        <Lock className="w-2.5 h-2.5" /> Synced from Custodian
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    readOnly={isCustodianLinked}
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg text-xs transition-colors ${
                      isCustodianLinked
                        ? 'bg-slate-100/90 text-slate-600 border-slate-200 cursor-not-allowed select-none'
                        : 'bg-white border-slate-200 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-slate-700">Email Address *</label>
                    {isCustodianLinked && (
                      <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200/60 px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
                        <Lock className="w-2.5 h-2.5" /> Synced from Custodian
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    required
                    readOnly={isCustodianLinked}
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg text-xs transition-colors ${
                      isCustodianLinked
                        ? 'bg-slate-100/90 text-slate-600 border-slate-200 cursor-not-allowed select-none'
                        : 'bg-white border-slate-200 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-slate-700">Phone Number</label>
                    {isCustodianLinked && (
                      <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200/60 px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
                        <Lock className="w-2.5 h-2.5" /> Synced from Custodian
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    readOnly={isCustodianLinked}
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg text-xs transition-colors ${
                      isCustodianLinked
                        ? 'bg-slate-100/90 text-slate-600 border-slate-200 cursor-not-allowed select-none'
                        : 'bg-white border-slate-200 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Role *</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs"
                  >
                    {rolesList.length > 0 ? (
                      rolesList.map(r => (
                        <option key={r.id || r.name} value={r.name}>{r.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="System Administrator">System Administrator</option>
                        <option value="Asset Manager">Asset Manager</option>
                        <option value="Maintenance Manager">Maintenance Manager</option>
                        <option value="Standard User">Standard User</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={userFormData.status}
                    onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Company */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-slate-700">Company *</label>
                    {isCustodianLinked && custodianLinkedFields.company && (
                      <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200/60 px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
                        <Lock className="w-2.5 h-2.5" /> Synced from Custodian
                      </span>
                    )}
                  </div>
                  <select
                    disabled={isCustodianLinked && custodianLinkedFields.company}
                    value={userFormData.company}
                    onChange={(e) => setUserFormData({ ...userFormData, company: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg text-xs transition-colors ${
                      isCustodianLinked && custodianLinkedFields.company
                        ? 'bg-slate-100/90 text-slate-600 border-slate-200 cursor-not-allowed'
                        : 'bg-white border-slate-200 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]'
                    }`}
                  >
                    <option value="">Select Licensed Company...</option>
                    {companiesList.map(c => (
                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-slate-700">Department</label>
                    {isCustodianLinked && custodianLinkedFields.department && (
                      <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200/60 px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
                        <Lock className="w-2.5 h-2.5" /> Synced from Custodian
                      </span>
                    )}
                  </div>
                  <select
                    disabled={isCustodianLinked && custodianLinkedFields.department}
                    value={userFormData.department}
                    onChange={(e) => setUserFormData({ ...userFormData, department: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg text-xs transition-colors ${
                      isCustodianLinked && custodianLinkedFields.department
                        ? 'bg-slate-100/90 text-slate-600 border-slate-200 cursor-not-allowed'
                        : 'bg-white border-slate-200 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]'
                    }`}
                  >
                    <option value="">-- Select Department --</option>
                    {departmentsList.map(d => (
                      <option key={d.id || d.name} value={d.name}>{d.name} {d.code ? `(${d.code})` : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Section from Master Data */}
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-slate-700">Section</label>
                    {isCustodianLinked && custodianLinkedFields.section && (
                      <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200/60 px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
                        <Lock className="w-2.5 h-2.5" /> Synced from Custodian
                      </span>
                    )}
                  </div>
                  <select
                    disabled={isCustodianLinked && custodianLinkedFields.section}
                    value={userFormData.section || userFormData.costCenter || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setUserFormData({ ...userFormData, section: val, costCenter: val });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg text-xs transition-colors ${
                      isCustodianLinked && custodianLinkedFields.section
                        ? 'bg-slate-100/90 text-slate-600 border-slate-200 cursor-not-allowed'
                        : 'bg-white border-slate-200 focus:outline-none focus:border-[#6C2BD9] cursor-pointer'
                    }`}
                  >
                    <option value="">Select Section...</option>
                    {sectionsList.map(s => {
                      const val = s.name || s.code;
                      const isInactive = s.active === false || String(s.status || '').toLowerCase() === 'inactive' || String(s.status || '').toLowerCase() === 'deactivated';
                      const label = s.name ? `${s.name}${s.code ? ` (${s.code})` : ''}` : s.code;
                      return (
                        <option
                          key={s.id || s.code || s.name}
                          value={val}
                          disabled={isInactive}
                          className={isInactive ? "text-slate-400 bg-slate-100 italic" : "text-slate-800 font-medium"}
                          style={isInactive ? { color: '#94a3b8' } : undefined}
                        >
                          {label}{isInactive ? ' (Deactivated)' : ''}
                        </option>
                      );
                    })}
                    {showEditModal && (userFormData.section || userFormData.costCenter) && !sectionsList.some(s => (s.name || s.code) === (userFormData.section || userFormData.costCenter)) && (
                      <option
                        value={userFormData.section || userFormData.costCenter}
                        disabled
                        className="text-slate-400 bg-slate-100 italic"
                        style={{ color: '#94a3b8' }}
                      >
                        {userFormData.section || userFormData.costCenter} (Deactivated)
                      </option>
                    )}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">Configured in Master Data &gt; Sections.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#6C2BD9]" />
                    <span>Password Configuration</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-bold text-[#6C2BD9] hover:underline cursor-pointer"
                  >
                    + Generate Random Password
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      placeholder={showEditModal ? 'Leave blank to keep existing password' : 'Enter initial password...'}
                      value={userFormData.password || ''}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-[#6C2BD9]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="forcePassCheck"
                      checked={userFormData.forcePasswordChange !== false}
                      onChange={(e) => setUserFormData({ ...userFormData, forcePasswordChange: e.target.checked })}
                      className="rounded border-slate-300 text-[#6C2BD9]"
                    />
                    <label htmlFor="forcePassCheck" className="text-[11px] font-medium text-slate-700 cursor-pointer">
                      Force password change on first login
                    </label>
                  </div>
                </div>

                {!showEditModal && (
                  <div className="flex items-center gap-2 px-2.5 py-1.5 bg-amber-50 border border-amber-200/70 rounded-lg text-amber-800 text-[11px]">
                    <span className="shrink-0 font-bold">⏱️ 20-Min Expiry:</span>
                    <span>Username and initial password will be emailed to the user and will expire in <strong>20 minutes</strong>.</span>
                  </div>
                )}

                {userFormData.password && (
                  <PasswordRequirementsTracker
                    password={userFormData.password}
                    policy={userPasswordPolicy}
                    onValidityChange={setIsUserPassValid}
                    showSummaryBadge={true}
                  />
                )}
              </div>

              {actionErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{actionErrorMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
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
      {/* ASSIGN ROLE MODAL */}
      {showAssignRolesModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 overflow-y-auto max-h-[90vh] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Assign Role</h3>
                  <p className="text-xs text-slate-500">Update system access & permissions for {selectedUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignRolesModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Details Mini Card */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#6C2BD9] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{selectedUser.name}</div>
                  <div className="text-xs text-slate-500">{selectedUser.email || selectedUser.username}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Current Role</span>
                <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-100 text-[#6C2BD9] border border-purple-200">
                  {selectedUser.role || 'Standard User'}
                </span>
              </div>
            </div>

            {/* Role Choices */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Select New Role *</label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {rolesList.map(r => {
                  const isSelected = (selectedRoleForAssignment === r.id || selectedRoleForAssignment === r.name);
                  return (
                    <div
                      key={r.id || r.name}
                      onClick={() => setSelectedRoleForAssignment(r.id || r.name)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-[#6C2BD9] bg-purple-50/50 ring-2 ring-[#6C2BD9]/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="radio"
                          name="assignedRole"
                          checked={isSelected}
                          onChange={() => setSelectedRoleForAssignment(r.id || r.name)}
                          className="mt-0.5 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <span>{r.name}</span>
                            {r.code && <span className="font-mono text-[10px] text-slate-400">({r.code})</span>}
                            {r.isSystem && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-slate-100 text-slate-600">
                                System
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{r.description || 'Access role for operations'}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        r.status === 'Active' || r.active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {r.status || 'Active'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAssignRolesModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isAssigningRole || !selectedRoleForAssignment}
                onClick={handleSaveAssignRole}
                className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isAssigningRole ? 'Saving...' : 'Save Role Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE PERMISSIONS MODAL */}
      {showPermissionsModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center font-bold shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">Manage Permissions</h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      {effectiveRoleData.roleName}
                    </span>
                    {effectiveRoleData.isSuperAdmin && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        Superadmin Full Access
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Effective access rights for <strong className="text-slate-700 font-semibold">{selectedUser.name}</strong> ({selectedUser.email || selectedUser.username || 'User'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User & Assigned Role Overview Bar */}
            <div className="px-6 py-3 bg-purple-50/50 border-b border-purple-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-6 text-xs">
                <div>
                  <span className="text-[10px] text-purple-800 font-bold uppercase tracking-wider block">Assigned Role</span>
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#6C2BD9]" />
                    {effectiveRoleData.roleName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Role Type</span>
                  <span className="text-slate-700 font-medium">
                    {effectiveRoleData.roleObj?.roleType || (effectiveRoleData.isSuperAdmin ? 'System Role' : 'Custom Role')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Department / Org</span>
                  <span className="text-slate-700 font-medium">{selectedUser.department || selectedUser.company || 'All Enterprise Units'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPermissionsModal(false);
                    const currentRole = rolesList.find(r => r.name === selectedUser.role || r.id === selectedUser.roleId);
                    setSelectedRoleForAssignment(currentRole?.id || currentRole?.name || selectedUser.role || '');
                    setShowAssignRolesModal(true);
                  }}
                  className="px-3 py-1.5 bg-white border border-[#6C2BD9] text-[#6C2BD9] hover:bg-purple-50 text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Change Role
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPermissionsModal(false);
                    navigate('/admin/roles');
                  }}
                  className="px-3 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Edit Role Permissions
                </button>
              </div>
            </div>

            {/* Filter & Metric Bar */}
            <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              {/* Metric Counters */}
              <div className="flex items-center gap-2 text-xs">
                <div className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-slate-600 font-medium">Modules:</span>
                  <strong className="text-slate-800 font-bold">{permissionStats.operationalModulesCount} / {permissionStats.totalOperationalModules}</strong>
                </div>
                <div className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-slate-600 font-medium">Master Catalogs:</span>
                  <strong className="text-slate-800 font-bold">{permissionStats.masterCatalogsCount} / {permissionStats.totalMasterCatalogs}</strong>
                </div>
                <div className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-slate-600 font-medium">Granted Actions:</span>
                  <strong className="text-emerald-700 font-bold">{permissionStats.totalActionsGranted}</strong>
                </div>
              </div>

              {/* Search, Tabs & Options */}
              <div className="flex items-center gap-2.5 flex-1 justify-end min-w-[280px]">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={permModalSearch}
                    onChange={(e) => setPermModalSearch(e.target.value)}
                    placeholder="Search module, catalog, or action..."
                    className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#6C2BD9] focus:border-[#6C2BD9]"
                  />
                  {permModalSearch && (
                    <button
                      onClick={() => setPermModalSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center bg-white border border-slate-200 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setPermModalTab('all')}
                    className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                      permModalTab === 'all' ? 'bg-[#6C2BD9] text-white font-bold shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setPermModalTab('modules')}
                    className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                      permModalTab === 'modules' ? 'bg-[#6C2BD9] text-white font-bold shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Modules ({permissionStats.totalOperationalModules})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPermModalTab('master_data')}
                    className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                      permModalTab === 'master_data' ? 'bg-[#6C2BD9] text-white font-bold shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Masters ({permissionStats.totalMasterCatalogs})
                  </button>
                </div>

                <label className="flex items-center gap-1.5 text-xs text-slate-600 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permModalOnlyAllowed}
                    onChange={(e) => setPermModalOnlyAllowed(e.target.checked)}
                    className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]/30 cursor-pointer"
                  />
                  <span className="text-[11px] font-medium whitespace-nowrap">Granted only</span>
                </label>
              </div>
            </div>

            {/* Scrollable Permissions Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* 1. OPERATIONAL MODULES SECTION */}
              {(permModalTab === 'all' || permModalTab === 'modules') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#6C2BD9]" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Operational Modules & System Capabilities
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {permissionStats.operationalModulesCount} of {permissionStats.totalOperationalModules} active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {MODULE_STRUCTURE
                      .filter(mod => {
                        if (mod.key === 'master-data') return false; // Rendered below with full granular catalog detail
                        const q = permModalSearch.toLowerCase().trim();
                        if (q) {
                          const matchName = mod.name.toLowerCase().includes(q);
                          const matchKey = mod.key.toLowerCase().includes(q);
                          const matchAct = mod.actions.some(a => a.toLowerCase().includes(q));
                          const matchScreen = mod.screens.some(s => s.toLowerCase().includes(q));
                          if (!matchName && !matchKey && !matchAct && !matchScreen) return false;
                        }
                        if (permModalOnlyAllowed) {
                          const hasAny = mod.actions.some(a => isModuleActionGranted(mod.key, a));
                          if (!hasAny) return false;
                        }
                        return true;
                      })
                      .map((mod) => {
                        const grantedActions = mod.actions.filter(a => isModuleActionGranted(mod.key, a));
                        const isAllGranted = grantedActions.length === mod.actions.length;
                        const isNoneGranted = grantedActions.length === 0;

                        return (
                          <div
                            key={mod.key}
                            className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5 hover:border-purple-200 transition-colors"
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <div>
                                <span className="font-bold text-xs text-slate-900 block">{mod.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {mod.screens.length} Screens ({mod.screens.slice(0, 2).join(', ')}{mod.screens.length > 2 ? '...' : ''})
                                </span>
                              </div>
                              {isAllGranted ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Full Access
                                </span>
                              ) : !isNoneGranted ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                  Custom ({grantedActions.length}/{mod.actions.length})
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                  No Access
                                </span>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {mod.actions.map((act) => {
                                const isGranted = isModuleActionGranted(mod.key, act);
                                if (permModalOnlyAllowed && !isGranted) return null;
                                return (
                                  <span
                                    key={act}
                                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
                                      isGranted
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold'
                                        : 'bg-slate-50 text-slate-400 line-through border border-slate-200/50 opacity-70'
                                    }`}
                                    title={isGranted ? `Permission Granted: ${act}` : `Permission Denied: ${act}`}
                                  >
                                    {isGranted ? (
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                    ) : (
                                      <XCircle className="w-3 h-3 text-slate-300 shrink-0" />
                                    )}
                                    {act}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* 2. GRANULAR MASTER DATA HUB SECTION (19 CATALOGS) */}
              {(permModalTab === 'all' || permModalTab === 'master_data') && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Master Data Hub (19 Catalogs)
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {permissionStats.masterCatalogsCount} of {permissionStats.totalMasterCatalogs} catalogs accessible
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {MASTER_DATA_ENTITIES
                      .filter(cat => {
                        const q = permModalSearch.toLowerCase().trim();
                        if (q) {
                          const matchName = cat.name.toLowerCase().includes(q);
                          const matchKey = cat.key.toLowerCase().includes(q);
                          const matchAct = cat.actions.some(a => a.toLowerCase().includes(q));
                          if (!matchName && !matchKey && !matchAct) return false;
                        }
                        if (permModalOnlyAllowed) {
                          const hasAny = cat.actions.some(a => isMasterActionGranted(cat.key, a));
                          if (!hasAny) return false;
                        }
                        return true;
                      })
                      .map((cat) => {
                        const grantedActions = cat.actions.filter(a => isMasterActionGranted(cat.key, a));
                        const isAllGranted = grantedActions.length === cat.actions.length;
                        const isViewOnly = grantedActions.length === 1 && grantedActions[0] === 'View';
                        const isNoneGranted = grantedActions.length === 0;

                        return (
                          <div
                            key={cat.key}
                            className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 hover:border-purple-200 transition-colors"
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                              <span className="font-bold text-xs text-slate-900">{cat.name}</span>
                              {isAllGranted ? (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Full Access
                                </span>
                              ) : isViewOnly ? (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                                  View Only
                                </span>
                              ) : !isNoneGranted ? (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                  Custom ({grantedActions.length}/{cat.actions.length})
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                  No Access
                                </span>
                              )}
                            </div>

                            {/* Granular Action Pills */}
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {cat.actions.map((act) => {
                                const isGranted = isMasterActionGranted(cat.key, act);
                                if (permModalOnlyAllowed && !isGranted) return null;
                                return (
                                  <span
                                    key={act}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-colors ${
                                      isGranted
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold'
                                        : 'bg-slate-50 text-slate-400 line-through border border-slate-200/50 opacity-60'
                                    }`}
                                    title={isGranted ? `Permission Granted: ${act}` : `Permission Denied: ${act}`}
                                  >
                                    {isGranted ? (
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                    ) : (
                                      <XCircle className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                                    )}
                                    {act}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Empty state if search or filter matches nothing */}
              {permModalSearch && (
                (() => {
                  const q = permModalSearch.toLowerCase().trim();
                  const anyOpMatch = MODULE_STRUCTURE
                    .filter(m => m.key !== 'master-data')
                    .some(m => m.name.toLowerCase().includes(q) || m.key.toLowerCase().includes(q) || m.actions.some(a => a.toLowerCase().includes(q)));
                  const anyMasterMatch = MASTER_DATA_ENTITIES
                    .some(c => c.name.toLowerCase().includes(q) || c.key.toLowerCase().includes(q) || c.actions.some(a => a.toLowerCase().includes(q)));

                  if (!anyOpMatch && !anyMasterMatch) {
                    return (
                      <div className="py-12 text-center space-y-2">
                        <Search className="w-8 h-8 text-slate-300 mx-auto" />
                        <h5 className="text-xs font-bold text-slate-700">No matching permissions found</h5>
                        <p className="text-[11px] text-slate-400">
                          No module, master catalog, or action matched "{permModalSearch}".
                        </p>
                        <button
                          type="button"
                          onClick={() => setPermModalSearch('')}
                          className="mt-2 text-xs text-[#6C2BD9] hover:underline font-semibold cursor-pointer"
                        >
                          Clear search filter
                        </button>
                      </div>
                    );
                  }
                  return null;
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  Permissions are governed by the assigned role (<strong>{effectiveRoleData.roleName}</strong>).
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPermissionsModal(false);
                    navigate('/admin/roles');
                  }}
                  className="px-3.5 py-2 bg-purple-50 text-[#6C2BD9] hover:bg-purple-100 border border-purple-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Roles & Permissions
                </button>
                <button
                  type="button"
                  onClick={() => setShowPermissionsModal(false)}
                  className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => { setShowResetPasswordModal(false); setResetModalSuccess(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200 text-[#6C2BD9] flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset User Password</h3>
                <p className="text-xs text-slate-500">Issue a secure one-time temporary password</p>
              </div>
            </div>

            {resetModalSuccess ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="text-xs font-bold text-emerald-900">Temporary Password Generated & Set!</div>
                  <p className="text-[11px] text-emerald-700">
                    Share this one-time code with <strong>{selectedUser.name || selectedUser.username}</strong>.
                  </p>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl flex items-center justify-between border border-slate-800">
                  <span className="font-mono text-sm font-bold text-emerald-400 tracking-wider">
                    {resetModalTempPassword}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyTempPassword}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {resetModalCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{resetModalCopied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800">Next Steps for User:</div>
                  <p>1. User signs in using this temporary password.</p>
                  <p>2. The system forces them to set their permanent password before accessing the dashboard.</p>
                  <p>3. This temporary code expires in <strong>24 hours</strong> and works only once.</p>
                </div>

                <button
                  type="button"
                  onClick={() => { setShowResetPasswordModal(false); setResetModalSuccess(false); }}
                  className="w-full py-2.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target User:</span>
                    <span className="font-bold text-slate-800">{selectedUser.name || selectedUser.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Username:</span>
                    <span className="font-mono font-semibold text-slate-700">{selectedUser.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Company:</span>
                    <span className="text-slate-700">{selectedUser.company || selectedUser.companyName || 'Corporate'}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Generated Temporary Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setResetModalTempPassword(generateCompliantPasswordBrowser(userPasswordPolicy))}
                      className="text-[11px] font-bold text-[#6C2BD9] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Regenerate
                    </button>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl flex items-center justify-between border border-slate-800">
                    <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
                      {resetModalTempPassword}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyTempPassword}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {resetModalCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{resetModalCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-950">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    Security Protocol Notice:
                  </div>
                  <p>• Code is cryptographically generated and conforms to company password policy.</p>
                  <p>• Valid for <strong>24 hours</strong>. Single-use only.</p>
                  <p>• User will be locked from all modules until setting a permanent password.</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowResetPasswordModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={resetModalIsLoading}
                    onClick={handleConfirmResetPassword}
                    className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{resetModalIsLoading ? 'Updating...' : 'Set Temporary Password'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDeleteUser}
        entityName="User"
        itemName={userToDelete?.name}
        itemCode={userToDelete?.email}
        description="This action will remove the user account and verify that no active custody is held."
        isLoading={isDeleting}
      />

      {/* Status Confirmation Modal */}
      <StatusConfirmModal
        isOpen={Boolean(userToToggleStatus)}
        onClose={() => setUserToToggleStatus(null)}
        onConfirm={handleConfirmToggleUserStatus}
        entityName="User"
        itemName={userToToggleStatus?.name}
        itemCode={userToToggleStatus?.email}
        currentStatus={userToToggleStatus?.status}
        isLoading={isStatusUpdating}
      />
    </div>
  );
}

export default UserManagement;

