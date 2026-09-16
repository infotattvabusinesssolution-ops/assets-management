import React, { useState, useEffect } from 'react';
import {
  Building2,
  GitBranch,
  Network,
  MapPin,
  Coins,
  Search,
  Filter,
  Plus,
  Download,
  MoreHorizontal,
  Eye,
  Edit2,
  Users,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronRight,
  Briefcase
} from 'lucide-react';

export default function CompanyOrganization() {
  const [activeTab, setActiveTab] = useState('companies'); // companies, businessUnits, departments, locations, costCenters

  // Data States
  const [companies, setCompanies] = useState([]);
  const [businessUnits, setBusinessUnits] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [companyStatusFilter, setCompanyStatusFilter] = useState('All Status');
  const [regionFilter, setRegionFilter] = useState('All Regions');
  const [companyTypeFilter, setCompanyTypeFilter] = useState('All Types');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('All Companies');
  const [locationTypeFilter, setLocationTypeFilter] = useState('All Types');

  // UI States
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', region: 'UAE', type: 'Operating', status: 'Active' });

  // Fetch Tab Data
  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'companies') {
        const res = await fetch(`http://localhost:5000/api/v1/admin/organization/companies?search=${searchQuery}&status=${companyStatusFilter}&region=${regionFilter}&type=${companyTypeFilter}`);
        const data = await res.json();
        if (data.success) setCompanies(data.companies || []);
      } else if (activeTab === 'businessUnits') {
        const res = await fetch(`http://localhost:5000/api/v1/admin/organization/business-units?search=${searchQuery}`);
        const data = await res.json();
        if (data.success) setBusinessUnits(data.businessUnits || []);
      } else if (activeTab === 'departments') {
        const res = await fetch(`http://localhost:5000/api/v1/admin/organization/departments?search=${searchQuery}&company=${selectedCompanyFilter}`);
        const data = await res.json();
        if (data.success) setDepartments(data.departments || []);
      } else if (activeTab === 'locations') {
        const res = await fetch(`http://localhost:5000/api/v1/admin/organization/locations?search=${searchQuery}&company=${selectedCompanyFilter}&locationType=${locationTypeFilter}`);
        const data = await res.json();
        if (data.success) setLocations(data.locations || []);
      } else if (activeTab === 'costCenters') {
        const res = await fetch(`http://localhost:5000/api/v1/admin/organization/cost-centers?search=${searchQuery}`);
        const data = await res.json();
        if (data.success) setCostCenters(data.costCenters || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, searchQuery, companyStatusFilter, regionFilter, companyTypeFilter, selectedCompanyFilter, locationTypeFilter]);

  const handleCreateEntity = async (e) => {
    e.preventDefault();
    try {
      let endpoint = '';
      if (activeTab === 'companies') endpoint = 'http://localhost:5000/api/v1/admin/organization/companies';
      else if (activeTab === 'departments') endpoint = 'http://localhost:5000/api/v1/admin/organization/departments';
      else if (activeTab === 'locations') endpoint = 'http://localhost:5000/api/v1/admin/organization/locations';
      else if (activeTab === 'costCenters') endpoint = 'http://localhost:5000/api/v1/admin/organization/cost-centers';

      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          setToastMsg('Record created successfully');
          setShowAddModal(false);
          fetchData();
        } else {
          alert(data.error);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'companies', label: 'Companies', icon: Building2, count: companies.length },
    { id: 'businessUnits', label: 'Business Units', icon: GitBranch, count: businessUnits.length },
    { id: 'departments', label: 'Departments', icon: Network, count: departments.length },
    { id: 'locations', label: 'Locations', icon: MapPin, count: locations.length },
    { id: 'costCenters', label: 'Cost Centers', icon: Coins, count: costCenters.length }
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
      <div className="mb-5">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span>Administration</span>
          <span>&gt;</span>
          <span className="text-[#6C2BD9] font-medium">Company &amp; Organization</span>
          {activeTab !== 'companies' && (
            <>
              <span>&gt;</span>
              <span className="text-slate-700 font-medium capitalize">{activeTab}</span>
            </>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              {activeTab === 'companies' && 'Company & Organization'}
              {activeTab === 'businessUnits' && 'Business Units'}
              {activeTab === 'departments' && 'Departments'}
              {activeTab === 'locations' && 'Locations'}
              {activeTab === 'costCenters' && 'Cost Centers'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {activeTab === 'companies' && 'Manage companies, business units, departments and locations'}
              {activeTab === 'businessUnits' && 'Maintain strategic business units linked to parent companies'}
              {activeTab === 'departments' && 'Manage departments within business units. Assign department head, location, cost center and users.'}
              {activeTab === 'locations' && 'Manage locations within your organization. Define site details, address, hierarchy and assign to business units or cost centers.'}
              {activeTab === 'costCenters' && 'Maintain organizational cost centers for financial tracking and depreciation allocation.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => alert(`Exporting ${activeTab} data`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export &or;
            </button>

            <button
              onClick={() => {
                setFormData({ name: '', code: '', region: 'UAE', type: 'Operating', status: 'Active' });
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-lg transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add {activeTab === 'companies' ? 'Company' : activeTab === 'departments' ? 'Department' : activeTab === 'locations' ? 'Location' : activeTab === 'costCenters' ? 'Cost Center' : 'Business Unit'}
            </button>
          </div>
        </div>
      </div>

      {/* 5-Tab Navigation Bar (Exact Match Screenshots 3, 4, 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery('');
              }}
              className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold transition border ${
                isActive
                  ? 'bg-white border-[#6C2BD9] text-[#6C2BD9] shadow-sm ring-1 ring-[#6C2BD9]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#6C2BD9]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: COMPANIES (SCREENSHOT 3) */}
      {activeTab === 'companies' && (
        <>
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
            <div className="text-xs font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#6C2BD9]" />
              Filters
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Company Status</label>
                <select
                  value={companyStatusFilter}
                  onChange={(e) => setCompanyStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="All Status">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Region</label>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="All Regions">All Regions</option>
                  <option value="UAE">UAE</option>
                  <option value="KSA">KSA</option>
                  <option value="Qatar">Qatar</option>
                  <option value="Bahrain">Bahrain</option>
                  <option value="Oman">Oman</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Company Type</label>
                <select
                  value={companyTypeFilter}
                  onChange={(e) => setCompanyTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="All Types">All Types</option>
                  <option value="Holding">Holding</option>
                  <option value="Operating">Operating</option>
                  <option value="Region">Region</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Parent Company</label>
                <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs">
                  <option>All</option>
                  <option>Asset360 Holdings</option>
                </select>
              </div>

              <div className="col-span-2 lg:col-span-1">
                <label className="block text-slate-600 font-medium mb-1">Search</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, code or description..."
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => {
                  setCompanyStatusFilter('All Status');
                  setRegionFilter('All Regions');
                  setCompanyTypeFilter('All Types');
                  setSearchQuery('');
                }}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-medium"
              >
                Reset
              </button>

              <div className="flex items-center gap-3">
                <button className="text-[#6C2BD9] font-medium hover:underline">More Filters &or;</button>
                <button
                  onClick={fetchData}
                  className="px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-semibold rounded-lg shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Companies List Table (Screenshot 3) */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Companies ({companies.length})</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold select-none">
                    <th className="p-3 pl-4 w-10">
                      <input type="checkbox" className="rounded border-slate-300 text-[#6C2BD9]" />
                    </th>
                    <th className="p-3 w-10 text-slate-400">#</th>
                    <th className="p-3 font-semibold text-slate-900">Company Name &or;</th>
                    <th className="p-3 font-semibold text-slate-900">Code &or;</th>
                    <th className="p-3 font-semibold text-slate-900">Type &or;</th>
                    <th className="p-3 font-semibold text-slate-900">Region &or;</th>
                    <th className="p-3 font-semibold text-slate-900">No. of Business Units &or;</th>
                    <th className="p-3 font-semibold text-slate-900">No. of Locations &or;</th>
                    <th className="p-3 font-semibold text-slate-900">Status &or;</th>
                    <th className="p-3 font-semibold text-slate-900">Created On &or;</th>
                    <th className="p-3 text-right pr-4 font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companies.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-[#F5F3FF]/40 transition">
                      <td className="p-3 pl-4">
                        <input type="checkbox" className="rounded border-slate-300 text-[#6C2BD9]" />
                      </td>
                      <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-900">{c.name}</td>
                      <td className="p-3 text-slate-600 font-mono">{c.code}</td>
                      <td className="p-3 text-slate-600">{c.type}</td>
                      <td className="p-3 text-slate-600">{c.region}</td>
                      <td className="p-3 text-slate-700 font-medium font-mono">{c.businessUnitsCount}</td>
                      <td className="p-3 text-slate-700 font-medium font-mono">{c.locationsCount}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                            c.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{c.createdOn}</td>
                      <td className="p-3 text-right pr-4 relative">
                        <button
                          onClick={() => setActiveDropdownId(activeDropdownId === c.id ? null : c.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded border border-slate-200 hover:bg-slate-50"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* 8 Row Actions for Company (Screenshot 3) */}
                        {activeDropdownId === c.id && (
                          <div className="absolute right-4 top-10 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-30 py-1 text-left animate-in fade-in duration-100">
                            <button
                              onClick={() => { alert(`Company: ${c.name}`); setActiveDropdownId(null); }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#6C2BD9]" /> View Details
                            </button>
                            <button
                              onClick={() => { alert(`Edit: ${c.name}`); setActiveDropdownId(null); }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#6C2BD9]" /> Edit Company
                            </button>
                            <button
                              onClick={() => { setActiveTab('departments'); setActiveDropdownId(null); }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                            >
                              <Network className="w-3.5 h-3.5 text-[#6C2BD9]" /> Manage Organization
                            </button>
                            <button
                              onClick={() => { setActiveTab('businessUnits'); setActiveDropdownId(null); }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                            >
                              <Plus className="w-3.5 h-3.5 text-[#6C2BD9]" /> Add Business Unit
                            </button>
                            <button
                              onClick={() => { setActiveTab('locations'); setActiveDropdownId(null); }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                            >
                              <MapPin className="w-3.5 h-3.5 text-[#6C2BD9]" /> Add Location
                            </button>
                            <button
                              onClick={() => { alert(`Assign Users to ${c.name}`); setActiveDropdownId(null); }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                            >
                              <Users className="w-3.5 h-3.5 text-[#6C2BD9]" /> Assign Users
                            </button>
                            <button
                              onClick={() => { setToastMsg(`Toggled status for ${c.name}`); setActiveDropdownId(null); }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-[#6C2BD9]" /> {c.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button
                              onClick={() => { alert(`Dependency check: Cannot delete ${c.name} while referenced by assets. Deactivation is recommended.`); setActiveDropdownId(null); }}
                              className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>Showing 1 to {companies.length} of {companies.length} records</div>
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
        </>
      )}

      {/* TAB 3: DEPARTMENTS (SCREENSHOT 4) */}
      {activeTab === 'departments' && (
        <>
          {/* Departments Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
            <div className="text-xs font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#6C2BD9]" />
              Filters
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Company</label>
                <select
                  value={selectedCompanyFilter}
                  onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="All Companies">All Companies</option>
                  <option value="Asset360 Holdings">Asset360 Holdings</option>
                  <option value="Wavelogix FZC">Wavelogix FZC</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Business Unit</label>
                <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs">
                  <option>All Business Units</option>
                  <option>Corporate Services</option>
                  <option>Operations</option>
                  <option>Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Department Status</label>
                <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Search</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by department name, code..."
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => { setSelectedCompanyFilter('All Companies'); setSearchQuery(''); }}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-medium"
              >
                Reset
              </button>
              <button
                onClick={fetchData}
                className="px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-semibold rounded-lg shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Departments Table (Screenshot 4) */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Departments ({departments.length})</h2>
              <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> Export &or;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold select-none">
                    <th className="p-3 pl-4 w-10">
                      <input type="checkbox" className="rounded border-slate-300 text-[#6C2BD9]" />
                    </th>
                    <th className="p-3 w-10 text-slate-400">#</th>
                    <th className="p-3 font-semibold text-slate-900">Department Name &or;</th>
                    <th className="p-3 font-semibold text-slate-900">Code &or;</th>
                    <th className="p-3 font-semibold text-slate-900">Business Unit &or;</th>
                    <th className="p-3 font-semibold text-slate-900">Department Head &or;</th>
                    <th className="p-3 font-semibold text-slate-900">Location &or;</th>
                    <th className="p-3 font-semibold text-slate-900">Cost Center &or;</th>
                    <th className="p-3 font-semibold text-slate-900">Status &or;</th>
                    <th className="p-3 font-semibold text-slate-900">Created On &or;</th>
                    <th className="p-3 text-right pr-4 font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departments.map((d, idx) => (
                    <tr key={d.id} className="hover:bg-[#F5F3FF]/40 transition">
                      <td className="p-3 pl-4">
                        <input type="checkbox" className="rounded border-slate-300 text-[#6C2BD9]" />
                      </td>
                      <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-900">{d.name}</td>
                      <td className="p-3 font-mono text-slate-600">{d.code}</td>
                      <td className="p-3 text-slate-600">{d.businessUnit}</td>
                      <td className="p-3 text-slate-700 font-medium">{d.departmentHead}</td>
                      <td className="p-3 text-slate-600">{d.location}</td>
                      <td className="p-3 font-mono text-slate-600">{d.costCenter}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                            d.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{d.createdOn}</td>
                      <td className="p-3 text-right pr-4 relative">
                        <button
                          onClick={() => setActiveDropdownId(activeDropdownId === d.id ? null : d.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded border border-slate-200 hover:bg-slate-50"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* 8 Row Actions for Departments (Screenshot 4) */}
                        {activeDropdownId === d.id && (
                          <div className="absolute right-4 top-10 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-30 py-1 text-left animate-in fade-in duration-100">
                            <button onClick={() => setActiveDropdownId(null)} className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2">
                              <Eye className="w-3.5 h-3.5 text-[#6C2BD9]" /> View Details
                            </button>
                            <button onClick={() => setActiveDropdownId(null)} className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2">
                              <Edit2 className="w-3.5 h-3.5 text-[#6C2BD9]" /> Edit Department
                            </button>
                            <button onClick={() => setActiveDropdownId(null)} className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2">
                              <Users className="w-3.5 h-3.5 text-[#6C2BD9]" /> Manage Users
                            </button>
                            <button onClick={() => setActiveDropdownId(null)} className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2">
                              <Briefcase className="w-3.5 h-3.5 text-[#6C2BD9]" /> Set Department Head
                            </button>
                            <button onClick={() => setActiveDropdownId(null)} className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-[#6C2BD9]" /> Assign Location
                            </button>
                            <button onClick={() => setActiveDropdownId(null)} className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2">
                              <Coins className="w-3.5 h-3.5 text-[#6C2BD9]" /> Assign Cost Center
                            </button>
                            <button onClick={() => setActiveDropdownId(null)} className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2">
                              <RotateCcw className="w-3.5 h-3.5 text-[#6C2BD9]" /> {d.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button onClick={() => setActiveDropdownId(null)} className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium">
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 4: LOCATIONS (SCREENSHOT 5) */}
      {activeTab === 'locations' && (
        <>
          {/* Locations Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
            <div className="text-xs font-semibold text-slate-800 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#6C2BD9]" />
                Filters
              </div>
              <button className="text-[#6C2BD9] text-xs font-medium flex items-center gap-1">
                Advanced Filters
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Company</label>
                <select
                  value={selectedCompanyFilter}
                  onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="All Companies">All Companies</option>
                  <option value="Asset360 Holdings">Asset360 Holdings</option>
                  <option value="Wavelogix FZC">Wavelogix FZC</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Business Unit</label>
                <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs">
                  <option>All Business Units</option>
                  <option>Corporate Services</option>
                  <option>Operations</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Country</label>
                <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs">
                  <option>All Countries</option>
                  <option>UAE</option>
                  <option>KSA</option>
                  <option>Qatar</option>
                  <option>Oman</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Location Type</label>
                <select
                  value={locationTypeFilter}
                  onChange={(e) => setLocationTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="All Types">All Types</option>
                  <option value="Head Office">Head Office</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Office">Office</option>
                  <option value="Service Center">Service Center</option>
                  <option value="Site">Site</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Search</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by location name, code..."
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => { setSelectedCompanyFilter('All Companies'); setLocationTypeFilter('All Types'); setSearchQuery(''); }}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-medium"
              >
                Reset
              </button>
              <button
                onClick={fetchData}
                className="px-4 py-1.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-semibold rounded-lg shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Locations Table (Screenshot 5) */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Locations ({locations.length})</h2>
              <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> Export &or;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold select-none">
                    <th className="p-3 pl-4 w-10">
                      <input type="checkbox" className="rounded border-slate-300 text-[#6C2BD9]" />
                    </th>
                    <th className="p-3 w-10 text-slate-400">#</th>
                    <th className="p-3 font-semibold text-slate-900">Location Name &or;</th>
                    <th className="p-3 font-semibold text-slate-900">Code &or;</th>
                    <th className="p-3 font-semibold text-slate-900">Company &or;</th>
                    <th className="p-3 font-semibold text-slate-900">Business Unit &or;</th>
                    <th className="p-3 font-semibold text-slate-900">City &or;</th>
                    <th className="p-3 font-semibold text-slate-900">Country &or;</th>
                    <th className="p-3 font-semibold text-slate-900">Location Type &or;</th>
                    <th className="p-3 font-semibold text-slate-900">Status &or;</th>
                    <th className="p-3 text-right pr-4 font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {locations.map((loc, idx) => (
                    <tr key={loc.id} className="hover:bg-[#F5F3FF]/40 transition">
                      <td className="p-3 pl-4">
                        <input type="checkbox" className="rounded border-slate-300 text-[#6C2BD9]" />
                      </td>
                      <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-900">{loc.name}</td>
                      <td className="p-3 font-mono text-slate-600">{loc.code}</td>
                      <td className="p-3 text-slate-600">{loc.company}</td>
                      <td className="p-3 text-slate-600">{loc.businessUnit}</td>
                      <td className="p-3 text-slate-600">{loc.city}</td>
                      <td className="p-3 text-slate-600">{loc.country}</td>
                      <td className="p-3 text-slate-700">{loc.locationType}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                            loc.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {loc.status}
                        </span>
                      </td>
                      <td className="p-3 text-right pr-4 relative">
                        <button
                          onClick={() => setActiveDropdownId(activeDropdownId === loc.id ? null : loc.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded border border-slate-200 hover:bg-slate-50"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* 7 Row Actions for Locations (Screenshot 5) */}
                        {activeDropdownId === loc.id && (
                          <div className="absolute right-4 top-10 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-30 py-1 text-left animate-in fade-in duration-100">
                            <button onClick={() => setActiveDropdownId(null)} className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2">
                              <Eye className="w-3.5 h-3.5 text-[#6C2BD9]" /> View Details
                            </button>
                            <button onClick={() => setActiveDropdownId(null)} className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2">
                              <Edit2 className="w-3.5 h-3.5 text-[#6C2BD9]" /> Edit Location
                            </button>
                            <button onClick={() => setActiveDropdownId(null)} className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2">
                              <Network className="w-3.5 h-3.5 text-[#6C2BD9]" /> Manage Departments
                            </button>
                            <button onClick={() => setActiveDropdownId(null)} className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2">
                              <Coins className="w-3.5 h-3.5 text-[#6C2BD9]" /> Assign Cost Center
                            </button>
                            <button onClick={() => setActiveDropdownId(null)} className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2">
                              <Users className="w-3.5 h-3.5 text-[#6C2BD9]" /> Assign Users
                            </button>
                            <button onClick={() => setActiveDropdownId(null)} className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-[#F5F3FF] hover:text-[#6C2BD9] flex items-center gap-2">
                              <RotateCcw className="w-3.5 h-3.5 text-[#6C2BD9]" /> {loc.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button onClick={() => setActiveDropdownId(null)} className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium">
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: BUSINESS UNITS */}
      {activeTab === 'businessUnits' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Business Units ({businessUnits.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessUnits.map((bu) => (
              <div key={bu.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#6C2BD9] font-bold">{bu.code}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{bu.status}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-1">{bu.name}</h4>
                <p className="text-xs text-slate-500 mt-1">Parent: {bu.company}</p>
                <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                  <span>Head: <strong>{bu.head}</strong></span>
                  <button className="text-[#6C2BD9] hover:underline font-medium">Manage &rarr;</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: COST CENTERS */}
      {activeTab === 'costCenters' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Cost Centers ({costCenters.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="p-3 pl-4">Cost Center Code</th>
                  <th className="p-3">Cost Center Name</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Currency</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {costCenters.map((cc) => (
                  <tr key={cc.id} className="hover:bg-[#F5F3FF]/40 transition">
                    <td className="p-3 pl-4 font-mono font-bold text-[#6C2BD9]">{cc.code}</td>
                    <td className="p-3 font-semibold text-slate-900">{cc.name}</td>
                    <td className="p-3 text-slate-600">{cc.company}</td>
                    <td className="p-3 text-slate-600">{cc.department}</td>
                    <td className="p-3 text-slate-600">{cc.location}</td>
                    <td className="p-3 text-slate-700">{cc.costCenterType}</td>
                    <td className="p-3 font-mono">{cc.currency}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {cc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
