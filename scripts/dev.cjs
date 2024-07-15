const { execSync } = require('node:child_process');
const pkg = require('../package.json');

execSync(`VITE_APP_VERSION=${pkg.version} vite --host 0.0.0.0 --port 3231`, { stdio: 'inherit' });
