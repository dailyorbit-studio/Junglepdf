import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { TOOL_CATEGORIES, TOOL_COUNT, categoryHref } from "@/lib/tools";
import { SITE_NAME, CREATOR } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "About us",
  description: `Who builds ${SITE_NAME}, why all ${TOOL_COUNT} tools run in your browser instead of on a server, and what the project will and will not do with the files you open.`,
  path: "/about/",
  brandSuffix: true,
});

/**
 * A plain content page — no client state, so it stays a server component and
 * ships no JavaScript of its own.
 */
export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mb-4">
        About {SITE_NAME}
      </h1>
      <p className="text-base text-ink-secondary max-w-xl leading-relaxed">
        {TOOL_COUNT} file tools that run entirely inside your browser. No uploads,
        no accounts, no limits — and no server that could keep a copy of your
        files even if someone wanted it to.
      </p>

      <div className="mt-10 prose-tool">
        <h2>Why we built it</h2>
        <p>
          Almost every free file converter online works the same way: you hand it
          your file, it travels to a server you know nothing about, something
          happens there, and a download link comes back. That model is fine for a
          holiday photo and genuinely uncomfortable for a signed contract, a
          payslip, a passport scan, or a medical report — which is exactly the
          kind of document people most often need to merge, compress, or convert.
        </p>
        <p>
          Browsers no longer need that server. The Canvas API can re-encode
          images, the Web Audio API can decode and rewrite sound, WebAssembly runs
          a real build of FFmpeg, and pdf-lib and pdf.js can take a PDF apart and
          put it back together. {SITE_NAME} is what you get when you build the
          usual toolbox on top of those instead.
        </p>

        <h2>How it works</h2>
        <p>
          When you drop a file onto a tool here, it is read into your browser&apos;s
          memory and processed on your own machine. Nothing is uploaded, so there
          is no queue to wait in, no file-size cap imposed by bandwidth, and
          nothing left on someone else&apos;s infrastructure after you close the
          tab. Once the page has loaded, most tools keep working with the network
          switched off entirely.
        </p>
        <p>
          It also means speed is your hardware&apos;s speed. A large video
          conversion is slower here than on a server farm, and we say so on the
          tool rather than hiding it behind a spinner.
        </p>

        <h2>What we will not do</h2>
        <ul>
          <li>
            <strong>Upload your files.</strong> Not for processing, not for
            &ldquo;optimisation&rdquo;, not temporarily. There is no upload
            endpoint to send them to.
          </li>
          <li>
            <strong>Ask you to sign up.</strong> No account, no email, no daily
            quota, no watermark on the output.
          </li>
          <li>
            <strong>Gate a feature behind a plan.</strong> Every tool is complete
            as shipped.
          </li>
          <li>
            <strong>Overstate what a tool does.</strong> Where something has a
            real limit — PDF compression being structural only, video trimming
            cutting on keyframes, PDF-to-Text not being OCR — the tool says so
            before you run it.
          </li>
        </ul>

        <h2>How it stays free</h2>
        <p>
          Running {SITE_NAME} costs almost nothing, because the expensive part —
          the processing — happens on your device rather than on hardware we pay
          for. Hosting static files is cheap enough that advertising covers it,
          and ads only load if you accept them in the consent banner. Declining
          means no third-party script runs at all. See the{" "}
          <Link href="/legal/privacy-policy/">privacy policy</Link> for the
          details.
        </p>

        <h2>The tools</h2>
        <p>
          {TOOL_COUNT} tools across four categories, added as we hit the need for
          them ourselves:
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TOOL_CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={categoryHref(category.slug)}
            className="group bg-surface border border-border rounded-xl p-4 hover:border-accent/40 hover:shadow-[var(--shadow-card-hover)] transition-all duration-200"
          >
            <span className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${category.colorClass.replace("text-", "bg-")}`}
              />
              <span className="text-sm font-semibold text-ink group-hover:text-accent transition-colors duration-150">
                {category.label}
              </span>
            </span>
            <span className="mt-1 block text-xs text-ink-muted">
              {category.tools.length} tools
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-10 prose-tool">
        <h2>Who builds it</h2>
        <p>
          {SITE_NAME} is built and maintained by{" "}
          <a
            href={`https://${CREATOR.domain}`}
            rel="me noopener noreferrer"
            target="_blank"
          >
            {CREATOR.name}
          </a>
          , an independent studio. It is not a front end for someone
          else&apos;s conversion API, and there is no company behind it
          collecting your documents — the operator is one small team, reachable
          at the address below.
        </p>
        <p>
          That matters more here than it would on most sites. A tool that
          promises your files never leave your device is only worth as much as
          the people making the promise, so it should be obvious who they are.
        </p>

        <h2>Get in touch</h2>
        <p>
          Bug reports, missing formats, and tool suggestions are all welcome — the
          list above grew mostly out of them. Write to{" "}
          <a href={`mailto:${CREATOR.email}`}>{CREATOR.email}</a>, or see the{" "}
          <Link href="/legal/contact/">contact page</Link>.
        </p>
      </div>
    </div>
  );
}
