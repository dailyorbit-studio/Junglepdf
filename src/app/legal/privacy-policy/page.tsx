import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How JunglePDF handles your data: your files never leave your device, we store no accounts, and third-party cookies load only if you accept them in the banner.",
  path: "/legal/privacy-policy/",
  brandSuffix: true,
});

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mb-8">Privacy Policy</h1>

      <div className="prose-tool">
        <p><strong>Last updated:</strong> July 2026</p>

        <h2>The short version</h2>
        <p>
          JunglePDF processes all files entirely in your web browser. Your photos,
          audio files, PDFs, and any other documents you work with on this site are
          never uploaded to any server. We have no backend infrastructure that handles
          user files. Zero percent of your media data touches our servers because we
          don&apos;t have file-processing servers.
        </p>

        <h2>What data we collect</h2>
        <h3>Analytics data</h3>
        <p>
          We use Google Analytics to understand which tools are most popular and how
          visitors navigate the site. This collects anonymized usage data such as page
          views, browser type, screen resolution, and approximate geographic region.
          It does not collect file contents, filenames, or any information about the
          files you process.
        </p>

        <h3>Advertising data</h3>
        <p>
          We display ads through Google AdSense to keep the tools free. AdSense may use
          cookies to serve personalized ads based on your browsing history across the web.
          You can opt out of personalized advertising through Google&apos;s{" "}
          <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            Ad Settings
          </a>{" "}
          page or by declining cookies in the consent banner when you first visit JunglePDF.
        </p>

        <h3>Cookie consent preferences</h3>
        <p>
          We store your cookie consent choice (accepted or declined) in your browser&apos;s
          localStorage. This is a simple text value — it contains no personal information and
          is never transmitted to any server.
        </p>

        <h2>What data we do NOT collect</h2>
        <ul>
          <li>File contents (images, audio, video, PDFs)</li>
          <li>File names or metadata</li>
          <li>Personal identity information (name, email, phone)</li>
          <li>Login credentials (there are no accounts)</li>
          <li>Payment information (everything is free)</li>
        </ul>

        <h2>How file processing works</h2>
        <p>
          Every tool on JunglePDF uses client-side web APIs to process your files:
        </p>
        <ul>
          <li><strong>Image tools</strong> use the HTML5 Canvas API to resize and compress images in browser memory.</li>
          <li><strong>Audio tools</strong> use the Web Audio API and a WebAssembly build of FFmpeg that runs in your browser tab.</li>
          <li><strong>PDF tools</strong> use the pdf-lib JavaScript library to read, merge, split, and optimize PDF documents locally.</li>
        </ul>
        <p>
          At no point during any of these operations is file data transmitted over the
          internet. The files are read from your local disk into your browser&apos;s
          memory, processed there, and the output is generated locally for download.
        </p>

        <h2>Third-party services</h2>
        <ul>
          <li><strong>Google Analytics</strong> — anonymized traffic analytics</li>
          <li><strong>Google AdSense</strong> — display advertising</li>
          <li><strong>Google Fonts</strong> — web font delivery (Inter, Source Sans 3)</li>
          <li><strong>unpkg CDN</strong> — FFmpeg WebAssembly core files</li>
        </ul>

        <h2>GDPR and CCPA compliance</h2>
        <p>
          Under the GDPR (EU) and CCPA (California), you have the right to know what
          data is collected about you and to request its deletion. Since we don&apos;t
          collect personal data beyond anonymized analytics, there is no personal data
          to delete. If you have questions, contact us at the email address on our{" "}
          <a href="/legal/contact/" className="text-accent hover:underline">Contact page</a>.
        </p>
        <p>
          The cookie consent banner on your first visit lets you accept or decline
          third-party cookies before any advertising scripts load. Declining cookies
          prevents Google AdSense from setting tracking cookies.
        </p>

        <h2>Children&apos;s privacy</h2>
        <p>
          JunglePDF does not knowingly collect data from children under 13. The site is
          a general-purpose utility tool with no account system or content submission features.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this policy from time to time. Changes will be posted on this page
          with an updated &quot;Last updated&quot; date. We encourage you to review this page
          periodically.
        </p>
      </div>
    </div>
  );
}
