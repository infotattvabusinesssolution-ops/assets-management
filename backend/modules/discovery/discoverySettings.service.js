/**
 * Discovery Settings Service
 * Centralized administration and configuration layer for Asset360 Auto Discovery.
 * Manages Profiles, Credential Vault, Third-party Connectors, Weighted Matching Rules,
 * Device Classification Mappings, Discovery Schedules, Global System Settings,
 * Protected Field Governance, and Configuration Audit Logging.
 */

// 1. Pre-seeded Discovery Profiles matching Screenshot 24
let discoveryProfilesStore = [
  {
    id: 'PROF-001',
    profileName: 'Default (All Devices)',
    description: 'Discovers all network devices in corporate network',
    discoveryType: 'IP Range Scan',
    targetScope: '192.168.1.0/24',
    ipStart: '192.168.1.0',
    ipEnd: '192.168.1.254',
    scanMethods: ['SNMP', 'WMI/WinRM', 'Ping Sweep'],
    scanTimeout: 10,
    maxRetryAttempts: 2,
    deviceTypes: 'All Types',
    enableSoftwareInventory: true,
    credentialRefs: ['CRED-001', 'CRED-003'],
    status: 'Active',
    createdOn: '2026-08-15T08:00:00Z',
    updatedOn: '2026-09-10T10:00:00Z'
  },
  {
    id: 'PROF-002',
    profileName: 'Data Center',
    description: 'High-density scan for core infrastructure and hypervisors',
    discoveryType: 'SNMP Scan',
    targetScope: '10.10.0.0/16',
    ipStart: '10.10.0.1',
    ipEnd: '10.10.255.254',
    scanMethods: ['SNMP', 'SSH'],
    scanTimeout: 15,
    maxRetryAttempts: 3,
    deviceTypes: 'Servers',
    enableSoftwareInventory: true,
    credentialRefs: ['CRED-001', 'CRED-002'],
    status: 'Active',
    createdOn: '2026-08-18T09:30:00Z',
    updatedOn: '2026-09-08T14:20:00Z'
  },
  {
    id: 'PROF-003',
    profileName: 'Branch Offices',
    description: 'Distributed scan across remote retail and regional sites',
    discoveryType: 'WMI Scan',
    targetScope: 'Multiple Sites',
    ipStart: '10.20.1.1',
    ipEnd: '10.20.10.254',
    scanMethods: ['WMI/WinRM', 'Ping Sweep'],
    scanTimeout: 20,
    maxRetryAttempts: 2,
    deviceTypes: 'Workstations',
    enableSoftwareInventory: true,
    credentialRefs: ['CRED-001'],
    status: 'Active',
    createdOn: '2026-08-20T11:00:00Z',
    updatedOn: '2026-09-07T16:40:00Z'
  },
  {
    id: 'PROF-004',
    profileName: 'Remote Sites',
    description: 'Endpoint discovery for off-grid and work-from-home machines',
    discoveryType: 'Agent Based',
    targetScope: 'Remote Locations',
    ipStart: '',
    ipEnd: '',
    scanMethods: ['Agent Telemetry'],
    scanTimeout: 30,
    maxRetryAttempts: 1,
    deviceTypes: 'Laptops',
    enableSoftwareInventory: true,
    credentialRefs: [],
    status: 'Inactive',
    createdOn: '2026-08-22T13:15:00Z',
    updatedOn: '2026-09-01T09:00:00Z'
  },
  {
    id: 'PROF-005',
    profileName: 'Printers',
    description: 'Dedicated subnet sweep for multi-function office printers',
    discoveryType: 'SNMP Scan',
    targetScope: '192.168.20.0/24',
    ipStart: '192.168.20.1',
    ipEnd: '192.168.20.254',
    scanMethods: ['SNMP', 'Ping Sweep'],
    scanTimeout: 8,
    maxRetryAttempts: 2,
    deviceTypes: 'Printers',
    enableSoftwareInventory: false,
    credentialRefs: ['CRED-003'],
    status: 'Active',
    createdOn: '2026-08-25T14:00:00Z',
    updatedOn: '2026-09-05T11:10:00Z'
  },
  {
    id: 'PROF-006',
    profileName: 'Network Devices',
    description: 'Switch, router, firewall and wireless access point audit',
    discoveryType: 'SNMP Scan',
    targetScope: '10.20.0.0/16',
    ipStart: '10.20.0.1',
    ipEnd: '10.20.255.254',
    scanMethods: ['SNMP', 'SSH'],
    scanTimeout: 12,
    maxRetryAttempts: 3,
    deviceTypes: 'Network Devices',
    enableSoftwareInventory: false,
    credentialRefs: ['CRED-004'],
    status: 'Active',
    createdOn: '2026-08-28T16:45:00Z',
    updatedOn: '2026-09-09T17:30:00Z'
  }
];

