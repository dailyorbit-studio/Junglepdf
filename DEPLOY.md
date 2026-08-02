# Deploying JunglePDF

The site is a fully static export: `npm run build` writes the whole site to
`out/`, and any static host can serve it. There is no server code, no special
headers requirement (the FFmpeg core is single-threaded, so no COOP/COEP), and
nothing to run at request time.

## 1. Build

```bash
npm ci
npm run build   # prebuild copies the FFmpeg/pdf.js vendor assets, then exports to out/
```

Set `NEXT_PUBLIC_SITE_URL` **only if** the deployed origin is not
`https://junglepdf.in` — it feeds every canonical URL, og:url, robots.txt and
the sitemap, so a mismatch makes every page point at the wrong domain.

## 2. Host configuration

Two behaviours matter on any host; everything else is defaults.

| Requirement | Why |
|---|---|
| Serve `/pdf/merge-pdf/` from `out/pdf/merge-pdf/index.html` (directory index) | The export uses `trailingSlash: true`; every internal link ends in `/`. |
| Serve `out/404.html` for unknown paths | Otherwise visitors get the host's default error page. |

Recommended cache headers (all three hosts below support them via config file):

- `/_next/static/*`, `/ffmpeg/*`, `/pdfjs/*` → `Cache-Control: public, max-age=31536000, immutable` (content-hashed or version-locked)
- everything else → default (revalidate)

### Cloudflare Pages
Build command `npm run build`, output directory `out`. Directory indexes and
`404.html` are picked up automatically. Free tier is fine — bandwidth is the
only real cost of this site and Pages doesn't bill for it.

### Netlify
Build command `npm run build`, publish directory `out`. `404.html` is
automatic. Add `NEXT_PUBLIC_SITE_URL` under Site settings → Environment if
needed.

### Vercel
Framework preset Next.js — it detects `output: "export"` and serves `out/`
statically. Nothing else to configure.

### GitHub Pages
Works, but only on a custom domain (project pages live under `/repo/`, which
breaks every absolute path). Add a `.nojekyll` file and the CNAME.

## 3. Immediately after the first deploy

1. **Google Search Console** — add the `junglepdf.in` property (domain
   verification via DNS TXT is the least fragile). Then paste the token into
   the commented `verification` block in `src/app/layout.tsx` and redeploy, or
   keep the DNS record — either works.
2. **Submit the sitemap**: `https://junglepdf.in/sitemap.xml` (66 URLs).
3. **Bing Webmaster Tools** — "Import from Google Search Console" does it in
   one click.
4. **Request indexing** for the homepage and the four category pages; the rest
   follows from internal links.

## 4. When AdSense is approved

- Set `NEXT_PUBLIC_ADSENSE_CLIENT` (see `.env.example`) and redeploy.
- Add `public/ads.txt` containing exactly:
  `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`
  (your real publisher id — do not deploy a placeholder; a malformed ads.txt
  is worse for approval than none).
- Swap the real ad markup into `AdSlot.tsx` (instructions in its header).
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` enables GA4 the same way. Both scripts stay
  behind the consent banner.

## What is already handled in code

- Per-page titles (≤60 chars), descriptions (110–165), canonicals with
  trailing slashes, Open Graph + Twitter cards — via `src/lib/seo.ts`, audited
  across all 66 pages.
- robots.txt, sitemap.xml, manifest.webmanifest, favicon/icon/apple-icon,
  card.png, and `public/images/logo.png` — the linkable copy of the mark, for
  anything that needs a plain URL rather than a Next metadata file. All
  regenerate together with `node scripts/build-brand-assets.mjs`.
- Structured data: Organization + WebSite + WebApplication graph site-wide;
  BreadcrumbList, FAQPage, HowTo, WebApplication per tool; ItemList per
  category.
- Custom 404 (noindex), `.env.example` documenting every variable.
