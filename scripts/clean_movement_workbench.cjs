const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'AssignmentMovementWorkbench.jsx');
let content = fs.readFileSync(file, 'utf8');

// Replace DEFAULT_ASSETS array with empty array
content = content.replace(/const DEFAULT_ASSETS = \[\s*\{[\s\S]*?\}\s*\];/m, 'const DEFAULT_ASSETS = [];');
content = content.replace(/const DEFAULT_RECENT_MOVEMENTS = \[\s*\{[\s\S]*?\}\s*\];/m, 'const DEFAULT_RECENT_MOVEMENTS = [];');
content = content.replace(/const DEFAULT_PENDING_APPROVALS = \[\s*\{[\s\S]*?\}\s*\];/m, 'const DEFAULT_PENDING_APPROVALS = [];');

// Add const location = useLocation();
if (!content.includes('const location = useLocation();')) {
  content = content.replace('const navigate = useNavigate();', 'const navigate = useNavigate();\n  const location = useLocation();');
}

// Update initial state
content = content.replace('const [assets, setAssets] = useState(DEFAULT_ASSETS);', 'const [assets, setAssets] = useState([]);');
content = content.replace('const [selectedAsset, setSelectedAsset] = useState(DEFAULT_ASSETS[0]);', 'const [selectedAsset, setSelectedAsset] = useState(null);');
content = content.replace("const [selectedIds, setSelectedIds] = useState(['AS-000123']);", 'const [selectedIds, setSelectedIds] = useState([]);');

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated AssignmentMovementWorkbench.jsx');
