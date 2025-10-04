const { api } = require('@electron-forge/core');
const { spawn } = require('child_process');
const path = require('path');

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { 
      cwd, 
      stdio: 'inherit',
      shell: true 
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function make() {
  try {
    console.log('Building with Vite first...');
    await runCommand('npm', ['run', 'build'], __dirname);
    
    console.log('Starting Electron Forge package process...');
    console.log('Working directory:', __dirname);
    console.log('Main entry should be at:', path.join(__dirname, 'out', 'main', 'index.js'));
    
    const results = await api.package({
      dir: __dirname,
      platform: 'win32',
      arch: 'x64',
    });
    
    console.log('Package completed successfully!');
    console.log('Results:', results);
    
    console.log('Now making distributables...');
    const makeResults = await api.make({
      dir: __dirname,
      platform: 'win32',
      arch: 'x64',
    });
    
    console.log('Make completed successfully!');
    console.log('Make Results:', makeResults);
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

make();