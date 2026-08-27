const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'ezgif-3f3609fb9980269e-jpg');
const destDir = path.join(__dirname, '..', 'public', 'frames');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function getJpgSize(filePath) {
  const buf = fs.readFileSync(filePath);
  for (let i = 0; i < buf.length - 8; i++) {
    if (buf[i] === 0xFF && (buf[i + 1] === 0xC0 || buf[i + 1] === 0xC2)) {
      const h = buf.readUInt16BE(i + 5);
      const w = buf.readUInt16BE(i + 7);
      return { w, h };
    }
  }
  return null;
}

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jpg'));
console.log('Total files in source dir:', files.length);

let totalBytes = 0;
let missing = [];
let dimensions = new Set();
let corrupt = [];

for (let i = 1; i <= 300; i++) {
  const numStr = String(i).padStart(3, '0');
  const filename = 'ezgif-frame-' + numStr + '.jpg';
  const srcFile = path.join(srcDir, filename);
  const destFile = path.join(destDir, filename);

  if (!fs.existsSync(srcFile)) {
    missing.push(filename);
    continue;
  }

  const stat = fs.statSync(srcFile);
  if (stat.size === 0) {
    corrupt.push(filename);
  }
  totalBytes += stat.size;

  const dim = getJpgSize(srcFile);
  if (!dim) {
    corrupt.push(filename);
  } else {
    dimensions.add(dim.w + 'x' + dim.h);
  }

  if (!fs.existsSync(destFile) || fs.statSync(destFile).size !== stat.size) {
    fs.copyFileSync(srcFile, destFile);
  }
}

console.log('--- Verification Summary ---');
console.log('Total Expected Frames: 300');
console.log('Total Valid Frames Found:', 300 - missing.length - corrupt.length);
console.log('Missing Frames Count:', missing.length);
console.log('Corrupt Frames Count:', corrupt.length);
console.log('Dimensions Across All Frames:', Array.from(dimensions).join(', '));
console.log('Total File Size (MB):', (totalBytes / (1024 * 1024)).toFixed(2) + ' MB');
console.log('Average Frame Size (KB):', (totalBytes / 300 / 1024).toFixed(1) + ' KB');
console.log('Clean Destination Path: /public/frames/ezgif-frame-001.jpg ... ezgif-frame-300.jpg');
