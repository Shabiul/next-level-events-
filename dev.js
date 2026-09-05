const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting The Decor Party Development Servers...\n');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const nle = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'NLE'),
  shell: true,
});

const crm = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'CRM'),
  shell: true,
});

nle.stdout?.on('data', (data) => {
  process.stdout.write(`[NLE] ${data}`);
});
nle.stderr?.on('data', (data) => {
  process.stderr.write(`[NLE ERR] ${data}`);
});

crm.stdout?.on('data', (data) => {
  process.stdout.write(`[CRM] ${data}`);
});
crm.stderr?.on('data', (data) => {
  process.stderr.write(`[CRM ERR] ${data}`);
});

nle.on('error', (err) => console.error('[NLE Process Error]:', err));
crm.on('error', (err) => console.error('[CRM Process Error]:', err));

process.on('SIGINT', () => {
  nle.kill();
  crm.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  nle.kill();
  crm.kill();
  process.exit();
});
