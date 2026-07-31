# JunglePDF

Free file utilities that run entirely in the browser. Audio, image, PDF and video
tools — **no file is ever uploaded to a server.**

Built with Next.js 16 (App Router), React 19 and Tailwind v4, compiled to a fully
static site with `output: "export"`. There is no backend, no database and no
runtime cost beyond static hosting.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on <http://localhost:3000>. `predev` copies the FFmpeg core and
pdf.js worker into `public/` first — they are gitignored and regenerated, so a fresh
clone needs the install step before the dev server will start.

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Static export → `out/` |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

There is no test suite. Changes are verified by driving the real app in a browser.

## How it works

Every tool is a pure engine in `src/lib/` plus a two-file route: a server
`page.tsx` that owns the metadata and SEO copy, and a `"use client"` component
that owns the interaction.

- **Audio and video** go through a single WebAssembly FFmpeg runtime (`lib/ffmpeg.ts`).
- **Images** go through `lib/canvas-utils.ts`, which handles the OffscreenCanvas
  and `createImageBitmap` fallbacks.
- **PDFs** use pdf-lib for structure and pdf.js for anything needing pixels.

`src/lib/tools.ts` is the single source of truth for the catalogue. The nav,
footer, homepage, category pages, search, related-tool rails and sitemap all
derive from it.

See [`CLAUDE.md`](CLAUDE.md) for the full architecture guide and
[`HANDOFF.md`](HANDOFF.md) for the current state of the work.

## Configuration

Copy `.env.example` to `.env.local`. Everything in it is optional — unset values
disable the feature rather than breaking the build.

These are `NEXT_PUBLIC_*` variables in a static export, so they are baked in at
**build** time. Changing one means rebuilding and redeploying.

## Deploying

Deploys to **Netlify**. `npm run build` produces a static `out/` directory;
`netlify.toml` sets the build command and publish directory.

Do not enable `@netlify/plugin-nextjs`. It exists to run Next's server runtime
on Netlify Functions, and this site is a pure static export with no server to
run.

Security headers live in `public/_headers`, which is copied verbatim into
`out/` — a static export cannot set headers at runtime, so they have to be
configured at the hosting layer. The Content-Security-Policy there ships as
`Report-Only`; the comments in the file record what has been verified and when
to switch it to enforcing.

## Licence

Tool icons are [Font Awesome Free](https://fontawesome.com/), licensed
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); attribution is on the
Terms of Use page. Icons are inlined as path data rather than linked, so viewing
a page sends no request to a third party.
