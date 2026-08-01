import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import ToolExplorer from "@/components/ToolExplorer";
import { CanopyBackdrop } from "@/components/Foliage";
import { ToolIcon } from "@/lib/tool-icons";
import { TOOL_COUNT, HERO_TOOLS } from "@/lib/tools";
import { SITE_NAME } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

// Absolute, via pageMetadata: the layout's `%s | JunglePDF` template would
// otherwise append the brand to a title that already opens with it.
export const metadata: Metadata = pageMetadata({
  title: `${SITE_NAME} — Free PDF, Image, Audio & Video Tools`,
  description: `Convert, compress and edit PDFs, images, audio and video — ${TOOL_COUNT} free tools that run entirely on your device. No uploads, no sign-up, no limits.`,
  path: "/",
});

const TRUST_POINTS = [
  {
    title: "Nothing is uploaded",
    body: "Your files are read into your browser's memory and processed there. No server ever receives them, so there is nothing to leak, log, or delete later.",
    icon: (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    ),
  },
  {
    title: "No account, no limits",
    body: "No sign-up, no email, no daily quota, and no watermark on the output. There is no server bill to cover, so there is nothing to gate.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    title: "As fast as your machine",
    body: "No upload wait and no queue behind other people's jobs. Processing starts the moment you drop a file and runs at the speed of your own hardware.",
    icon: (
      <>
        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
      </>
    ),
  },
];

