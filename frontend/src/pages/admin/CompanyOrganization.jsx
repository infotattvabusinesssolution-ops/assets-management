import React, { useState } from 'react';
import {
  Building2,
  GitBranch,
  Network,
  MapPin,
  Coins,
  ChevronRight,
  Plus,
  CheckCircle2,
  X
} from 'lucide-react';
import clsx from 'clsx';

import CompaniesTab from '../../components/company-organization/CompaniesTab';
import BusinessUnitsTab from '../../components/company-organization/BusinessUnitsTab';
import DepartmentsTab from '../../components/company-organization/DepartmentsTab';
import LocationsTab from '../../components/company-organization/LocationsTab';
import CostCentersTab from '../../components/company-organization/CostCentersTab';

import { useLocation } from 'react-router-dom';

export function CompanyOrganization() {
  const location = useLocation();
  const getInitialTab = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('department')) return 'departments';
    if (path.includes('business-unit') || path.includes('businessunit')) return 'businessUnits';
    if (path.includes('location')) return 'locations';
    if (path.includes('cost-center') || path.includes('costcenter')) return 'costCenters';
    return 'companies';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [toastMsg, setToastMsg] = useState('');

  React.useEffect(() => {
    const path = location.pathname.toLowerCase();
    const search = location.search.toLowerCase();
    if (path.includes('department') || search.includes('departments')) {
      setActiveTab('departments');
    } else if (path.includes('business') || search.includes('businessunit')) {
      setActiveTab('businessUnits');
    } else if (path.includes('location') || search.includes('location')) {
      setActiveTab('locations');
    } else if (path.includes('cost-center') || search.includes('cost-center')) {
      setActiveTab('costCenters');
    } else if (path.includes('company') || path.includes('organization')) {
      if (search.includes('departments')) setActiveTab('departments');
      else if (search.includes('business')) setActiveTab('businessUnits');
      else if (search.includes('location')) setActiveTab('locations');
      else if (search.includes('cost')) setActiveTab('costCenters');
      else setActiveTab('companies');
    }
  }, [location]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const TABS = [
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'businessUnits', label: 'Business Units', icon: GitBranch },
    { id: 'departments', label: 'Departments', icon: Network },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'costCenters', label: 'Cost Centers', icon: Coins }
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
          <span className="text-[#2563EB] font-bold">Company &amp; Organization</span>
          {activeTab !== 'companies' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-700 font-bold capitalize">
                {TABS.find((t) => t.id === activeTab)?.label}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Company &amp; Organization
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage companies, business units, departments and locations
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                const activeLabel = TABS.find((t) => t.id === activeTab)?.label;
                triggerToast(`Add ${activeLabel} window opened.`);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                Add {activeTab === 'companies' ? 'Company' : activeTab === 'businessUnits' ? 'Business Unit' : activeTab === 'departments' ? 'Department' : activeTab === 'locations' ? 'Location' : 'Cost Center'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 5-Tab Navigation Bar (Matching Screenshot) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border',
                isActive
                  ? 'bg-white border-[#2563EB] text-[#2563EB] shadow-md ring-2 ring-[#2563EB]/15'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-2xs'
              )}
            >
              <Icon className={clsx('w-4 h-4', isActive ? 'text-[#2563EB]' : 'text-slate-400')} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render Active Tab Component */}
      {activeTab === 'companies' && (
        <CompaniesTab triggerToast={triggerToast} onSwitchTab={(tabId) => setActiveTab(tabId)} />
      )}

      {activeTab === 'businessUnits' && (
        <BusinessUnitsTab triggerToast={triggerToast} />
      )}

      {activeTab === 'departments' && (
        <DepartmentsTab triggerToast={triggerToast} onSwitchTab={(tabId) => setActiveTab(tabId)} />
      )}

      {activeTab === 'locations' && (
        <LocationsTab triggerToast={triggerToast} onSwitchTab={(tabId) => setActiveTab(tabId)} />
      )}

      {activeTab === 'costCenters' && (
        <CostCentersTab triggerToast={triggerToast} onSwitchTab={(tabId) => setActiveTab(tabId)} />
      )}
    </div>
  );
}

export default CompanyOrganization;
