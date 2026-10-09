import React, { useState, useEffect } from 'react';
import { X, UserCheck, Building2, MapPin, Calendar, AlertCircle, Package, User, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export function AssignCustodianModal({ isOpen, onClose, asset, onAssigned }) {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [employeesList, setEmployeesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);

  const [isCustomCustodian, setIsCustomCustodian] = useState(false);
  const [formData, setFormData] = useState({
    custodianId: '',
    assignedTo: '',
    employeeCode: '',
    contactEmail: '',
    department: '',
    assignmentDate: new Date().toISOString().slice(0, 10),
    assignmentPurpose: 'Regular Use',
    conditionAtIssue: 'Good',
    remarks: ''
  });

  // Load real employee and department records for the asset company.
  useEffect(() => {
    if (isOpen) {
      setSubmitError('');
      Promise.all([
        api.get('/master-data/employees'),
        api.get('/master-data/departments')
      ]).then(([empRes, deptRes]) => {
        if (!Array.isArray(empRes?.employees) || !Array.isArray(deptRes?.departments)) {
          throw new Error('Could not load employee master data.');
        }
        setEmployeesList(empRes.employees.filter(employee => employee.active &&
          (!asset?.companyId || employee.companyId === asset.companyId)));
        setDepartmentsList(deptRes.departments.filter(department => department.active &&
          (!asset?.companyId || department.companyId === asset.companyId)));
      }).catch(error => {
        setEmployeesList([]);
        setDepartmentsList([]);
        setSubmitError(error?.message || 'Could not load employee master data.');
      });
    }
  }, [isOpen, asset?.companyId]);

  // Pre-fill asset context
  useEffect(() => {
    if (asset && isOpen) {
      const currentCust = (asset.custodianName && asset.custodianName !== 'Unassigned')
        ? asset.custodianName
        : (asset.custodian ? (asset.custodian.fullName || asset.custodian.firstName) : '');
      const currentCustId = asset.custodianId || asset.custodian?.id || '';
      const currentCode = asset.custodian?.employeeCode || asset.custodianCode || '';
      const currentEmail = asset.custodian?.email || asset.custodianEmail || '';

      setFormData({
        custodianId: currentCustId,
        assignedTo: currentCust,
        employeeCode: currentCode,
        contactEmail: currentEmail,
        department: asset.departmentName || asset.department?.name || '',
        assignmentDate: new Date().toISOString().slice(0, 10),
        assignmentPurpose: 'Regular Use',
        conditionAtIssue: asset.condition || 'Good',
        remarks: ''
      });
      setIsCustomCustodian(false);
    }
  }, [asset, isOpen]);

  if (!isOpen || !asset) return null;

  const handleEmployeeChange = (e) => {
    const val = e.target.value;
    if (!val || val === '__unassign__') {
      setIsCustomCustodian(false);
      setFormData(prev => ({
        ...prev,
        custodianId: '',
        assignedTo: val === '__unassign__' ? 'Unassigned' : '',
        employeeCode: '',
        contactEmail: ''
      }));
      return;
    }

    if (val === '__custom__') {
      setIsCustomCustodian(true);
      setFormData(prev => ({
        ...prev,
        custodianId: '',
        assignedTo: '',
        employeeCode: '',
        contactEmail: ''
      }));
      return;
    }

    setIsCustomCustodian(false);
    const emp = employeesList.find(x => x.id === val);
    setFormData(prev => ({
      ...prev,
      custodianId: emp?.id || '',
      assignedTo: emp?.fullName || '',
      employeeCode: emp?.employeeCode || '',
      contactEmail: emp?.email || '',
      department: emp?.department?.name || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.custodianId && !isCustomCustodian && formData.assignedTo !== 'Unassigned') {
      setSubmitError('Please select or enter a custodian to assign this asset to.');
      return;
    }
    if (isCustomCustodian && (!formData.assignedTo.trim() || !formData.employeeCode.trim() || !formData.contactEmail.trim())) {
      setSubmitError('Name, employee code, and email are required for a new custodian.');
      return;
    }

    setSubmitError('');
    setLoading(true);

    try {
      const payload = {
        custodianId: formData.custodianId || null,
        customCustodian: isCustomCustodian ? {
          fullName: formData.assignedTo.trim(),
          employeeCode: formData.employeeCode.trim(),
          email: formData.contactEmail.trim(),
          department: formData.department
        } : undefined,
        assignmentDate: formData.assignmentDate,
        assignmentPurpose: formData.assignmentPurpose,
        conditionAtIssue: formData.conditionAtIssue,
        remarks: formData.remarks
      };

      const res = await api.post(`/assets/${encodeURIComponent(asset.dbId || asset.id || asset.assetId)}/custodian-assignment`, payload);
      if (!res?.success || !res.asset) {
        throw new Error(res.message || 'Failed to assign custodian');
      }

      if (onAssigned) {
        onAssigned({
          ...asset,
          ...res.asset,
          custodianName: res.asset.custodian?.fullName || 'Unassigned',
          custodianCode: res.asset.custodian?.employeeCode || '',
          custodianEmail: res.asset.custodian?.email || '',
          departmentName: res.asset.department?.name || asset.departmentName || '',
          lifecycleStatus: res.asset.lifecycleStatus
        }, res);
      }

      onClose();
    } catch (err) {
      console.error('Assignment error:', err);
      setSubmitError(err.response?.data?.message || err.message || 'Failed to complete assignment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-purple-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#6C2BD9] text-white flex items-center justify-center font-bold shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Assign to Custodian</h3>
              <p className="text-xs text-slate-500">Set or change the assigned employee custodian</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {submitError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Selected Asset Context Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#6C2BD9] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Package className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-[#6C2BD9]">
                  {asset.assetId || asset.assetNumber || asset.id}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-purple-100/70 text-[#6C2BD9]">
                  {asset.lifecycleStatus || 'Unknown'}
                </span>
              </div>
              <p className="font-semibold text-slate-800 truncate mt-0.5">
                {asset.name || asset.description || 'Asset'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Current Custodian: <strong className="text-slate-700 font-semibold">{asset.custodianName || 'Unassigned'}</strong>
              </p>
            </div>
          </div>

          {/* Custodian Select (The primary option to change) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select New Custodian / Assignee <span className="text-rose-500">*</span>
            </label>
            <select
              value={isCustomCustodian ? '__custom__' : (formData.assignedTo === 'Unassigned' ? '__unassign__' : formData.custodianId)}
              onChange={handleEmployeeChange}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
            >
              <option value="">-- Choose Employee / Custodian --</option>
              {employeesList.map(e => {
                const label = `${e.fullName || e.name} (${e.employeeCode || e.code || 'EMP'})${e.department?.name ? ` • ${e.department.name}` : ''}`;
                return (
                  <option key={e.id} value={e.id}>
                    {label}
                  </option>
                );
              })}
              <option value="__custom__">+ Enter Custom Custodian...</option>
              <option value="__unassign__">Remove custodian</option>
            </select>
          </div>

          {/* Custom Assignee Name Input */}
          {isCustomCustodian && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assignee Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                placeholder="e.g. David Miller"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
              />
            </div>
          )}

          {/* Real Contact Email & Employee ID Inputs */}
          {formData.assignedTo && formData.assignedTo !== 'Unassigned' && (
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Employee ID / Code
                </label>
                <input
                  type="text"
                  value={formData.employeeCode}
                  onChange={e => setFormData({ ...formData, employeeCode: e.target.value })}
                  readOnly={!isCustomCustodian}
                  required={isCustomCustodian}
                  placeholder="e.g. EMP-102"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                  readOnly={!isCustomCustodian}
                  required={isCustomCustodian}
                  placeholder="e.g. employee@company.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
                />
              </div>
            </div>
          )}

          {/* Department & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              {isCustomCustodian ? <select
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
              >
                <option value="">Select Department</option>
                {departmentsList.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select> : <input value={formData.department} readOnly
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-800" />}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assignment Date *</label>
              <input
                type="date"
                value={formData.assignmentDate}
                onChange={e => setFormData({ ...formData, assignmentDate: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
              />
            </div>
          </div>

          {/* Assignment Purpose & Condition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Purpose</label>
              <select
                value={formData.assignmentPurpose}
                onChange={e => setFormData({ ...formData, assignmentPurpose: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
              >
                <option value="Regular Use">Regular Use / Standard Issue</option>
                <option value="Project Assignment">Project Assignment</option>
                <option value="Temporary Issue">Temporary Issue</option>
                <option value="Hardware Replacement">Hardware Replacement</option>
                <option value="Executive Equipment">Executive Equipment</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Condition at Issue</label>
              <select
                value={formData.conditionAtIssue}
                onChange={e => setFormData({ ...formData, conditionAtIssue: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
              >
                <option value="Good">Good (Ready for Use)</option>
                <option value="Brand New">Brand New</option>
                <option value="Fair">Fair / Operational</option>
              </select>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes / Remarks (Optional)</label>
            <input
              type="text"
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="e.g. Assigned with laptop bag, charger and mouse"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#6C2BD9] hover:bg-[#5b21b6] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Assignment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
