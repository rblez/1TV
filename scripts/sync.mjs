import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const VIMEUS_BASE = 'https://vimeus.com';
const apiKey = process.env.VIMEUS_API_KEY;
const supaUrl = process.env.PUBLIC_SUPABASE_URL;
const supaKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!apiKey || !supaUrl || !supaKey) {
  console.error('Missing env', { hasApiKey: !!apiKey, hasUrl: !!supaUrl, hasAnon: !!supaKey });
  process.exit(1);
}
const supa = createClient(supaUrl, supaKey);

async function fetchPage(key, page) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const url = `${VIMEUS_BASE}/api/listing/${key}?page=${page}`;
      const r = await fetch(url, { headers: { Accept: 'application/json', 'X-API-Key': apiKey }, signal: AbortSignal.timeout(15000) });
      const body = await r.json();
      if (r.status !== 200 || body.error || !body.data?.result) throw new Error(`HTTP ${r.status} ${body.message ?? ''}`);
      const inferred = key === 'movies' ? 'movie' : key === 'animes' ? 'anime' : 'series';
      for (const it of body.data.result) if (!it.content_type) it.content_type = inferred;
      return { items: body.data.result, pages: body.data.pages ?? 1 };
    } catch (e) {
      console.log(`  retry ${attempt} page ${page}: ${e.cause?.code ?? e.message}`);
      if (attempt === 4) throw e;
      await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }
}

async function syncKey(key) {
  console.log(`[${key}] fetching page 1...`);
  const first = await fetchPage(key, 1);
  const totalPages = first.pages;
  console.log(`[${key}] total pages: ${totalPages}, first page: ${first.items.length}`);
  let all = [...first.items];
  await supa.from('cached_listings').upsert({ key: `${key}:p1`, data: first.items, pages: totalPages, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  for (let p = 2; p <= totalPages; p++) {
    await new Promise((r) => setTimeout(r, 200));
    process.stdout.write(`\r[${key}] ${p}/${totalPages}...`);
    const { items } = await fetchPage(key, p);
    all.push(...items);
    await supa.from('cached_listings').upsert({ key: `${key}:p${p}`, data: items, pages: totalPages, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  }
  console.log(`\n[${key}] upserting all (${all.length})...`);
  await supa.from('cached_listings').upsert({ key: `${key}:all`, data: all, pages: totalPages, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  return { pages: totalPages, total: all.length };
}

const results = {};
for (const k of ['movies', 'series', 'animes']) {
  results[k] = await syncKey(k);
}
console.log('DONE', results);
const { data } = await supa.from('cached_listings').select('key, pages').order('key');
console.log(data);
