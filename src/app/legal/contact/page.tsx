import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME, CREATOR } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch with the JunglePDF team — bug reports, missing file formats, tool suggestions, and partnership enquiries. We usually reply within two business days.",
  path: "/legal/contact/",
  brandSuffix: true,
});

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mb-4">Contact us</h1>
      <p className="text-base text-ink-secondary mb-10 max-w-xl">
        Have a question, found a bug, or want to suggest a new tool? Reach out and we&apos;ll
        get back to you as soon as we can.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Email */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="w-10 h-10 rounded-lg bg-accent-subtle text-accent flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-ink mb-1">Email</h2>
          <p className="text-sm text-ink-secondary mb-3">
            For general inquiries, bug reports, or partnership questions.
          </p>
          <a
            href={`mailto:${CREATOR.email}`}
            className="text-sm text-accent hover:underline font-medium"
          >
            {CREATOR.email}
          </a>
          <p className="mt-4 pt-4 border-t border-border-subtle text-sm text-ink-secondary">
            {SITE_NAME} is operated by{" "}
            <a
              href={`https://${CREATOR.domain}`}
              rel="me noopener noreferrer"
              target="_blank"
              className="text-accent hover:underline font-medium"
            >
              {CREATOR.name}
            </a>
            .
          </p>
        </div>

        {/* Response time */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="w-10 h-10 rounded-lg bg-secondary-subtle text-secondary flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-ink mb-1">Response time</h2>
          <p className="text-sm text-ink-secondary">
            We typically respond within 1–2 business days. For urgent issues
            affecting tool functionality, please include your browser name
            and version in the email.
          </p>
        </div>
      </div>

      {/* Additional info for AdSense publisher verification */}
      <div className="mt-12 prose-tool">
        <h2>About JunglePDF</h2>
        <p>
          JunglePDF is an independent web project that provides free, privacy-first
          file processing tools. All tools run entirely in the browser using standard
          web technologies. There are no user accounts, no subscription tiers, and no
          data collection beyond anonymized analytics.
        </p>
        <p>
          The project is maintained by a small team committed to building useful
          utilities that respect user privacy. We don&apos;t sell data, gate features,
          or require sign-ups. If you find the tools helpful, sharing the site with
          others is the best way to support us.
        </p>
      </div>
    </div>
  );
}