export default function HomePage() {
  return (
    <>
      {/*
        Hero.

        overflow-hidden is load-bearing: CanopyBackdrop hangs foliage past every
        edge (-left-10, -top-12, -bottom-16) and without the clip those spill out
        and give the whole page a horizontal scrollbar. It also means nothing
        inside may rely on escaping the section's box — which is what ruled out
        keeping a search field here. See HERO_TOOLS in lib/tools.ts.
      */}
      <section className="relative overflow-hidden border-b border-border-subtle">
        <CanopyBackdrop />

        {/* relative + z-10 so the content sits above the foliage layer. */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-12 sm:pb-16">
          {/*
            Two columns from lg up. Below that the artwork is dropped rather
            than stacked: on a phone it would push the tool links — the one
            thing the hero exists to get you to — below the fold.
          */}
          {/*
            The image column grows with the viewport rather than taking a
            fixed 29rem everywhere: at 1024 the headline is already tight at
            48px, so lg keeps roughly the width it had and only xl and up
            spend the extra room on the artwork.
          */}
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] lg:items-center gap-8 lg:gap-10">
            <div className="max-w-2xl">
              {/*
                text-balance instead of a hard <br>: the column is narrower
                now that the artwork is bigger, and a forced break there left
                one long line and one orphan. Balancing lets the browser split
                it evenly at whatever width the column ends up.
              */}
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-[3rem] font-bold text-ink tracking-tight leading-[1.1] text-balance">
                Every file tool you need,{" "}
                <span className="text-accent">running in your browser</span>
              </h1>

              <p className="mt-5 text-base sm:text-lg text-ink-secondary leading-relaxed max-w-xl">
                Merge PDFs, compress images, convert video, extract audio — all without
                uploading a single byte. No accounts, no watermarks, no waiting.
              </p>

              {/*
                Direct links rather than a search field — see HERO_TOOLS in
                lib/tools.ts for why the field could not stay here.

                Real <Link>s, so these are six crawlable internal links to the
                site's most-wanted pages sitting in the first screenful. The
                search box they replaced was a dead end to a crawler.
              */}
              <div className="mt-8">
                <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  Popular tools
                </h2>

                <ul className="mt-3 flex flex-wrap gap-2 max-w-xl">
                  {HERO_TOOLS.map((tool) => (
                    <li key={tool.href}>
                      <Link
                        href={tool.href}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-4 text-sm font-medium text-ink-secondary shadow-[var(--shadow-card)] hover:border-accent hover:text-accent transition-colors duration-150"
                      >
                        <span
                          className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${tool.category.subtleClass} ${tool.category.colorClass}`}
                        >
                          <ToolIcon category={tool.category.slug} slug={tool.slug} size={12} />
                        </span>
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/*
                  No "Browse all N tools" link here. The full grid is the very
                  next section on this page, so an anchor down to it is asking
                  someone to click for something a scroll already gives them.
                */}
              </div>
            </div>

            {/*
              mix-blend-multiply because the artwork carries a white background
              and the page is off-white (--color-paper) — without it the
              artwork sits in a visible pale rectangle. Multiply drops the
              white and leaves the flat colours untouched.

              priority: it is the largest thing above the fold, so it is the
              LCP candidate and must not be lazy-loaded. The intrinsic size is
              the file's real 612×408, which reserves the box before the bytes
              arrive so the hero does not jump.

              Served as PNG on purpose. `output: "export"` means next/image
              cannot optimize at build time, so whatever is referenced here is
              exactly what ships: 125KB, against the 20KB a WebP of the same
              612×408 pixels costs. Worth remembering if the hero ever turns up
              in a Core Web Vitals report — it is the LCP element.
            */}
            <Image
              src="/images/Home.png"
              alt=""
              width={612}
              height={408}
              priority
              sizes="(min-width: 1280px) 40rem, (min-width: 1024px) 34rem, 0px"
              className="hidden lg:block w-full h-auto mix-blend-multiply lg:-mr-4 xl:-mr-8"
            />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <AdSlot variant="leaderboard" />
      </div>

      <ToolExplorer />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSlot variant="in-feed" />
      </div>

      {/* Trust strip */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TRUST_POINTS.map((point) => (
            <div key={point.title} className="bg-surface border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-accent-subtle text-accent flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {point.icon}
                </svg>
              </div>
              <h2 className="text-base font-semibold text-ink mb-1.5">{point.title}</h2>
              <p className="text-sm text-ink-secondary leading-relaxed">{point.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SEO content */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 prose-tool">
        <h2>What is {SITE_NAME}?</h2>
        <p>
          {SITE_NAME} is a collection of {TOOL_COUNT} free file utilities that work
          entirely inside your web browser. Unlike traditional online converters
          that upload your files to a remote server, every operation here happens
          locally on your computer using standard web technologies — the HTML5
          Canvas API, the Web Audio API, and WebAssembly.
        </p>
        <p>
          That means your photos, contracts, medical records, and audio files never
          leave your device. There are no file size limits imposed by server
          bandwidth, no waiting in a processing queue, and no risk of your personal
          data sitting on someone else&apos;s infrastructure after you close the tab.
        </p>

        <h2>How does browser-based processing work?</h2>
        <p>
          Modern browsers ship with genuinely powerful APIs. When you compress an
          image here, the tool draws it onto an invisible canvas element and then
          repeatedly re-encodes it, binary-searching the quality setting until the
          output lands under your target size. The whole loop runs in your
          browser&apos;s memory.
        </p>
        <p>
          For audio, the Web Audio API decodes sound files into raw samples that can
          be sliced, reversed, mixed, and re-encoded. Video and audio conversion use
          a WebAssembly build of FFmpeg — the same engine professional editing
          software relies on — running directly inside your tab. PDF operations use
          pdf-lib to rewrite the document structure, and pdf.js when a page actually
          needs to be drawn.
        </p>

        <h2>Where the limits are</h2>
        <p>
          Being honest about this matters more than a marketing claim. WebAssembly
          encoding runs roughly ten times slower than native FFmpeg, so converting a
          long video takes minutes rather than seconds — each tool says so before you
          start. PDF compression is structural only, because pdf-lib cannot re-encode
          embedded images, so a scan-heavy PDF barely shrinks. And very large files
          are bounded by your available memory rather than by an upload cap.
        </p>
        <p>
          Every tool that has a caveat like this states it in the interface, not
          buried in a help page. A tool that quietly does something different from
          what you asked is worse than one that tells you what it cannot do.
        </p>

        <h2>Why client-side matters</h2>
        <p>
          Privacy is the obvious benefit, but there are practical ones too.
          Client-side tools keep working after the page has loaded, even offline.
          They run at the speed of your hardware rather than a shared cloud server.
          And they cost essentially nothing to operate, which is what lets them stay
          free without upsell prompts, watermarks, or features held behind a paywall.
        </p>
      </section>

      <AdSlot variant="anchor" />
    </>
  );
}
