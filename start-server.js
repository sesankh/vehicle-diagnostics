const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting backend server...');

// Start the backend using ts-node directly
const child = spawn('npx', ['ts-node', 'apps/backend/src/main.ts'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('❌ Failed to start backend:', error);
});

child.on('exit', (code) => {
  console.log(`Backend exited with code ${code}`);
});

console.log('💡 Backend should be starting on http://localhost:3000');
console.log('💡 Press Ctrl+C to stop the server'); 