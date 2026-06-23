/**
 * Mata procesos en :3001, limpia .next y arranca next dev.
 * Uso: npm run dev:restart
 */
import { execSync, spawn } from 'node:child_process';
import { platform } from 'node:os';

const PORT = 3001;

function killPortWindows(port) {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, {
      encoding: 'utf8',
    });
    const pids = new Set();

    for (const line of output.split('\n')) {
      if (!line.includes('LISTENING')) {
        continue;
      }
      const parts = line.trim().split(/\s+/);
      const pid = parts.at(-1);
      if (pid && pid !== '0') {
        pids.add(pid);
      }
    }

    for (const pid of pids) {
      execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
      console.log(`Proceso ${pid} terminado (puerto ${port})`);
    }
  } catch {
    // Puerto libre
  }
}

if (platform() === 'win32') {
  killPortWindows(PORT);
}

console.log('Limpiando .next…');
execSync('npm run clean', { stdio: 'inherit', cwd: process.cwd() });

console.log(`Arrancando next dev en :${PORT}…`);
const child = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd(),
});

child.on('exit', (code) => process.exit(code ?? 0));
