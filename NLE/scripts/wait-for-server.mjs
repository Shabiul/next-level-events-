import http from 'http';

const PORT = Number(process.env.PORT || 5000);
const TIMEOUT_MS = 60000;
const INTERVAL_MS = 300;

if (process.env.SKIP_WAIT === '1' || process.env.SKIP_WAIT === 'true' || process.argv.includes('--no-wait')) {
  process.exit(0);
}

console.log(`[wait] Waiting for backend server on port ${PORT}...`);

const startTime = Date.now();

function probe(host) {
  return new Promise((resolve) => {
    const req = http.get(
      {
        hostname: host,
        port: PORT,
        path: '/api/health',
        timeout: 1000,
      },
      (res) => {
        // Any HTTP response means the server is bound and accepting connections
        if (res.statusCode !== undefined) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    );

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function check() {
  const isUp = (await probe('127.0.0.1')) || (await probe('localhost'));

  if (isUp) {
    console.log(`[wait] Backend server is ready! Launching frontend...\n`);
    process.exit(0);
  }

  if (Date.now() - startTime > TIMEOUT_MS) {
    console.error(`\n[wait] Timed out waiting for backend server after ${TIMEOUT_MS / 1000}s on port ${PORT}.\n`);
    process.exit(1);
  }

  setTimeout(check, INTERVAL_MS);
}

check();
