const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../../frontend/src/pages/ExecutiveDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add import api
if (!content.includes("import { api } from '../services/api';")) {
  content = content.replace(
    /import \{ useAuth \} from '\.\.\/context\/AuthContext';/,
    `import { useAuth } from '../context/AuthContext';\nimport { api } from '../services/api';`
  );
}

// Add state and useEffect in ExecutiveDashboard
content = content.replace(
  /export function ExecutiveDashboard\(\) \{/,
  `export function ExecutiveDashboard() {
  const [dbKpis, setDbKpis] = useState(null);

  React.useEffect(() => {
    const fetchDashboardKpis = async () => {
      try {
        const res = await api.get('/reports/dashboard').catch(() => null);
        if (res && res.kpis) {
          setDbKpis(res.kpis);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };
    fetchDashboardKpis();
  }, []);`
);

// Replace hardcoded numbers in KPI cards
content = content.replace(
  /<span className="text-2xl font-black text-black block leading-none">12,458<\/span>/,
  '<span className="text-2xl font-black text-black block leading-none">{dbKpis ? dbKpis.totalAssets.toLocaleString() : "..."}</span>'
);

content = content.replace(
  /<span className="text-2xl font-black text-black block leading-none">11,230<\/span>/,
  '<span className="text-2xl font-black text-black block leading-none">{dbKpis ? dbKpis.activeAssets.toLocaleString() : "..."}</span>'
);

content = content.replace(
  /<span className="text-\[11px\] font-bold text-black block">90\.1%<\/span>/,
  '<span className="text-[11px] font-bold text-black block">{dbKpis && dbKpis.totalAssets ? `${Math.round((dbKpis.activeAssets / dbKpis.totalAssets) * 100)}%` : "0%"}</span>'
);

content = content.replace(
  /<span className="text-2xl font-black text-black block leading-none">652<\/span>/,
  '<span className="text-2xl font-black text-black block leading-none">{dbKpis ? dbKpis.underMaintenance.toLocaleString() : "..."}</span>'
);

content = content.replace(
  /<span className="text-2xl font-black text-black block leading-none">276<\/span>/,
  '<span className="text-2xl font-black text-black block leading-none">{dbKpis ? dbKpis.maintenanceOverdue.toLocaleString() : "..."}</span>'
);

content = content.replace(
  /<span className="text-2xl font-black text-black block leading-none">180<\/span>/,
  '<span className="text-2xl font-black text-black block leading-none">{dbKpis ? dbKpis.disposedAssets.toLocaleString() : "..."}</span>'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('ExecutiveDashboard wired to live DB successfully.');
