// One-off: extract official Edgefolio brand assets from the showcase sheet
// "Etalase Logo Edgefolio Neon Hijau.png" into public/brand/ + build favicon.ico.
//
// Pipeline: gradient-flood background removal -> connected-component cleanup ->
// dark-fringe defringe -> outward color bleed -> feathered (anti-aliased) alpha.
// Usage: node scripts/extract-logo.mjs
import { writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";

const SHEET = "Etalase Logo Edgefolio Neon Hijau.png";
const BG = { r: 1, g: 8, b: 5 }; // sheet background color
const GRAD_TOL = 30; // max per-step color change while following the background gradient
const DARK_CAP = 110; // background/glow pixels stay below this max-channel value
const KEY_TOL = 10; // global chroma-key for leftover near-bg noise (e.g. letter counters)
const MARGIN = 24;
const FRINGE_MAXCH = 110; // opaque pixels darker than this near an edge = shadow fringe
const FRINGE_RADIUS = 2;
const BLEED_RADIUS = 6;
const FEATHER_PASSES = 2;

const REGIONS = {
  horizontal: { left: 180, top: 240, width: 760, height: 152 },
  icon: { left: 1056, top: 176, width: 296, height: 280 },
};

// Component filter — keep blobs >= minArea that are "solid" enough vs their
// bounding box (thin glow rings have <8% fill; real logo strokes ~30%+).
const FILTERS = {
  horizontal: { minArea: 150 },
  icon: { minArea: 500 },
};

function colorDist(buf, i, bg) {
  return Math.abs(buf[i] - bg.r) + Math.abs(buf[i + 1] - bg.g) + Math.abs(buf[i + 2] - bg.b);
}

async function extractRegion(name, region, filter) {
  const left = Math.max(0, region.left - MARGIN);
  const top = Math.max(0, region.top - MARGIN);
  const width = region.width + MARGIN * 2;
  const height = region.height + MARGIN * 2;

  const { data, info } = await sharp(SHEET)
    .extract({ left, top, width, height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const px = (x, y) => (y * w + x) * 4;
  const maxCh = (i) => Math.max(data[i], data[i + 1], data[i + 2]);

  // Gradient-following flood fill from the crop edges: walks through the
  // smooth dark background/glow but stops at sharp color edges (the logo).
  const visited = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;
  const trySeed = (x, y, fromIdx) => {
    const idx = y * w + x;
    if (visited[idx]) return;
    const i = px(x, y);
    if (maxCh(i) >= DARK_CAP) return;
    if (
      fromIdx >= 0 &&
      colorDist(data, i, { r: data[fromIdx], g: data[fromIdx + 1], b: data[fromIdx + 2] }) >= GRAD_TOL
    )
      return;
    visited[idx] = 1;
    queue[tail++] = idx;
  };
  for (let x = 0; x < w; x++) {
    trySeed(x, 0, -1);
    trySeed(x, h - 1, -1);
  }
  for (let y = 0; y < h; y++) {
    trySeed(0, y, -1);
    trySeed(w - 1, y, -1);
  }
  while (head < tail) {
    const idx = queue[head++];
    const x = idx % w;
    const y = (idx / w) | 0;
    const i = idx * 4;
    if (x > 0) trySeed(x - 1, y, i);
    if (x < w - 1) trySeed(x + 1, y, i);
    if (y > 0) trySeed(x, y - 1, i);
    if (y < h - 1) trySeed(x, y + 1, i);
  }
  let floodCleared = 0;
  for (let i = 0; i < w * h; i++) {
    if (visited[i]) {
      data[i * 4 + 3] = 0;
      floodCleared++;
    }
  }

  // Global chroma-key for leftover background noise (e.g. enclosed letter counters)
  let keyedCleared = 0;
  for (let i = 0; i < w * h; i++) {
    if (data[i * 4 + 3] === 0) continue;
    if (colorDist(data, i * 4, BG) < KEY_TOL) {
      data[i * 4 + 3] = 0;
      keyedCleared++;
    }
  }
  console.log(`[${name}] bg removed: flood=${floodCleared} keyed=${keyedCleared}`);

  // Connected-component filter — drop leftover glow rings / specks
  if (filter) {
    const label = new Int32Array(w * h).fill(-1);
    const sizes = [];
    const minXs = [],
      maxXs = [],
      minYs = [],
      maxYs = [];
    const stack = new Int32Array(w * h);
    for (let start = 0; start < w * h; start++) {
      if (label[start] !== -1 || data[start * 4 + 3] === 0) continue;
      const id = sizes.length;
      let sp = 0;
      stack[sp++] = start;
      label[start] = id;
      let size = 0;
      let mnx = w,
        mxx = -1,
        mny = h,
        mxy = -1;
      while (sp > 0) {
        const idx = stack[--sp];
        size++;
        const x = idx % w;
        const y = (idx / w) | 0;
        if (x < mnx) mnx = x;
        if (x > mxx) mxx = x;
        if (y < mny) mny = y;
        if (y > mxy) mxy = y;
        const nb = [
          x > 0 ? idx - 1 : -1,
          x < w - 1 ? idx + 1 : -1,
          y > 0 ? idx - w : -1,
          y < h - 1 ? idx + w : -1,
        ];
        for (const n of nb) {
          if (n >= 0 && label[n] === -1 && data[n * 4 + 3] > 0) {
            label[n] = id;
            stack[sp++] = n;
          }
        }
      }
      sizes.push(size);
      minXs.push(mnx);
      maxXs.push(mxx);
      minYs.push(mny);
      maxYs.push(mxy);
    }
    let kept = 0;
    let dropped = 0;
    for (let i = 0; i < w * h; i++) {
      if (data[i * 4 + 3] === 0) continue;
      const id = label[i];
      const boxArea = (maxXs[id] - minXs[id] + 1) * (maxYs[id] - minYs[id] + 1);
      const keep = sizes[id] >= filter.minArea && sizes[id] / boxArea >= 0.08;
      if (keep) kept++;
      else {
        data[i * 4 + 3] = 0;
        dropped++;
      }
    }
    console.log(`[${name}] components=${sizes.length} kept=${kept} dropped=${dropped}`);
  }

  // Distance (in px) from each pixel to the nearest transparent pixel
  const distT = new Int32Array(w * h).fill(1e9);
  const dq = [];
  for (let i = 0; i < w * h; i++) {
    if (data[i * 4 + 3] === 0) {
      distT[i] = 0;
      dq.push(i);
    }
  }
  for (let qi = 0; qi < dq.length; qi++) {
    const idx = dq[qi];
    const d = distT[idx];
    if (d >= FRINGE_RADIUS + 1) continue;
    const x = idx % w;
    const y = (idx / w) | 0;
    const nb = [x > 0 ? idx - 1 : -1, x < w - 1 ? idx + 1 : -1, y > 0 ? idx - w : -1, y < h - 1 ? idx + w : -1];
    for (const n of nb) {
      if (n >= 0 && distT[n] > d + 1) {
        distT[n] = d + 1;
        dq.push(n);
      }
    }
  }

  // 1) Defringe: drop dark shadow pixels that sit right at the silhouette edge
  let defringed = 0;
  for (let i = 0; i < w * h; i++) {
    if (data[i * 4 + 3] === 0) continue;
    if (maxCh(i * 4) < FRINGE_MAXCH && distT[i] <= FRINGE_RADIUS) {
      data[i * 4 + 3] = 0;
      defringed++;
    }
  }
  console.log(`[${name}] defringed=${defringed}`);

  // Solid mask after defringe (source of truth for alpha + colors)
  const solid = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) solid[i] = data[i * 4 + 3] > 0 ? 1 : 0;

  // 1b) Neutralise the transparent background. Beyond the 6px bleed the pixels
  //     still hold the sheet's dark-green RGB, which shows as a green "box" in
  //     viewers/contexts that ignore the alpha channel. Replace them with the
  //     site background colour so the cutout reads cleanly everywhere.
  const MATTE = { r: 16, g: 18, b: 15 };
  for (let i = 0; i < w * h; i++) {
    if (data[i * 4 + 3] === 0) {
      data[i * 4] = MATTE.r;
      data[i * 4 + 1] = MATTE.g;
      data[i * 4 + 2] = MATTE.b;
    }
  }

  // 2) Outward color bleed: copy logo colors into the surrounding transparent
  //    area so feathered/downscaled edges never pick up dark background.
  const known = solid.slice();
  for (let pass = 0; pass < BLEED_RADIUS; pass++) {
    const src = known.slice();
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        if (known[idx]) continue;
        const nb = [x > 0 ? idx - 1 : -1, x < w - 1 ? idx + 1 : -1, y > 0 ? idx - w : -1, y < h - 1 ? idx + w : -1];
        let found = -1;
        for (const n of nb) {
          if (n >= 0 && src[n]) {
            found = n;
            break;
          }
        }
        if (found >= 0) {
          data[idx * 4] = data[found * 4];
          data[idx * 4 + 1] = data[found * 4 + 1];
          data[idx * 4 + 2] = data[found * 4 + 2];
          known[idx] = 1;
        }
      }
    }
  }

  // 3) Feather the mask outward (anti-aliased edges)
  let mask = Float32Array.from(solid);
  for (let pass = 0; pass < FEATHER_PASSES; pass++) {
    const next = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        let sum = mask[idx];
        let cnt = 1;
        if (x > 0) {
          sum += mask[idx - 1];
          cnt++;
        }
        if (x < w - 1) {
          sum += mask[idx + 1];
          cnt++;
        }
        if (y > 0) {
          sum += mask[idx - w];
          cnt++;
        }
        if (y < h - 1) {
          sum += mask[idx + w];
          cnt++;
        }
        next[idx] = sum / cnt;
      }
    }
    mask = next;
  }
  for (let i = 0; i < w * h; i++) {
    data[i * 4 + 3] = Math.max(0, Math.min(255, Math.round(mask[i] * 255)));
  }

  // Final trim on alpha
  let minX = w,
    minY = h,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[px(x, y) + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const outW = maxX - minX + 1;
  const outH = maxY - minY + 1;
  console.log(`[${name}] output: ${outW}x${outH} (ratio ${(outW / outH).toFixed(2)})`);

  const out = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: minX, top: minY, width: outW, height: outH })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();

  // Verify
  const { data: od, info: oi } = await sharp(out)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let white = 0,
    lime = 0,
    emerald = 0,
    opaque = 0,
    semi = 0,
    darkOpaqueEdge = 0;
  for (let y = 0; y < oi.height; y++) {
    for (let x = 0; x < oi.width; x++) {
      const o = (y * oi.width + x) * 4;
      const a = od[o + 3];
      if (a === 0) continue;
      if (a < 255) semi++;
      if (a < 128) continue;
      opaque++;
      const r = od[o],
        g = od[o + 1],
        b = od[o + 2];
      const mx = Math.max(r, g, b);
      if (r > 200 && g > 200 && b > 200) white++;
      else if (g > 180 && r > 100 && r < 230 && b < 140) lime++;
      else if (g > 90 && b > 40 && r < 100) emerald++;
      if (mx < FRINGE_MAXCH) {
        const nb = [
          x > 0 ? o - 4 : -1,
          x < oi.width - 1 ? o + 4 : -1,
          y > 0 ? o - oi.width * 4 : -1,
          y < oi.height - 1 ? o + oi.width * 4 : -1,
        ];
        if (nb.some((n) => n >= 0 && od[n + 3] < 128)) darkOpaqueEdge++;
      }
    }
  }
  console.log(
    `[${name}] opaque=${opaque} semi=${semi} white=${white} lime=${lime} emerald=${emerald} darkEdgeOpaque=${darkOpaqueEdge}`,
  );
  if (opaque === 0) throw new Error(`[${name}] fully transparent — extraction failed`);
  return { out, width: outW, height: outH, white, lime, emerald, opaque };
}