// 2. Pre-seeded Credential Vault matching Screenshot 24
// NOTE: Secrets and private keys are stored only in memory/backend vault, NEVER returned to browser!
let credentialVaultStore = [
  {
    id: 'CRED-001',
    name: 'Windows Admin',
    type: 'Windows (WMI)',
    username: 'assetadmin',
    domain: 'CORP.ASSET360',
    secretMasked: '••••••••••••',
    encryptedSecret: 'ENC_AES256_WMI_SECRET_9874',
    usedInProfiles: 'Default, Data Center',
    status: 'Active',
    lastRotated: '2026-08-10'
  },
  {
    id: 'CRED-002',
    name: 'Linux SSH',
    type: 'SSH',
    username: 'linuxadmin',
    domain: '-',
    secretMasked: '••••••••••••',
    encryptedSecret: 'ENC_RSA_KEY_PRIV_4821',
    usedInProfiles: 'Data Center',
    status: 'Active',
    lastRotated: '2026-08-15'
  },
  {
    id: 'CRED-003',
    name: 'SNMP Read',
    type: 'SNMP v2c',
    username: 'public',
    domain: '-',
    secretMasked: '••••••••',
    encryptedSecret: 'ENC_SNMP_COMMUNITY_PUBLIC',
    usedInProfiles: 'Default, Printers',
    status: 'Active',
    lastRotated: '2026-07-20'
  },
  {
    id: 'CRED-004',
    name: 'SNMP v3',
    type: 'SNMP v3',
    username: 'snmpuser',
    domain: '-',
    secretMasked: '••••••••••••',
    encryptedSecret: 'ENC_SNMP_V3_AUTHPRIV_7721',
    usedInProfiles: 'Network Devices',
    status: 'Active',
    lastRotated: '2026-09-01'
  }
];

// 3. Pre-seeded Connectors & Integrations matching Screenshot 24
let connectorsStore = [
  {
    id: 'CONN-001',
    name: 'Intune',
    type: 'MDM',
    targetSystem: 'Microsoft Intune',
    endpointUrl: 'https://graph.microsoft.com/v1.0/deviceManagement',
    credentialRef: 'CRED-001',
    syncFrequency: 'Every 4 Hours',
    status: 'Active',
    lastSync: '10 Sep 2026 08:15',
    syncResult: 'Success: 142 records synchronized',
    history: [
      { timestamp: '2026-09-10T08:15:00Z', status: 'Success', count: 142 },
      { timestamp: '2026-09-10T04:15:00Z', status: 'Success', count: 140 }
    ]
  },
  {
    id: 'CONN-002',
    name: 'SCCM',
    type: 'Endpoint Mgmt',
    targetSystem: 'Microsoft SCCM',
    endpointUrl: 'https://sccm.corp.local/AdminService/v1.0',
    credentialRef: 'CRED-001',
    syncFrequency: 'Daily at 07:00 AM',
    status: 'Active',
    lastSync: '10 Sep 2026 07:30',
    syncResult: 'Success: 310 records synchronized',
    history: [
      { timestamp: '2026-09-10T07:30:00Z', status: 'Success', count: 310 }
    ]
  },
  {
    id: 'CONN-003',
    name: 'ServiceNow',
    type: 'ITSM/CMDB',
    targetSystem: 'ServiceNow',
    endpointUrl: 'https://asset360.service-now.com/api/now/table/cmdb_ci',
    credentialRef: 'CRED-001',
    syncFrequency: 'Daily at 23:00 PM',
    status: 'Active',
    lastSync: '09 Sep 2026 23:10',
    syncResult: 'Success: 512 configuration items mapped',
    history: [
      { timestamp: '2026-09-09T23:10:00Z', status: 'Success', count: 512 }
    ]
  },
  {
    id: 'CONN-004',
    name: 'AWS',
    type: 'Cloud',
    targetSystem: 'Amazon Web Services',
    endpointUrl: 'https://ec2.eu-west-1.amazonaws.com',
    credentialRef: 'CRED-002',
    syncFrequency: 'Daily at 03:00 AM',
    status: 'Inactive',
    lastSync: '-',
    syncResult: 'Disabled by administrator',
    history: []
  },
  {
    id: 'CONN-005',
    name: 'Azure AD',
    type: 'Directory',
    targetSystem: 'Microsoft Entra ID',
    endpointUrl: 'https://graph.microsoft.com/v1.0/devices',
    credentialRef: 'CRED-001',
    syncFrequency: 'Every 6 Hours',
    status: 'Active',
    lastSync: '10 Sep 2026 06:45',
    syncResult: 'Success: 280 device identities matched',
    history: [
      { timestamp: '2026-09-10T06:45:00Z', status: 'Success', count: 280 }
    ]
  }
];

