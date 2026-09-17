import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  MoreHorizontal,
  Plus,
  X,
  Copy,
  RefreshCw,
  Trash2,
  ChevronRight,
  Truck,
  Package,
  FileText,
  FileCheck,
  Globe,
  Mail,
  Phone,
  MapPin,
  Building2,
  DollarSign
} from 'lucide-react';
import clsx from 'clsx';

export const INITIAL_SUPPLIERS = [
  {
    id: 1,
    code: 'SUP-1000',
    name: 'Zebra Technologies',
    type: 'Hardware',
    company: 'Wavelogix FZC',
    country: 'USA',
    contactPerson: 'Michael Brown',
    email: 'michael.brown@zebra.com',
    phone: '+1 847 634 6700',
    address: '3 Overlook Point, Lincolnshire, Illinois 60069, USA',
    website: 'www.zebra.com',
    paymentTerms: '30 Days',
    taxNo: '12-3456789',
    description: 'Manufacturer of barcode and RFID devices',
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '12 Jan 2025 09:15 AM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '28 Aug 2025 02:30 PM',
    relatedInfo: {
      purchaseOrders: 18,
      assets: 245,
      contracts: 3,
      documents: 12
    }
  },
  {
    id: 2,
    code: 'SUP-1100',
    name: 'Honeywell',
    type: 'Hardware',
    company: 'Wavelogix FZC',
    country: 'USA',
    contactPerson: 'Sarah Wilson',
    email: 'sarah.wilson@honeywell.com',
    phone: '+1 800 582 4263',
    address: '855 S Mint St, Charlotte, NC 28202, USA',
    website: 'www.honeywell.com',
    paymentTerms: '45 Days',
    taxNo: '12-9876543',
    description: 'Enterprise barcode scanners, mobile computers, and industrial automation.',
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '14 Jan 2025 10:30 AM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '25 Aug 2025 01:15 PM',
    relatedInfo: {
      purchaseOrders: 14,
      assets: 180,
      contracts: 2,
      documents: 8
    }
  },
  {
    id: 3,
    code: 'SUP-1200',
    name: 'Brady Corporation',
    type: 'Consumables',
    company: 'Wavelogix FZC',
    country: 'USA',
    contactPerson: 'Thomas Lee',
    email: 'thomas.lee@bradycorp.com',
    phone: '+1 414 358 6600',
    address: '6555 W Good Hope Rd, Milwaukee, WI 53223, USA',
    website: 'www.bradycorp.com',
    paymentTerms: '30 Days',
    taxNo: '34-5678901',
    description: 'Industrial safety identification, specialty labels, and printer ribbons.',
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '16 Jan 2025 02:00 PM',
    lastModifiedBy: 'Ramesh Kumar',
    lastModifiedOn: '20 Aug 2025 11:40 AM',
    relatedInfo: {
      purchaseOrders: 22,
      assets: 95,
      contracts: 1,
      documents: 5
    }
  },
  {
    id: 4,
    code: 'SUP-1300',
    name: 'HID Global',
    type: 'RFID Tags',
    company: 'Wavelogix FZC',
    country: 'USA',
    contactPerson: 'Rachel Kim',
    email: 'rachel.kim@hidglobal.com',
    phone: '+1 512 776 9000',
    address: '611 Center Ridge Dr, Austin, TX 78753, USA',
    website: 'www.hidglobal.com',
    paymentTerms: '60 Days',
    taxNo: '45-6789012',
    description: 'Secure identity solutions, active/passive RFID tags, and access controllers.',
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '18 Jan 2025 11:15 AM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '22 Aug 2025 04:50 PM',
    relatedInfo: {
      purchaseOrders: 16,
      assets: 310,
      contracts: 4,
      documents: 9
    }
  },
  {
    id: 5,
    code: 'SUP-1400',
    name: 'Teltonika',
    type: 'Telematics',
    company: 'Wavelogix FZC',
    country: 'Lithuania',
    contactPerson: 'Jonas Petraitis',
    email: 'jonas.p@teltonika.lt',
    phone: '+370 37 204 444',
    address: 'Saltoniskiu g. 9, Vilnius 08105, Lithuania',
    website: 'www.teltonika-gps.com',
    paymentTerms: '30 Days',
    taxNo: 'LT-100029341',
    description: 'GPS trackers, BLE beacons, asset tracking devices, and IoT gateways.',
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '20 Jan 2025 09:45 AM',
    lastModifiedBy: 'Hassan Ali',
    lastModifiedOn: '26 Aug 2025 10:20 AM',
    relatedInfo: {
      purchaseOrders: 11,
      assets: 420,
      contracts: 2,
      documents: 6
    }
  },
  {
    id: 6,
    code: 'SUP-1500',
    name: 'TEXBIT GmbH',
    type: 'RFID Tags',
    company: 'Wavelogix FZC',
    country: 'Germany',
    contactPerson: 'Stefan Weber',
    email: 's.weber@texbit.de',
    phone: '+49 711 722 328',
    address: 'Industriestrasse 14, 70565 Stuttgart, Germany',
    website: 'www.texbit.de',
    paymentTerms: '30 Days',
    taxNo: 'DE-98712345',
    description: 'High-temperature industrial RFID transponders and laundry tags.',
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '22 Jan 2025 01:30 PM',
    lastModifiedBy: 'Michael Chen',
    lastModifiedOn: '27 Aug 2025 03:15 PM',
    relatedInfo: {
      purchaseOrders: 8,
      assets: 150,
      contracts: 1,
      documents: 4
    }
  },
  {
    id: 7,
    code: 'SUP-1600',
    name: 'Urovo',
    type: 'Handheld Devices',
    company: 'Wavelogix FZC',
    country: 'China',
    contactPerson: 'Li Wei',
    email: 'li.wei@urovo.com',
    phone: '+86 755 8659 0000',
    address: 'High-Tech Industrial Park, Nanshan District, Shenzhen, China',
    website: 'www.urovo.com',
    paymentTerms: '45 Days',
    taxNo: 'CN-914403007',
    description: 'Rugged handheld mobile computers and mobile payment terminals.',
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '25 Jan 2025 10:00 AM',
    lastModifiedBy: 'Sarah Ahmed',
    lastModifiedOn: '29 Aug 2025 09:30 AM',
    relatedInfo: {
      purchaseOrders: 15,
      assets: 290,
      contracts: 3,
      documents: 7
    }
  },
  {
    id: 8,
    code: 'SUP-1700',
    name: 'Newland',
    type: 'Scanners',
    company: 'Wavelogix FZC',
    country: 'China',
    contactPerson: 'Chen Fang',
    email: 'chen.fang@newland-id.com',
    phone: '+86 592 608 9797',
    address: 'Software Park Phase II, Xiamen, Fujian, China',
    website: 'www.newland-id.com',
    paymentTerms: '30 Days',
    taxNo: 'CN-913502006',
    description: 'Fixed mount OEM barcode scan engines and wireless handheld scanners.',
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '28 Jan 2025 03:45 PM',
    lastModifiedBy: 'Ramesh Kumar',
    lastModifiedOn: '30 Aug 2025 02:10 PM',
    relatedInfo: {
      purchaseOrders: 9,
      assets: 130,
      contracts: 1,
      documents: 3
    }
  },
  {
    id: 9,
    code: 'SUP-1800',
    name: 'Emdoor',
    type: 'Rugged Tablets',
    company: 'Wavelogix FZC',
    country: 'China',
    contactPerson: 'Kevin Zhang',
    email: 'kevin.z@emdoor.com',
    phone: '+86 755 2372 2888',
    address: 'Baoan District, Shenzhen, Guangdong, China',
    website: 'www.emdoor.com',
    paymentTerms: '30 Days',
    taxNo: 'CN-914403003',
    description: 'Windows & Android rugged tablets and vehicle mount computers.',
    status: 'Inactive',
    createdBy: 'Admin',
    createdOn: '01 Feb 2025 09:20 AM',
    lastModifiedBy: 'Kevin Zhang',
    lastModifiedOn: '01 Sep 2025 11:00 AM',
    relatedInfo: {
      purchaseOrders: 4,
      assets: 65,
      contracts: 1,
      documents: 2
    }
  },
  {
    id: 10,
    code: 'SUP-1900',
    name: 'Al Futtaim Technologies',
    type: 'Local Supplier',
    company: 'Wavelogix FZC',
    country: 'UAE',
    contactPerson: 'Ahmed Al Marri',
    email: 'ahmed.marri@alfuttaim.ae',
    phone: '+971 4 332 9000',
    address: 'Al Futtaim Tower, Deira, Dubai, UAE',
    website: 'www.alfuttaimtechnologies.com',
    paymentTerms: '30 Days',
    taxNo: '100023456700003',
    description: 'System integrator, ELV systems, local warranty support and installation.',
    status: 'Active',
    createdBy: 'Admin',
    createdOn: '05 Feb 2025 11:30 AM',
    lastModifiedBy: 'Ahmed Al Marri',
    lastModifiedOn: '02 Sep 2025 04:15 PM',
    relatedInfo: {
      purchaseOrders: 25,
      assets: 540,
      contracts: 5,
      documents: 14
    }
  }
];

