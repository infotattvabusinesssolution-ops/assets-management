import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  MapPin,
  Grid,
  Tag,
  QrCode,
  ShieldAlert,
  Calculator,
  Ruler,
  HelpCircle,
  Users,
  UserCheck,
  FileText,
  Shield,
  Wrench,
  Bell,
  GitBranch,
  Folder,
  Box,
  Gauge,
  Calendar,
  Monitor,
  Map,
  Cpu,
  SlidersHorizontal,
  Plus,
  Download,
  Info,
  CheckCircle2,
  ChevronRight,
  Database,
  Search,
  RefreshCw,
  Layers,
  Sparkles
} from 'lucide-react';
import { AddCategoryModal } from '../components/modals/AddCategoryModal';
import { AddCompanyModal } from '../components/modals/AddCompanyModal';
import { AddSiteModal } from '../components/modals/AddSiteModal';
import { AddGenericMasterRecordModal } from '../components/modals/AddGenericMasterRecordModal';
import { MasterDataDetailDrawer } from '../components/master-data/MasterDataDetailDrawer';

const MASTER_DATA_CARDS = [
  {
    id: 'org',
    title: 'Organization Management',
    desc: 'Manage companies, legal entities, business units, departments and cost centers.',
    icon: Building2,
    modal: 'company'
  },
  {
    id: 'locations',
    title: 'Locations Management',
    desc: 'Manage countries, regions, sites, buildings, floors, rooms, zones and storage areas.',
    icon: MapPin,
    modal: 'site'
  },
  {
    id: 'classification',
    title: 'Asset Classification',
    desc: 'Manage asset groups, categories, classes, types and subcategories.',
    icon: Grid,
    modal: 'category'
  },
  {
    id: 'item_master',
    title: 'Asset & Item Master',
    desc: 'Manage manufacturers, brands, models and model-specific attributes.',
    icon: Tag,
    modal: 'model'
  },
  {
    id: 'tagging',
    title: 'Identification & Tagging',
    desc: 'Configure tag types, numbering schemes, label templates and tagging rules.',
    icon: QrCode
  },
  {
    id: 'status',
    title: 'Asset Status & Condition',
    desc: 'Define lifecycle status, condition types and criticality levels.',
    icon: ShieldAlert
  },
  {
    id: 'finance',
    title: 'Financial & Accounting',
    desc: 'Configure asset books, depreciation methods, fiscal calendars and GL mapping.',
    icon: Calculator
  },
  {
    id: 'units',
    title: 'Units & Currencies',
    desc: 'Maintain units of measure, unit conversions and currencies.',
    icon: Ruler
  },
  {
    id: 'reasons',
    title: 'Reason Codes',
    desc: 'Define reason codes for transfer, loss, damage, impairment, disposal and others.',
    icon: HelpCircle
  },
  {
    id: 'vendors',
    title: 'Vendors & Service Providers',
    desc: 'Manage vendors, service providers, insurers and warranty partners.',
    icon: Users
  },
  {
    id: 'custodians',
    title: 'Employees & Custodians',
    desc: 'Maintain employees, custodians and organizational hierarchy.',
    icon: UserCheck,
    modal: 'employee'
  },
  {
    id: 'contracts',
    title: 'Contracts & Agreements',
    desc: 'Manage contract types, vendors, terms, renewals and obligations.',
    icon: FileText
  },
  {
    id: 'insurance',
    title: 'Insurance Management',
    desc: 'Manage insurance policies, coverage, premiums and claims.',
    icon: Shield
  },
  {
    id: 'maintenance',
    title: 'Maintenance Configuration',
    desc: 'Configure maintenance types, frequencies, checklists and failure codes.',
    icon: Wrench
  },
  {
    id: 'notifications',
    title: 'Notification Templates',
    desc: 'Create and manage in-app, email and push notification templates.',
    icon: Bell
  },
  {
    id: 'workflow',
    title: 'Workflow Configuration',
    desc: 'Define approval workflows, rules, escalation and delegations.',
    icon: GitBranch
  },
  {
    id: 'documents',
    title: 'Document Management',
    desc: 'Define document types, categories and retention policies.',
    icon: Folder
  },
  {
    id: 'inventory',
    title: 'Inventory & Spare Parts',
    desc: 'Manage spare parts, stores, bins, stock categories and issue types.',
    icon: Box
  },
  {
    id: 'meters',
    title: 'Meter & Reading Types',
    desc: 'Configure meter types, reading intervals and UoM.',
    icon: Gauge
  },
  {
    id: 'calendars',
    title: 'Calendars & Holidays',
    desc: 'Manage working calendars, shifts and holiday schedules.',
    icon: Calendar
  },
  {
    id: 'auto_discovery',
    title: 'Auto Discovery Configuration',
    desc: 'Configure network auto discovery, discovery tools and matching rules.',
    icon: Monitor
  },
  {
    id: 'floor_plans',
    title: 'Map & Floor Plans',
    desc: 'Manage maps, floor plans, zones and asset positioning settings.',
    icon: Map
  },
  {
    id: 'integrations',
    title: 'Integration Setup',
    desc: 'Configure ERP, HR, ITSM, CMDB, IoT and other system integrations.',
    icon: Cpu
  },
  {
    id: 'system_settings',
    title: 'System Settings',
    desc: 'Configure numbering, codes, preferences and global settings.',
    icon: SlidersHorizontal
  }
];

