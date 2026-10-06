const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../frontend/src');

function cleanFile(relPath, transforms) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    return;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  for (const t of transforms) {
    if (typeof t === 'function') {
      content = t(content);
    } else {
      content = content.replace(t.pattern, t.replacement);
    }
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Cleaned: ${relPath}`);
}

// 1. MovementHistory.jsx
cleanFile('pages/MovementHistory.jsx', [
  {
    pattern: /\/\/ Pre-seeded 24 Movement History records[\s\S]*?const SEED_MOVEMENTS = \[[\s\S]*?\n\];\s*/,
    replacement: 'const SEED_MOVEMENTS = [];\n\n'
  },
  {
    pattern: /const \[selectedMovementId, setSelectedMovementId\] = useState\('MOV-2026-0012'\);/,
    replacement: "const [selectedMovementId, setSelectedMovementId] = useState(null);"
  },
  {
    pattern: /const \[filterSearch, setFilterSearch\] = useState\(searchParams\.get\('search'\) \|\| 'AS-000123'\);/,
    replacement: "const [filterSearch, setFilterSearch] = useState(searchParams.get('search') || '');"
  },
  {
    pattern: /const \[filterFromDate, setFilterFromDate\] = useState\('01 Jan 2025'\);/,
    replacement: "const [filterFromDate, setFilterFromDate] = useState('');"
  },
  {
    pattern: /const \[filterToDate, setFilterToDate\] = useState\('10 Sep 2026'\);/,
    replacement: "const [filterToDate, setFilterToDate] = useState('');"
  },
  {
    pattern: /const \[movements, setMovements\] = useState\(SEED_MOVEMENTS\);/,
    replacement: "const [movements, setMovements] = useState([]);"
  },
  {
    pattern: /const \[totalRecords, setTotalRecords\] = useState\(24\);/,
    replacement: "const [totalRecords, setTotalRecords] = useState(0);"
  },
  {
    pattern: /const \[kpis, setKpis\] = useState\({\s*totalMovements:\s*24,[\s\S]*?cancelledRejected:\s*1\s*}\);/,
    replacement: `const [kpis, setKpis] = useState({
    totalMovements: 0,
    completed: 0,
    inTransit: 0,
    pendingReceipt: 0,
    cancelledRejected: 0
  });`
  },
  {
    pattern: /return movements\.find\(m => m\.movementId === selectedMovementId\) \|\| movements\[0\] \|\| SEED_MOVEMENTS\[0\];/,
    replacement: "return movements.find(m => m.movementId === selectedMovementId) || movements[0] || null;"
  },
  {
    pattern: /\{SEED_MOVEMENTS\.map\(\(ev, i\) => \(/g,
    replacement: "{(selectedMovement?.timeline || movements || []).map((ev, i) => ("
  }
]);

// 2. MovementApprovals.jsx
cleanFile('pages/MovementApprovals.jsx', [
  {
    pattern: /const DEFAULT_REQUESTS = \[[\s\S]*?\n\];\s*export function MovementApprovals\(\) \{/,
    replacement: 'const DEFAULT_REQUESTS = [];\n\nexport function MovementApprovals() {'
  },
  {
    pattern: /const \[requests, setRequests\] = useState\(DEFAULT_REQUESTS\);/,
    replacement: "const [requests, setRequests] = useState([]);"
  },
  {
    pattern: /const \[selectedRequest, setSelectedRequest\] = useState\(DEFAULT_REQUESTS\[0\]\);/,
    replacement: "const [selectedRequest, setSelectedRequest] = useState(null);"
  },
  {
    pattern: /const \[selectedIds, setSelectedIds\] = useState\(new Set\(\['REQ-00045'\]\)\);/,
    replacement: "const [selectedIds, setSelectedIds] = useState(new Set());"
  },
  {
    pattern: /const \[totalRecords, setTotalRecords\] = useState\(12\);/,
    replacement: "const [totalRecords, setTotalRecords] = useState(0);"
  },
  {
    pattern: /const \[kpis, setKpis\] = useState\({\s*pendingApprovals:\s*12,[\s\S]*?overdueRequests:\s*3\s*}\);/,
    replacement: `const [kpis, setKpis] = useState({
    pendingApprovals: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    overdueRequests: 0
  });`
  }
]);

// 3. UserManagement.jsx
cleanFile('pages/admin/UserManagement.jsx', [
  {
    pattern: /export const INITIAL_USERS = \[[\s\S]*?\n\];\s*export function UserManagement\(\) \{/,
    replacement: 'export const INITIAL_USERS = [];\n\nexport function UserManagement() {'
  },
  {
    pattern: /const \[userList, setUserList\] = useState\(INITIAL_USERS\);/,
    replacement: "const [userList, setUserList] = useState([]);"
  },
  // Ensure fetchUsers handles api properly
  (content) => {
    return content.replace(
      /const res = await fetch\(`\$\{API_BASE_URL\}\/admin\/users\?\$\{params\.toString\(\)\}`\);[\s\S]*?if \(res\.ok\) \{[\s\S]*?\}\s*\} catch \(err\) \{/g,
      `const res = await fetch(\`\${API_BASE_URL}/admin/users?\${params.toString()}\`, {
        headers: {
          'Authorization': \`Bearer \${localStorage.getItem('fams_token') || ''}\`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
          setUserList(data.users);
          setTotalUsers(data.total || data.users.length);
          setLoading(false);
          return;
        }
      }
    } catch (err) {`
    );
  }
]);