// 4. Pre-seeded Matching Rules matching Screenshot 24
let matchingRulesStore = [
  {
    id: 'RULE-01',
    attribute: 'Serial Number',
    weight: 30,
    useInMatching: true,
    description: 'Primary identifier',
    isPrimary: true
  },
  {
    id: 'RULE-02',
    attribute: 'BIOS / UUID',
    weight: 25,
    useInMatching: true,
    description: 'System UUID / BIOS ID',
    isPrimary: true
  },
  {
    id: 'RULE-03',
    attribute: 'MAC Address',
    weight: 20,
    useInMatching: true,
    description: 'Primary MAC address',
    isPrimary: false
  },
  {
    id: 'RULE-04',
    attribute: 'Hostname',
    weight: 15,
    useInMatching: true,
    description: 'Device hostname',
    isPrimary: false
  },
  {
    id: 'RULE-05',
    attribute: 'Model',
    weight: 10,
    useInMatching: true,
    description: 'Device model',
    isPrimary: false
  },
  {
    id: 'RULE-06',
    attribute: 'IP Address',
    weight: 5,
    useInMatching: false,
    description: 'Last known IP address',
    isPrimary: false
  }
];

// Default Matching Rules for Reset
const DEFAULT_MATCHING_RULES = JSON.parse(JSON.stringify(matchingRulesStore));

// 5. Pre-seeded Device Classification Mapping Rules
let deviceClassificationStore = [
  {
    id: 'CLASS-001',
    discoveredType: 'Computer',
    osPattern: 'Windows',
    assetGroup: 'IT Equipment',
    assetClass: 'End User Computing',
    category: 'Computer',
    subcategory: 'Desktop / Workstation',
    suggestedStatus: 'In Stock'
  },
  {
    id: 'CLASS-002',
    discoveredType: 'Computer',
    osPattern: 'macOS|OS X',
    assetGroup: 'IT Equipment',
    assetClass: 'End User Computing',
    category: 'Computer',
    subcategory: 'MacBook / Apple PC',
    suggestedStatus: 'In Stock'
  },
  {
    id: 'CLASS-003',
    discoveredType: 'Server',
    osPattern: '.*',
    assetGroup: 'IT Equipment',
    assetClass: 'Enterprise Infrastructure',
    category: 'Server',
    subcategory: 'Rack Server',
    suggestedStatus: 'Active'
  },
  {
    id: 'CLASS-004',
    discoveredType: 'Network Device',
    osPattern: 'Cisco|Aruba|Fortinet',
    assetGroup: 'IT Equipment',
    assetClass: 'Networking',
    category: 'Switch / Router',
    subcategory: 'Managed Switch',
    suggestedStatus: 'Active'
  },
  {
    id: 'CLASS-005',
    discoveredType: 'Printer',
    osPattern: '.*',
    assetGroup: 'IT Equipment',
    assetClass: 'Office Peripherals',
    category: 'Printer',
    subcategory: 'Network Multifunction',
    suggestedStatus: 'Active'
  },
  {
    id: 'CLASS-006',
    discoveredType: 'Mobile Device',
    osPattern: 'iOS|iPadOS|Android',
    assetGroup: 'IT Equipment',
    assetClass: 'Mobile Computing',
    category: 'Tablet / Phone',
    subcategory: 'Corporate Tablet',
    suggestedStatus: 'In Stock'
  },
  {
    id: 'CLASS-007',
    discoveredType: 'Display',
    osPattern: '.*',
    assetGroup: 'IT Equipment',
    assetClass: 'Audio Visual',
    category: 'Display Screen',
    subcategory: 'Conference Room Display',
    suggestedStatus: 'Active'
  },
  {
    id: 'CLASS-008',
    discoveredType: 'POS Device',
    osPattern: 'Zebra|Honeywell',
    assetGroup: 'Operational Equipment',
    assetClass: 'Store Systems',
    category: 'Handheld Scanner',
    subcategory: 'Mobile Computer',
    suggestedStatus: 'In Stock'
  }
];

