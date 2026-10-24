/**
 * Wisdom Technosoft - Static Build Script
 *
 * Assembles static files into `dist/` for Cloudflare Pages deployment.
 * Supports Cloudflare Pages "Astro" preset or static output:
 * Build command: `npm run build`
 * Output directory: `dist`
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');

function cleanDist() {
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('==> Starting Wisdom Technosoft static build...');
cleanDist();

// 1. Copy public directory contents to dist
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  for (const item of fs.readdirSync(publicDir)) {
    copyRecursive(path.join(publicDir, item), path.join(distDir, item));
  }
}

// 2. Copy root static assets & pages
const filesToCopy = [
  'index.html',
  '404.html',
  'privacy.html',
  'styles.css',
  'script.js',
  '_headers',
  '_redirects',
];

for (const file of filesToCopy) {
  const src = path.join(__dirname, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

// 3. Copy assets folder
const assetsSrc = path.join(__dirname, 'assets');
const assetsDest = path.join(distDir, 'assets');
copyRecursive(assetsSrc, assetsDest);

// Summary
const distFiles = fs.readdirSync(distDir);
console.log(`==> Build completed successfully! Output in dist/ (${distFiles.length} top-level entries)`);
for (const f of distFiles) {
  console.log(`    + ${f}`);
}
