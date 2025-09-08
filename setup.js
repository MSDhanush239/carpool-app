const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚗 Setting up Carpool App...\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js version: ${nodeVersion}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js first.');
  process.exit(1);
}

// Install root dependencies
console.log('\n📦 Installing root dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed');
} catch (error) {
  console.error('❌ Failed to install root dependencies');
  process.exit(1);
}

// Install server dependencies
console.log('\n📦 Installing server dependencies...');
try {
  process.chdir('server');
  execSync('npm install', { stdio: 'inherit' });
  process.chdir('..');
  console.log('✅ Server dependencies installed');
} catch (error) {
  console.error('❌ Failed to install server dependencies');
  process.exit(1);
}

// Install client dependencies
console.log('\n📦 Installing client dependencies...');
try {
  process.chdir('client');
  execSync('npm install', { stdio: 'inherit' });
  process.chdir('..');
  console.log('✅ Client dependencies installed');
} catch (error) {
  console.error('❌ Failed to install client dependencies');
  process.exit(1);
}

// Create environment files if they don't exist
console.log('\n🔧 Setting up environment files...');

// Server .env
const serverEnvPath = path.join('server', '.env');
if (!fs.existsSync(serverEnvPath)) {
  const serverEnvContent = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/carpool-app
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development`;
  fs.writeFileSync(serverEnvPath, serverEnvContent);
  console.log('✅ Created server/.env file');
} else {
  console.log('ℹ️  server/.env already exists');
}

// Client .env.local
const clientEnvPath = path.join('client', '.env.local');
if (!fs.existsSync(clientEnvPath)) {
  const clientEnvContent = `NEXT_PUBLIC_API_URL=http://localhost:5000/api`;
  fs.writeFileSync(clientEnvPath, clientEnvContent);
  console.log('✅ Created client/.env.local file');
} else {
  console.log('ℹ️  client/.env.local already exists');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Update the JWT_SECRET in server/.env for production');
console.log('3. Run "npm run dev" to start both frontend and backend');
console.log('4. Open http://localhost:3000 in your browser');
console.log('\n📚 For more information, check the README.md file');

