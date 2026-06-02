/**
 * Generates PWA icons (192x192 and 512x512 PNG) using only built-in Node.js modules.
 * Run: node scripts/generate-icons.mjs
 */
import zlib from 'zlib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../public/icons');
fs.mkdirSync(outDir, { recursive: true });

// ── CRC32 (needed for PNG chunks) ─────────────────────────────────────────────
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.allocUnsafe(4);
  lenBuf.writeUInt32BE(data.length);
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
}

function buildPNG(size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR: RGBA (colorType=6)
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // RGBA
  ihdr[10] = ihdr[11] = ihdr[12] = 0;

  // Draw pixel-by-pixel into raw rows
  const raw = [];
  const cx = size / 2, cy = size / 2, r = size / 2;

  for (let y = 0; y < size; y++) {
    raw.push(0); // filter byte
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Outside circle → transparent
      if (dist > r) { raw.push(0, 0, 0, 0); continue; }

      // Gold border ring (outer 5%)
      if (dist > r * 0.92) {
        raw.push(212, 175, 55, 255); continue; // gold
      }

      // Background gradient: deep purple → dark navy
      const t = dist / r;
      const br = Math.round(26 + (13 - 26) * t);
      const bg2 = Math.round(15 + (10 - 15) * t);
      const bb = Math.round(46 + (26 - 46) * t);

      // Purple inner glow near border
      if (dist > r * 0.75) {
        const blend = (dist - r * 0.75) / (r * 0.17);
        raw.push(
          Math.round(br + (76 - br) * blend),
          Math.round(bg2 + (29 - bg2) * blend),
          Math.round(bb + (149 - bb) * blend),
          255
        );
        continue;
      }

      raw.push(br, bg2, bb, 255);
    }
  }

  // Draw a simple ⚗ flask silhouette
  // (we approximate with geometric shapes in the center)
  const scale = size / 192;
  function setPixel(px, py, rr, gg, bb2, aa = 255) {
    if (px < 0 || py < 0 || px >= size || py >= size) return;
    const rowOff = py * (size * 4 + 1) + 1 + px * 4;
    raw[rowOff]     = rr;
    raw[rowOff + 1] = gg;
    raw[rowOff + 2] = bb2;
    raw[rowOff + 3] = aa;
  }
  function fillRect(x0, y0, w, h, rr, gg, bb2) {
    for (let yy = y0; yy < y0 + h; yy++)
      for (let xx = x0; xx < x0 + w; xx++)
        setPixel(Math.round(xx), Math.round(yy), rr, gg, bb2);
  }
  function fillCircleShape(x0, y0, radius, rr, gg, bb2) {
    for (let yy = -radius; yy <= radius; yy++)
      for (let xx = -radius; xx <= radius; xx++)
        if (xx * xx + yy * yy <= radius * radius)
          setPixel(Math.round(x0 + xx), Math.round(y0 + yy), rr, gg, bb2);
  }

  // Flask body (gold)
  fillCircleShape(cx, cy + 10 * scale, 30 * scale, 212, 175, 55);
  // Flask neck (narrower, gold)
  fillRect(cx - 8 * scale, cy - 32 * scale, 16 * scale, 28 * scale, 212, 175, 55);
  // Inner flask (dark, to hollow out)
  fillCircleShape(cx, cy + 10 * scale, 22 * scale, 26, 15, 46);
  fillRect(cx - 5 * scale, cy - 28 * scale, 10 * scale, 22 * scale, 26, 15, 46);
  // Bubbles inside flask (purple)
  fillCircleShape(cx - 6 * scale, cy + 14 * scale, 5 * scale, 124, 58, 237);
  fillCircleShape(cx + 7 * scale, cy + 4 * scale, 4 * scale, 212, 175, 55);
  fillCircleShape(cx, cy + 18 * scale, 3 * scale, 124, 58, 237);

  const rawBuf = Buffer.from(raw);
  const compressed = zlib.deflateSync(rawBuf, { level: 9 });

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const size of [192, 512]) {
  const png = buildPNG(size);
  const out = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(out, png);
  console.log(`✓ Generated ${out} (${png.length} bytes)`);
}
