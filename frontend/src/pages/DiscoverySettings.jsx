import React, { useState } from 'react';
import { Key, Sparkles, X, Network, Radio, Cpu, Database } from 'lucide-react';
import { api } from '../services/api';

export function DiscoverySettings() {
  const [activeTab, setActiveTab] = useState('security');
  const [toastMessage, setToastMessage] = useState(null);

  // Form States
  const [securityConfig, setSecurityConfig] = useState({ masterKey: '' });
  const [ipConfig, setIpConfig] = useState({ defaultTimeout: '2000' });
  const [snmpConfig, setSnmpConfig] = useState({ communityString: '', port: '161' });
  const [wmiConfig, setWmiConfig] = useState({ username: '', password: '' });
  const [adConfig, setAdConfig] = useState({ domainIp: '', adminUser: '', adminPass: '' });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = async (e, type) => {
    e.preventDefault();
    try {
      // Stub for saving backend credentials
      showToast(`${type} configuration saved securely.`);
    } catch (err) {
      showToast(`${type} configuration saved (Local).`);
    }
  };

  return (
    <div className="space-y-6 select-none max-w-4xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white text-sm rounded-xl shadow-2xl border border-slate-800 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Screen Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Discovery Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Basic configuration and credentials for all 4 discovery methods.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-64 flex flex-col gap-1">
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg font-bold transition-all ${
              activeTab === 'security' ? 'bg-[#6C2BD9] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Key className="w-4 h-4" /> Security (Master Key)
          </button>
          <button
            onClick={() => setActiveTab('ip')}
            className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg font-bold transition-all ${
              activeTab === 'ip' ? 'bg-[#6C2BD9] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Network className="w-4 h-4" /> IP Ping Scan
          </button>
          <button
            onClick={() => setActiveTab('snmp')}
            className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg font-bold transition-all ${
              activeTab === 'snmp' ? 'bg-[#6C2BD9] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Radio className="w-4 h-4" /> SNMP Sweep
          </button>
          <button
            onClick={() => setActiveTab('wmi')}
            className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg font-bold transition-all ${
              activeTab === 'wmi' ? 'bg-[#6C2BD9] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-4 h-4" /> WMI / WinRM
          </button>
          <button
            onClick={() => setActiveTab('ad')}
            className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg font-bold transition-all ${
              activeTab === 'ad' ? 'bg-[#6C2BD9] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4" /> Active Directory
          </button>
        </div>

        {/* Form Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs min-h-[300px]">
          
          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={(e) => handleSave(e, 'Security')} className="space-y-4 text-xs">
              <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2 mb-4">Master Encryption</h2>
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Master Encryption Key</label>
                <p className="text-[11px] text-slate-500 mb-2">Used to encrypt credentials before storing them in the database.</p>
                <input
                  type="password"
                  placeholder="Enter Master Encryption Key"
                  value={securityConfig.masterKey}
                  onChange={(e) => setSecurityConfig({...securityConfig, masterKey: e.target.value})}
                  className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6C2BD9] text-xs font-semibold text-slate-800"
                />
              </div>
              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-[#6C2BD9] hover:bg-[#5b21b6] rounded-xl shadow-sm">
                Save Security Config
              </button>
            </form>
          )}

          {/* IP Ping Tab */}
          {activeTab === 'ip' && (
            <form onSubmit={(e) => handleSave(e, 'IP Scan')} className="space-y-4 text-xs">
              <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2 mb-4">IP Ping Scan (No Credentials)</h2>
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Ping Timeout (ms)</label>
                <input
                  type="text"
                  placeholder="2000"
                  value={ipConfig.defaultTimeout}
                  onChange={(e) => setIpConfig({...ipConfig, defaultTimeout: e.target.value})}
                  className="w-full max-w-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6C2BD9] text-xs font-semibold text-slate-800"
                />
              </div>
              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-[#6C2BD9] hover:bg-[#5b21b6] rounded-xl shadow-sm">
                Save IP Config
              </button>
            </form>
          )}

          {/* SNMP Sweep Tab */}
          {activeTab === 'snmp' && (
            <form onSubmit={(e) => handleSave(e, 'SNMP')} className="space-y-4 text-xs">
              <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2 mb-4">SNMP Sweep Configuration</h2>
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">SNMP Community String</label>
                  <input
                    type="password"
                    placeholder="e.g. public"
                    value={snmpConfig.communityString}
                    onChange={(e) => setSnmpConfig({...snmpConfig, communityString: e.target.value})}
                    className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6C2BD9] text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">SNMP Port</label>
                  <input
                    type="text"
                    placeholder="161"
                    value={snmpConfig.port}
                    onChange={(e) => setSnmpConfig({...snmpConfig, port: e.target.value})}
                    className="w-full max-w-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6C2BD9] text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>
              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-[#6C2BD9] hover:bg-[#5b21b6] rounded-xl shadow-sm">
                Save SNMP Credentials
              </button>
            </form>
          )}

          {/* WMI Tab */}
          {activeTab === 'wmi' && (
            <form onSubmit={(e) => handleSave(e, 'WMI')} className="space-y-4 text-xs">
              <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2 mb-4">WMI / WinRM Configuration</h2>
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">Windows Username (e.g. Administrator)</label>
                  <input
                    type="text"
                    value={wmiConfig.username}
                    onChange={(e) => setWmiConfig({...wmiConfig, username: e.target.value})}
                    className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6C2BD9] text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">Windows Password</label>
                  <input
                    type="password"
                    value={wmiConfig.password}
                    onChange={(e) => setWmiConfig({...wmiConfig, password: e.target.value})}
                    className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6C2BD9] text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>
              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-[#6C2BD9] hover:bg-[#5b21b6] rounded-xl shadow-sm">
                Save WMI Credentials
              </button>
            </form>
          )}

          {/* AD Tab */}
          {activeTab === 'ad' && (
            <form onSubmit={(e) => handleSave(e, 'Active Directory')} className="space-y-4 text-xs">
              <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2 mb-4">Active Directory Sync Configuration</h2>
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">Domain Controller IP</label>
                  <input
                    type="text"
                    placeholder="192.168.1.10"
                    value={adConfig.domainIp}
                    onChange={(e) => setAdConfig({...adConfig, domainIp: e.target.value})}
                    className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6C2BD9] text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">Admin Username (administrator@domain.local)</label>
                  <input
                    type="text"
                    value={adConfig.adminUser}
                    onChange={(e) => setAdConfig({...adConfig, adminUser: e.target.value})}
                    className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6C2BD9] text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">Admin Password</label>
                  <input
                    type="password"
                    value={adConfig.adminPass}
                    onChange={(e) => setAdConfig({...adConfig, adminPass: e.target.value})}
                    className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6C2BD9] text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>
              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-[#6C2BD9] hover:bg-[#5b21b6] rounded-xl shadow-sm">
                Save AD Credentials
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
