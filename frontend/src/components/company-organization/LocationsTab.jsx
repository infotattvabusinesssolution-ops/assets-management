import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit2,
  Network,
  Coins,
  UserPlus,
  XCircle,
  CheckCircle2,
  Trash2,
  ChevronDown,
  Download,
  Calendar,
  Settings,
  ChevronUp,
  X,
  Building2,
  Plus
} from 'lucide-react';
import clsx from 'clsx';

export const INITIAL_LOCATIONS = [
  {
    id: 1,
    name: 'Dubai HQ',
    code: 'DXB-HQ',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate Services',
    city: 'Dubai',
    country: 'UAE',
    locationType: 'Head Office',
    status: 'Active',
    createdOn: '10 Jan 2025',
    address: 'Emaar Square, Building 4, Downtown Dubai, UAE',
    costCenter: 'CC-1001'
  },
  {
    id: 2,
    name: 'Jebel Ali Warehouse',
    code: 'DXB-WH1',
    company: 'Asset360 Holdings',
    businessUnit: 'Operations',
    city: 'Jebel Ali',
    country: 'UAE',
    locationType: 'Warehouse',
    status: 'Active',
    createdOn: '10 Jan 2025',
    address: 'Gate 4, Jebel Ali Freezone (JAFZA), Dubai, UAE',
    costCenter: 'CC-2001'
  },
  {
    id: 3,
    name: 'Abu Dhabi Office',
    code: 'AUH-OF1',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate Services',
    city: 'Abu Dhabi',
    country: 'UAE',
    locationType: 'Office',
    status: 'Active',
    createdOn: '11 Jan 2025',
    address: 'Al Khatem Tower, ADGM Square, Al Maryah Island, Abu Dhabi, UAE',
    costCenter: 'CC-1002'
  },
  {
    id: 4,
    name: 'Sharjah Warehouse',
    code: 'SHJ-WH1',
    company: 'Wavelogix FZC',
    businessUnit: 'Operations',
    city: 'Sharjah',
    country: 'UAE',
    locationType: 'Warehouse',
    status: 'Active',
    createdOn: '12 Jan 2025',
    address: 'SAIF Zone, Warehouse Area C, Sharjah, UAE',
    costCenter: 'CC-2003'
  },
  {
    id: 5,
    name: 'Riyadh Office',
    code: 'RUH-OF1',
    company: 'd.code Solutions LLC',
    businessUnit: 'Sales',
    city: 'Riyadh',
    country: 'KSA',
    locationType: 'Office',
    status: 'Active',
    createdOn: '12 Jan 2025',
    address: 'King Fahd Road, Al Olaya District, Riyadh, KSA',
    costCenter: 'CC-3001'
  },
  {
    id: 6,
    name: 'Doha Office',
    code: 'DOH-OF1',
    company: 'Digital ID Solutions',
    businessUnit: 'Sales',
    city: 'Doha',
    country: 'Qatar',
    locationType: 'Office',
    status: 'Inactive',
    createdOn: '13 Jan 2025',
    address: 'West Bay Commercial Tower, Doha, Qatar',
    costCenter: 'CC-3002'
  },
  {
    id: 7,
    name: 'Muscat Service Center',
    code: 'MCT-SVC',
    company: 'Asset360 Holdings',
    businessUnit: 'Support',
    city: 'Muscat',
    country: 'Oman',
    locationType: 'Service Center',
    status: 'Active',
    createdOn: '14 Jan 2025',
    address: 'Ruwi Commercial District, Muscat, Oman',
    costCenter: 'CC-1004'
  },
  {
    id: 8,
    name: 'Dammam Warehouse',
    code: 'DMM-WH1',
    company: 'Wavelogix FZC',
    businessUnit: 'Operations',
    city: 'Dammam',
    country: 'KSA',
    locationType: 'Warehouse',
    status: 'Active',
    createdOn: '15 Jan 2025',
    address: '2nd Industrial City, Dammam, KSA',
    costCenter: 'CC-2002'
  },
  {
    id: 9,
    name: 'Fujairah Site',
    code: 'FUJ-ST1',
    company: 'Green Arabia LLC',
    businessUnit: 'Operations',
    city: 'Fujairah',
    country: 'UAE',
    locationType: 'Site',
    status: 'Active',
    createdOn: '16 Jan 2025',
    address: 'Port of Fujairah Energy Park, Fujairah, UAE',
    costCenter: 'CC-2004'
  },
  {
    id: 10,
    name: 'Al Ain Office',
    code: 'AAN-OF1',
    company: 'Asset360 Holdings',
    businessUnit: 'Administration',
    city: 'Al Ain',
    country: 'UAE',
    locationType: 'Office',
    status: 'Active',
    createdOn: '17 Jan 2025',
    address: 'Town Centre Commercial Mall, Al Ain, UAE',
    costCenter: 'CC-1005'
  },
  {
    id: 11,
    name: 'Jeddah Branch',
    code: 'JED-BR1',
    company: 'd.code Solutions LLC',
    businessUnit: 'Sales',
    city: 'Jeddah',
    country: 'KSA',
    locationType: 'Office',
    status: 'Active',
    createdOn: '18 Jan 2025',
    address: 'Al Corniche Road, Al Hamra District, Jeddah, KSA',
    costCenter: 'CC-3003'
  },
  {
    id: 12,
    name: 'Manama Tech Hub',
    code: 'BAH-HUB',
    company: 'Digital ID Solutions',
    businessUnit: 'Corporate Services',
    city: 'Manama',
    country: 'Bahrain',
    locationType: 'Office',
    status: 'Active',
    createdOn: '19 Jan 2025',
    address: 'Bahrain Financial Harbour, Manama, Bahrain',
    costCenter: 'CC-1006'
  },
  {
    id: 13,
    name: 'Kuwait City Logistics Hub',
    code: 'KWT-HUB',
    company: 'Asset360 Holdings',
    businessUnit: 'Operations',
    city: 'Kuwait City',
    country: 'Kuwait',
    locationType: 'Warehouse',
    status: 'Active',
    createdOn: '20 Jan 2025',
    address: 'Shuwaikh Industrial Area, Kuwait City, Kuwait',
    costCenter: 'CC-2005'
  },
  {
    id: 14,
    name: 'Ras Al Khaimah Site',
    code: 'RAK-ST1',
    company: 'Wavelogix FZC',
    businessUnit: 'Operations',
    city: 'Ras Al Khaimah',
    country: 'UAE',
    locationType: 'Site',
    status: 'Active',
    createdOn: '21 Jan 2025',
    address: 'RAK Maritime City, Ras Al Khaimah, UAE',
    costCenter: 'CC-2006'
  },
  {
    id: 15,
    name: 'Sohar Depot',
    code: 'SOH-DEP',
    company: 'Asset360 Holdings',
    businessUnit: 'Operations',
    city: 'Sohar',
    country: 'Oman',
    locationType: 'Warehouse',
    status: 'Active',
    createdOn: '22 Jan 2025',
    address: 'Sohar Freezone Area 2, Sohar, Oman',
    costCenter: 'CC-2007'
  }
];

