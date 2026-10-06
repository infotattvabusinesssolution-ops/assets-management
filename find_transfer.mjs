import fs from 'fs';

const content = fs.readFileSync('frontend/src/pages/AssetList.jsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (/transfer/i.test(line)) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