export function SuppliersTab({ triggerToast, activeRowMenuId, setActiveRowMenuId, handleOpenAddModal }) {
  const [suppliersList, setSuppliersList] = useState(INITIAL_SUPPLIERS);
  const [selectedSupplier, setSelectedSupplier] = useState(INITIAL_SUPPLIERS[0]);
  const [selectedSupIds, setSelectedSupIds] = useState([]);

  // Filter States
  const [supSearchQuery, setSupSearchQuery] = useState('');
  const [supTypeFilter, setSupTypeFilter] = useState('All Types');
  const [supStatusFilter, setSupStatusFilter] = useState('All');
  const [supCountryFilter, setSupCountryFilter] = useState('All');
  const [supCompanyFilter, setSupCompanyFilter] = useState('All Companies');

  // Modal State
  const [showAddSupModal, setShowAddSupModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supFormState, setSupFormState] = useState({
    code: '',
    name: '',
    type: 'Hardware',
    company: 'Wavelogix FZC',
    country: 'USA',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    paymentTerms: '30 Days',
    taxNo: '',
    description: '',
    status: 'Active'
  });

  // Filtered Suppliers Memo
  const filteredSuppliers = useMemo(() => {
    return suppliersList.filter((sup) => {
      const matchesSearch =
        !supSearchQuery ||
        sup.code.toLowerCase().includes(supSearchQuery.toLowerCase()) ||
        sup.name.toLowerCase().includes(supSearchQuery.toLowerCase()) ||
        (sup.contactPerson && sup.contactPerson.toLowerCase().includes(supSearchQuery.toLowerCase())) ||
        (sup.description && sup.description.toLowerCase().includes(supSearchQuery.toLowerCase()));

      const matchesType =
        supTypeFilter === 'All Types' || supTypeFilter === 'All' || sup.type === supTypeFilter;

      const matchesStatus =
        supStatusFilter === 'All' || sup.status.toLowerCase() === supStatusFilter.toLowerCase();

      const matchesCountry =
        supCountryFilter === 'All' || sup.country === supCountryFilter;

      const matchesCompany =
        supCompanyFilter === 'All Companies' || supCompanyFilter === 'All' || sup.company === supCompanyFilter;

      return matchesSearch && matchesType && matchesStatus && matchesCountry && matchesCompany;
    });
  }, [suppliersList, supSearchQuery, supTypeFilter, supStatusFilter, supCountryFilter, supCompanyFilter]);

  const handleResetSupFilters = () => {
    setSupSearchQuery('');
    setSupTypeFilter('All Types');
    setSupStatusFilter('All');
    setSupCountryFilter('All');
    setSupCompanyFilter('All Companies');
  };

  const handleOpenAddSupModalInternal = (supToEdit = null) => {
    if (supToEdit) {
      setEditingSupplier(supToEdit);
      setSupFormState({
        code: supToEdit.code,
        name: supToEdit.name,
        type: supToEdit.type || 'Hardware',
        company: supToEdit.company || 'Wavelogix FZC',
        country: supToEdit.country || 'USA',
        contactPerson: supToEdit.contactPerson || '',
        email: supToEdit.email || '',
        phone: supToEdit.phone || '',
        address: supToEdit.address || '',
        website: supToEdit.website || '',
        paymentTerms: supToEdit.paymentTerms || '30 Days',
        taxNo: supToEdit.taxNo || '',
        description: supToEdit.description || '',
        status: supToEdit.status || 'Active'
      });
    } else {
      setEditingSupplier(null);
      setSupFormState({
        code: '',
        name: '',
        type: 'Hardware',
        company: 'Wavelogix FZC',
        country: 'USA',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        paymentTerms: '30 Days',
        taxNo: '',
        description: '',
        status: 'Active'
      });
    }
    setShowAddSupModal(true);
  };

  const handleSaveSup = (e) => {
    e.preventDefault();
    if (!supFormState.code || !supFormState.name) return;

    if (editingSupplier) {
      const updated = suppliersList.map((s) =>
        s.id === editingSupplier.id
          ? {
            ...s,
            code: supFormState.code.toUpperCase(),
            name: supFormState.name,
            type: supFormState.type,
            company: supFormState.company,
            country: supFormState.country,
            contactPerson: supFormState.contactPerson,
            email: supFormState.email,
            phone: supFormState.phone,
            address: supFormState.address,
            website: supFormState.website,
            paymentTerms: supFormState.paymentTerms,
            taxNo: supFormState.taxNo,
            description: supFormState.description,
            status: supFormState.status,
            lastModifiedBy: 'Logged In User',
            lastModifiedOn: new Date().toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }) + ' 02:30 PM'
          }
          : s
      );
      setSuppliersList(updated);
      if (selectedSupplier?.id === editingSupplier.id) {
        setSelectedSupplier(updated.find((item) => item.id === editingSupplier.id));
      }
      triggerToast && triggerToast(`Supplier "${supFormState.name}" updated successfully.`);
    } else {
      const newSup = {
        id: Date.now(),
        code: supFormState.code.toUpperCase(),
        name: supFormState.name,
        type: supFormState.type,
        company: supFormState.company,
        country: supFormState.country,
        contactPerson: supFormState.contactPerson,
        email: supFormState.email,
        phone: supFormState.phone,
        address: supFormState.address,
        website: supFormState.website,
        paymentTerms: supFormState.paymentTerms,
        taxNo: supFormState.taxNo,
        description: supFormState.description,
        status: supFormState.status,
        createdBy: 'Admin User',
        createdOn: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ' 09:15 AM',
        lastModifiedBy: 'Admin User',
        lastModifiedOn: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ' 09:15 AM',
        relatedInfo: {
          purchaseOrders: 0,
          assets: 0,
          contracts: 0,
          documents: 0
        }
      };
      setSuppliersList([newSup, ...suppliersList]);
      setSelectedSupplier(newSup);
      triggerToast && triggerToast(`Supplier "${supFormState.name}" created successfully.`);
    }
    setShowAddSupModal(false);
  };

  const handleDuplicateSupplier = (sup) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const duplicated = {
      ...sup,
      id: Date.now(),
      code: `${sup.code}-COPY`,
      name: `${sup.name} (Copy)`,
      createdOn: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ' 09:15 AM'
    };
    setSuppliersList([duplicated, ...suppliersList]);
    setSelectedSupplier(duplicated);
    triggerToast && triggerToast(`Supplier "${sup.name}" duplicated as "${duplicated.code}".`);
  };

  const handleToggleSupStatus = (sup) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    const newStatus = sup.status === 'Active' ? 'Inactive' : 'Active';
    const updated = suppliersList.map((s) =>
      s.id === sup.id ? { ...s, status: newStatus } : s
    );
    setSuppliersList(updated);
    if (selectedSupplier?.id === sup.id) {
      setSelectedSupplier({ ...selectedSupplier, status: newStatus });
    }
    triggerToast && triggerToast(`Supplier "${sup.code}" status changed to ${newStatus}.`);
  };

  const handleDeleteSupplier = (sup) => {
    setActiveRowMenuId && setActiveRowMenuId(null);
    if (window.confirm(`Are you sure you want to delete Supplier "${sup.name}" (${sup.code})?`)) {
      const remaining = suppliersList.filter((s) => s.id !== sup.id);
      setSuppliersList(remaining);
      if (remaining.length > 0) setSelectedSupplier(remaining[0]);
      triggerToast && triggerToast(`Supplier "${sup.code}" deleted successfully.`);
    }
  };

  const handleToggleSelectAllSups = () => {
    if (selectedSupIds.length === filteredSuppliers.length) {
      setSelectedSupIds([]);
    } else {
      setSelectedSupIds(filteredSuppliers.map((s) => s.id));
    }
  };

  const handleToggleSelectSup = (id, e) => {
    if (e) e.stopPropagation();
    if (selectedSupIds.includes(id)) {
      setSelectedSupIds(selectedSupIds.filter((item) => item !== id));
    } else {
      setSelectedSupIds([...selectedSupIds, id]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar matching exact reference screenshot */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by supplier code, name, or contact..."
              value={supSearchQuery}
              onChange={(e) => setSupSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C2BD9] focus:bg-white transition-all"
            />
          </div>

          <div className="w-full md:w-44 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Supplier Type</span>
            <select
              value={supTypeFilter}
              onChange={(e) => setSupTypeFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All Types">All Types</option>
              <option value="Hardware">Hardware</option>
              <option value="Consumables">Consumables</option>
              <option value="RFID Tags">RFID Tags</option>
              <option value="Telematics">Telematics</option>
              <option value="Handheld Devices">Handheld Devices</option>
              <option value="Scanners">Scanners</option>
              <option value="Rugged Tablets">Rugged Tablets</option>
              <option value="Local Supplier">Local Supplier</option>
            </select>
          </div>

          <div className="w-full md:w-28 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Status</span>
            <select
              value={supStatusFilter}
              onChange={(e) => setSupStatusFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="w-full md:w-36 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Country</span>
            <select
              value={supCountryFilter}
              onChange={(e) => setSupCountryFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="USA">USA</option>
              <option value="Lithuania">Lithuania</option>
              <option value="Germany">Germany</option>
              <option value="China">China</option>
              <option value="UAE">UAE</option>
            </select>
          </div>

          <div className="w-full md:w-40 relative">
            <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Company</span>
            <select
              value={supCompanyFilter}
              onChange={(e) => setSupCompanyFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#6C2BD9] cursor-pointer"
            >
              <option value="All Companies">All Companies</option>
              <option value="Wavelogix FZC">Wavelogix FZC</option>
              <option value="Wavelogix KSA">Wavelogix KSA</option>
            </select>
          </div>

          <div className="pt-4 md:pt-0">
            <button
              onClick={handleResetSupFilters}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
            >
              Reset
            </button>
          </div>

          <div className="pt-4 md:pt-0">
            <button
              className="px-4 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Table Container */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Suppliers List</h2>
              <p className="text-xs text-slate-500">Showing all suppliers.</p>
            </div>
            <span className="text-xs font-bold text-[#6C2BD9] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              {filteredSuppliers.length} Suppliers Loaded
            </span>
          </div>

          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedSupIds.length === filteredSuppliers.length && filteredSuppliers.length > 0}
                      onChange={handleToggleSelectAllSups}
                      className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-2 text-center">#</th>
                  <th className="py-3 px-3">Supplier Code ↕</th>
                  <th className="py-3 px-3">Supplier Name ↕</th>
                  <th className="py-3 px-3">Supplier Type</th>
                  <th className="py-3 px-3">Country</th>
                  <th className="py-3 px-3">Contact Person</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSuppliers.map((sup, index) => {
                  const isSelected = selectedSupplier?.id === sup.id;
                  const isChecked = selectedSupIds.includes(sup.id);
                  const isMenuOpen = activeRowMenuId === `sup-${sup.id}`;

                  return (
                    <tr
                      key={sup.id}
                      onClick={() => setSelectedSupplier(sup)}
                      className={clsx(
                        'cursor-pointer transition-colors relative',
                        isSelected ? 'bg-purple-50/60 font-semibold' : 'hover:bg-slate-50/70'
                      )}
                    >
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleToggleSelectSup(sup.id, e)}
                          className="rounded text-[#6C2BD9] focus:ring-[#6C2BD9] cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-400 text-[11px]">{index + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#6C2BD9]">
                        {sup.code}
                      </td>
                      <td className="py-2.5 px-3 text-[#1E1B4B] font-bold">{sup.name}</td>
                      <td className="py-2.5 px-3 text-slate-700">{sup.type}</td>
                      <td className="py-2.5 px-3 text-slate-600">{sup.country}</td>
                      <td className="py-2.5 px-3 text-slate-800">{sup.contactPerson}</td>
                      <td className="py-2.5 px-3 text-slate-700 font-mono text-[11px]">{sup.phone}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold',
                            sup.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          )}
                        >
                          {sup.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center relative" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedSupplier(sup)}
                            title="View Details"
                            className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-[#6C2BD9] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenAddSupModalInternal(sup)}
                            title="Edit Supplier"
                            className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-[#6C2BD9] transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setActiveRowMenuId && setActiveRowMenuId(isMenuOpen ? null : `sup-${sup.id}`)}
                            title="More Actions"
                            className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 transition-colors cursor-pointer"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>

                        {isMenuOpen && (
                          <div className="absolute right-2 top-8 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 text-left space-y-0.5">
                            <button
                              onClick={() => {
                                setSelectedSupplier(sup);
                                setActiveRowMenuId && setActiveRowMenuId(null);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Details</span>
                            </button>
                            <button
                              onClick={() => handleOpenAddSupModalInternal(sup)}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit Supplier</span>
                            </button>
                            <button
                              onClick={() => handleDuplicateSupplier(sup)}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Duplicate</span>
                            </button>
                            <button
                              onClick={() => handleToggleSupStatus(sup)}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-lg flex items-center gap-2"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>{sup.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteSupplier(sup)}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination matching reference screenshot */}
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/20">
            <span>Showing 1 to {filteredSuppliers.length} of 42 records</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold cursor-pointer">«</button>
                <button className="px-2.5 py-1 rounded-lg bg-[#6C2BD9] text-white font-bold cursor-pointer">1</button>
                <button className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold cursor-pointer">2</button>
                <button className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold cursor-pointer">3</button>
                <button className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold cursor-pointer">4</button>
                <button className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold cursor-pointer">5</button>
                <button className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold cursor-pointer">»</button>
              </div>
              <select className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium cursor-pointer">
                <option value="10">10 / page</option>
                <option value="25">25 / page</option>
                <option value="50">50 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Selected Supplier Details Drawer matching exact reference screenshot */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#6C2BD9]" />
              <span>Supplier Details</span>
            </h3>
            <button
              onClick={() => handleOpenAddSupModalInternal(selectedSupplier)}
              className="px-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#6C2BD9] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          {selectedSupplier && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-1 py-1">
                <span className="text-slate-500 font-medium">Supplier Code</span>
                <span className="col-span-2 font-bold font-mono text-[#6C2BD9]">{selectedSupplier.code}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Supplier Name</span>
                <span className="col-span-2 font-semibold text-slate-900">{selectedSupplier.name}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Supplier Type</span>
                <span className="col-span-2 font-semibold text-slate-800">{selectedSupplier.type}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Company</span>
                <span className="col-span-2 text-slate-800 font-semibold">{selectedSupplier.company}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Contact Person</span>
                <span className="col-span-2 text-slate-900 font-bold">{selectedSupplier.contactPerson}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Email</span>
                <span className="col-span-2 font-mono text-[#6C2BD9] font-medium">{selectedSupplier.email}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Phone</span>
                <span className="col-span-2 font-mono text-slate-700">{selectedSupplier.phone}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Address</span>
                <span className="col-span-2 text-slate-700 leading-relaxed">{selectedSupplier.address}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Country</span>
                <span className="col-span-2 font-semibold text-slate-800">{selectedSupplier.country}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Website</span>
                <span className="col-span-2 font-mono text-[#6C2BD9] font-semibold">{selectedSupplier.website}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="col-span-2">
                  <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold', selectedSupplier.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>
                    {selectedSupplier.status}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Payment Terms</span>
                <span className="col-span-2 font-semibold text-slate-800">{selectedSupplier.paymentTerms}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Tax Registration No.</span>
                <span className="col-span-2 font-mono text-slate-700">{selectedSupplier.taxNo}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Description</span>
                <span className="col-span-2 text-slate-700 leading-relaxed">{selectedSupplier.description}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Created By</span>
                <span className="col-span-2 text-slate-700">{selectedSupplier.createdBy}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Created On</span>
                <span className="col-span-2 text-slate-700">{selectedSupplier.createdOn}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Last Modified By</span>
                <span className="col-span-2 text-slate-700">{selectedSupplier.lastModifiedBy}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Last Modified On</span>
                <span className="col-span-2 text-slate-700">{selectedSupplier.lastModifiedOn}</span>
              </div>

              {/* Related Information Panel matching reference screenshot */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Related Information</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Package className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Purchase Orders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedSupplier.relatedInfo.purchaseOrders}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <Truck className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Assets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedSupplier.relatedInfo.assets.toLocaleString()}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <FileCheck className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Contracts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedSupplier.relatedInfo.contracts}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-slate-700 group-hover:text-[#6C2BD9]">
                      <FileText className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      <span className="font-semibold">Documents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{selectedSupplier.relatedInfo.documents}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6C2BD9]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Add / Edit Supplier */}
      {showAddSupModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#6C2BD9]" />
                <span>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</span>
              </h3>
              <button onClick={() => setShowAddSupModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSup} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supplier Code *</label>
                  <input
                    type="text"
                    required
                    value={supFormState.code}
                    onChange={(e) => setSupFormState({ ...supFormState, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SUP-1000"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supplier Name *</label>
                  <input
                    type="text"
                    required
                    value={supFormState.name}
                    onChange={(e) => setSupFormState({ ...supFormState, name: e.target.value })}
                    placeholder="e.g. Zebra Technologies"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supplier Type</label>
                  <select
                    value={supFormState.type}
                    onChange={(e) => setSupFormState({ ...supFormState, type: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Consumables">Consumables</option>
                    <option value="RFID Tags">RFID Tags</option>
                    <option value="Telematics">Telematics</option>
                    <option value="Handheld Devices">Handheld Devices</option>
                    <option value="Scanners">Scanners</option>
                    <option value="Rugged Tablets">Rugged Tablets</option>
                    <option value="Local Supplier">Local Supplier</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company</label>
                  <select
                    value={supFormState.company}
                    onChange={(e) => setSupFormState({ ...supFormState, company: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="Wavelogix FZC">Wavelogix FZC</option>
                    <option value="Wavelogix KSA">Wavelogix KSA</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Country</label>
                  <select
                    value={supFormState.country}
                    onChange={(e) => setSupFormState({ ...supFormState, country: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="USA">USA</option>
                    <option value="Lithuania">Lithuania</option>
                    <option value="Germany">Germany</option>
                    <option value="China">China</option>
                    <option value="UAE">UAE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={supFormState.contactPerson}
                    onChange={(e) => setSupFormState({ ...supFormState, contactPerson: e.target.value })}
                    placeholder="e.g. Michael Brown"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={supFormState.email}
                    onChange={(e) => setSupFormState({ ...supFormState, email: e.target.value })}
                    placeholder="michael@zebra.com"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={supFormState.phone}
                    onChange={(e) => setSupFormState({ ...supFormState, phone: e.target.value })}
                    placeholder="+1 847..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <textarea
                  rows={2}
                  value={supFormState.address}
                  onChange={(e) => setSupFormState({ ...supFormState, address: e.target.value })}
                  placeholder="Street address, city, state, postal code..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Website</label>
                  <input
                    type="text"
                    value={supFormState.website}
                    onChange={(e) => setSupFormState({ ...supFormState, website: e.target.value })}
                    placeholder="www.zebra.com"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Terms</label>
                  <select
                    value={supFormState.paymentTerms}
                    onChange={(e) => setSupFormState({ ...supFormState, paymentTerms: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="45 Days">45 Days</option>
                    <option value="60 Days">60 Days</option>
                    <option value="Advance">Advance</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tax No.</label>
                  <input
                    type="text"
                    value={supFormState.taxNo}
                    onChange={(e) => setSupFormState({ ...supFormState, taxNo: e.target.value })}
                    placeholder="12-3456789"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={supFormState.description}
                  onChange={(e) => setSupFormState({ ...supFormState, description: e.target.value })}
                  placeholder="Manufacturer of barcode and RFID devices..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={supFormState.status}
                  onChange={(e) => setSupFormState({ ...supFormState, status: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#6C2BD9] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddSupModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white font-bold cursor-pointer shadow-sm">
                  {editingSupplier ? 'Save Changes' : 'Create Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuppliersTab;