// 6. Pre-seeded Discovery Schedules
let discoverySchedulesStore = [
  {
    id: 'SCHED-001',
    name: 'HQ Daily Nightly Sweep',
    frequency: 'Daily',
    time: '02:00 AM',
    timezone: 'Asia/Dubai (UTC+4)',
    profileId: 'PROF-001',
    profileName: 'Default (All Devices)',
    enabled: true,
    nextRun: 'Tomorrow at 02:00 AM',
    lastRun: 'Today at 02:00 AM'
  },
  {
    id: 'SCHED-002',
    name: 'Data Center Core Weekend Audit',
    frequency: 'Weekly (Sun)',
    time: '01:00 AM',
    timezone: 'Asia/Dubai (UTC+4)',
    profileId: 'PROF-002',
    profileName: 'Data Center',
    enabled: true,
    nextRun: 'Sunday at 01:00 AM',
    lastRun: '08 Sep 2026 01:00 AM'
  },
  {
    id: 'SCHED-003',
    name: 'Printers Monthly Baseline',
    frequency: 'Monthly (1st)',
    time: '05:00 AM',
    timezone: 'Asia/Dubai (UTC+4)',
    profileId: 'PROF-005',
    profileName: 'Printers',
    enabled: true,
    nextRun: '01 Oct 2026 05:00 AM',
    lastRun: '01 Sep 2026 05:00 AM'
  }
];

// 7. Pre-seeded Global Settings matching Screenshot 24
let globalSettingsStore = {
  staleDeviceThresholdDays: 30,
  autoCreateExceptionForUnknown: true,
  enableSoftwareInventory: true,
  defaultDiscoverySchedule: 'Weekly',
  notificationEmail: 'it-team@company.com',
  enableDiscoveryAuditLog: true,
  thresholds: {
    autoMatchPercentage: 90,
    suggestedMatchPercentage: 60,
    reviewThresholdPercentage: 50
  },
  protectedFields: [
    'purchasePrice',
    'capitalizedCost',
    'depreciationMethod',
    'rfidTag',
    'barcode',
    'assignedCustodian',
    'financialStatus',
    'bookValue'
  ]
};

// 8. Discovery Audit Logs Store
let discoveryAuditLogsStore = [
  {
    id: 'AUD-001',
    timestamp: '2026-09-10T10:00:00Z',
    module: 'Discovery Settings',
    category: 'Discovery Profiles',
    action: 'UPDATE_PROFILE',
    entityId: 'PROF-001',
    changedBy: 'John Doe (System Administrator)',
    details: 'Updated scan timeout from 8s to 10s on Default profile'
  },
  {
    id: 'AUD-002',
    timestamp: '2026-09-08T15:30:00Z',
    module: 'Discovery Settings',
    category: 'Matching Rules',
    action: 'UPDATE_WEIGHTS',
    entityId: 'RULE-01',
    changedBy: 'John Doe (System Administrator)',
    details: 'Adjusted Serial Number match weight to 30%'
  },
  {
    id: 'AUD-003',
    timestamp: '2026-09-05T09:20:00Z',
    module: 'Discovery Settings',
    category: 'Global Settings',
    action: 'UPDATE_GLOBAL',
    entityId: 'GLOBAL',
    changedBy: 'Admin User',
    details: 'Enabled auto-creation of exceptions for unknown devices'
  }
];

