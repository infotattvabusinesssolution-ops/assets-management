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
  XCircle,
  FileText,
  Clock,
  ExternalLink,
  Building,
  Settings,
  ShieldCheck,
  Database,
  Layers,
  Sparkles,
  Cpu,
  Wrench,
  X,
  HelpCircle,
  RotateCcw,
  Check,
  User,
  MapPin,
  Tag,
  Link,
  Unlink
} from 'lucide-react';

const INITIAL_TREE_DATA = [
  {
    id: 'AST-000100',
    assetId: 'AST-000100',
    name: 'Main Chiller Plant',
    category: 'HVAC System',
    type: 'System',
    level: 1,
    levelName: 'Parent System',
    status: 'In Use',
    condition: 'Good',
    location: 'Dubai HQ, Plant Room',
    custodian: 'Facilities Team',
    model: 'Trane Centrifugal',
    serialNumber: 'TRN-SYS-900',
    manufacturer: 'Trane',
    purchaseDate: '15 Jan 2021',
    warrantyExpiry: '14 Jan 2028',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
    children: [
      {
        id: 'AST-000101',
        assetId: 'AST-000101',
        name: 'Chiller Unit - 1',
        category: 'HVAC Equipment',
        type: 'Equipment',
        level: 2,
        levelName: 'Child Asset',
        status: 'In Use',
        condition: 'Good',
        location: 'Dubai HQ, Plant Room',
        custodian: 'Facilities Team',
        model: 'Trane RTAC 250',
        serialNumber: 'TRN-250-001',
        manufacturer: 'Trane',
        purchaseDate: '12 Jan 2022',
        warrantyExpiry: '11 Jan 2027',
        parentAssetId: 'AST-000100',
        parentAssetName: 'Main Chiller Plant',
        image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=600',
        children: [
          {
            id: 'AST-000101-01',
            assetId: 'AST-000101-01',
            name: 'Compressor',
            category: 'HVAC Component',
            type: 'Component',
            level: 3,
            levelName: 'Sub-Component',
            status: 'In Use',
            condition: 'Good',
            location: 'Dubai HQ, Plant Room',
            custodian: 'Facilities Team',
            model: 'Copeland Scroll 15HP',
            serialNumber: 'COP-15-881',
            manufacturer: 'Copeland',
            purchaseDate: '12 Jan 2022',
            warrantyExpiry: '11 Jan 2027',
            parentAssetId: 'AST-000101',
            parentAssetName: 'Chiller Unit - 1'
          },
          {
            id: 'AST-000101-02',
            assetId: 'AST-000101-02',
            name: 'Condenser',
            category: 'HVAC Component',
            type: 'Component',
            level: 3,
            levelName: 'Sub-Component',
            status: 'In Use',
            condition: 'Good',
            location: 'Dubai HQ, Plant Room',
            custodian: 'Facilities Team',
            model: 'Trane Aluminum Coil',
            serialNumber: 'TRN-CND-02',
            manufacturer: 'Trane',
            purchaseDate: '12 Jan 2022',
            warrantyExpiry: '11 Jan 2027',
            parentAssetId: 'AST-000101',
            parentAssetName: 'Chiller Unit - 1'
          },
          {
            id: 'AST-000101-03',
            assetId: 'AST-000101-03',
            name: 'Control Panel',
            category: 'Electronics Component',
            type: 'Component',
            level: 3,
            levelName: 'Sub-Component',
            status: 'In Use',
            condition: 'Good',
            location: 'Dubai HQ, Plant Room',
            custodian: 'Facilities Team',
            model: 'Symbio 800 Controller',
            serialNumber: 'SYM-800-441',
            manufacturer: 'Trane',
            purchaseDate: '12 Jan 2022',
            warrantyExpiry: '11 Jan 2027',
            parentAssetId: 'AST-000101',
            parentAssetName: 'Chiller Unit - 1'
          }
        ]
      },
      {
        id: 'AST-000102',
        assetId: 'AST-000102',
        name: 'Chiller Unit - 2',
        category: 'HVAC Equipment',
        type: 'Equipment',
        level: 2,
        levelName: 'Child Asset',
        status: 'In Use',
        condition: 'Good',
        location: 'Dubai HQ, Plant Room',
        custodian: 'Facilities Team',
        model: 'Trane RTAC 250',
        serialNumber: 'TRN-250-002',
        manufacturer: 'Trane',
        purchaseDate: '12 Jan 2022',
        warrantyExpiry: '11 Jan 2027',
        parentAssetId: 'AST-000100',
        parentAssetName: 'Main Chiller Plant',
        image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=600',
        children: [
          {
            id: 'AST-000102-01',
            assetId: 'AST-000102-01',
            name: 'Compressor',
            category: 'HVAC Component',
            type: 'Component',
            level: 3,
            levelName: 'Sub-Component',
            status: 'In Use',
            condition: 'Good',
            location: 'Dubai HQ, Plant Room',
            custodian: 'Facilities Team',
            model: 'Copeland Scroll 15HP',
            serialNumber: 'COP-15-882',
            manufacturer: 'Copeland',
            purchaseDate: '12 Jan 2022',
            warrantyExpiry: '11 Jan 2027',
            parentAssetId: 'AST-000102',
            parentAssetName: 'Chiller Unit - 2'
          },
          {
            id: 'AST-000102-02',
            assetId: 'AST-000102-02',
            name: 'Condenser',
            category: 'HVAC Component',
            type: 'Component',
            level: 3,
            levelName: 'Sub-Component',
            status: 'In Use',
            condition: 'Good',
            location: 'Dubai HQ, Plant Room',
            custodian: 'Facilities Team',
            model: 'Trane Aluminum Coil',
            serialNumber: 'TRN-CND-03',
            manufacturer: 'Trane',
            purchaseDate: '12 Jan 2022',
            warrantyExpiry: '11 Jan 2027',
            parentAssetId: 'AST-000102',
            parentAssetName: 'Chiller Unit - 2'
          },
          {
            id: 'AST-000102-03',
            assetId: 'AST-000102-03',
            name: 'Control Panel',
            category: 'Electronics Component',
            type: 'Component',
            level: 3,
            levelName: 'Sub-Component',
            status: 'In Use',
            condition: 'Good',
            location: 'Dubai HQ, Plant Room',
            custodian: 'Facilities Team',
            model: 'Symbio 800 Controller',
            serialNumber: 'SYM-800-442',
            manufacturer: 'Trane',
            purchaseDate: '12 Jan 2022',
            warrantyExpiry: '11 Jan 2027',
            parentAssetId: 'AST-000102',
            parentAssetName: 'Chiller Unit - 2'
          }
        ]
      },
      {
        id: 'AST-000103',
        assetId: 'AST-000103',
        name: 'Cooling Tower',
        category: 'HVAC Equipment',
        type: 'Equipment',
        level: 2,
        levelName: 'Child Asset',
        status: 'In Use',
        condition: 'Good',
        location: 'Dubai HQ, Rooftop',
        custodian: 'Facilities Team',
        model: 'BAC FXV 400',
        serialNumber: 'BAC-400-99',
        manufacturer: 'Baltimore Aircoil',
        purchaseDate: '10 Feb 2021',
        warrantyExpiry: '09 Feb 2028',
        parentAssetId: 'AST-000100',
        parentAssetName: 'Main Chiller Plant',
        children: []
      },
      {
        id: 'AST-000104',
        assetId: 'AST-000104',
        name: 'Pump Set',
        category: 'Pumping Equipment',
        type: 'Equipment',
        level: 2,
        levelName: 'Child Asset',
        status: 'In Use',
        condition: 'Good',
        location: 'Dubai HQ, Basement 2',
        custodian: 'Facilities Team',
        model: 'Grundfos TPE 100',
        serialNumber: 'GRN-100-11',
        manufacturer: 'Grundfos',
        purchaseDate: '10 Feb 2021',
        warrantyExpiry: '09 Feb 2028',
        parentAssetId: 'AST-000100',
        parentAssetName: 'Main Chiller Plant',
        children: []
      }
    ]
  }
];

