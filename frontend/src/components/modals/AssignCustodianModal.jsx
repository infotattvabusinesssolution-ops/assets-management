import React, { useState, useEffect } from 'react';
import { X, UserCheck, Building2, MapPin, Calendar, AlertCircle, Package, User, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export function AssignCustodianModal({ isOpen, onClose, asset, onAssigned }) {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [employeesList, setEmployeesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [sitesList, setSitesList] = useState([]);

  const [formData, setFormData] = useState({
    custodianId: '',
    assignedTo: '',
    department: '',
    location: '',
    building: '',
    floor: '',
    room: '',
    assignmentDate: new Date().toISOString().slice(0, 10),
    assignmentPurpose: 'Regular Use',
    conditionAtIssue: 'Good',
    remarks: ''
  });

  // Fetch live master data (employees, departments, locations)
  useEffect(() => {
    if (isOpen) {
      setSubmitError('');
      Promise.allSettled([
        api.get('/master-data/employees'),
        api.get('/custody-transfers/master-references'),
        api.get('/custody-transfers/locations/hierarchy')
      ]).then(([empRes, refRes, hierRes]) => {
        if (empRes.status === 'fulfilled' && empRes.value?.employees?.length) {
          setEmployeesList(empRes.value.employees);
        } else if (refRes.status === 'fulfilled' && refRes.value?.custodians?.length) {
          setEmployeesList(refRes.value.custodians.map(c => ({
            id: c.id,
            employeeCode: c.code,
            fullName: c.name || c.fullName,
            department: c.department
          })));
        }

        if (refRes.status === 'fulfilled' && refRes.value?.departments?.length) {
          setDepartmentsList(refRes.value.departments);
        }

        if (hierRes.status === 'fulfilled' && hierRes.value?.sites?.length) {
          setSitesList(hierRes.value.sites);
        }
      });
    }
  }, [isOpen]);

  // Pre-fill asset context
  useEffect(() => {
    if (asset && isOpen) {
      const currentCust = (asset.custodianName && asset.custodianName !== 'Unassigned')
        ? asset.custodianName
        : (asset.custodian ? (asset.custodian.fullName || asset.custodian.firstName) : '');
      const currentCustId = asset.custodianId || asset.custodian?.id || '';

      setFormData({
        custodianId: currentCustId,
        assignedTo: currentCust,
        department: asset.departmentName || asset.department?.name || '',
        location: asset.siteName || asset.site?.name || asset.locationStr || 'Dubai HQ',
        building: asset.buildingName || asset.building?.name || 'Block A',
        floor: asset.floorRoom || asset.floorName || asset.floor?.name || 'Ground Floor',
        room: asset.roomName || asset.room?.name || 'IT-101',
        assignmentDate: new Date().toISOString().slice(0, 10),
        assignmentPurpose: 'Regular Use',
        conditionAtIssue: asset.condition || 'Good',
        remarks: ''
      });
    }
  }, [asset, isOpen]);

  if (!isOpen || !asset) return null;

  const handleEmployeeChange = (e) => {
    const val = e.target.value;
    if (!val || val === '__unassign__') {
      setFormData(prev => ({
        ...prev,
        custodianId: '',
        assignedTo: val === '__unassign__' ? 'Unassigned' : ''
      }));
      return;
    }

    const emp = employeesList.find(x => x.id === val || x.fullName === val || `${x.fullName} (${x.employeeCode || 'EMP'})` === val);
    setFormData(prev => ({
      ...prev,
      custodianId: emp?.id || val,
      assignedTo: emp?.fullName || val,
      department: emp?.department?.name || (typeof emp?.department === 'string' ? emp.department : prev.department)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.assignedTo && !formData.custodianId) {
      setSubmitError('Please select a custodian to assign this asset to.');
      return;
    }

    setSubmitError('');
    setLoading(true);

    try {
      const payload = {
        assetId: asset.id || asset.assetId,
        custodianId: formData.custodianId || null,
        assignedTo: formData.assignedTo,
        department: formData.department,
        location: formData.location,
        building: formData.building,
        floor: formData.floor,
        room: formData.room,
        assignmentDate: formData.assignmentDate,
        assignmentPurpose: formData.assignmentPurpose,
        conditionAtIssue: formData.conditionAtIssue,
        remarks: formData.remarks,
        isDraft: false
      };

      const res = await api.post('/movements/assign', payload);
      if (res?.success === false) {
        throw new Error(res.message || 'Failed to assign custodian');
      }

      if (onAssigned) {
        const isUnassigning = !formData.custodianId || formData.assignedTo === 'Unassigned';
        onAssigned({
          ...asset,
          custodianId: isUnassigning ? null : formData.custodianId,
          custodianName: isUnassigning ? 'Unassigned' : formData.assignedTo,
          departmentName: formData.department,
          lifecycleStatus: isUnassigning ? 'AVAILABLE' : 'ASSIGNED'
        });
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
                  {asset.lifecycleStatus || 'ACTIVE'}
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
              value={formData.assignedTo === 'Unassigned' ? '__unassign__' : (formData.custodianId || formData.assignedTo)}
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
              <option value="__unassign__">Unassign / Return to Store Inventory</option>
            </select>
          </div>

          {/* Department & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C2BD9]/20 focus:border-[#6C2BD9]"
              >
                <option value="">Select Department</option>
                {departmentsList.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
                {departmentsList.length === 0 && (
                  <>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Facilities">Facilities</option>
                  </>
                )}
              </select>
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