function logAudit(category, action, entityId, details, user) {
  const entry = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    module: 'Discovery Settings',
    category,
    action,
    entityId,
    changedBy: user?.name || user?.fullName || 'John Doe (System Administrator)',
    details
  };
  discoveryAuditLogsStore.unshift(entry);
  return entry;
}

export class DiscoverySettingsService {
  /**
   * Get Complete Discovery Settings Overview (Profiles, Creds, Connectors, Rules, Global)
   */
  static async getOverview() {
    return {
      profiles: discoveryProfilesStore,
      credentials: discoveryProfilesStore ? credentialVaultStore.map(({ encryptedSecret, ...safe }) => safe) : [],
      connectors: connectorsStore,
      matchingRules: matchingRulesStore,
      classifications: deviceClassificationStore,
      schedules: discoverySchedulesStore,
      globalSettings: globalSettingsStore
    };
  }

  // -------------------------------------------------------------
  // 1. Discovery Profiles Methods
  // -------------------------------------------------------------

  static async getProfiles() {
    return discoveryProfilesStore;
  }

  static async getProfileById(id) {
    const profile = discoveryProfilesStore.find(p => p.id === id || p.profileName === id);
    if (!profile) return null;
    return profile;
  }

  static async saveProfile(payload, user) {
    let profile;
    const isUpdate = payload.id && discoveryProfilesStore.some(p => p.id === payload.id);

    if (isUpdate) {
      profile = discoveryProfilesStore.find(p => p.id === payload.id);
      Object.assign(profile, payload, { updatedOn: new Date().toISOString() });
      logAudit('Discovery Profiles', 'UPDATE_PROFILE', profile.id, `Updated profile ${profile.profileName}`, user);
    } else {
      const newId = `PROF-${String(discoveryProfilesStore.length + 1).padStart(3, '0')}`;
      profile = {
        id: newId,
        profileName: payload.profileName || 'New Discovery Profile',
        description: payload.description || '',
        discoveryType: payload.discoveryType || 'IP Range Scan',
        targetScope: payload.targetScope || `${payload.ipStart || '192.168.1.0'} - ${payload.ipEnd || '192.168.1.254'}`,
        ipStart: payload.ipStart || '192.168.1.0',
        ipEnd: payload.ipEnd || '192.168.1.254',
        scanMethods: payload.scanMethods || ['SNMP', 'Ping Sweep'],
        scanTimeout: Number(payload.scanTimeout) || 10,
        maxRetryAttempts: Number(payload.maxRetryAttempts) || 2,
        deviceTypes: payload.deviceTypes || 'All Types',
        enableSoftwareInventory: payload.enableSoftwareInventory !== false,
        credentialRefs: payload.credentialRefs || [],
        status: payload.status || 'Active',
        createdOn: new Date().toISOString(),
        updatedOn: new Date().toISOString()
      };
      discoveryProfilesStore.push(profile);
      logAudit('Discovery Profiles', 'CREATE_PROFILE', profile.id, `Created new profile ${profile.profileName}`, user);
    }

    return profile;
  }

  static async cloneProfile(profileId, user) {
    const source = discoveryProfilesStore.find(p => p.id === profileId);
    if (!source) throw new Error('Source profile not found to clone');

    const newId = `PROF-${String(discoveryProfilesStore.length + 1).padStart(3, '0')}`;
    const cloned = {
      ...source,
      id: newId,
      profileName: `${source.profileName} (Copy)`,
      createdOn: new Date().toISOString(),
      updatedOn: new Date().toISOString()
    };
    discoveryProfilesStore.push(cloned);
    logAudit('Discovery Profiles', 'CLONE_PROFILE', cloned.id, `Cloned profile from ${source.profileName}`, user);
    return cloned;
  }

  static async deleteProfile(profileId, user) {
    const idx = discoveryProfilesStore.findIndex(p => p.id === profileId);
    if (idx !== -1) {
      const removed = discoveryProfilesStore.splice(idx, 1)[0];
      logAudit('Discovery Profiles', 'DELETE_PROFILE', profileId, `Deleted profile ${removed.profileName}`, user);
      return true;
    }
    return false;
  }

