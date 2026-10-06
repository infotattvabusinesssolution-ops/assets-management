import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  ChevronRight,
  ChevronDown,
  FolderTree,
  Plus,
  ArrowLeftRight,
  Eye,
  MoreVertical,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ExternalLink,
  Building,
  Settings,
  ShieldCheck,
  Cpu,
  X,
  MapPin,
  User,
  Clock,
  Box,
  Layers,
  Sparkles,
  Tag,
  DollarSign,
  Check,
  UserCheck,
  Briefcase,
  Receipt,
  Building2
} from 'lucide-react';
import { AssignCustodianModal } from '../components/modals/AssignCustodianModal';

export function AssetHierarchy() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Details'); // Details, Child Assets, Related Documents, History
  const [activeModal, setActiveModal] = useState(null); // null, ADD_CHILD, REASSIGN_PARENT
  const [modalTab, setModalTab] = useState('CREATE'); // 'CREATE' | 'ATTACH'
  const [isAssignCustodianOpen, setIsAssignCustodianOpen] = useState(false);
  
  // Master data collections
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [sites, setSites] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);

  const [toast, setToast] = useState(null);
  const [auditHistory, setAuditHistory] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loadError, setLoadError] = useState("");

  // Form states for modals
  const [childFormData, setChildFormData] = useState({ childAssetId: '' });
  const [newChildData, setNewChildData] = useState({
    name: '',
    categoryId: '',
    assetType: 'IT Equipment',
    serialNumber: '',
    tagNumber: '',
    rfidEpc: '',
    manufacturer: '',
    model: '',
    condition: 'NEW',
    criticality: 'MEDIUM',
    acquisitionValue: '',
    currency: 'USD',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyExpiry: '',
    warrantyProvider: '',
    warrantyCoverage: 'Full Parts & Labor',
    supplierName: '',
    poNumber: '',
    inheritLocation: true,
    inheritCustodian: true,
    custodianId: '',
    departmentId: '',
    costCenterId: '',
    siteId: '',
    buildingId: '',
    floorId: '',
    roomId: '',
    description: ''
  });
  const [reassignData, setReassignData] = useState({ newParentAssetId: '' });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Hierarchy Tree from Backend
  const fetchHierarchyTree = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assets/hierarchy/tree');
      if (!res?.success || !Array.isArray(res.tree)) throw new Error('Invalid hierarchy response.');
      setTreeData(res.tree);
      setLoadError('');
      const expanded = {};
      res.tree.forEach(root => { expanded[root.assetId] = true; });
      setExpandedNodes(prev => ({ ...expanded, ...prev }));
      setSelectedAssetId(previous => {
        const contains = nodes => nodes.some(n => n.assetId === previous || contains(n.children || []));
        return contains(res.tree) ? previous : (res.tree[0]?.assetId || '');
      });
    } catch (err) {
      setTreeData([]);
      setSelectedAssetId('');
      setLoadError(err?.response?.data?.message || err.message || 'Could not load hierarchy.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Audit History from Backend
  const fetchAuditHistory = async (assetId) => {
    try {
      const res = await api.get('/assets/hierarchy/history', { params: assetId ? { assetId } : {} });
      setAuditHistory(Array.isArray(res?.history) ? res.history : []);
    } catch (err) {
      setAuditHistory([]);
      showToast('error', err?.response?.data?.message || 'Could not load hierarchy history.');
    }
  };

  useEffect(() => {
    fetchHierarchyTree();
    Promise.allSettled([
      api.get('/master-data/categories'),
      api.get('/master-data/employees'),
      api.get('/master-data/departments'),
      api.get('/master-data/cost-centers'),
      api.get('/master-data/sites'),
      api.get('/master-data/buildings'),
      api.get('/master-data/floors'),
      api.get('/master-data/rooms'),
      api.get('/master-data/manufacturers')
    ]).then(([catRes, empRes, deptRes, ccRes, siteRes, bldgRes, flrRes, rmRes, mfrRes]) => {
      if (catRes.status === 'fulfilled') setCategories(catRes.value?.categories || (Array.isArray(catRes.value) ? catRes.value : []));
      if (empRes.status === 'fulfilled') setEmployees(empRes.value?.employees || (Array.isArray(empRes.value) ? empRes.value : []));
      if (deptRes.status === 'fulfilled') setDepartments(deptRes.value?.departments || (Array.isArray(deptRes.value) ? deptRes.value : []));
      if (ccRes.status === 'fulfilled') setCostCenters(ccRes.value?.costCenters || (Array.isArray(ccRes.value) ? ccRes.value : []));
      if (siteRes.status === 'fulfilled') setSites(siteRes.value?.sites || (Array.isArray(siteRes.value) ? siteRes.value : []));
      if (bldgRes.status === 'fulfilled') setBuildings(bldgRes.value?.buildings || (Array.isArray(bldgRes.value) ? bldgRes.value : []));
      if (flrRes.status === 'fulfilled') setFloors(flrRes.value?.floors || (Array.isArray(flrRes.value) ? flrRes.value : []));
      if (rmRes.status === 'fulfilled') setRooms(rmRes.value?.rooms || (Array.isArray(rmRes.value) ? rmRes.value : []));
      if (mfrRes.status === 'fulfilled') setManufacturers(mfrRes.value?.manufacturers || (Array.isArray(mfrRes.value) ? mfrRes.value : []));
    });
  }, []);

  // Find selected asset recursively
  const selectedAsset = useMemo(() => {
    const findNode = (nodes) => {
      for (const node of nodes) {
        if (node.assetId === selectedAssetId || node.id === selectedAssetId) return node;
        if (node.children && node.children.length > 0) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findNode(treeData) || null;
  }, [treeData, selectedAssetId]);

  const allNodes = useMemo(() => {
    const flatten = nodes => nodes.flatMap(node => [node, ...flatten(node.children || [])]);
    return flatten(treeData);
  }, [treeData]);
  const selectableParents = allNodes.filter(node =>
    node.assetId !== selectedAsset?.assetId &&
    !(selectedAsset?.children || []).some(child => {
      const contains = current => current.assetId === node.assetId || (current.children || []).some(contains);
      return contains(child);
    })
  );
  useEffect(() => {
    if (!selectedAsset?.id) { setDocuments([]); return; }
    let cancelled = false;
    api.get('/assets/' + selectedAsset.id + '/documents')
      .then(res => { if (!cancelled) setDocuments(Array.isArray(res?.documents) ? res.documents : []); })
      .catch(() => { if (!cancelled) setDocuments([]); });
    return () => { cancelled = true; };
  }, [selectedAsset?.id]);

  useEffect(() => { if (selectedAsset?.id) fetchAuditHistory(selectedAsset.id); else setAuditHistory([]); }, [selectedAsset?.id]);

  // Expand / Collapse Node
  const toggleNode = (nodeId) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Expand All / Collapse All
  const handleExpandAll = () => {
    const all = {};
    const collectIds = (nodes) => {
      nodes.forEach((n) => {
        all[n.assetId] = true;
        if (n.children) collectIds(n.children);
      });
    };
    collectIds(treeData);
    setExpandedNodes(all);
    showToast('info', 'Expanded all nodes in the hierarchy tree.');
  };

  const handleCollapseAll = () => {
    setExpandedNodes({});
    showToast('info', 'Collapsed all nodes in the hierarchy tree.');
  };

  // Location cascading filters
  const filteredBuildings = useMemo(() => {
    if (!newChildData.siteId) return buildings;
    return buildings.filter(b => b.siteId === newChildData.siteId);
  }, [buildings, newChildData.siteId]);

  const filteredFloors = useMemo(() => {
    if (!newChildData.buildingId) return floors;
    return floors.filter(f => f.buildingId === newChildData.buildingId);
  }, [floors, newChildData.buildingId]);

  const filteredRooms = useMemo(() => {
    if (!newChildData.floorId) return rooms;
    return rooms.filter(r => r.floorId === newChildData.floorId);
  }, [rooms, newChildData.floorId]);

  // Handle Custodian selection in Child Form
  const handleChildCustodianSelect = (empId) => {
    const selectedEmp = employees.find(e => e.id === empId);
    setNewChildData(prev => ({
      ...prev,
      custodianId: empId,
      departmentId: selectedEmp?.departmentId || prev.departmentId,
      costCenterId: selectedEmp?.costCenterId || prev.costCenterId
    }));
  };

  // Auto-generate tag for child asset
  const handleAutoGenerateTag = () => {
    const rnd = Math.floor(100000 + Math.random() * 900000);
    const parentCode = selectedAsset?.assetId || 'AST';
    setNewChildData(prev => ({
      ...prev,
      tagNumber: `TAG-${parentCode}-C${rnd}`,
      rfidEpc: `E36000${rnd}`
    }));
  };

  // Reset Child Form
  const resetChildForm = () => {
    setNewChildData({
      name: '',
      categoryId: '',
      assetType: 'IT Equipment',
      serialNumber: '',
      tagNumber: '',
      rfidEpc: '',
      manufacturer: '',
      model: '',
      condition: 'NEW',
      criticality: 'MEDIUM',
      acquisitionValue: '',
      currency: 'USD',
      purchaseDate: new Date().toISOString().split('T')[0],
      warrantyExpiry: '',
      warrantyProvider: '',
      warrantyCoverage: 'Parts & Labor',
      supplierName: '',
      poNumber: '',
      inheritLocation: true,
      inheritCustodian: true,
      custodianId: '',
      departmentId: '',
      costCenterId: '',
      siteId: '',
      buildingId: '',
      floorId: '',
      roomId: '',
      description: ''
    });
  };

  // Handle Create New Child Submit
  const handleCreateChildSubmit = async (e) => {
    e.preventDefault();
    if (!newChildData.name.trim()) {
      showToast('error', 'Child Asset Name is required.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        parentAssetId: selectedAsset.assetId || selectedAsset.id,
        name: newChildData.name.trim(),
        description: newChildData.description?.trim() || undefined,
        categoryId: newChildData.categoryId || (categories[0]?.id || selectedAsset.categoryId),
        assetType: newChildData.assetType || undefined,
        serialNumber: newChildData.serialNumber.trim() || undefined,
        tagNumber: newChildData.tagNumber.trim() || undefined,
        rfidEpc: newChildData.rfidEpc.trim() || undefined,
        manufacturer: newChildData.manufacturer.trim() || undefined,
        model: newChildData.model.trim() || undefined,
        condition: newChildData.condition,
        criticality: newChildData.criticality,
        acquisitionValue: newChildData.acquisitionValue ? Number(newChildData.acquisitionValue) : 0,
        currency: newChildData.currency || 'USD',
        purchaseDate: newChildData.purchaseDate || undefined,
        warrantyExpiry: newChildData.warrantyExpiry || undefined,
        warrantyProvider: newChildData.warrantyProvider?.trim() || undefined,
        warrantyCoverage: newChildData.warrantyCoverage || undefined,
        supplierName: newChildData.supplierName?.trim() || undefined,
        poNumber: newChildData.poNumber?.trim() || undefined,
        inheritLocation: newChildData.inheritLocation,
        inheritCustodian: newChildData.inheritCustodian,
        custodianId: !newChildData.inheritCustodian ? (newChildData.custodianId || undefined) : undefined,
        departmentId: !newChildData.inheritCustodian ? (newChildData.departmentId || undefined) : undefined,
        costCenterId: !newChildData.inheritCustodian ? (newChildData.costCenterId || undefined) : undefined,
        siteId: !newChildData.inheritLocation ? (newChildData.siteId || undefined) : undefined,
        buildingId: !newChildData.inheritLocation ? (newChildData.buildingId || undefined) : undefined,
        floorId: !newChildData.inheritLocation ? (newChildData.floorId || undefined) : undefined,
        roomId: !newChildData.inheritLocation ? (newChildData.roomId || undefined) : undefined
      };

      const res = await api.post('/assets/hierarchy/create-child', payload);
      showToast('success', res?.message || `Child asset created under [${selectedAsset.assetId}]!`);
      setActiveModal(null);
      resetChildForm();
      await fetchHierarchyTree();
      if (selectedAsset?.id) await fetchAuditHistory(selectedAsset.id);
      setExpandedNodes((prev) => ({ ...prev, [selectedAsset.assetId]: true }));
      if (res?.asset?.assetId) {
        setSelectedAssetId(res.asset.assetId);
        setActiveTab('Details');
      }
    } catch (err) {
      showToast('error', err?.response?.data?.message || err?.message || 'Failed to create child asset.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Attach Existing Child Submit
  const handleAddChildSubmit = async (e) => {
    e.preventDefault();
    if (!childFormData.childAssetId) {
      showToast('error', 'Please select a Child Asset.');
      return;
    }

    if (childFormData.childAssetId === selectedAsset.assetId) {
      showToast('error', 'Validation Error: An asset cannot be added as a child of itself.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/assets/hierarchy/add-child', {
        parentAssetId: selectedAsset.assetId,
        childAssetId: childFormData.childAssetId
      });
      showToast('success', res?.message || `Child asset ${childFormData.childAssetId} attached under ${selectedAsset.assetId}!`);
      setActiveModal(null);
      setChildFormData({ childAssetId: '' });
      await fetchHierarchyTree();
      await fetchAuditHistory(selectedAsset.id);
      setExpandedNodes((prev) => ({ ...prev, [selectedAsset.assetId]: true }));
    } catch (err) {
      showToast('error', err?.response?.data?.message || err?.message || 'Failed to attach child asset.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Reassign Parent Submit
  const handleReassignParentSubmit = async (e) => {
    e.preventDefault();
    const newParentId = reassignData.newParentAssetId;

    if (!newParentId) return showToast('error', 'Select a parent asset.');
    if (newParentId === selectedAsset.assetId) {
      showToast('error', 'Validation Error: An asset cannot be assigned as its own parent.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/assets/hierarchy/assign-parent', {
        assetId: selectedAsset.assetId,
        parentAssetId: newParentId
      });
      showToast('success', res?.message || `Successfully reassigned ${selectedAsset.assetId} under new parent ${newParentId}!`);
      setActiveModal(null);
      await fetchHierarchyTree();
      await fetchAuditHistory(selectedAsset.id);
      if (newParentId) {
        setExpandedNodes((prev) => ({ ...prev, [newParentId]: true }));
      }
    } catch (err) {
      showToast('error', err?.response?.data?.message || err?.message || 'Failed to reassign parent asset.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Detach from Parent
  const handleRemoveParent = async () => {
    if (!selectedAsset.parentAssetId) return;
    try {
      setLoading(true);
      const res = await api.delete(`/assets/hierarchy/${selectedAsset.assetId}/remove-parent`);
      showToast('success', res?.message || `Removed parent relationship for [${selectedAsset.assetId}].`);
      await fetchHierarchyTree();
      await fetchAuditHistory(selectedAsset.id);
    } catch (err) {
      showToast('error', err?.response?.data?.message || err?.message || 'Failed to detach from parent.');
    } finally {
      setLoading(false);
    }
  };

  // Render Recursive Tree Node
  const renderTreeNode = (node) => {
    const isExpanded = expandedNodes[node.assetId];
    const isSelected = selectedAssetId === node.assetId;
    const hasChildren = node.children && node.children.length > 0;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches = current => current.assetId.toLowerCase().includes(q) ||
        current.name.toLowerCase().includes(q) || (current.children || []).some(matches);
      if (!matches(node)) return null;
    }

    return (
      <div key={node.assetId} className="select-none">
        <div
          onClick={() => setSelectedAssetId(node.assetId)}
          className={`flex items-center justify-between py-2 px-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            isSelected
              ? 'bg-purple-100 text-[#6C2BD9] border border-purple-300 shadow-2xs font-extrabold'
              : 'hover:bg-slate-100/80 text-slate-700 border border-transparent'
          }`}
          style={{ paddingLeft: `${(node.level - 1) * 16 + 10}px` }}
        >
          <div className="flex items-center gap-2 truncate">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(node.assetId);
                }}
                className="p-0.5 hover:bg-purple-200/60 rounded text-slate-500 cursor-pointer shrink-0"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-600" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
              </button>
            ) : (
              <span className="w-3.5 h-3.5 inline-block shrink-0" />
            )}

            {node.level === 1 && <Building className="w-4 h-4 text-[#6C2BD9] shrink-0" />}
            {node.level === 2 && <Cpu className="w-4 h-4 text-[#6C2BD9] shrink-0" />}
            {node.level === 3 && <Settings className="w-4 h-4 text-slate-500 shrink-0" />}

            <span className="font-mono font-bold text-xs text-slate-900 tracking-normal shrink-0">{node.assetId}</span>
            <span className="truncate text-slate-700 font-medium text-xs tracking-normal">{node.name}</span>
          </div>

          {hasChildren && (
            <span className="px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-[10px] font-extrabold shrink-0 ml-2">
              {node.children.length}
            </span>
          )}
        </div>

        {hasChildren && (isExpanded || searchQuery) && (
          <div className="space-y-0.5 mt-0.5">
            {node.children.map((child) => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-5 pb-12 font-sans antialiased text-slate-900 select-none">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 backdrop-blur-md transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : toast.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-800'
              : 'bg-purple-50 border-purple-300 text-purple-900'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Top Header & Breadcrumbs matching Screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <span className="font-bold text-[#6C2BD9]">Assets</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-700">Asset Hierarchy</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Asset Hierarchy</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Define and manage parent-child relationships between assets
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets in hierarchy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#6C2BD9]/20 w-48 sm:w-60"
            />
          </div>

          <button
            type="button"
            onClick={() => { setModalTab('CREATE'); setActiveModal('ADD_CHILD'); }}
            disabled={!selectedAsset}
            className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Child Asset
          </button>

          <button
            type="button"
            onClick={() => { setReassignData({ newParentAssetId: '' }); setActiveModal('REASSIGN_PARENT'); }}
            disabled={!selectedAsset}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#6C2BD9]" /> Reassign Parent
          </button>

          <button
            type="button"
            onClick={() => setIsAssignCustodianOpen(true)}
            disabled={!selectedAsset}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#6C2BD9]" /> Assign Custodian
          </button>

          {selectedAsset?.parentAssetId && (
            <button
              type="button"
              onClick={handleRemoveParent}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold rounded-xl text-xs flex items-center gap-1 border border-rose-200 shadow-2xs transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-rose-600" /> Detach Parent
            </button>
          )}

          <button
            type="button"
            disabled={!selectedAsset}
            onClick={() => navigate(`/assets/${selectedAsset.id || selectedAsset.assetId}`)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-[#6C2BD9] font-extrabold rounded-xl text-xs flex items-center gap-1.5 border border-purple-200 shadow-2xs transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#6C2BD9]" /> View Asset 360°
          </button>


        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Column: Asset Hierarchy Tree (4 cols) */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 flex flex-col justify-between min-h-[580px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-[#6C2BD9]" /> Asset Hierarchy Tree
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] rounded-lg cursor-pointer"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-[10px] rounded-lg cursor-pointer"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Tree Nodes List */}
            <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
              {treeData.map((node) => renderTreeNode(node))}
              {!treeData.length && <div className="p-5 text-center text-xs text-slate-500">{loadError || (loading ? "Loading assets..." : "No assets found.")}</div>}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-semibold flex items-center justify-between">
            <span>Level 1: System | Level 2: Equipment | Level 3: Component</span>
          </div>
        </div>

        {/* Right Column: Selected Asset Details (8 cols) */}
        {selectedAsset ? <div className="md:col-span-8 space-y-4">
          {/* Header Card matching Screenshot */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                {/* Icon Box fallback instead of broken img */}
                <div className="w-16 h-16 rounded-2xl border border-purple-100 bg-purple-50 text-[#6C2BD9] flex items-center justify-center shrink-0 shadow-2xs font-bold">
                  <Cpu className="w-8 h-8 text-[#6C2BD9]" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-black text-[#6C2BD9] text-base">
                      {selectedAsset.assetId}
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {selectedAsset.status}
                    </span>
                    <span className="px-2.5 py-0.5 bg-purple-100 text-[#6C2BD9] rounded-full text-[10px] font-extrabold">
                      {selectedAsset.levelName || 'Child Asset'}
                    </span>
                  </div>

                  <h2 className="text-xl font-black text-slate-900">{selectedAsset.name}</h2>
                </div>
              </div>

              {/* Right Summary Metadata Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs lg:border-l lg:border-slate-100 lg:pl-5">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Category</span>
                  <span className="font-bold text-slate-800">{selectedAsset.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Location</span>
                  <span className="font-bold text-slate-800">{selectedAsset.location}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Custodian</span>
                  <span className="font-bold text-slate-800">{selectedAsset.custodian}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Condition</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {selectedAsset.condition}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 font-bold text-xs">
              {[
                'Details',
                `Child Assets (${selectedAsset.children?.length || 0})`,
                'Related Documents',
                'History'
              ].map((tab) => {
                const tabKey = tab.split(' ')[0];
                const isActive = activeTab === tabKey;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tabKey)}
                    className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                      isActive
                        ? 'border-[#6C2BD9] text-[#6C2BD9] font-extrabold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Details Grid matching Screenshot */}
            {activeTab === 'Details' && (
              <div className="space-y-4 pt-1 text-xs">
                {/* 1. Custody & Ownership Card */}
                <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                    <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#6C2BD9]" /> Ownership & Custody Details
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAssignCustodianOpen(true)}
                      className="px-2.5 py-1 bg-white hover:bg-purple-100/70 text-[#6C2BD9] border border-purple-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Reassign Custodian
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-400 font-bold block mb-0.5">Assigned Custodian</span>
                      <span className="font-bold text-slate-900 block text-xs">
                        {selectedAsset.custodian} {selectedAsset.custodianCode ? `[${selectedAsset.custodianCode}]` : ''}
                      </span>
                      {selectedAsset.custodianEmail && (
                        <span className="text-[10px] text-slate-400 font-mono block">{selectedAsset.custodianEmail}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-bold block mb-0.5">Department</span>
                      <span className="font-bold text-slate-800 text-xs block">{selectedAsset.department || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-bold block mb-0.5">Cost Center</span>
                      <span className="font-bold text-slate-800 text-xs block">{selectedAsset.costCenter || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Core 2-Column Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  {/* Left Column: Identifiers & Technical Specs */}
                  <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2.5">
                    <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
                      <Cpu className="w-4 h-4 text-[#6C2BD9]" /> Technical & Identification
                    </span>
                    <div className="space-y-2 pt-0.5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500 font-medium">Asset ID</span>
                        <span className="font-mono font-bold text-[#6C2BD9]">{selectedAsset.assetId}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500 font-medium">Asset Name</span>
                        <span className="font-bold text-slate-900">{selectedAsset.name}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500 font-medium">Category</span>
                        <span className="font-semibold text-slate-800">{selectedAsset.category}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500 font-medium">Manufacturer / Brand</span>
                        <span className="font-semibold text-slate-800">{selectedAsset.manufacturer}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500 font-medium">Model / Part No</span>
                        <span className="font-semibold text-slate-800">{selectedAsset.model}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500 font-medium">Serial Number</span>
                        <span className="font-mono font-semibold text-slate-700">{selectedAsset.serialNumber}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500 font-medium">Tag / Barcode</span>
                        <span className="font-mono font-bold text-slate-800">{selectedAsset.barcode || selectedAsset.tagNumber}</span>
                      </div>
                      <div className="flex items-center justify-between pb-0.5">
                        <span className="text-slate-500 font-medium">Condition & Criticality</span>
                        <span className="font-bold text-emerald-700">
                          {selectedAsset.condition} • {selectedAsset.criticality}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Hierarchy Position & Physical Location */}
                  <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2.5">
                    <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
                      <MapPin className="w-4 h-4 text-[#6C2BD9]" /> Location & Hierarchy Position
                    </span>
                    <div className="space-y-2 pt-0.5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500 font-medium">Parent Asset</span>
                        <span className="font-bold text-[#6C2BD9] flex items-center gap-1">
                          {selectedAsset.parentAssetId
                            ? `${selectedAsset.parentAssetId} (${selectedAsset.parentAssetName || 'Parent'})`
                            : 'Root System (No Parent)'}
                          {selectedAsset.parentAssetId && <ExternalLink className="w-3.5 h-3.5" />}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500 font-medium">Hierarchy Tier</span>
                        <span className="font-bold text-slate-800">
                          Level {selectedAsset.level} ({selectedAsset.levelName})
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500 font-medium">Site / Campus</span>
                        <span className="font-semibold text-slate-800">{selectedAsset.siteName || selectedAsset.location}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500 font-medium">Building</span>
                        <span className="font-semibold text-slate-800">{selectedAsset.buildingName || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500 font-medium">Floor & Room</span>
                        <span className="font-semibold text-slate-800">
                          {selectedAsset.floorName || '-'} {selectedAsset.roomName ? `• ${selectedAsset.roomName}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500 font-medium">Direct Child Assets</span>
                        <span className="font-bold text-[#6C2BD9]">{selectedAsset.children?.length || 0} Components</span>
                      </div>
                      <div className="flex items-center justify-between pb-0.5">
                        <span className="text-slate-500 font-medium">Total Descendants</span>
                        <span className="font-bold text-slate-800">{selectedAsset.totalDescendantCount || 0} Nodes</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Procurement & Financials Card */}
                <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2.5">
                  <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <DollarSign className="w-4 h-4 text-[#6C2BD9]" /> Procurement & Financial Attributes
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-0.5">
                    <div>
                      <span className="text-[11px] text-slate-400 font-bold block mb-0.5">Acquisition Value</span>
                      <span className="font-bold text-slate-900">
                        {selectedAsset.acquisitionValue ? `${selectedAsset.currency} ${Number(selectedAsset.acquisitionValue).toLocaleString()}` : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-bold block mb-0.5">Purchase Date</span>
                      <span className="font-mono font-semibold text-slate-800">{selectedAsset.purchaseDate}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-bold block mb-0.5">Supplier / Vendor</span>
                      <span className="font-semibold text-slate-800">{selectedAsset.supplierName || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-bold block mb-0.5">PO / Invoice Number</span>
                      <span className="font-mono font-semibold text-slate-800">{selectedAsset.poNumber || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-bold block mb-0.5">Warranty Expiry</span>
                      <span className="font-mono font-semibold text-slate-800">{selectedAsset.warrantyExpiry}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-bold block mb-0.5">Warranty Provider</span>
                      <span className="font-semibold text-slate-800">{selectedAsset.warrantyProvider || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-bold block mb-0.5">Hierarchy Value Rollup</span>
                      <span className="font-extrabold text-[#6C2BD9]">
                        {selectedAsset.totalAcquisitionValue ? `${selectedAsset.currency} ${Number(selectedAsset.totalAcquisitionValue).toLocaleString()}` : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-bold block mb-0.5">Lifecycle Status</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] inline-block">
                        {selectedAsset.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Child Assets */}
            {activeTab === 'Child' && (
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                    <FolderTree className="w-4 h-4 text-[#6C2BD9]" />
                    Direct Child Components ({selectedAsset.children?.length || 0})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setModalTab('CREATE'); setActiveModal('ADD_CHILD'); }}
                      className="px-3 py-1.5 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create Child Asset
                    </button>
                    <button
                      type="button"
                      onClick={() => { setModalTab('ATTACH'); setActiveModal('ADD_CHILD'); }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#6C2BD9]" /> Attach Existing
                    </button>
                  </div>
                </div>

                {selectedAsset.children && selectedAsset.children.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-auto max-h-[350px]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] shadow-2xs">
                        <tr>
                          <th className="p-3">Asset ID</th>
                          <th className="p-3">Child Name</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Serial No</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                        {selectedAsset.children.map((child) => (
                          <tr key={child.assetId} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-[#6C2BD9]">{child.assetId}</td>
                            <td className="p-3 font-bold text-slate-900">{child.name}</td>
                            <td className="p-3 text-slate-600">{child.category}</td>
                            <td className="p-3 font-mono text-slate-500">{child.serialNumber || 'N/A'}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                                {child.status || 'Active'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setSelectedAssetId(child.assetId)}
                                className="px-2.5 py-1 bg-purple-50 text-[#6C2BD9] hover:bg-purple-100 rounded-lg text-[11px] font-bold cursor-pointer"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6C2BD9] mx-auto flex items-center justify-center font-bold">
                      <FolderTree className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">No Child Components Registered Yet</p>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-0.5">
                        Break down this asset into modular sub-components, assemblies, or parts.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => { setModalTab('CREATE'); setActiveModal('ADD_CHILD'); }}
                        className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Create First Child Asset
                      </button>
                      <button
                        type="button"
                        onClick={() => { setModalTab('ATTACH'); setActiveModal('ADD_CHILD'); }}
                        className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#6C2BD9]" /> Attach Existing
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Related Documents */}
            {activeTab === 'Related' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                {documents.length ? documents.map(doc => (
                  <a key={doc.id} href={doc.url} target="_blank" rel="noreferrer" className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-purple-300">
                    <FileText className="w-6 h-6 text-[#6C2BD9]" />
                    <span className="font-extrabold text-slate-900 block break-all">{doc.name}</span>
                    <span className="text-[10px] text-slate-400">{doc.type} {doc.size && '(' + doc.size + ')'}</span>
                  </a>
                )) : <div className="col-span-3 p-5 text-center text-slate-500">No documents attached to this asset.</div>}
              </div>
            )}

            {/* Tab 4: History */}
            {activeTab === 'History' && (
              <div className="space-y-3 pt-1">
                <div className="border border-slate-200 rounded-xl overflow-auto max-h-[350px] text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] shadow-2xs">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Previous Parent</th>
                        <th className="p-3">New Parent</th>
                        <th className="p-3">User</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                      {auditHistory.filter(item => item.entityId === selectedAsset.id || item.entityId === selectedAsset.assetId).length > 0 ? (
                        auditHistory.filter(item => item.entityId === selectedAsset.id || item.entityId === selectedAsset.assetId).map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td className="p-3 font-mono text-slate-500">{item.timestamp}</td>
                            <td className="p-3 text-slate-500 font-mono">{allNodes.find(node => node.id === item.previousParent)?.assetId || item.previousParent || "None"}</td>
                            <td className="p-3 font-mono text-[#6C2BD9] font-bold truncate max-w-xs">{item.newParent || "None"}</td>
                            <td className="p-3 text-slate-700">{item.user}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  item.action.includes('ADD')
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : item.action.includes('REMOVE')
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {item.action.replace('ASSET_HIERARCHY_', '').replace(/_/g, ' ')}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : <tr><td colSpan={5} className="p-5 text-center text-slate-500">No hierarchy changes recorded for this asset.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div> : <div className="md:col-span-8 bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs">{loadError || "Select an asset to view details."}</div>}
      </div>

      {/* Add / Create Child Asset Modal */}
      {activeModal === 'ADD_CHILD' && selectedAsset && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 text-xs max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6C2BD9] flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">Add Child Component</h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Configure modular sub-assets and attributes under {selectedAsset.assetId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setModalTab('CREATE')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modalTab === 'CREATE'
                    ? 'bg-white text-[#6C2BD9] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Create New Child Asset
              </button>
              <button
                type="button"
                onClick={() => setModalTab('ATTACH')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modalTab === 'ATTACH'
                    ? 'bg-white text-[#6C2BD9] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Attach Existing Asset
              </button>
            </div>

            {/* Parent Asset Context Banner */}
            <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
              <div>
                <span className="text-[10px] font-bold text-purple-700 block uppercase tracking-wider">Target Parent Node</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono font-extrabold text-[#6C2BD9] text-xs">{selectedAsset.assetId}</span>
                  <span className="font-bold text-slate-900 text-xs">— {selectedAsset.name}</span>
                </div>
              </div>
              <div className="text-left sm:text-right text-[11px] text-slate-600 font-medium">
                <span className="block text-slate-500">{selectedAsset.location || 'Location Default'}</span>
                <span className="text-slate-400 font-semibold">{selectedAsset.custodian || 'Custodian Default'} ({selectedAsset.department || 'Default Dept'})</span>
              </div>
            </div>

            {/* Modal Body: CREATE Form */}
            {modalTab === 'CREATE' && (
              <form onSubmit={handleCreateChildSubmit} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
                  
                  {/* Section 1: Basic Information */}
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">1. Basic Information</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-slate-700 font-bold mb-1">Child Asset Name / Description *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Compressor Unit 2, 64GB RAM Module, Server Fan Assembly"
                          value={newChildData.name}
                          onChange={(e) => setNewChildData({ ...newChildData, name: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#6C2BD9]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Category *</label>
                        <select
                          required
                          value={newChildData.categoryId}
                          onChange={(e) => setNewChildData({ ...newChildData, categoryId: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-[#6C2BD9]"
                        >
                          <option value="">Select Category</option>
                          {categories.map((c) => (
                            <option key={c.id || c.code} value={c.id || c.code}>
                              {c.name || c.code}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Asset Class / Type</label>
                        <select
                          value={newChildData.assetType}
                          onChange={(e) => setNewChildData({ ...newChildData, assetType: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                        >
                          <option value="IT Equipment">IT Equipment</option>
                          <option value="Machinery & Plant">Machinery & Plant</option>
                          <option value="HVAC & Utilities">HVAC & Utilities</option>
                          <option value="Hardware Component">Hardware Component</option>
                          <option value="Electrical System">Electrical System</option>
                          <option value="Furniture & Fixture">Furniture & Fixture</option>
                          <option value="Peripherals & Accessories">Peripherals & Accessories</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Serial Number</label>
                        <input
                          type="text"
                          placeholder="e.g. SN-998234-A"
                          value={newChildData.serialNumber}
                          onChange={(e) => setNewChildData({ ...newChildData, serialNumber: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-medium text-slate-800 focus:bg-white focus:border-[#6C2BD9]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-700 font-bold">Tag Number / Barcode</label>
                          <button
                            type="button"
                            onClick={handleAutoGenerateTag}
                            className="text-[10px] text-[#6C2BD9] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3" /> Auto-Generate
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. TAG-AST-00121-C1"
                          value={newChildData.tagNumber}
                          onChange={(e) => setNewChildData({ ...newChildData, tagNumber: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-[#6C2BD9] focus:bg-white focus:border-[#6C2BD9]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Technical Specifications & Condition */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">2. Specifications & Condition</span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Manufacturer / Brand</label>
                        <input
                          type="text"
                          placeholder="e.g. Dell, Carrier, Samsung"
                          list="mfr-suggestions"
                          value={newChildData.manufacturer}
                          onChange={(e) => setNewChildData({ ...newChildData, manufacturer: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-[#6C2BD9]"
                        />
                        <datalist id="mfr-suggestions">
                          {manufacturers.map(m => <option key={m.id} value={m.name} />)}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Model / Part Number</label>
                        <input
                          type="text"
                          placeholder="e.g. CR-06D, DDR4-3200"
                          value={newChildData.model}
                          onChange={(e) => setNewChildData({ ...newChildData, model: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-[#6C2BD9]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Asset Condition</label>
                        <select
                          value={newChildData.condition}
                          onChange={(e) => setNewChildData({ ...newChildData, condition: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                        >
                          <option value="NEW">New</option>
                          <option value="GOOD">Good / Working</option>
                          <option value="FAIR">Fair / Needs Inspection</option>
                          <option value="DAMAGED">Damaged / Non-operational</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Criticality</label>
                        <select
                          value={newChildData.criticality}
                          onChange={(e) => setNewChildData({ ...newChildData, criticality: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical Component</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Custody & Ownership (Custodian, Department, Cost Center) */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                        <User className="w-3.5 h-3.5 text-[#6C2BD9]" /> 3. Custody & Ownership
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                        <input
                          type="checkbox"
                          checked={newChildData.inheritCustodian}
                          onChange={(e) => setNewChildData({ ...newChildData, inheritCustodian: e.target.checked })}
                          className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                        />
                        <span>Inherit from Parent ({selectedAsset.custodian || 'Parent'} • {selectedAsset.department || 'Dept'})</span>
                      </label>
                    </div>

                    {!newChildData.inheritCustodian ? (
                      <div className="p-3 bg-purple-50/40 border border-purple-100 rounded-xl space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Assigned Custodian *</label>
                            <select
                              value={newChildData.custodianId}
                              onChange={(e) => handleChildCustodianSelect(e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#6C2BD9]"
                            >
                              <option value="">Unassigned</option>
                              {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                  {emp.employeeCode ? `[${emp.employeeCode}] ` : ''}{emp.fullName} {emp.department?.name ? `(${emp.department.name})` : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Department</label>
                            <select
                              value={newChildData.departmentId}
                              onChange={(e) => setNewChildData({ ...newChildData, departmentId: e.target.value })}
                              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#6C2BD9]"
                            >
                              <option value="">Select Department</option>
                              {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name} {d.code ? `(${d.code})` : ''}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Cost Center</label>
                            <select
                              value={newChildData.costCenterId}
                              onChange={(e) => setNewChildData({ ...newChildData, costCenterId: e.target.value })}
                              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#6C2BD9]"
                            >
                              <option value="">Select Cost Center</option>
                              {costCenters.map(cc => (
                                <option key={cc.id} value={cc.id}>{cc.name} {cc.code ? `(${cc.code})` : ''}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
                        <span>Auto-inheriting custody from parent:</span>
                        <span className="font-bold text-slate-800">{selectedAsset.custodian} • {selectedAsset.department}</span>
                      </div>
                    )}
                  </div>

                  {/* Section 4: Physical Location (Site, Building, Floor, Room) */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5 text-[#6C2BD9]" /> 4. Physical Location & Placement
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                        <input
                          type="checkbox"
                          checked={newChildData.inheritLocation}
                          onChange={(e) => setNewChildData({ ...newChildData, inheritLocation: e.target.checked })}
                          className="rounded border-slate-300 text-[#6C2BD9] focus:ring-[#6C2BD9]"
                        />
                        <span>Inherit from Parent ({selectedAsset.location || 'Parent Site'})</span>
                      </label>
                    </div>

                    {!newChildData.inheritLocation ? (
                      <div className="p-3 bg-purple-50/40 border border-purple-100 rounded-xl space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Site / Campus</label>
                            <select
                              value={newChildData.siteId}
                              onChange={(e) => setNewChildData({ ...newChildData, siteId: e.target.value, buildingId: '', floorId: '', roomId: '' })}
                              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#6C2BD9]"
                            >
                              <option value="">Select Site</option>
                              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Building</label>
                            <select
                              value={newChildData.buildingId}
                              onChange={(e) => setNewChildData({ ...newChildData, buildingId: e.target.value, floorId: '', roomId: '' })}
                              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#6C2BD9]"
                            >
                              <option value="">Select Building</option>
                              {filteredBuildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Floor</label>
                            <select
                              value={newChildData.floorId}
                              onChange={(e) => setNewChildData({ ...newChildData, floorId: e.target.value, roomId: '' })}
                              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#6C2BD9]"
                            >
                              <option value="">Select Floor</option>
                              {filteredFloors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Room / Area</label>
                            <select
                              value={newChildData.roomId}
                              onChange={(e) => setNewChildData({ ...newChildData, roomId: e.target.value })}
                              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#6C2BD9]"
                            >
                              <option value="">Select Room</option>
                              {filteredRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
                        <span>Auto-inheriting location from parent:</span>
                        <span className="font-bold text-slate-800">{selectedAsset.location || 'Parent Site & Room'}</span>
                      </div>
                    )}
                  </div>

                  {/* Section 5: Procurement & Financials */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">5. Procurement & Financials</span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Acquisition Cost</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newChildData.acquisitionValue}
                          onChange={(e) => setNewChildData({ ...newChildData, acquisitionValue: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Currency</label>
                        <select
                          value={newChildData.currency}
                          onChange={(e) => setNewChildData({ ...newChildData, currency: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="AED">AED (د.إ)</option>
                          <option value="SAR">SAR (﷼)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Purchase Date</label>
                        <input
                          type="date"
                          value={newChildData.purchaseDate}
                          onChange={(e) => setNewChildData({ ...newChildData, purchaseDate: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">PO / Invoice Number</label>
                        <input
                          type="text"
                          placeholder="e.g. PO-2026-9041"
                          value={newChildData.poNumber}
                          onChange={(e) => setNewChildData({ ...newChildData, poNumber: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Supplier / Vendor</label>
                        <input
                          type="text"
                          placeholder="e.g. Dell Middle East, Carrier Solutions"
                          value={newChildData.supplierName}
                          onChange={(e) => setNewChildData({ ...newChildData, supplierName: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Warranty Expiry Date</label>
                        <input
                          type="date"
                          value={newChildData.warrantyExpiry}
                          onChange={(e) => setNewChildData({ ...newChildData, warrantyExpiry: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Warranty Provider / OEM</label>
                        <input
                          type="text"
                          placeholder="e.g. Dell ProSupport, Carrier Care"
                          value={newChildData.warrantyProvider}
                          onChange={(e) => setNewChildData({ ...newChildData, warrantyProvider: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 6: Additional Notes */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <label className="block text-slate-700 font-bold">Additional Notes / Technical Description</label>
                    <textarea
                      rows={2}
                      placeholder="Optional notes regarding installation, warranty terms, or hardware specifications..."
                      value={newChildData.description}
                      onChange={(e) => setNewChildData({ ...newChildData, description: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    />
                  </div>

                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Child...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Create & Attach Child Asset</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Modal Body: ATTACH Form */}
            {modalTab === 'ATTACH' && (
              <form onSubmit={handleAddChildSubmit} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Select Existing Asset to Attach as Child *</label>
                    <select
                      required
                      value={childFormData.childAssetId}
                      onChange={(e) => setChildFormData({ childAssetId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 cursor-pointer"
                    >
                      <option value="">Select an existing asset</option>
                      {selectableParents.map((asset) => (
                        <option key={asset.id} value={asset.assetId}>
                          {asset.assetId} — {asset.name} ({asset.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-medium">
                    <strong>Note:</strong> Linking an existing asset updates its structural parent hierarchy reference. Physical location and custodian remain governed by asset movement policies unless transferred.
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {loading ? 'Attaching...' : 'Attach Child Asset'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {activeModal === 'REASSIGN_PARENT' && selectedAsset && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleReassignParentSubmit}
            className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-[#6C2BD9]" /> Reassign Parent Asset
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-2.5 bg-purple-50 border border-purple-100 rounded-xl text-purple-900">
                <span className="font-extrabold block">Asset to Reassign:</span>
                <span className="font-mono font-bold text-[#6C2BD9]">{selectedAsset.assetId}</span> - {selectedAsset.name}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Select New Parent Node *</label>
                <select
                  value={reassignData.newParentAssetId}
                  onChange={(e) => setReassignData({ newParentAssetId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-pointer"
                >
                  <option value="">Select an asset</option>
                  {selectableParents.map(asset => <option key={asset.id} value={asset.assetId}>{asset.assetId} - {asset.name}</option>)}
                </select>
              </div>

              <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-[11px] text-purple-900 space-y-1">
                <span className="font-extrabold block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#6C2BD9]" /> Backend Validation Rules:
                </span>
                <ul className="list-disc list-inside text-[10px] space-y-0.5 text-slate-700">
                  <li>Prevents self-assignment ({selectedAsset.assetId} &rarr; {selectedAsset.assetId})</li>
                  <li>Prevents circular loops ({selectedAsset.assetId} &rarr; Sub-child &rarr; {selectedAsset.assetId})</li>
                  <li>Preserves custodian, site, and financial book value</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl shadow-xs cursor-pointer"
              >
                Save Reassignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assign Custodian Modal */}
      {isAssignCustodianOpen && selectedAsset && (
        <AssignCustodianModal
          isOpen={isAssignCustodianOpen}
          onClose={() => setIsAssignCustodianOpen(false)}
          asset={selectedAsset}
          onAssigned={() => {
            setIsAssignCustodianOpen(false);
            showToast('success', 'Custodian assigned successfully!');
            fetchHierarchyTree();
          }}
        />
      )}
    </div>
  );
}

export default AssetHierarchy;
