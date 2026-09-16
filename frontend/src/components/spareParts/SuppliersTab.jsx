import React, { useState } from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  Edit,
  Eye,
  Star,
  Plus,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  MoreHorizontal,
  ExternalLink,
  CheckCircle2,
  Building2
} from 'lucide-react';

export function SuppliersTab({ onShowToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All Countries');
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);

  // Mock Suppliers dataset matching exact screenshot data
  const [suppliersList, setSuppliersList] = useState([
    {
      id: 1,
      code: 'SUP-001',
      name: 'Al Futtaim Trading LLC',
      type: 'Parts Supplier',
      country: 'UAE',
      contactPerson: 'Ahmed Khan',
      phone: '+971 4 331 2000',
      email: 'ahmed.khan@futtaim.ae',
      status: 'Active',
      isPreferred: true,
      address: 'PO Box 12345, Dubai, UAE',
      trn: 'TRN123456789000',
      paymentTerms: '30 Days',
      leadTimeDays: 7,
      currency: 'AED',
      website: 'www.futtaim.ae',
      remarks: 'Authorized distributor for HVAC and electrical spare parts.'
    },
    {
      id: 2,
      code: 'SUP-002',
      name: 'ABB Middle East',
      type: 'Parts Supplier',
      country: 'UAE',
      contactPerson: 'Ramesh Nair',
      phone: '+971 4 424 0000',
      email: 'ramesh.nair@ae.abb.com',
      status: 'Active',
      isPreferred: false,
      address: 'DIC Industrial Area, Dubai, UAE',
      trn: 'TRN987654321000',
      paymentTerms: '45 Days',
      leadTimeDays: 14,
      currency: 'AED',
      website: 'www.abb.com/ae',
      remarks: 'OEM supplier for heavy switchgear and circuit breakers.'
    },
    {
      id: 3,
      code: 'SUP-003',
      name: 'Emirates Trading Co.',
      type: 'Parts Supplier',
      country: 'UAE',
      contactPerson: 'Sarah Ahmed',
      phone: '+971 4 295 0000',
      email: 'sarah@emiratestrading.ae',
      status: 'Active',
      isPreferred: true,
      address: 'Deira Hardware Market, Dubai, UAE',
      trn: 'TRN456789123000',
      paymentTerms: '30 Days',
      leadTimeDays: 5,
      currency: 'AED',
      website: 'www.emiratestrading.ae',
      remarks: 'Primary supplier for plumbing valves and pipe fittings.'
    },
    {
      id: 4,
      code: 'SUP-004',
      name: 'Honeywell Middle East',
      type: 'Parts Supplier',
      country: 'UAE',
      contactPerson: 'James Smith',
      phone: '+971 4 450 0000',
      email: 'james.smith@honeywell.com',
      status: 'Active',
      isPreferred: false,
      address: 'Emaar Business Park, Dubai, UAE',
      trn: 'TRN112233445566',
      paymentTerms: '60 Days',
      leadTimeDays: 21,
      currency: 'AED',
      website: 'www.honeywell.com',
      remarks: 'Fire alarm sensors and building automation controllers supplier.'
    },
    {
      id: 5,
      code: 'SUP-005',
      name: 'Schneider Electric',
      type: 'Parts Supplier',
      country: 'UAE',
      contactPerson: 'Khalid Omar',
      phone: '+971 4 372 0000',
      email: 'khalid.omar@se.com',
      status: 'Active',
      isPreferred: true,
      address: 'Silicon Oasis, Dubai, UAE',
      trn: 'TRN998877665544',
      paymentTerms: '30 Days',
      leadTimeDays: 10,
      currency: 'AED',
      website: 'www.se.com/ae',
      remarks: 'Approved electrical component partner.'
    },
    {
      id: 6,
      code: 'SUP-006',
      name: 'BuildCare LLC',
      type: 'Parts Supplier',
      country: 'UAE',
      contactPerson: 'Fatima Ali',
      phone: '+971 4 288 0000',
      email: 'fatima@buildcare.ae',
      status: 'Active',
      isPreferred: false,
      address: 'Al Quoz Industrial 3, Dubai, UAE',
      trn: 'TRN334455667788',
      paymentTerms: '30 Days',
      leadTimeDays: 7,
      currency: 'AED',
      website: 'www.buildcare.ae',
      remarks: 'Civil construction materials and structural fasteners.'
    },
    {
      id: 7,
      code: 'SUP-007',
      name: 'Al Bahar',
      type: 'Parts Supplier',
      country: 'UAE',
      contactPerson: 'Yousef Mahmoud',
      phone: '+971 4 395 0000',
      email: 'yousef@albahar.ae',
      status: 'Active',
      isPreferred: false,
      address: 'Sharjah Industrial Area 1, UAE',
      trn: 'TRN776655443322',
      paymentTerms: '45 Days',
      leadTimeDays: 7,
      currency: 'AED',
      website: 'www.albahar.com',
      remarks: 'Caterpillar generator parts and engine filters.'
    },
    {
      id: 8,
      code: 'SUP-008',
      name: 'Philips',
      type: 'Parts Supplier',
      country: 'Netherlands',
      contactPerson: 'Mark Johnson',
      phone: '+31 40 27 9000',
      email: 'mark.johnson@philips.com',
      status: 'Active',
      isPreferred: false,
      address: 'Eindhoven, Netherlands',
      trn: 'NL801234567B01',
      paymentTerms: '60 Days',
      leadTimeDays: 30,
      currency: 'EUR',
      website: 'www.philips.com',
      remarks: 'Direct OEM import for specialized LED lighting drivers.'
    },
    {
      id: 9,
      code: 'SUP-009',
      name: 'Emirates General Supplies',
      type: 'Service Supplier',
      country: 'UAE',
      contactPerson: 'Omar Hassan',
      phone: '+971 4 333 1000',
      email: 'omar@egs.ae',
      status: 'Inactive',
      isPreferred: false,
      address: 'Jebel Ali Free Zone, Dubai, UAE',
      trn: 'TRN556677889900',
      paymentTerms: '15 Days',
      leadTimeDays: 14,
      currency: 'AED',
      website: 'www.egs.ae',
      remarks: 'Service vendor currently under contract renegotiation.'
    },
    {
      id: 10,
      code: 'SUP-010',
      name: 'Atlas Copco',
      type: 'Parts Supplier',
      country: 'UAE',
      contactPerson: 'Lisa Brown',
      phone: '+971 4 880 0000',
      email: 'lisa.brown@atlascopco.com',
      status: 'Active',
      isPreferred: false,
      address: 'JAFZA South, Dubai, UAE',
      trn: 'TRN123987456000',
      paymentTerms: '30 Days',
      leadTimeDays: 10,
      currency: 'AED',
      website: 'www.atlascopco.com',
      remarks: 'Air compressor spares and pneumatic maintenance.'
    }
  ]);

  // Active selected supplier (Default: SUP-001 Al Futtaim Trading LLC matching screenshot)
  const [selectedSupplier, setSelectedSupplier] = useState(suppliersList[0]);
  const [selectedIds, setSelectedIds] = useState([]);

  // Toggle preferred star
  const togglePreferred = (id, e) => {
    e.stopPropagation();
    setSuppliersList((prev) =>
      prev.map((sup) =>
        sup.id === id ? { ...sup, isPreferred: !sup.isPreferred } : sup
      )
    );
    onShowToast?.('Updated preferred status');
  };

  // Selection Checkbox
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSuppliers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSuppliers.map((s) => s.id));
    }
  };

  // Filter Logic
  const filteredSuppliers = suppliersList.filter((sup) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      sup.code.toLowerCase().includes(q) ||
      sup.name.toLowerCase().includes(q) ||
      sup.contactPerson.toLowerCase().includes(q) ||
      sup.email.toLowerCase().includes(q);

    const matchesType = typeFilter === 'All Types' || sup.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || sup.status === statusFilter;
    const matchesCountry = countryFilter === 'All Countries' || sup.country === countryFilter;

    return matchesQuery && matchesType && matchesStatus && matchesCountry;
  });

  const handleReset = () => {
    setSearchQuery('');
    setTypeFilter('All Types');
    setStatusFilter('All');
    setCountryFilter('All Countries');
    onShowToast?.('Filters reset to default.');
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* MAIN 2-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: SUPPLIERS LIST TABLE (8 COLS) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between overflow-hidden">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div>
              <h2 className="text-base font-bold text-slate-900">Suppliers List</h2>
              <p className="text-xs text-slate-500">
                View and manage all suppliers for spare parts and services.
              </p>
            </div>

            {/* Filter Controls Row matching exact screenshot design */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Box */}
              <div className="relative min-w-[200px] flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by supplier name, code, contact person..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Supplier Type Dropdown */}
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="All Types">Supplier Type: All Types</option>
                  <option value="Parts Supplier">Parts Supplier</option>
                  <option value="Service Supplier">Service Supplier</option>
                </select>
              </div>

              {/* Status Dropdown */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="All">Status: All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Country Dropdown */}
              <div>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="All Countries">All Countries</option>
                  <option value="UAE">UAE</option>
                  <option value="Netherlands">Netherlands</option>
                </select>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                Reset
              </button>

              {/* Filter Button */}
              <button
                onClick={() => onShowToast?.('Filters applied')}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Filter className="w-3.5 h-3.5 fill-current" /> Filter
              </button>
            </div>

            {/* Data Table matching exact columns of screenshot */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-2 text-center w-8">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length > 0 &&
                          selectedIds.length === filteredSuppliers.length
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="py-2.5 px-2 text-slate-400">#</th>
                    <th className="py-2.5 px-3">Supplier Code</th>
                    <th className="py-2.5 px-3">Supplier Name</th>
                    <th className="py-2.5 px-3">Supplier Type</th>
                    <th className="py-2.5 px-3">Country</th>
                    <th className="py-2.5 px-3">Contact Person</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-2 text-center">Preferred</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-8 text-center text-slate-400">
                        No suppliers found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map((sup) => {
                      const isSelected = selectedSupplier?.id === sup.id;
                      const isChecked = selectedIds.includes(sup.id);

                      return (
                        <tr
                          key={sup.id}
                          onClick={() => setSelectedSupplier(sup)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50/80 font-semibold'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          {/* Checkbox */}
                          <td
                            className="py-2.5 px-2 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelect(sup.id)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>

                          {/* # */}
                          <td className="py-2.5 px-2 text-slate-400 font-mono text-[11px]">{sup.id}</td>

                          {/* Supplier Code */}
                          <td className="py-2.5 px-3">
                            <span className="text-blue-600 font-semibold font-mono hover:underline">
                              {sup.code}
                            </span>
                          </td>

                          {/* Supplier Name */}
                          <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                            {sup.name}
                          </td>

                          {/* Supplier Type */}
                          <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{sup.type}</td>

                          {/* Country */}
                          <td className="py-2.5 px-3 text-slate-600">{sup.country}</td>

                          {/* Contact Person */}
                          <td className="py-2.5 px-3 text-slate-800 whitespace-nowrap">
                            {sup.contactPerson}
                          </td>

                          {/* Phone */}
                          <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                            {sup.phone}
                          </td>

                          {/* Email */}
                          <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                            {sup.email}
                          </td>

                          {/* Status Badge */}
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border inline-block ${
                                sup.status === 'Active'
                                  ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                  : 'bg-rose-100 text-rose-700 border-rose-300'
                              }`}
                            >
                              {sup.status}
                            </span>
                          </td>

                          {/* Preferred Star Icon */}
                          <td className="py-2.5 px-2 text-center">
                            <button
                              onClick={(e) => togglePreferred(sup.id, e)}
                              className="text-blue-600 hover:scale-110 transition-transform"
                              title={sup.isPreferred ? 'Preferred Supplier' : 'Set as Preferred'}
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  sup.isPreferred
                                    ? 'fill-blue-600 text-blue-600'
                                    : 'text-slate-400'
                                }`}
                              />
                            </button>
                          </td>

                          {/* Actions Column */}
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSupplier(sup);
                                }}
                                className="p-1 rounded-md text-blue-600 hover:bg-blue-100 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onShowToast?.(`Editing Supplier ${sup.code}`);
                                }}
                                className="p-1 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
                                title="Edit Supplier"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onShowToast?.(`Options for ${sup.code}`);
                                }}
                                className="p-1 rounded-md text-slate-400 hover:bg-slate-100 transition-colors"
                                title="More options"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Pagination */}
          <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-slate-500 font-medium text-xs">
              Showing 1 to {filteredSuppliers.length} of 24 records
            </span>

            <div className="flex items-center gap-1.5">
              <button className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-semibold disabled:opacity-50">
                &lt;
              </button>
              <button className="px-3 py-1 rounded bg-blue-600 text-white font-bold text-xs">1</button>
              <button className="px-3 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium">
                2
              </button>
              <button className="px-3 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium">
                3
              </button>
              <button className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-semibold">
                &gt;
              </button>

              <select className="ml-2 bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-medium">
                <option>10 / page</option>
                <option>25 / page</option>
                <option>50 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SUPPLIER DETAILS PANEL (4 COLS) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between space-y-4">
          {selectedSupplier ? (
            <div className="space-y-4">
              {/* Header with Edit Button */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Supplier Details</h3>
                <button
                  onClick={() => onShowToast?.(`Editing Supplier ${selectedSupplier.code}`)}
                  className="px-3 py-1 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-500" /> Edit
                </button>
              </div>

              {/* Basic Fields */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Supplier Code</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedSupplier.code}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Supplier Name</span>
                  <span className="font-bold text-slate-900">{selectedSupplier.name}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Supplier Type</span>
                  <span className="font-medium text-slate-800">{selectedSupplier.type}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Status</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                      selectedSupplier.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                        : 'bg-rose-100 text-rose-700 border-rose-300'
                    }`}
                  >
                    {selectedSupplier.status}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Preferred Supplier</span>
                  <Star
                    className={`w-4 h-4 ${
                      selectedSupplier.isPreferred
                        ? 'fill-blue-600 text-blue-600'
                        : 'text-slate-300'
                    }`}
                  />
                </div>
              </div>

              {/* Section: Contact Information */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900">Contact Information</h4>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-semibold text-slate-900">{selectedSupplier.contactPerson}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-mono text-slate-800">{selectedSupplier.phone}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                    <a
                      href={`mailto:${selectedSupplier.email}`}
                      className="text-blue-600 hover:underline font-mono text-[11px]"
                    >
                      {selectedSupplier.email}
                    </a>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">{selectedSupplier.address}</span>
                  </div>
                </div>
              </div>

              {/* Section: Business Information */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900">Business Information</h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Country</span>
                    <span className="font-medium text-slate-800">{selectedSupplier.country}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Tax Number</span>
                    <span className="font-mono font-bold text-slate-900">{selectedSupplier.trn}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Payment Terms</span>
                    <span className="font-medium text-slate-800">{selectedSupplier.paymentTerms}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Lead Time (Days)</span>
                    <span className="font-mono text-slate-900 font-bold">{selectedSupplier.leadTimeDays}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Currency</span>
                    <span className="font-medium text-slate-800">{selectedSupplier.currency}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Website</span>
                    <a
                      href={`https://${selectedSupplier.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium flex items-center gap-1"
                    >
                      {selectedSupplier.website} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Section: Remarks Callout Box */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-medium block mb-1 text-xs">Remarks</span>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 italic text-[11px] leading-relaxed">
                  {selectedSupplier.remarks}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">Select a supplier to view details</div>
          )}
        </div>
      </div>

      {/* BOTTOM STICKY ACTION BAR matching exact screenshot */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex justify-between items-center">
        <button
          onClick={() => onShowToast?.('Action cancelled')}
          className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={() => onShowToast?.(`Viewing documents for ${selectedSupplier?.code}`)}
          className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <FileText className="w-4 h-4 text-slate-600" /> View Documents
        </button>
      </div>
    </div>
  );
}