export function AdminMasterData() {
  const { user } = useAuth();
  const userRoleCode = user?.role?.code || 'SYS_ADMIN';

  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Search filter for cards
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer state
  const [selectedCard, setSelectedCard] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);

  // Modal states
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [showAddCmpModal, setShowAddCmpModal] = useState(false);
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);

  // Generic modal state
  const [genericModalConfig, setGenericModalConfig] = useState({ isOpen: false, entityType: 'department', entityTitle: 'Department' });

  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadMasterDataOverview();
  }, []);

  async function loadMasterDataOverview() {
    setStatsLoading(true);
    try {
      const [statsRes, cRes, sRes] = await Promise.all([
        api.get('/master-data/stats'),
        api.get('/master-data/companies'),
        api.get('/master-data/sites')
      ]);

      if (statsRes && statsRes.success) {
        setStats(statsRes.stats);
      }
      if (cRes && cRes.success) setCompanies(cRes.companies || []);
      if (sRes && sRes.success) setSites(sRes.sites || []);
    } catch (err) {
      console.warn('Master data overview load fallback:', err);
    } finally {
      setStatsLoading(false);
    }
  }

  const handleCategoryAdded = (newCat) => {
    setSuccessMsg(`Asset Category "${newCat.name || newCat.code}" created successfully!`);
    setTimeout(() => setSuccessMsg(''), 5000);
    loadMasterDataOverview();
  };

  const handleCompanyAdded = (newCmp) => {
    setCompanies(prev => [...prev, newCmp]);
    setSuccessMsg(`Organization Entity "${newCmp.name || newCmp.code}" created successfully!`);
    setTimeout(() => setSuccessMsg(''), 5000);
    loadMasterDataOverview();
  };

  const handleSiteAdded = (newSite) => {
    setSites(prev => [...prev, newSite]);
    setSuccessMsg(`Site Campus "${newSite.name || newSite.code}" created successfully!`);
    setTimeout(() => setSuccessMsg(''), 5000);
    loadMasterDataOverview();
  };

  const handleGenericRecordAdded = (newItem) => {
    setSuccessMsg(`Master Record "${newItem.name || newItem.fullName || newItem.label || newItem.code}" created successfully!`);
    setTimeout(() => setSuccessMsg(''), 5000);
    loadMasterDataOverview();
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setShowDrawer(true);
  };

  const handleOpenAddForCard = () => {
    if (!selectedCard) return;
    if (selectedCard.id === 'org') setShowAddCmpModal(true);
    else if (selectedCard.id === 'locations') setShowAddSiteModal(true);
    else if (selectedCard.id === 'classification') setShowAddCatModal(true);
    else {
      const typeMap = {
        item_master: { type: 'model', title: 'Asset Model' },
        custodians: { type: 'employee', title: 'Employee / Custodian' },
        vendors: { type: 'vendor', title: 'Vendor / Provider' },
        maintenance: { type: 'maintenance', title: 'Maintenance Rule' }
      };
      const cfg = typeMap[selectedCard.id] || { type: selectedCard.id, title: selectedCard.title };
      setGenericModalConfig({ isOpen: true, entityType: cfg.type, entityTitle: cfg.title });
    }
  };

  // Filter 24 cards based on global search input
  const filteredCards = MASTER_DATA_CARDS.filter(card => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      card.title.toLowerCase().includes(q) ||
      card.desc.toLowerCase().includes(q) ||
      card.id.toLowerCase().includes(q)
    );
  });

  const totalRecordsFormatted = stats?.totalMasterRecords ? stats.totalMasterRecords.toLocaleString() : '0';
  const lastUpdatedFormatted = stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'May 20, 2025 10:30 AM';

  return (
    <div className="space-y-6 pb-12">

      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Master Data & Configuration</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-[#6c2bd9] font-bold border border-purple-200 uppercase tracking-wide">
              Center
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Define and manage all core master data and configuration settings used across the Asset Management System.
          </p>
        </div>

        {/* Global Header Actions */}
        <div className="flex items-center gap-3 relative flex-wrap">

          {/* Dynamic Add New Record Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQuickAddMenu(!showQuickAddMenu)}
              className="btn-primary px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-brand-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Record</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showQuickAddMenu ? 'rotate-270' : 'rotate-90'}`} />
            </button>

            {/* Supported Record Types Dropdown */}
            {showQuickAddMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 shadow-2xl rounded-2xl p-2 z-50 space-y-1 animate-in fade-in duration-150">
                <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Supported Master Records
                </div>
                <button
                  onClick={() => { setShowAddCmpModal(true); setShowQuickAddMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6c2bd9] transition-all flex items-center gap-2.5"
                >
                  <Building2 className="w-4 h-4 text-[#6c2bd9]" />
                  <span>New Organization Entity</span>
                </button>
                <button
                  onClick={() => { setShowAddSiteModal(true); setShowQuickAddMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6c2bd9] transition-all flex items-center gap-2.5"
                >
                  <MapPin className="w-4 h-4 text-[#6c2bd9]" />
                  <span>New Site / Campus</span>
                </button>
                <button
                  onClick={() => { setShowAddCatModal(true); setShowQuickAddMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6c2bd9] transition-all flex items-center gap-2.5"
                >
                  <Grid className="w-4 h-4 text-[#6c2bd9]" />
                  <span>New Asset Category</span>
                </button>
                <button
                  onClick={() => { setGenericModalConfig({ isOpen: true, entityType: 'manufacturer', entityTitle: 'Manufacturer' }); setShowQuickAddMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6c2bd9] transition-all flex items-center gap-2.5"
                >
                  <Tag className="w-4 h-4 text-[#6c2bd9]" />
                  <span>New OEM Manufacturer</span>
                </button>
                <button
                  onClick={() => { setGenericModalConfig({ isOpen: true, entityType: 'model', entityTitle: 'Asset Model' }); setShowQuickAddMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6c2bd9] transition-all flex items-center gap-2.5"
                >
                  <Tag className="w-4 h-4 text-[#6c2bd9]" />
                  <span>New Asset Model</span>
                </button>
                <button
                  onClick={() => { setGenericModalConfig({ isOpen: true, entityType: 'department', entityTitle: 'Department' }); setShowQuickAddMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6c2bd9] transition-all flex items-center gap-2.5"
                >
                  <Users className="w-4 h-4 text-[#6c2bd9]" />
                  <span>New Department</span>
                </button>
                <button
                  onClick={() => { setGenericModalConfig({ isOpen: true, entityType: 'employee', entityTitle: 'Employee / Custodian' }); setShowQuickAddMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6c2bd9] transition-all flex items-center gap-2.5"
                >
                  <UserCheck className="w-4 h-4 text-[#6c2bd9]" />
                  <span>New Custodian Employee</span>
                </button>
              </div>
            )}
          </div>

          <a
            href="/receiving"
            className="btn-secondary px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Import Data</span>
          </a>

          <button
            onClick={loadMasterDataOverview}
            disabled={statsLoading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-all cursor-pointer shadow-xs"
            title="Refresh System Statistics"
          >
            <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin text-[#6c2bd9]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Global Master Data Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
        <input
          type="text"
          placeholder="Search master data cards by name, type, description, or keyword (e.g. 'locations', 'maintenance', 'finance')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* 24 Configuration Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-300 rounded-2xl bg-white space-y-3">
          <Layers className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-800">No master data modules match "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="btn-secondary text-xs px-4 py-2 font-semibold"
          >
            Show All 24 Modules
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCards.map((card) => {
            const IconComp = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-3 hover:border-[#6c2bd9]/60 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex items-start gap-3 min-w-0 z-10">
                  <div className="w-10 h-10 rounded-xl border border-purple-200 bg-purple-50/60 text-[#6c2bd9] flex items-center justify-center shrink-0 group-hover:bg-[#6c2bd9] group-hover:text-white group-hover:border-[#6c2bd9] transition-all shadow-xs">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug group-hover:text-[#6c2bd9] transition-colors truncate">
                      {card.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#6c2bd9] group-hover:translate-x-0.5 transition-all shrink-0 mt-1 z-10" />
              </div>
            );
          })}
        </div>
      )}

      {/* Real Statistics Bottom Summary Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center shadow-xs">
        {/* Info Column */}
        <div className="flex items-start gap-3.5 md:col-span-1">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-[#6c2bd9] border border-purple-200 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">About Master Data</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Master data is the foundation of your asset management system. Accurate and complete master data ensures better tracking, reporting and decision-making.
            </p>
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-center gap-3 md:justify-center border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Last Updated</p>
            <p className="text-xs font-bold text-slate-800">{lastUpdatedFormatted}</p>
            <p className="text-[10px] text-slate-500">By {user?.username || 'John Doe'}</p>
          </div>
        </div>

        {/* Real Total Records */}
        <div className="flex items-center gap-3 md:justify-end border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#6c2bd9] flex items-center justify-center shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Records</p>
            <p className="text-lg font-black text-slate-900 leading-tight">
              {statsLoading ? '...' : totalRecordsFormatted}
            </p>
            <p className="text-[10px] text-slate-500">Across all master data</p>
          </div>
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      <MasterDataDetailDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        card={selectedCard}
        onAddClick={handleOpenAddForCard}
        userRole={userRoleCode}
      />

      {/* Standard Modals */}
      <AddCategoryModal
        isOpen={showAddCatModal}
        onClose={() => setShowAddCatModal(false)}
        onSuccess={handleCategoryAdded}
      />

      <AddCompanyModal
        isOpen={showAddCmpModal}
        onClose={() => setShowAddCmpModal(false)}
        onSuccess={handleCompanyAdded}
      />

      <AddSiteModal
        isOpen={showAddSiteModal}
        onClose={() => setShowAddSiteModal(false)}
        onSuccess={handleSiteAdded}
        companies={companies}
      />

      {/* Generic Modal for Manufacturers, Models, Departments, Employees, Custom Fields */}
      <AddGenericMasterRecordModal
        isOpen={genericModalConfig.isOpen}
        onClose={() => setGenericModalConfig(prev => ({ ...prev, isOpen: false }))}
        onSuccess={handleGenericRecordAdded}
        entityType={genericModalConfig.entityType}
        entityTitle={genericModalConfig.entityTitle}
      />
    </div>
  );
}