// 4. AuditManagement.jsx
cleanFile('pages/AuditManagement.jsx', [
  {
    pattern: /\/\/ Pre-seeded 12 Audits matching Screenshot 28 exact records[\s\S]*?const SEED_AUDITS = \[[\s\S]*?\n\];\s*/,
    replacement: 'const SEED_AUDITS = [];\n\n'
  },
  (content) => {
    // Add audits state and fetch logic to AuditManagement
    if (!content.includes('const [audits, setAudits] = useState(')) {
      content = content.replace(
        /export function AuditManagement\(\) \{/,
        `export function AuditManagement() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchAudits = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stocktakes/audits').catch(() => null);
        if (res && res.audits) {
          setAudits(res.audits);
        } else if (res && res.campaigns) {
          setAudits(res.campaigns);
        }
      } catch (e) {
        console.error('Failed to load audits:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAudits();
  }, []);`
      );
      content = content.replace(/SEED_AUDITS\.find\(/g, 'audits.find(');
      content = content.replace(/SEED_AUDITS\.filter\(/g, 'audits.filter(');
      content = content.replace(/SEED_AUDITS\.length/g, 'audits.length');
      content = content.replace(/SEED_AUDITS\[0\]/g, 'audits[0] || null');
    }
    return content;
  }
]);

// 5. AuditReport.jsx
cleanFile('pages/AuditReport.jsx', [
  {
    pattern: /const DEFAULT_AUDIT_INFO = {[\s\S]*?};\s*const DEFAULT_KPIS = {[\s\S]*?};\s*/,
    replacement: `const DEFAULT_AUDIT_INFO = null;
const DEFAULT_KPIS = {
  totalAssets: 0,
  verified: 0,
  verifiedPct: 0,
  pending: 0,
  pendingPct: 0,
  notFound: 0,
  notFoundPct: 0,
  wrongLocation: 0,
  wrongLocationPct: 0,
  wrongCustodian: 0,
  wrongCustodianPct: 0,
  unregistered: 0,
  unregisteredPct: 0,
  damaged: 0,
  damagedPct: 0,
  totalExceptions: 0
};
`
  },
  {
    pattern: /const SEEDED_SAMPLE_ASSETS = \[[\s\S]*?\n\];\s*/,
    replacement: 'const SEEDED_SAMPLE_ASSETS = [];\n\n'
  },
  {
    pattern: /const \[totalRecords, setTotalRecords\] = useState\(600\);/,
    replacement: 'const [totalRecords, setTotalRecords] = useState(0);'
  }
]);

// 6. AuditLogsConsole.jsx
cleanFile('pages/admin/AuditLogsConsole.jsx', [
  {
    pattern: /\/\/ Exact 10 seed rows from Screenshot[\s\S]*?const SEED_AUDIT_LOGS = \[[\s\S]*?\n\];\s*/,
    replacement: 'const SEED_AUDIT_LOGS = [];\n\n'
  },
  {
    pattern: /const \[logs, setLogs\] = useState\(SEED_AUDIT_LOGS\);/,
    replacement: 'const [logs, setLogs] = useState([]);'
  },
  {
    pattern: /return logs\.find\(l => l\.id === selectedLogId\) \|\| logs\[0\] \|\| SEED_AUDIT_LOGS\[0\];/,
    replacement: 'return logs.find(l => l.id === selectedLogId) || logs[0] || null;'
  },
  {
    pattern: /setLogs\(SEED_AUDIT_LOGS\);/g,
    replacement: 'setLogs([]);'
  }
]);

console.log('Mocks purge script executed successfully.');