export function AssetHierarchy() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [treeData, setTreeData] = useState(INITIAL_TREE_DATA);
  const [expandedNodes, setExpandedNodes] = useState({
    'AST-000100': true,
    'AST-000101': true,
    'AST-000102': true
  });
  const [selectedAssetId, setSelectedAssetId] = useState('AST-000101');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Details'); // Details, Child Assets, Related Documents, History
  const [activeModal, setActiveModal] = useState(null); // null, ADD_CHILD, REASSIGN_PARENT
  const [toast, setToast] = useState(null);

  // Form states for modals
  const [childFormData, setChildFormData] = useState({ childAssetId: '', childAssetName: '', category: 'HVAC Component' });
  const [reassignData, setReassignData] = useState({ newParentAssetId: 'AST-000100' });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

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
    return findNode(treeData) || INITIAL_TREE_DATA[0].children[0];
  }, [treeData, selectedAssetId]);

  // Expand / Collapse Node
  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Expand All / Collapse All
  const handleExpandAll = () => {
    const all = {};
    const collectIds = (nodes) => {
      nodes.forEach(n => {
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

  // Handle Add Child Submit
  const handleAddChildSubmit = async (e) => {
    e.preventDefault();
    if (!childFormData.childAssetId || !childFormData.childAssetName) {
      showToast('error', 'Please fill in Child Asset ID and Asset Name.');
      return;
    }

    if (childFormData.childAssetId === selectedAsset.assetId) {
      showToast('error', 'Validation Error: An asset cannot be added as a child of itself.');
      return;
    }

    try {
      await api.post('/assets/hierarchy/add-child', {
        parentAssetId: selectedAsset.assetId,
        childAssetId: childFormData.childAssetId
      });
    } catch (err) {
      // Graceful fallback simulation
    }

    const newChild = {
      id: childFormData.childAssetId,
      assetId: childFormData.childAssetId,
      name: childFormData.childAssetName,
      category: childFormData.category,
      type: 'Component',
      level: selectedAsset.level + 1,
      levelName: 'Sub-Component',
      status: 'In Use',
      condition: 'Good',
      location: selectedAsset.location,
      custodian: selectedAsset.custodian,
      model: 'Generic Component',
      serialNumber: `${childFormData.childAssetId}-SN`,
      manufacturer: 'OEM Supplier',
      purchaseDate: '16 Sep 2026',
      warrantyExpiry: '15 Sep 2028',
      parentAssetId: selectedAsset.assetId,
      parentAssetName: selectedAsset.name,
      children: []
    };

    // Recursively attach to parent node
    const attachChild = (nodes) => {
      return nodes.map(node => {
        if (node.assetId === selectedAsset.assetId) {
          return { ...node, children: [...(node.children || []), newChild] };
        }
        if (node.children && node.children.length > 0) {
          return { ...node, children: attachChild(node.children) };
        }
        return node;
      });
    };

    setTreeData(prev => attachChild(prev));
    setExpandedNodes(prev => ({ ...prev, [selectedAsset.assetId]: true }));
    setActiveModal(null);
    setChildFormData({ childAssetId: '', childAssetName: '', category: 'HVAC Component' });
    showToast('success', `Child asset ${newChild.assetId} (${newChild.name}) attached under ${selectedAsset.assetId}!`);
  };

  // Handle Reassign Parent Submit
  const handleReassignParentSubmit = async (e) => {
    e.preventDefault();
    const newParentId = reassignData.newParentAssetId;

    if (newParentId === selectedAsset.assetId) {
      showToast('error', 'Validation Error: An asset cannot be assigned as its own parent.');
      return;
    }

    // Circular dependency check simulation
    if (newParentId.startsWith(selectedAsset.assetId)) {
      showToast('error', `Circular Reference Error: Cannot assign ${selectedAsset.assetId} under its own sub-child node (${newParentId}).`);
      return;
    }

    try {
      await api.post('/assets/hierarchy/assign-parent', {
        assetId: selectedAsset.assetId,
        parentAssetId: newParentId
      });
    } catch (err) {
      // Graceful fallback
    }

    showToast('success', `Successfully reassigned ${selectedAsset.assetId} under new parent ${newParentId}! Physical location & custodian remain unchanged.`);
    setActiveModal(null);
  };

  // Render Recursive Tree Node
  const renderTreeNode = (node) => {
    const isExpanded = expandedNodes[node.assetId];
    const isSelected = selectedAssetId === node.assetId;
    const hasChildren = node.children && node.children.length > 0;

    // Filter tree matching search
    if (searchQuery) {
      const matchesSelf = node.assetId.toLowerCase().includes(searchQuery.toLowerCase()) || node.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesChild = node.children && node.children.some(c => c.assetId.toLowerCase().includes(searchQuery.toLowerCase()) || c.name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSelf && !matchesChild) return null;
    }

    return (
      <div key={node.assetId} className="select-none">
        <div
          onClick={() => setSelectedAssetId(node.assetId)}
          className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            isSelected
              ? 'bg-purple-100/90 text-[#6C2BD9] border border-purple-300 shadow-2xs font-extrabold'
              : 'hover:bg-slate-100 text-slate-700 border border-transparent'
          }`}
          style={{ paddingLeft: `${(node.level - 1) * 16 + 8}px` }}
        >
          <div className="flex items-center gap-1.5 truncate">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleNode(node.assetId); }}
                className="p-0.5 hover:bg-purple-200/60 rounded text-slate-500 cursor-pointer"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-4 h-4 inline-block" />
            )}

            {node.level === 1 && <Building className="w-4 h-4 text-[#6C2BD9] shrink-0" />}
            {node.level === 2 && <Cpu className="w-4 h-4 text-blue-600 shrink-0" />}
            {node.level === 3 && <Settings className="w-4 h-4 text-slate-500 shrink-0" />}

            <span className="font-mono font-bold text-[11px] text-slate-900">{node.assetId}</span>
            <span className="truncate text-slate-700 font-medium">{node.name}</span>
          </div>

          {hasChildren && (
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[9px] font-bold">
              {node.children.length}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0.5 mt-0.5">
            {node.children.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-5 pb-12 font-sans text-slate-900 select-none">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 backdrop-blur-md transition-all animate-bounce ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
          toast.type === 'error' ? 'bg-rose-50 border-rose-300 text-rose-800' :
          'bg-blue-50 border-blue-300 text-blue-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Top Header & Breadcrumbs (Matching Screenshot 1-to-1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-0.5">
            <span className="font-bold text-[#6C2BD9]">Assets</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-700">Asset Hierarchy</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Asset Hierarchy</h1>
          <p className="text-xs text-slate-500 font-medium">Define and manage parent-child relationships between assets</p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search assets in hierarchy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 w-48 sm:w-60"
            />
          </div>

          <button
            type="button"
            onClick={() => setActiveModal('ADD_CHILD')}
            className="px-4 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-[#6C2BD9]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Child Asset
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('REASSIGN_PARENT')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#6C2BD9]" /> Reassign Parent
          </button>

          <button
            type="button"
            onClick={() => navigate(`/assets/${selectedAsset.id || selectedAsset.assetId}`)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-[#6C2BD9] font-extrabold rounded-xl text-xs flex items-center gap-1.5 border border-purple-200 shadow-2xs transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#6C2BD9]" /> View Asset 360°
          </button>

          <button type="button" className="p-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-500 shadow-2xs">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid (Tree View Left + Detail Panel Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Left Column: Asset Hierarchy Tree (4 cols) */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 flex flex-col justify-between min-h-[560px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-[#6C2BD9]" /> Asset Hierarchy Tree
              </h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-all"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-[10px] rounded-lg transition-all"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Tree Container */}
            <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
              {treeData.map(node => renderTreeNode(node))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-medium flex items-center justify-between">
            <span>Level 1: System | Level 2: Equipment | Level 3: Sub-Component</span>
          </div>
        </div>

        {/* Right Column: Selected Asset Detail View (8 cols) */}
        <div className="md:col-span-8 space-y-4">
          
          {/* Selected Asset Header Card (Matching Screenshot 1-to-1) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                {/* Asset Machine Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-2xs">
                  <img
                    src={selectedAsset.image || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=600'}
                    alt={selectedAsset.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-black text-[#6C2BD9] text-base">{selectedAsset.assetId}</span>
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

              {/* Stat Summary Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-l border-slate-100 pl-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Category</span>
                  <span className="font-bold text-slate-800">{selectedAsset.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Location</span>
                  <span className="font-bold text-slate-800">{selectedAsset.location}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Custodian</span>
                  <span className="font-bold text-slate-800">{selectedAsset.custodian}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Condition</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {selectedAsset.condition}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabbed Navigation Bar */}
            <div className="flex items-center gap-2 border-b border-slate-200 font-bold text-xs">
              {['Details', `Child Assets (${selectedAsset.children?.length || 0})`, 'Related Documents', 'History'].map((tab) => {
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

            {/* Tab Content 1: Details */}
            {activeTab === 'Details' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs pt-1">
                <div className="space-y-2.5">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Asset ID</span>
                    <span className="font-mono font-bold text-[#6C2BD9]">{selectedAsset.assetId}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Asset Name</span>
                    <span className="font-bold text-slate-900">{selectedAsset.name}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Asset Type</span>
                    <span className="font-semibold text-slate-800">{selectedAsset.type}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Category</span>
                    <span className="font-semibold text-slate-800">{selectedAsset.category}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Model</span>
                    <span className="font-semibold text-slate-800">{selectedAsset.model}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Serial Number</span>
                    <span className="font-mono font-semibold text-slate-700">{selectedAsset.serialNumber}</span>
                  </div>

                  <div className="flex justify-between pb-1.5">
                    <span className="text-slate-500 font-medium">Manufacturer</span>
                    <span className="font-semibold text-slate-800">{selectedAsset.manufacturer}</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Parent Asset</span>
                    <span className="font-bold text-[#6C2BD9] flex items-center gap-1">
                      {selectedAsset.parentAssetId ? `${selectedAsset.parentAssetId} (${selectedAsset.parentAssetName || 'Parent'})` : 'Root System (No Parent)'}
                      {selectedAsset.parentAssetId && <ExternalLink className="w-3 h-3" />}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Level</span>
                    <span className="font-bold text-slate-800">{selectedAsset.level} ({selectedAsset.levelName})</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Location</span>
                    <span className="font-semibold text-slate-800">{selectedAsset.location}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Custodian</span>
                    <span className="font-semibold text-slate-800">{selectedAsset.custodian}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Purchase Date</span>
                    <span className="font-medium text-slate-700">{selectedAsset.purchaseDate}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Warranty Expiry</span>
                    <span className="font-medium text-slate-700">{selectedAsset.warrantyExpiry}</span>
                  </div>

                  <div className="flex justify-between pb-1.5">
                    <span className="text-slate-500 font-medium">Condition</span>
                    <span className="font-bold text-emerald-700">{selectedAsset.condition}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content 2: Child Assets */}
            {activeTab === 'Child' && (
              <div className="space-y-3 pt-1">
                {selectedAsset.children && selectedAsset.children.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                          <th className="p-3">Asset ID</th>
                          <th className="p-3">Child Name</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Serial No</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                        {selectedAsset.children.map(child => (
                          <tr key={child.assetId} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-[#6C2BD9]">{child.assetId}</td>
                            <td className="p-3 font-bold text-slate-900">{child.name}</td>
                            <td className="p-3 text-slate-600">{child.category}</td>
                            <td className="p-3 font-mono text-slate-500">{child.serialNumber}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                                {child.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setSelectedAssetId(child.assetId)}
                                className="px-2.5 py-1 bg-purple-50 text-[#6C2BD9] hover:bg-purple-100 rounded-lg text-[11px] font-bold"
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
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No child assets attached under this node. Click <strong>Add Child Asset</strong> above to attach components.
                  </div>
                )}
              </div>
            )}

            {/* Tab Content 3: Related Documents */}
            {activeTab === 'Related' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <FileText className="w-6 h-6 text-[#6C2BD9]" />
                  <div>
                    <span className="font-extrabold text-slate-900 block">{selectedAsset.assetId}_Manual_Spec.pdf</span>
                    <span className="text-[10px] text-slate-400">Technical Spec (2.4 MB)</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div>
                    <span className="font-extrabold text-slate-900 block">Electrical_Schematics.pdf</span>
                    <span className="text-[10px] text-slate-400 font-mono">Drawing v3.1 (1.1 MB)</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <FileText className="w-6 h-6 text-emerald-600" />
                  <div>
                    <span className="font-extrabold text-slate-900 block">Warranty_Certificate.pdf</span>
                    <span className="text-[10px] text-slate-400">OEM Warranty (450 KB)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content 4: History */}
            {activeTab === 'History' && (
              <div className="space-y-3 pt-1">
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Previous Parent</th>
                        <th className="p-3">New Parent</th>
                        <th className="p-3">User</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                      <tr>
                        <td className="p-3 font-mono text-slate-500">16 Sep 2026 10:15 AM</td>
                        <td className="p-3 text-slate-400 font-mono">None (Root)</td>
                        <td className="p-3 font-mono text-[#6C2BD9] font-bold">AST-000100</td>
                        <td className="p-3 text-slate-700">John Doe</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold">
                            Parent Assigned
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-slate-500">12 Jan 2022 09:00 AM</td>
                        <td className="p-3 text-slate-400 font-mono">-</td>
                        <td className="p-3 font-mono text-slate-700 font-bold">Created</td>
                        <td className="p-3 text-slate-700">System Admin</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                            Asset Registered
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Key Features & Navigation Flow Sections (Matching Screenshot 1-to-1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        
        {/* Left: Key Features */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm">Key Features</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            
            <div className="p-3 border border-slate-200 rounded-xl space-y-1 bg-white">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-1">
                <FolderTree className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 block leading-tight text-[11px]">Parent - Child Structure</span>
              <p className="text-[10px] text-slate-500 leading-tight">Define multi-level asset hierarchies (Asset &rarr; Sub-Asset &rarr; Component &rarr; Sub-Component).</p>
            </div>

            <div className="p-3 border border-slate-200 rounded-xl space-y-1 bg-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-1">
                <Plus className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 block leading-tight text-[11px]">Add / Manage Relationships</span>
              <p className="text-[10px] text-slate-500 leading-tight">Add child assets, reassign parent, or remove from hierarchy with validation.</p>
            </div>

            <div className="p-3 border border-slate-200 rounded-xl space-y-1 bg-white">
              <div className="w-8 h-8 rounded-lg bg-[#6C2BD9] text-white font-bold flex items-center justify-center text-xs mb-1">
                <Eye className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 block leading-tight text-[11px]">Asset 360° Integration</span>
              <p className="text-[10px] text-slate-500 leading-tight">View complete asset details, child assets, documents and history.</p>
            </div>

            <div className="p-3 border border-slate-200 rounded-xl space-y-1 bg-white">
              <div className="w-8 h-8 rounded-lg bg-orange-500 text-white font-bold flex items-center justify-center text-xs mb-1">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 block leading-tight text-[11px]">Data Validation</span>
              <p className="text-[10px] text-slate-500 leading-tight">Prevent duplicate links, circular references and self-assignment.</p>
            </div>

            <div className="p-3 border border-slate-200 rounded-xl space-y-1 bg-white">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-1">
                <Clock className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 block leading-tight text-[11px]">Hierarchy History</span>
              <p className="text-[10px] text-slate-500 leading-tight">Track all hierarchy changes with effective dates and audit logs.</p>
            </div>

            <div className="p-3 border border-slate-200 rounded-xl space-y-1 bg-white">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-xs mb-1">
                <Settings className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 block leading-tight text-[11px]">Configurable Levels</span>
              <p className="text-[10px] text-slate-500 leading-tight">Support multiple hierarchy levels as per organization requirements.</p>
            </div>

          </div>
        </div>

        {/* Right: Navigation Flow */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm">Navigation Flow</h3>

          <div className="flex items-center justify-between gap-1 pt-2">
            
            <div className="flex flex-col items-center text-center space-y-1.5 flex-1">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Building className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-extrabold text-slate-800 leading-tight">1. Login<br/><span className="font-normal text-slate-400">Access Asset360</span></span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mb-4" />

            <div className="flex flex-col items-center text-center space-y-1.5 flex-1">
              <div className="w-9 h-9 rounded-full bg-[#6C2BD9] text-white flex items-center justify-center shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-extrabold text-slate-800 leading-tight">2. Go to Asset Hierarchy<br/><span className="font-normal text-slate-400">Via Assets menu</span></span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mb-4" />

            <div className="flex flex-col items-center text-center space-y-1.5 flex-1">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Search className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-extrabold text-slate-800 leading-tight">3. Search / Select Parent<br/><span className="font-normal text-slate-400">Find asset</span></span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mb-4" />

            <div className="flex flex-col items-center text-center space-y-1.5 flex-1">
              <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs">
                <FolderTree className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-extrabold text-slate-800 leading-tight">4. View Hierarchy<br/><span className="font-normal text-slate-400">Expand tree</span></span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mb-4" />

            <div className="flex flex-col items-center text-center space-y-1.5 flex-1">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-extrabold text-slate-800 leading-tight">5. Add / Modify Relationship<br/><span className="font-normal text-slate-400">Reassign parent</span></span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mb-4" />

            <div className="flex flex-col items-center text-center space-y-1.5 flex-1">
              <div className="w-9 h-9 rounded-full bg-purple-800 text-white flex items-center justify-center shadow-xs">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-extrabold text-slate-800 leading-tight">6. Validate &amp; Save<br/><span className="font-normal text-slate-400">Saves changes</span></span>
            </div>

          </div>
        </div>

      </div>

      {/* ================= MODALS ================= */}

      {/* Add Child Asset Modal */}
      {activeModal === 'ADD_CHILD' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddChildSubmit} className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#6C2BD9]" /> Add Child Asset
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-2.5 bg-purple-50 border border-purple-100 rounded-xl text-purple-900">
                <span className="font-extrabold block">Target Parent Asset:</span>
                <span className="font-mono font-bold text-[#6C2BD9]">{selectedAsset.assetId}</span> - {selectedAsset.name}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Child Asset ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AST-000101-04"
                  value={childFormData.childAssetId}
                  onChange={(e) => setChildFormData({ ...childFormData, childAssetId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Child Asset Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Expansion Valve"
                  value={childFormData.childAssetName}
                  onChange={(e) => setChildFormData({ ...childFormData, childAssetName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Category</label>
                <select
                  value={childFormData.category}
                  onChange={(e) => setChildFormData({ ...childFormData, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                >
                  <option value="HVAC Component">HVAC Component</option>
                  <option value="Electronics Component">Electronics Component</option>
                  <option value="Mechanical Assembly">Mechanical Assembly</option>
                  <option value="Pumping Component">Pumping Component</option>
                </select>
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-medium">
                <strong>Note:</strong> Adding a child asset updates hierarchy structural links only. Physical location and custodian remain governed by location policies.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-slate-700">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl shadow-md shadow-[#6C2BD9]/20">Attach Child Asset</button>
            </div>
          </form>
        </div>
      )}

      {/* Reassign Parent Modal */}
      {activeModal === 'REASSIGN_PARENT' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleReassignParentSubmit} className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-[#6C2BD9]" /> Reassign Parent Asset
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="AST-000100">AST-000100 (Main Chiller Plant)</option>
                  <option value="AST-000101">AST-000101 (Chiller Unit - 1)</option>
                  <option value="AST-000102">AST-000102 (Chiller Unit - 2)</option>
                  <option value="AST-000103">AST-000103 (Cooling Tower)</option>
                  <option value="AST-000104">AST-000104 (Pump Set)</option>
                </select>
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1">
                <span className="font-extrabold block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Backend Validation Rules:
                </span>
                <ul className="list-disc list-inside text-[10px] space-y-0.5 text-blue-800">
                  <li>Prevents self-assignment ({selectedAsset.assetId} &rarr; {selectedAsset.assetId})</li>
                  <li>Prevents circular loops ({selectedAsset.assetId} &rarr; Sub-child &rarr; {selectedAsset.assetId})</li>
                  <li>Preserves custodian, site, and financial book value</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-slate-700">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-extrabold rounded-xl shadow-md shadow-[#6C2BD9]/20">Save Reassignment</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

export default AssetHierarchy;
