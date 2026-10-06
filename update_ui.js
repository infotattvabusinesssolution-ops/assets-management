const fs = require('fs');
const file = 'D:/offcie 2/assets-management/frontend/src/pages/DiscoveryWorkbench.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `                    {/* Credentials */}
                    <div>
                      <label className="block text-slate-500 mb-1">Credentials (optional)</label>
                      <div className="flex items-center gap-2">
                        <select
                          value={credentials}
                          onChange={(e) => setCredentials(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#6C2BD9]"
                        >
                          <option value="Use Saved Credentials">Use Saved Credentials</option>
                          <option value="Domain Admin">Domain Admin</option>
                          <option value="SNMP v3 Auth">SNMP v3 Auth</option>
                        </select>
                        <button
                          onClick={() => setIsSettingsOpen(true)}
                          className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-purple-700 transition-colors shrink-0"
                          title="Credentials key settings"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      </div>
                    </div>`.replace(/\r\n/g, '\n');

const replacement = `                    {/* Dynamic Credentials Section */}
                    <div className="pt-2 border-t border-slate-100">
                      <h3 className="text-xs font-bold text-slate-700 mb-2">Required Credentials</h3>
                      
                      {discoveryType === 'SNMP Sweep' && (
                        <div>
                          <label className="block text-slate-500 mb-1">SNMP Community String</label>
                          <input
                            type="password"
                            placeholder="e.g. public"
                            value={credentialForm.snmpCommunity}
                            onChange={(e) => setCredentialForm({...credentialForm, snmpCommunity: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#6C2BD9]"
                          />
                        </div>
                      )}

                      {discoveryType === 'Active Directory Sync' && (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-slate-500 mb-1">Domain Controller IP</label>
                            <input
                              type="text"
                              placeholder="192.168.1.10"
                              value={credentialForm.domainIpAddress}
                              onChange={(e) => setCredentialForm({...credentialForm, domainIpAddress: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#6C2BD9]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Admin Username</label>
                            <input
                              type="text"
                              placeholder="administrator@domain.local"
                              value={credentialForm.username}
                              onChange={(e) => setCredentialForm({...credentialForm, username: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#6C2BD9]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Admin Password</label>
                            <input
                              type="password"
                              value={credentialForm.passwordValue}
                              onChange={(e) => setCredentialForm({...credentialForm, passwordValue: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#6C2BD9]"
                            />
                          </div>
                        </div>
                      )}

                      {discoveryType === 'WMI/WinRM Agentless' && (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-slate-500 mb-1">Windows Username</label>
                            <input
                              type="text"
                              placeholder="Administrator"
                              value={credentialForm.username}
                              onChange={(e) => setCredentialForm({...credentialForm, username: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#6C2BD9]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Windows Password</label>
                            <input
                              type="password"
                              value={credentialForm.passwordValue}
                              onChange={(e) => setCredentialForm({...credentialForm, passwordValue: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#6C2BD9]"
                            />
                          </div>
                        </div>
                      )}

                      {discoveryType === 'IP Range Scan' && (
                        <div className="text-xs text-slate-500 italic py-2">
                          No credentials required for standard ping sweeps.
                        </div>
                      )}
                    </div>`;

const normalizedContent = content.replace(/\r\n/g, '\n');
if (normalizedContent.includes(target)) {
  fs.writeFileSync(file, normalizedContent.replace(target, replacement));
  console.log('Success!');
} else {
  console.log('Target not found!');
}