function buildIco(pngEntries) {
  // ICO container with PNG-compressed entries (Vista+)
  const count = pngEntries.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  const entries = [];
  let offset = 6 + 16 * count;
  for (const { size, data } of pngEntries) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...pngEntries.map((p) => p.data)]);
}

const horizontal = await extractRegion("horizontal-logo", REGIONS.horizontal, FILTERS.horizontal);
const icon = await extractRegion("icon", REGIONS.icon, FILTERS.icon);

if (horizontal.white < 100) throw new Error("horizontal logo: white 'Edge' text not found — wrong region?");
if (horizontal.lime < 100) throw new Error("horizontal logo: lime 'folio' text not found — wrong region?");

await mkdir("public/brand", { recursive: true });
await writeFile("public/brand/edgefolio-logo-v3.png", horizontal.out);
await writeFile("public/brand/edgefolio-icon-v3.png", icon.out);
console.log("wrote public/brand/edgefolio-logo-v3.png + edgefolio-icon-v3.png");

// Favicon from the icon-only variant
const icoSizes = [16, 32, 48, 64, 256];
const pngEntries = [];
for (const size of icoSizes) {
  const data = await sharp(icon.out)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  pngEntries.push({ size, data });
}
await writeFile("src/app/favicon.ico", buildIco(pngEntries));
console.log(`wrote src/app/favicon.ico (${icoSizes.join(", ")})`);
