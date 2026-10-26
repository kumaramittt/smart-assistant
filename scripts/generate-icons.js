import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, pixelFn) {
  // CRC table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  // Raw image data with filter byte 0 at start of each scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // Color type 6 (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Ensure public dir exists
const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Icon generator helper: Dark indigo background with vibrant blue/cyan AI sparkle/robot icon
function generateIconPixels(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background gradient: #020617 (slate-950) to #1e3a8a (blue-900)
  const gradT = (dy + 1) / 2;
  let bgR = Math.round(2 + gradT * 28);
  let bgG = Math.round(6 + gradT * 52);
  let bgB = Math.round(23 + gradT * 115);

  // Outer border corner rounding for standard icons
  let alpha = 255;
  if (!isMaskable) {
    const cornerRadius = 0.22; // Squircle corner
    const qx = Math.max(0, Math.abs(dx) - (1 - cornerRadius));
    const qy = Math.max(0, Math.abs(dy) - (1 - cornerRadius));
    const cornerDist = Math.sqrt(qx * qx + qy * qy);
    if (cornerDist > cornerRadius) {
      alpha = 0;
    } else if (cornerDist > cornerRadius - 0.02) {
      alpha = Math.round(255 * (1 - (cornerDist - (cornerRadius - 0.02)) / 0.02));
    }
  }

  if (alpha === 0) return [0, 0, 0, 0];

  // Scale factor for inner graphic: maskable has safe zone (central 70%), standard has 80%
  const scale = isMaskable ? 0.35 : 0.45;
  const sx = dx / scale;
  const sy = dy / scale;

  // Draw 4-point star / AI sparkle centered at (0, 0)
  // Equation: |sx|^0.5 + |sy|^0.5 < 1 for an astroid star
  const absX = Math.abs(sx);
  const absY = Math.abs(sy);
  const starDist = Math.pow(absX, 0.6) + Math.pow(absY, 0.6);

  // Circular glow in the center
  const centerGlow = Math.max(0, 1 - Math.sqrt(sx * sx + sy * sy) * 0.8);

  let r = bgR;
  let g = bgG;
  let b = bgB;

  // Add subtle ambient blue glow
  const glowAmount = Math.max(0, 1 - dist);
  r = Math.min(255, r + Math.round(glowAmount * 30));
  g = Math.min(255, g + Math.round(glowAmount * 70));
  b = Math.min(255, b + Math.round(glowAmount * 140));

  if (starDist < 1.0) {
    // Inside the star: gradient from bright cyan #38bdf8 to vibrant white #ffffff
    const intensity = Math.pow(1 - starDist, 0.5);
    r = Math.round(255 * intensity + 37 * (1 - intensity));
    g = Math.round(255 * intensity + 99 * (1 - intensity));
    b = Math.round(255 * intensity + 235 * (1 - intensity));
  } else if (starDist < 1.15) {
    // Star anti-aliased edge
    const t = (starDist - 1.0) / 0.15;
    const starR = 37, starG = 99, starB = 235;
    r = Math.round(starR * (1 - t) + r * t);
    g = Math.round(starG * (1 - t) + g * t);
    b = Math.round(starB * (1 - t) + b * t);
  }

  // Small secondary accent star top right
  const s2x = (dx - 0.28) / 0.16;
  const s2y = (dy + 0.28) / 0.16;
  const star2Dist = Math.pow(Math.abs(s2x), 0.6) + Math.pow(Math.abs(s2y), 0.6);
  if (star2Dist < 1.0) {
    const t = 1 - star2Dist;
    r = Math.min(255, r + Math.round(200 * t));
    g = Math.min(255, g + Math.round(240 * t));
    b = 255;
  }

  return [Math.min(255, r), Math.min(255, g), Math.min(255, b), alpha];
}

console.log('Generating PWA icons...');

// 1. icon-192.png
const png192 = createPNG(192, 192, (x, y, w, h) => generateIconPixels(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);

// 2. icon-512.png
const png512 = createPNG(512, 512, (x, y, w, h) => generateIconPixels(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);

// 3. icon-maskable-512.png (padded for safe zone circle)
const pngMaskable512 = createPNG(512, 512, (x, y, w, h) => generateIconPixels(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'icon-maskable-512.png'), pngMaskable512);

// 4. apple-touch-icon.png (180x180)
const pngApple = createPNG(180, 180, (x, y, w, h) => generateIconPixels(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngApple);

// 5. favicon.svg
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="128" fill="url(#bg)" />
  <circle cx="256" cy="256" r="140" fill="url(#glow)" opacity="0.4" />
  <path d="M256 96 C256 184 256 184 344 256 C256 328 256 328 256 416 C256 328 256 328 168 256 C256 184 256 184 256 96 Z" fill="url(#sparkle)" />
  <path d="M384 128 C384 160 384 160 416 180 C384 200 384 200 384 232 C384 200 384 200 352 180 C384 160 384 160 384 128 Z" fill="#60a5fa" />
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="#020617" />
      <stop offset="1" stop-color="#1e3a8a" />
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(256 256) rotate(90) scale(160)">
      <stop stop-color="#38bdf8" />
      <stop offset="1" stop-color="#38bdf8" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="sparkle" x1="168" y1="96" x2="344" y2="416" gradientUnits="userSpaceOnUse">
      <stop stop-color="#ffffff" />
      <stop offset="0.5" stop-color="#38bdf8" />
      <stop offset="1" stop-color="#2563eb" />
    </linearGradient>
  </defs>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);

console.log('Successfully generated all PWA icons in /public!');