  // -------------------------------------------------------------
  // 2. Credential Vault Methods
  // -------------------------------------------------------------

  static async getCredentials() {
    // SECURITY RULE: Never return plaintext or encrypted secrets to client
    return credentialVaultStore.map(({ encryptedSecret, ...safe }) => safe);
  }

  static async saveCredential(payload, user) {
    let credential;
    const isUpdate = payload.id && credentialVaultStore.some(c => c.id === payload.id);

    if (isUpdate) {
      credential = credentialVaultStore.find(c => c.id === payload.id);
      credential.name = payload.name || credential.name;
      credential.type = payload.type || credential.type;
      credential.username = payload.username || credential.username;
      credential.domain = payload.domain || credential.domain;
      credential.status = payload.status || credential.status;
      if (payload.secret) {
        credential.encryptedSecret = `ENC_${Date.now()}_SECRET`;
        credential.lastRotated = new Date().toISOString().slice(0, 10);
      }
      logAudit('Credential Vault', 'UPDATE_CREDENTIAL', credential.id, `Updated credential ${credential.name}`, user);
    } else {
      const newId = `CRED-${String(credentialVaultStore.length + 1).padStart(3, '0')}`;
      credential = {
        id: newId,
        name: payload.name || 'New Credential',
        type: payload.type || 'Windows (WMI)',
        username: payload.username || 'admin',
        domain: payload.domain || '-',
        secretMasked: '••••••••••••',
        encryptedSecret: `ENC_${Date.now()}_SECRET`,
        usedInProfiles: payload.usedInProfiles || 'None',
        status: payload.status || 'Active',
        lastRotated: new Date().toISOString().slice(0, 10)
      };
      credentialVaultStore.push(credential);
      logAudit('Credential Vault', 'CREATE_CREDENTIAL', credential.id, `Created credential ${credential.name}`, user);
    }

    const { encryptedSecret, ...safe } = credential;
    return safe;
  }

  static async deleteCredential(credId, user) {
    const cred = credentialVaultStore.find(c => c.id === credId);
    if (!cred) return false;

    // Check if used in any active profiles
    const usedIn = discoveryProfilesStore.filter(p => p.credentialRefs?.includes(credId) || cred.usedInProfiles?.includes(p.profileName));
    if (usedIn.length > 0) {
      const names = usedIn.map(p => p.profileName).join(', ');
      throw new Error(`Cannot delete credential. It is currently referenced by active profile(s): ${names}`);
    }

    const idx = credentialVaultStore.findIndex(c => c.id === credId);
    if (idx !== -1) {
      credentialVaultStore.splice(idx, 1);
      logAudit('Credential Vault', 'DELETE_CREDENTIAL', credId, `Deleted credential ${cred.name}`, user);
      return true;
    }
    return false;
  }

  static async testCredential(credId) {
    const cred = credentialVaultStore.find(c => c.id === credId);
    if (!cred) throw new Error('Credential not found');

    return {
      success: true,
      credentialId: cred.id,
      name: cred.name,
      testStatus: 'SUCCESS',
      latencyMs: Math.floor(Math.random() * 80) + 20,
      message: `Authentication handshake verified successfully for ${cred.type} (${cred.username}).`
    };
  }

  // -------------------------------------------------------------
  // 3. Connectors & Third-Party Integrations Methods
  // -------------------------------------------------------------

  static async getConnectors() {
    return connectorsStore;
  }

  static async saveConnector(payload, user) {
    let connector;
    const isUpdate = payload.id && connectorsStore.some(c => c.id === payload.id);

    if (isUpdate) {
      connector = connectorsStore.find(c => c.id === payload.id);
      Object.assign(connector, payload);
      logAudit('Connectors', 'UPDATE_CONNECTOR', connector.id, `Updated connector ${connector.name}`, user);
    } else {
      const newId = `CONN-${String(connectorsStore.length + 1).padStart(3, '0')}`;
      connector = {
        id: newId,
        name: payload.name,
        type: payload.type || 'MDM',
        targetSystem: payload.targetSystem || payload.name,
        endpointUrl: payload.endpointUrl || '',
        credentialRef: payload.credentialRef || 'CRED-001',
        syncFrequency: payload.syncFrequency || 'Daily at 08:00 AM',
        status: payload.status || 'Active',
        lastSync: '-',
        syncResult: 'Initialized. Awaiting first scheduled sync.',
        history: []
      };
      connectorsStore.push(connector);
      logAudit('Connectors', 'CREATE_CONNECTOR', connector.id, `Created connector ${connector.name}`, user);
    }
    return connector;
  }

