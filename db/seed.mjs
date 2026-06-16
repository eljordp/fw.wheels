// Seed Supabase from the existing hardcoded catalog in script.js.
// Usage: DATABASE_URL="postgresql://..." node db/seed.mjs
// Idempotent: upserts products/variants/accessories by slug/size.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';

const __dir = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dir, '..', 'script.js'), 'utf8');

// --- pull an object literal `const NAME = { ... }` out of the source by brace matching
function extractObject(name) {
  const decl = new RegExp(`const\\s+${name}\\s*=\\s*{`);
  const m = decl.exec(src);
  if (!m) throw new Error(`could not find ${name}`);
  let i = m.index + m[0].length - 1; // at the opening {
  let depth = 0, inStr = false, q = '', start = i;
  for (; i < src.length; i++) {
    const c = src[i];
    if (inStr) { if (c === q && src[i - 1] !== '\\') inStr = false; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = true; q = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  const literal = src.slice(start, i);
  // eslint-disable-next-line no-eval
  return eval('(' + literal + ')');
}

const wheelData = extractObject('wheelData');
const wheelPrices = extractObject('wheelPrices');
const colorPriceOverrides = extractObject('colorPriceOverrides');
const wheelBoltConfigs = extractObject('wheelBoltConfigs');
const accessoryProducts = extractObject('accessoryProducts');

// Map a model slug prefix -> brand label
function brandForSlug(slug) {
  if (/^ah/i.test(slug)) return 'Aodhan';
  if (/^mf/i.test(slug)) return 'Mflow Racing';
  if (/^(tr|vr|sp|lt)/i.test(slug)) return 'Vors';
  return null;
}

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

let pCount = 0, vCount = 0, aCount = 0;

// ---- wheels ----
let sort = 0;
for (const [slug, w] of Object.entries(wheelData)) {
  sort++;
  const brand = brandForSlug(slug);
  const images = JSON.stringify(w.images || []);
  const res = await client.query(
    `insert into products (slug, kind, brand, series, name, center_bore, price_range, images, sort_order)
     values ($1,'wheel',$2,$3,$4,$5,$6,$7::jsonb,$8)
     on conflict (slug) do update set brand=excluded.brand, series=excluded.series, name=excluded.name,
       center_bore=excluded.center_bore, price_range=excluded.price_range, images=excluded.images, sort_order=excluded.sort_order
     returning id`,
    [slug, brand, w.series || null, w.name, w.centerBore || null, w.priceRange || null, images, sort]
  );
  const pid = res.rows[0].id;
  pCount++;
  const prices = wheelPrices[slug] || {};
  const overrides = colorPriceOverrides[slug] || null;
  const boltCfgAll = wheelBoltConfigs[slug] || {};
  for (const [size, v] of Object.entries(w.variants || {})) {
    const price = prices[size] ?? 0;
    const boltConfigs = boltCfgAll[size] || null;
    await client.query(
      `insert into product_variants (product_id, size, price, finishes, bolt_patterns, offsets, bolt_offsets, bolt_configs, price_overrides, image)
       values ($1,$2,$3,$4::jsonb,$5::jsonb,$6::jsonb,$7,$8,$9,$10)
       on conflict (product_id, size) do update set price=excluded.price, finishes=excluded.finishes,
         bolt_patterns=excluded.bolt_patterns, offsets=excluded.offsets, bolt_offsets=excluded.bolt_offsets,
         bolt_configs=excluded.bolt_configs, price_overrides=excluded.price_overrides, image=excluded.image`,
      [pid, size, price, JSON.stringify(v.finishes || []), JSON.stringify(v.boltPatterns || []),
       JSON.stringify(v.offsets || []), v.boltOffsets ? JSON.stringify(v.boltOffsets) : null,
       boltConfigs ? JSON.stringify(boltConfigs) : null, overrides ? JSON.stringify(overrides) : null, v.image || null]
    );
    vCount++;
  }
}

// ---- accessories ----
sort = 0;
for (const [slug, a] of Object.entries(accessoryProducts)) {
  sort++;
  const images = JSON.stringify(a.images || (a.image ? [a.image] : []));
  await client.query(
    `insert into products (slug, kind, name, images, acc_price, acc_pack, acc_desc, sort_order)
     values ($1,'accessory',$2,$3::jsonb,$4,$5,$6,$7)
     on conflict (slug) do update set name=excluded.name, images=excluded.images,
       acc_price=excluded.acc_price, acc_pack=excluded.acc_pack, acc_desc=excluded.acc_desc, sort_order=excluded.sort_order`,
    [slug, a.name, images, a.price ?? null, a.pack || null, a.description || a.desc || null, sort]
  );
  aCount++;
}

console.log(`Seeded: ${pCount} wheel models, ${vCount} variants, ${aCount} accessories.`);
await client.end();
