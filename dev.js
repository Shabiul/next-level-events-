const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting The Decor Party Development Servers...\n');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'NLE-backend'),
  shell: true,
});

const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'NLE-frontend'),
  shell: true,
});

backend.stdout?.on('data', (data) => {
  process.stdout.write(`[Backend] ${data}`);
});
backend.stderr?.on('data', (data) => {
  process.stderr.write(`[Backend ERR] ${data}`);
});

frontend.stdout?.on('data', (data) => {
  process.stdout.write(`[Frontend] ${data}`);
});
frontend.stderr?.on('data', (data) => {
  process.stderr.write(`[Frontend ERR] ${data}`);
});

backend.on('error', (err) => console.error('[Backend Process Error]:', err));
frontend.on('error', (err) => console.error('[Frontend Process Error]:', err));

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});