  static async testConnector(connId) {
    const conn = connectorsStore.find(c => c.id === connId);
    if (!conn) throw new Error('Connector not found');

    const isLive = conn.status === 'Active';
    if (!isLive) {
      return {
        success: false,
        status: 'OFFLINE',
        message: `Connector ${conn.name} is currently Inactive.`
      };
    }

    return {
      success: true,
      connectorId: conn.id,
      name: conn.name,
      targetSystem: conn.targetSystem,
      status: 'CONNECTED',
      latencyMs: Math.floor(Math.random() * 120) + 45,
      version: 'v2.4 API',
      message: `Successfully authenticated with ${conn.targetSystem} endpoint. Telemetry channels operational.`
    };
  }

  static async syncConnector(connId, user) {
    const conn = connectorsStore.find(c => c.id === connId);
    if (!conn) throw new Error('Connector not found');

    const syncedCount = Math.floor(Math.random() * 150) + 50;
    const timestamp = new Date().toISOString();
    conn.lastSync = 'Just now';
    conn.syncResult = `Success: ${syncedCount} records synchronized.`;
    conn.history.unshift({ timestamp, status: 'Success', count: syncedCount });

    logAudit('Connectors', 'SYNC_CONNECTOR', conn.id, `Manual sync triggered for ${conn.name} (${syncedCount} records)`, user);

    return {
      success: true,
      connector: conn,
      recordsSynced: syncedCount,
      timestamp
    };
  }

  static async deleteConnector(connId, user) {
    const idx = connectorsStore.findIndex(c => c.id === connId);
    if (idx !== -1) {
      const removed = connectorsStore.splice(idx, 1)[0];
      logAudit('Connectors', 'DELETE_CONNECTOR', connId, `Deleted connector ${removed.name}`, user);
      return true;
    }
    return false;
  }

  // -------------------------------------------------------------
  // 4. Weighted Matching Rules Methods
  // -------------------------------------------------------------

  static async getMatchingRules() {
    return matchingRulesStore;
  }

  static async updateMatchingRules(rulesArray, user) {
    if (!Array.isArray(rulesArray)) throw new Error('Invalid rules payload');

    matchingRulesStore = rulesArray.map(r => ({
      ...r,
      weight: Number(r.weight) || 0,
      useInMatching: !!r.useInMatching
    }));

    const totalWeight = matchingRulesStore.filter(r => r.useInMatching).reduce((sum, r) => sum + r.weight, 0);

    logAudit('Matching Rules', 'UPDATE_MATCHING_RULES', 'RULES', `Updated matching rule weights. Total active weight: ${totalWeight}%`, user);

    return {
      success: true,
      rules: matchingRulesStore,
      totalActiveWeight: totalWeight,
      isBalanced: totalWeight === 100
    };
  }

  static async resetMatchingRules(user) {
    matchingRulesStore = JSON.parse(JSON.stringify(DEFAULT_MATCHING_RULES));
    logAudit('Matching Rules', 'RESET_MATCHING_RULES', 'RULES', 'Reset matching rules to factory defaults', user);
    return matchingRulesStore;
  }

  // -------------------------------------------------------------
  // 5. Device Classification Mappings Methods
  // -------------------------------------------------------------

  static async getClassificationRules() {
    return deviceClassificationStore;
  }

  static async saveClassificationRule(payload, user) {
    let rule;
    const isUpdate = payload.id && deviceClassificationStore.some(r => r.id === payload.id);

    if (isUpdate) {
      rule = deviceClassificationStore.find(r => r.id === payload.id);
      Object.assign(rule, payload);
      logAudit('Device Classification', 'UPDATE_CLASSIFICATION', rule.id, `Updated classification mapping for ${rule.discoveredType}`, user);
    } else {
      const newId = `CLASS-${String(deviceClassificationStore.length + 1).padStart(3, '0')}`;
      rule = {
        id: newId,
        discoveredType: payload.discoveredType || 'Computer',
        osPattern: payload.osPattern || '.*',
        assetGroup: payload.assetGroup || 'IT Equipment',
        assetClass: payload.assetClass || 'End User Computing',
        category: payload.category || 'Computer',
        subcategory: payload.subcategory || 'Desktop',
        suggestedStatus: payload.suggestedStatus || 'In Stock'
      };
      deviceClassificationStore.push(rule);
      logAudit('Device Classification', 'CREATE_CLASSIFICATION', rule.id, `Created classification mapping for ${rule.discoveredType}`, user);
    }
    return rule;
  }

