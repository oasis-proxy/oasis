const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Usage: node tools/generate_key.js [private.pem]

const input = process.argv[2] || 'private.pem';

function generatePrivateKey(pemPath) {
  console.log(`Generating new private key at: ${pemPath}...`);
  try {
    execSync(`openssl genrsa -out ${pemPath} 2048`);
    console.log(`Private key saved to: ${pemPath}`);
  } catch (e) {
    console.error('Error generating key. Ensure openssl is installed.', e);
    process.exit(1);
  }
}

function calculateIdFromPublicKey(publicKeyDer) {
  const hash = crypto.createHash('sha256').update(publicKeyDer).digest('hex');
  const head = hash.slice(0, 32);
  return head.split('').map(char => {
    const code = parseInt(char, 16);
    return String.fromCharCode(97 + code);
  }).join('');
}

try {
  let publicKeyDer;
  let isPemFile = false;

  // Check if input is a file path (PEM)
  if (input.endsWith('.pem') || fs.existsSync(input)) {
    isPemFile = true;
    if (!fs.existsSync(input)) {
      generatePrivateKey(input);
    }
    publicKeyDer = execSync(`openssl rsa -in ${input} -pubout -outform DER`, { stdio: ['pipe', 'pipe', 'ignore'] });
  } 
  // Check if input looks like a Base64 string
  else if (/^[A-Za-z0-9+/]+={0,2}$/.test(input)) {
    console.log('Detected Base64 Public Key input.');
    publicKeyDer = Buffer.from(input, 'base64');
  } else {
    throw new Error('Invalid input. Provide a .pem file path or a Base64 public key string.');
  }
  
  const extensionId = calculateIdFromPublicKey(publicKeyDer);
  const manifestKey = publicKeyDer.toString('base64');

  console.log('\n--- Chrome Extension Identity Info ---\n');
  if (isPemFile) {
    console.log(`Private Key File: ${input}`);
    console.log('KEEP THIS FILE SAFE! You need it to sign updates.\n');
  } else {
    console.log('Source: Provided Public Key (Base64)\n');
  }
  
  console.log(`Extension ID:   ${extensionId}`);
  console.log('(Use this in your update.xml <app appid="...">)\n');

  if (isPemFile) {
    console.log('Manifest Key (Public):');
    console.log(manifestKey);
    console.log('\n(Use this in vite.config.js as manifest.key to enforce this ID)');
  }

} catch (e) {
  console.error('Error processing key:', e.message);
  console.log('\nUsage:');
  console.log('  node tools/generate_key.cjs [path/to/private.pem]');
  console.log('  node tools/generate_key.cjs [Base64_Public_Key_String]');
}
