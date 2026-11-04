const { execSync } = require('child_process');
const JOBS = { 'social-post': 'node social-poster.js', 'backup': 'npm run backup || true', 'low-stock': 'node jobs/low-stock.js || true', 'abandoned-cart': 'node jobs/abandoned-cart.js || true' };
const j = process.argv[2];
if (!j || !JOBS[j]) { console.log('Jobs:', Object.keys(JOBS).join(', ')); process.exit(1); }
console.log('▶', j); execSync(JOBS[j], { stdio: 'inherit' }); console.log('✅', j);