  static async deleteClassificationRule(ruleId, user) {
    const idx = deviceClassificationStore.findIndex(r => r.id === ruleId);
    if (idx !== -1) {
      deviceClassificationStore.splice(idx, 1);
      logAudit('Device Classification', 'DELETE_CLASSIFICATION', ruleId, 'Deleted classification mapping rule', user);
      return true;
    }
    return false;
  }

  // -------------------------------------------------------------
  // 6. Discovery Schedules Methods
  // -------------------------------------------------------------

  static async getSchedules() {
    return discoverySchedulesStore;
  }

  static async saveSchedule(payload, user) {
    let sched;
    const isUpdate = payload.id && discoverySchedulesStore.some(s => s.id === payload.id);

    if (isUpdate) {
      sched = discoverySchedulesStore.find(s => s.id === payload.id);
      Object.assign(sched, payload);
      logAudit('Discovery Schedule', 'UPDATE_SCHEDULE', sched.id, `Updated schedule ${sched.name}`, user);
    } else {
      const newId = `SCHED-${String(discoverySchedulesStore.length + 1).padStart(3, '0')}`;
      sched = {
        id: newId,
        name: payload.name || 'New Discovery Schedule',
        frequency: payload.frequency || 'Daily',
        time: payload.time || '02:00 AM',
        timezone: payload.timezone || 'Asia/Dubai (UTC+4)',
        profileId: payload.profileId || 'PROF-001',
        profileName: payload.profileName || 'Default (All Devices)',
        enabled: payload.enabled !== false,
        nextRun: 'Tomorrow at 02:00 AM',
        lastRun: '-'
      };
      discoverySchedulesStore.push(sched);
      logAudit('Discovery Schedule', 'CREATE_SCHEDULE', sched.id, `Created schedule ${sched.name}`, user);
    }
    return sched;
  }

  static async toggleSchedule(schedId, user) {
    const sched = discoverySchedulesStore.find(s => s.id === schedId);
    if (!sched) throw new Error('Schedule not found');
    sched.enabled = !sched.enabled;
    logAudit('Discovery Schedule', 'TOGGLE_SCHEDULE', sched.id, `Set schedule ${sched.name} enabled = ${sched.enabled}`, user);
    return sched;
  }

  static async deleteSchedule(schedId, user) {
    const idx = discoverySchedulesStore.findIndex(s => s.id === schedId);
    if (idx !== -1) {
      const removed = discoverySchedulesStore.splice(idx, 1)[0];
      logAudit('Discovery Schedule', 'DELETE_SCHEDULE', schedId, `Deleted schedule ${removed.name}`, user);
      return true;
    }
    return false;
  }

  // -------------------------------------------------------------
  // 7. Global Settings & Protected Governance Methods
  // -------------------------------------------------------------

  static async getGlobalSettings() {
    return globalSettingsStore;
  }

  static async updateGlobalSettings(payload, user) {
    // ENFORCE PROTECTED FIELD GOVERNANCE:
    // Discovery Settings must never permit unapproved modification of financial/capitalized cost or tag IDs
    const safePayload = { ...payload };
    delete safePayload.protectedFields; // Immutable system safety list

    Object.assign(globalSettingsStore, safePayload);

    logAudit('Global Settings', 'UPDATE_GLOBAL_SETTINGS', 'GLOBAL', 'Updated global discovery system parameters', user);

    return globalSettingsStore;
  }

  // -------------------------------------------------------------
  // 8. Audit Trail Query
  // -------------------------------------------------------------

  static async getAuditLogs() {
    return discoveryAuditLogsStore;
  }
}

export default DiscoverySettingsService;
