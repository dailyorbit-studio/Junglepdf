import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description:
    "The terms that apply when you use JunglePDF: what the free browser-based tools do, what they do not warrant, and who owns the files you process (you do).",
  path: "/legal/terms-of-use/",
  brandSuffix: true,
});

export default function TermsOfUsePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mb-8">Terms of Use</h1>

      <div className="prose-tool">
        <p><strong>Last updated:</strong> July 2026</p>

        <h2>Acceptance of terms</h2>
        <p>
          By accessing and using JunglePDF, you agree to be bound by these Terms of Use.
          If you do not agree with any part of these terms, please do not use the site.
        </p>

        <h2>Description of service</h2>
        <p>
          JunglePDF provides free, browser-based file processing tools including audio
          extraction, image compression, image resizing, and PDF manipulation. All tools
          operate entirely on the client side — no files are uploaded to or processed by
          our servers.
        </p>

        <h2>Use restrictions</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the tools to process files you do not have the legal right to modify</li>
          <li>Attempt to reverse engineer, decompile, or extract source code beyond what is publicly available</li>
          <li>Use automated scripts to make excessive requests to the site</li>
          <li>Redistribute the site&apos;s tools under a different brand without attribution</li>
        </ul>

        <h2>Intellectual property</h2>
        <p>
          The JunglePDF name, logo, design, and source code are the intellectual property
          of the JunglePDF team. The tools use open-source libraries (pdf-lib, FFmpeg)
          under their respective licenses (MIT, LGPL). Files you process remain your
          property — we claim no rights over your content.
        </p>
        <p>
          The tool icons are{" "}
          <a href="https://fontawesome.com/" rel="noopener noreferrer" target="_blank">
            Font Awesome
          </a>{" "}
          Free, licensed{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            rel="noopener noreferrer license"
            target="_blank"
          >
            CC BY 4.0
          </a>
          . They are bundled with the site rather than loaded from a third party,
          so viewing a page here sends no request to Font Awesome.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          JunglePDF is provided &quot;as is&quot; without warranty of any kind. We are
          not responsible for any data loss, file corruption, or other damages resulting
          from the use of our tools. Since all processing happens in your browser, we
          cannot control the outcome — it depends on your browser, device, and the
          files you provide.
        </p>
        <p>
          You are responsible for maintaining backups of your original files before
          processing them with any tool on this site.
        </p>

        <h2>Third-party content</h2>
        <p>
          The site displays advertisements through Google AdSense. We are not responsible
          for the content of third-party ads. Ad content is determined by Google based on
          your browsing history and the site context.
        </p>

        <h2>Availability</h2>
        <p>
          We make reasonable efforts to keep JunglePDF available, but we do not guarantee
          uninterrupted access. The site may be temporarily unavailable due to maintenance,
          updates, or factors outside our control.
        </p>

        <h2>Changes to these terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Changes will be posted
          on this page. Continued use of the site after changes are posted constitutes
          acceptance of the updated terms.
        </p>

        <h2>Governing law</h2>
        <p>
          These terms shall be governed by and construed in accordance with applicable law
          in the jurisdiction where the site operator is located.
        </p>

        <h2>Contact</h2>
        <p>
          If you have questions about these terms, please visit our{" "}
          <a href="/legal/contact/" className="text-accent hover:underline">Contact page</a>.
        </p>
      </div>
    </div>
  );
}
