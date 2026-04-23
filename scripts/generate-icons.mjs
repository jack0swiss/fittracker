/**
 * Generates minimal PNG icons (192×192 and 512×512) for the PWA manifest.
 * Uses Node built-ins only: zlib + fs.
 */
import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '..', 'public');

mkdirSync(PUBLIC, { recursive: true });

// #0f172a = (15, 23, 42)   primary dark background
// #22d3ee = (34, 211, 238) accent – dumbbell bar colour
const BG = [15, 23, 42];
const FG = [34, 211, 238];

function crc32(buf) {
  const table = makeCrcTable();
  let crc = 0xffffffff;
  for (const b of buf) crc = (table[(crc ^ b) & 0xff] ^ (crc >>> 8)) >>> 0;
  return (crc ^ 0xffffffff) >>> 0;
}

let _crcTable;
function makeCrcTable() {
  if (_crcTable) return _crcTable;
  _crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    _crcTable[n] = c;
  }
  return _crcTable;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const buf = Buffer.alloc(12 + data.length);
  buf.writeUInt32BE(data.length, 0);
  typeBytes.copy(buf, 4);
  data.copy(buf, 8);
  const crc = crc32(Buffer.concat([typeBytes, data]));
  buf.writeUInt32BE(crc, 8 + data.length);
  return buf;
}

function drawIcon(size) {
  const pixels = new Uint8Array(size * size * 3);

  const cx = size / 2;
  const cy = size / 2;

  // background
  for (let i = 0; i < size * size; i++) {
    pixels[i * 3]     = BG[0];
    pixels[i * 3 + 1] = BG[1];
    pixels[i * 3 + 2] = BG[2];
  }

  // rounded rect helper
  function setPixel(x, y, color) {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 3;
    pixels[i]     = color[0];
    pixels[i + 1] = color[1];
    pixels[i + 2] = color[2];
  }

  function fillRect(x0, y0, w, h, color) {
    for (let y = y0; y < y0 + h; y++)
      for (let x = x0; x < x0 + w; x++)
        setPixel(x, y, color);
  }

  const u = size / 32; // 1 unit

  // dumbbell bar
  fillRect(Math.round(11 * u), Math.round(15 * u), Math.round(10 * u), Math.round(2 * u), FG);
  // left shaft
  fillRect(Math.round(8 * u),  Math.round(12 * u), Math.round(3 * u),  Math.round(8 * u),  FG);
  // right shaft
  fillRect(Math.round(21 * u), Math.round(12 * u), Math.round(3 * u),  Math.round(8 * u),  FG);
  // outer left
  fillRect(Math.round(6 * u),  Math.round(14 * u), Math.round(2 * u),  Math.round(4 * u),  FG);
  // outer right
  fillRect(Math.round(24 * u), Math.round(14 * u), Math.round(2 * u),  Math.round(4 * u),  FG);

  void cx; void cy;
  return pixels;
}

function makePNG(size) {
  const pixels = drawIcon(size);
  const rawRows = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    rawRows[y * (1 + size * 3)] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 3;
      const dst = y * (1 + size * 3) + 1 + x * 3;
      rawRows[dst]     = pixels[src];
      rawRows[dst + 1] = pixels[src + 1];
      rawRows[dst + 2] = pixels[src + 2];
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData.writeUInt8(8,  8);  // bit depth
  ihdrData.writeUInt8(2,  9);  // RGB
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  const compressed = deflateSync(rawRows, { level: 9 });

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdrData),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const size of [192, 512]) {
  const png = makePNG(size);
  const dest = join(PUBLIC, `icon-${size}.png`);
  writeFileSync(dest, png);
  console.log(`wrote ${dest} (${png.length} bytes)`);
}
