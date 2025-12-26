import fs from 'node:fs';
import path from 'node:path';

const args = new Set(process.argv.slice(2));
const isCI = args.has('--ci');

const requiredNodeMajor = 20;
const nodeMajor = Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10);

const REQUIRED_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const OPTIONAL_VARS = [
  'VITE_FCM_VAPID_KEY',
  'VITE_RAKUTEN_APP_ID',
  'VITE_JANCODE_APP_ID',
  'VITE_GEMINI_API_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY',
  'VITE_EMAILJS_SERVICE_ID',
  'VITE_EMAILJS_TEMPLATE_ID',
  'VITE_EMAILJS_PUBLIC_KEY',
];

function parseDotenvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const out = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function looksPlaceholder(value) {
  if (!value) return true;
  return (
    value.startsWith('YOUR_') ||
    value.endsWith('_HERE') ||
    value.includes('YOUR_') ||
    value === 'TODO' ||
    value === 'REPLACE_ME'
  );
}

function readEnv() {
  const cwd = process.cwd();
  const envFileCandidates = ['.env', '.env.local', '.env.development', '.env.development.local'];
  const fromFiles = {};
  for (const file of envFileCandidates) {
    Object.assign(fromFiles, parseDotenvFile(path.join(cwd, file)));
  }
  return { ...fromFiles, ...process.env };
}

const combinedEnv = readEnv();

const missingRequired = REQUIRED_VARS.filter((key) => looksPlaceholder(combinedEnv[key]));
const missingOptional = OPTIONAL_VARS.filter((key) => !combinedEnv[key] || looksPlaceholder(combinedEnv[key]));

const lines = [];
lines.push('[doctor] life-pwa-react');
lines.push(`- Node.js: ${process.versions.node} (required: >=${requiredNodeMajor}.x)`);
if (nodeMajor < requiredNodeMajor) {
  lines.push(`- ERROR: Node.js major version is too old. Install Node ${requiredNodeMajor}.`);
}

if (missingRequired.length === 0) {
  lines.push('- Env: required VITE_* variables look set');
} else {
  lines.push('- Env: missing/placeholder required variables:');
  for (const key of missingRequired) lines.push(`  - ${key}`);
  lines.push("  Fix: create/update '.env.local' based on '.env.example'.");
}

if (missingOptional.length > 0) {
  lines.push('- Env: optional variables not set (feature-dependent):');
  for (const key of missingOptional) lines.push(`  - ${key}`);
}

console.log(lines.join('\n'));

const shouldFail = nodeMajor < requiredNodeMajor || (isCI && missingRequired.length > 0);
process.exit(shouldFail ? 1 : 0);

