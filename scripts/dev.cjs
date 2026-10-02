const { execFileSync } = require('node:child_process');
const process = require('node:process');
const dotenv = require('dotenv');
const pkg = require('../package.json');

dotenv.config({ path: ['.env.local', '.env'] });
const storybook = process.argv[2] === 'storybook';
const args = storybook
  ? ['exec', 'storybook', 'dev', '-p', process.env.BILL_STORYBOOK_PORT || '6006']
  : ['exec', 'vite', '--host', '0.0.0.0'];
execFileSync('pnpm', [...args, ...process.argv.slice(storybook ? 3 : 2)], {
  stdio: 'inherit',
  env: { ...process.env, VITE_APP_VERSION: pkg.version, REACT_EDITOR: 'cursor' },
});