export function LocationsTab({ triggerToast, onSwitchTab }) {
  const [locations, setLocations] = useState(INITIAL_LOCATIONS);
  const [selectedLocIds, setSelectedLocIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All Companies');
  const [buFilter, setBuFilter] = useState('All Business Units');
  const [countryFilter, setCountryFilter] = useState('All Countries');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [costCenterFilter, setCostCenterFilter] = useState('All Cost Centers');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);

  // Modals & UI State
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [showAddLocModal, setShowAddLocModal] = useState(false);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [editingLoc, setEditingLoc] = useState(null);

  const [locForm, setLocForm] = useState({
    name: '',
    code: '',
    company: 'Asset360 Holdings',
    businessUnit: 'Corporate Services',
    city: 'Dubai',
    country: 'UAE',
    locationType: 'Head Office',
    status: 'Active',
    address: '',
    costCenter: 'CC-1001'
  });

  // Filtered List Memo
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesSearch =
        !searchQuery ||
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (loc.address && loc.address.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCompany =
        companyFilter === 'All Companies' || companyFilter === 'All' || loc.company === companyFilter;

      const matchesBu =
        buFilter === 'All Business Units' || buFilter === 'All' || loc.businessUnit === buFilter;

      const matchesCountry =
        countryFilter === 'All Countries' || countryFilter === 'All' || loc.country === countryFilter;

      const matchesCity =
        cityFilter === 'All Cities' || cityFilter === 'All' || loc.city === cityFilter;

      const matchesType =
        typeFilter === 'All Types' || typeFilter === 'All' || loc.locationType === typeFilter;

      const matchesStatus =
        statusFilter === 'All Statuses' || statusFilter === 'All Status' || statusFilter === 'All' || loc.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesCostCenter =
        costCenterFilter === 'All Cost Centers' || costCenterFilter === 'All' || loc.costCenter === costCenterFilter;

      return (
        matchesSearch &&
        matchesCompany &&
        matchesBu &&
        matchesCountry &&
        matchesCity &&
        matchesType &&
        matchesStatus &&
        matchesCostCenter
      );
    });
  }, [
    locations,
    searchQuery,
    companyFilter,
    buFilter,
    countryFilter,
    cityFilter,
    typeFilter,
    statusFilter,
    costCenterFilter
  ]);

  // Paginated List
  const paginatedLocations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLocations.slice(start, start + pageSize);
  }, [filteredLocations, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredLocations.length / pageSize) || 1;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLocIds(paginatedLocations.map((loc) => loc.id));
    } else {
      setSelectedLocIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedLocIds.includes(id)) {
      setSelectedLocIds(selectedLocIds.filter((i) => i !== id));
    } else {
      setSelectedLocIds([...selectedLocIds, id]);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCompanyFilter('All Companies');
    setBuFilter('All Business Units');
    setCountryFilter('All Countries');
    setCityFilter('All Cities');
    setTypeFilter('All Types');
    setStatusFilter('All Statuses');
    setCostCenterFilter('All Cost Centers');
    setDepartmentFilter('All Departments');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  const handleOpenAddModal = (locToEdit = null) => {
    if (locToEdit) {
      setEditingLoc(locToEdit);
      setLocForm({
        name: locToEdit.name,
        code: locToEdit.code,
        company: locToEdit.company || 'Asset360 Holdings',
        businessUnit: locToEdit.businessUnit || 'Corporate Services',
        city: locToEdit.city || 'Dubai',
        country: locToEdit.country || 'UAE',
        locationType: locToEdit.locationType || 'Head Office',
        status: locToEdit.status || 'Active',
        address: locToEdit.address || '',
        costCenter: locToEdit.costCenter || 'CC-1001'
      });
    } else {
      setEditingLoc(null);
      setLocForm({
        name: '',
        code: '',
        company: 'Asset360 Holdings',
        businessUnit: 'Corporate Services',
        city: 'Dubai',
        country: 'UAE',
        locationType: 'Head Office',
        status: 'Active',
        address: '',
        costCenter: 'CC-1001'
      });
    }
    setShowAddLocModal(true);
  };

  const handleSaveLoc = (e) => {
    e.preventDefault();
    if (!locForm.name || !locForm.code) return;

    if (editingLoc) {
      setLocations(
        locations.map((loc) =>
          loc.id === editingLoc.id
            ? {
                ...loc,
                name: locForm.name,
                code: locForm.code.toUpperCase(),
                company: locForm.company,
                businessUnit: locForm.businessUnit,
                city: locForm.city,
                country: locForm.country,
                locationType: locForm.locationType,
                status: locForm.status,
                address: locForm.address,
                costCenter: locForm.costCenter
              }
            : loc
        )
      );
      triggerToast && triggerToast(`Location "${locForm.name}" updated.`);
    } else {
      const newLoc = {
        id: Date.now(),
        name: locForm.name,
        code: locForm.code.toUpperCase(),
        company: locForm.company,
        businessUnit: locForm.businessUnit,
        city: locForm.city,
        country: locForm.country,
        locationType: locForm.locationType,
        status: locForm.status,
        createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        address: locForm.address,
        costCenter: locForm.costCenter
      };
      setLocations([newLoc, ...locations]);
      triggerToast && triggerToast(`Location "${locForm.name}" created.`);
    }
    setShowAddLocModal(false);
  };

  const handleToggleStatus = (loc) => {
    setActiveDropdownId(null);
    const nextStatus = loc.status === 'Active' ? 'Inactive' : 'Active';
    setLocations(locations.map((l) => (l.id === loc.id ? { ...l, status: nextStatus } : l)));
    triggerToast && triggerToast(`Location "${loc.name}" status set to ${nextStatus}.`);
  };

  const handleDeleteLoc = (loc) => {
    setActiveDropdownId(null);
    if (!window.confirm(`Are you sure you want to delete location "${loc.name}"?`)) return;
    setLocations(locations.filter((l) => l.id !== loc.id));
    triggerToast && triggerToast(`Location "${loc.name}" deleted.`);
  };

  return (
    <div className="space-y-6">
      {/* Filters Card matching Screenshot */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-[#6C2BD9]" />
            <span>Filters</span>
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-xs font-bold text-[#6C2BD9] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Advanced Filters</span>
            {showAdvancedFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Row 1 Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Company */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Company</label>
            <div className="relative">
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
              >
                <option value="All Companies">All Companies</option>
                <option value="Asset360 Holdings">Asset360 Holdings</option>
                <option value="Wavelogix FZC">Wavelogix FZC</option>
                <option value="d.code Solutions LLC">d.code Solutions LLC</option>
                <option value="Digital ID Solutions">Digital ID Solutions</option>
                <option value="Green Arabia LLC">Green Arabia LLC</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Business Unit */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Business Unit</label>
            <div className="relative">
              <select
                value={buFilter}
                onChange={(e) => setBuFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
              >
                <option value="All Business Units">All Business Units</option>
                <option value="Corporate Services">Corporate Services</option>
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
                <option value="Support">Support</option>
                <option value="Administration">Administration</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Country</label>
            <div className="relative">
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
              >
                <option value="All Countries">All Countries</option>
                <option value="UAE">UAE</option>
                <option value="KSA">KSA</option>
                <option value="Qatar">Qatar</option>
                <option value="Oman">Oman</option>
                <option value="Bahrain">Bahrain</option>
                <option value="Kuwait">Kuwait</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">City</label>
            <div className="relative">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
              >
                <option value="All Cities">All Cities</option>
                <option value="Dubai">Dubai</option>
                <option value="Jebel Ali">Jebel Ali</option>
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Sharjah">Sharjah</option>
                <option value="Riyadh">Riyadh</option>
                <option value="Doha">Doha</option>
                <option value="Muscat">Muscat</option>
                <option value="Dammam">Dammam</option>
                <option value="Fujairah">Fujairah</option>
                <option value="Al Ain">Al Ain</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Location Type */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Location Type</label>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
              >
                <option value="All Types">All Types</option>
                <option value="Head Office">Head Office</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Office">Office</option>
                <option value="Service Center">Service Center</option>
                <option value="Site">Site</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 2 Filters matching Screenshot */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs mt-3 items-end animate-fadeIn">
            {/* Status */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Status</label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Cost Center */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Cost Center</label>
              <div className="relative">
                <select
                  value={costCenterFilter}
                  onChange={(e) => setCostCenterFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
                >
                  <option value="All Cost Centers">All Cost Centers</option>
                  <option value="CC-1001">CC-1001</option>
                  <option value="CC-1002">CC-1002</option>
                  <option value="CC-2001">CC-2001</option>
                  <option value="CC-2002">CC-2002</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Department</label>
              <div className="relative">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] appearance-none cursor-pointer"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Created Date */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Created Date</label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="From Date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full pl-8 pr-2 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:border-[#6C2BD9] focus:outline-hidden"
                  />
                </div>
                <span className="text-slate-400 font-bold">→</span>
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="To Date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:border-[#6C2BD9] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Search</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by location name, code or address..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-700 transition cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={() => triggerToast && triggerToast('Location filters applied.')}
            className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>

      {/* Locations Table Card matching Screenshot */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900">Locations ({filteredLocations.length})</h2>
          <button
            onClick={() => triggerToast && triggerToast('Exporting Locations data...')}
            className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold select-none text-[11px] uppercase tracking-wider">
                <th className="p-3 pl-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedLocIds.length === paginatedLocations.length && paginatedLocations.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-[#6C2BD9] cursor-pointer"
                  />
                </th>
                <th className="p-3 w-10 text-slate-400">#</th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Location Name</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Code</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Company</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Business Unit</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>City</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Country</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Location Type</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 font-bold text-slate-900">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#6C2BD9]">
                    <span>Status</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 text-center font-bold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedLocations.length === 0 ? (
                <tr>
                  <td colSpan="11" className="p-8 text-center text-slate-500 font-semibold">
                    No locations match current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedLocations.map((loc, idx) => {
                  const isSelected = selectedLocIds.includes(loc.id);
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={loc.id}
                      className={clsx(
                        'transition-colors',
                        isSelected ? 'bg-purple-50/40' : 'hover:bg-slate-50/60'
                      )}
                    >
                      <td className="p-3 pl-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(loc.id)}
                          className="rounded border-slate-300 text-[#6C2BD9] cursor-pointer"
                        />
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">{globalIdx}</td>
                      <td className="p-3 font-bold text-[#6C2BD9]">
                        <span
                          className="cursor-pointer hover:underline"
                          onClick={() => {
                            setSelectedLoc(loc);
                            setShowViewDetailsModal(true);
                          }}
                        >
                          {loc.name}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 font-mono font-bold">{loc.code}</td>
                      <td className="p-3 text-slate-800 font-semibold">{loc.company}</td>
                      <td className="p-3 text-slate-700">{loc.businessUnit}</td>
                      <td className="p-3 text-slate-700 font-medium">{loc.city}</td>
                      <td className="p-3 text-slate-800 font-bold">{loc.country}</td>
                      <td className="p-3 text-slate-700">{loc.locationType}</td>
                      <td className="p-3">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold',
                            loc.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          )}
                        >
                          {loc.status}
                        </span>
                      </td>
                      <td className="p-3 text-center relative">
                        <button
                          onClick={() => setActiveDropdownId(activeDropdownId === loc.id ? null : loc.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Context Dropdown Menu matching Screenshot exactly */}
                        {activeDropdownId === loc.id && (
                          <div className="absolute right-4 top-10 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 text-left animate-fadeIn">
                            <button
                              onClick={() => {
                                setSelectedLoc(loc);
                                setShowViewDetailsModal(true);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <Eye className="w-4 h-4 text-[#6C2BD9]" />
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                handleOpenAddModal(loc);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <Edit2 className="w-4 h-4 text-[#6C2BD9]" />
                              Edit Location
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdownId(null);
                                onSwitchTab && onSwitchTab('departments');
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <Network className="w-4 h-4 text-[#6C2BD9]" />
                              Manage Departments
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdownId(null);
                                onSwitchTab && onSwitchTab('costCenters');
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <Coins className="w-4 h-4 text-[#6C2BD9]" />
                              Assign Cost Center
                            </button>
                            <button
                              onClick={() => {
                                triggerToast && triggerToast(`Assign users to ${loc.name}`);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              <UserPlus className="w-4 h-4 text-[#6C2BD9]" />
                              Assign Users
                            </button>

                            <div className="border-t border-slate-100 my-1"></div>

                            <button
                              onClick={() => handleToggleStatus(loc)}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#6C2BD9] flex items-center gap-2.5 font-semibold"
                            >
                              {loc.status === 'Active' ? (
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
                              onClick={() => handleDeleteLoc(loc)}
                              className="w-full px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-semibold"
                            >
                              <Trash2 className="w-4 h-4 text-rose-600" />
                              Delete
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
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredLocations.length)} of {filteredLocations.length} records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2.5 py-1 border border-slate-200 rounded-lg disabled:opacity-40 font-bold hover:bg-slate-50 cursor-pointer"
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 border border-slate-200 rounded-lg disabled:opacity-40 font-bold hover:bg-slate-50 cursor-pointer"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={clsx(
                  'px-3 py-1 rounded-lg font-bold cursor-pointer',
                  currentPage === p ? 'bg-[#6C2BD9] text-white' : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 border border-slate-200 rounded-lg disabled:opacity-40 font-bold hover:bg-slate-50 cursor-pointer"
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 border border-slate-200 rounded-lg disabled:opacity-40 font-bold hover:bg-slate-50 cursor-pointer"
            >
              »
            </button>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs bg-white font-medium focus:outline-hidden cursor-pointer"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {showViewDetailsModal && selectedLoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center border border-purple-100">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedLoc.name}</h3>
                  <p className="text-xs text-slate-400">Code: {selectedLoc.code}</p>
                </div>
              </div>
              <button onClick={() => setShowViewDetailsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Full Address</span>
                <span className="font-bold text-slate-800">{selectedLoc.address || '-'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Company</span>
                  <span className="font-bold text-slate-800">{selectedLoc.company}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Business Unit</span>
                  <span className="font-bold text-slate-800">{selectedLoc.businessUnit}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">City / Country</span>
                  <span className="font-bold text-slate-800">{selectedLoc.city}, {selectedLoc.country}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Location Type</span>
                  <span className="font-bold text-[#6C2BD9]">{selectedLoc.locationType}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Cost Center</span>
                  <span className="font-mono font-bold text-[#6C2BD9]">{selectedLoc.costCenter}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Status</span>
                  <span className={clsx('font-bold', selectedLoc.status === 'Active' ? 'text-emerald-600' : 'text-rose-600')}>
                    {selectedLoc.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowViewDetailsModal(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT LOCATION MODAL */}
      {showAddLocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-fadeIn text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingLoc ? 'Edit Location' : 'Add New Location'}
              </h3>
              <button onClick={() => setShowAddLocModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLoc} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Location Name *</label>
                <input
                  type="text"
                  required
                  value={locForm.name}
                  onChange={(e) => setLocForm({ ...locForm, name: e.target.value })}
                  placeholder="e.g. Dubai HQ"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={locForm.code}
                    onChange={(e) => setLocForm({ ...locForm, code: e.target.value })}
                    placeholder="e.g. DXB-HQ"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location Type</label>
                  <select
                    value={locForm.locationType}
                    onChange={(e) => setLocForm({ ...locForm, locationType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium cursor-pointer"
                  >
                    <option value="Head Office">Head Office</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Office">Office</option>
                    <option value="Service Center">Service Center</option>
                    <option value="Site">Site</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company</label>
                  <select
                    value={locForm.company}
                    onChange={(e) => setLocForm({ ...locForm, company: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium cursor-pointer"
                  >
                    <option value="Asset360 Holdings">Asset360 Holdings</option>
                    <option value="Wavelogix FZC">Wavelogix FZC</option>
                    <option value="d.code Solutions LLC">d.code Solutions LLC</option>
                    <option value="Digital ID Solutions">Digital ID Solutions</option>
                    <option value="Green Arabia LLC">Green Arabia LLC</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Business Unit</label>
                  <select
                    value={locForm.businessUnit}
                    onChange={(e) => setLocForm({ ...locForm, businessUnit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium cursor-pointer"
                  >
                    <option value="Corporate Services">Corporate Services</option>
                    <option value="Operations">Operations</option>
                    <option value="Sales">Sales</option>
                    <option value="Support">Support</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={locForm.city}
                    onChange={(e) => setLocForm({ ...locForm, city: e.target.value })}
                    placeholder="e.g. Dubai"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Country</label>
                  <select
                    value={locForm.country}
                    onChange={(e) => setLocForm({ ...locForm, country: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium cursor-pointer"
                  >
                    <option value="UAE">UAE</option>
                    <option value="KSA">KSA</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Oman">Oman</option>
                    <option value="Bahrain">Bahrain</option>
                    <option value="Kuwait">Kuwait</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Address</label>
                <textarea
                  rows="2"
                  value={locForm.address}
                  onChange={(e) => setLocForm({ ...locForm, address: e.target.value })}
                  placeholder="Street, building, district details..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9] font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddLocModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingLoc ? 'Save Changes' : 'Create Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationsTab;
