# 1TV

Netflix privado con catálogo de películas, series y anime vía API de Vimeus. SvelteKit 2 + Svelte 5 (runes) + Tailwind v4 + Supabase.

## Stack
- **Frontend:** SvelteKit 2, Svelte 5 runes, Tailwind v4, Geist, HugeIcons free
- **Backend:** Supabase (auth OTP, Postgres, RLS) + API Vimeus (server-side only)
- **Deploy:** Vercel (`@sveltejs/adapter-vercel`, cron cada 6h)

## Desarrollo
```sh
cp .env.example .env.local   # llenar valores reales
npm install
npm run dev                  # http://localhost:5175
```

## Deploy en Vercel
1. Importar repo en https://vercel.com/new (detecta SvelteKit).
2. Environment Variables:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `VIMEUS_API_KEY` (solo servidor)
   - `PUBLIC_VIMEUS_VIEW_KEY`
   - `CRON_SECRET` (random 32 chars; Vercel Cron lo envía como Bearer a `/api/admin/sync`)
3. Deploy. El cron indexa todo el catálogo a `cached_listings`.

## Indexación
- Automática: cron `/api/admin/sync` cada 6h (`vercel.json`), pagina movies/series/animes completo con reintentos.
- Manual local: `node scripts/sync.mjs`.
- Caché: L1 RAM (15 min TTL) + L2 tabla `cached_listings` en Supabase.
