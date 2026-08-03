import type { Metadata } from "next";
import { Inter, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ConsentBanner from "@/components/ConsentBanner";
import ThirdPartyScripts from "@/components/ThirdPartyScripts";
import { SITE_URL, SITE_NAME, CREATOR, SOCIAL_LINKS } from "@/lib/site";

// Self-hosted at build time by next/font — no render-blocking round trip to
// fonts.googleapis.com, and no FOUT from a stylesheet <link>.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Free Online PDF, Image, Audio & Video Tools`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Free online tools to merge, split, compress and convert PDF, image, audio and video files. Everything runs in your browser — no uploads, no sign-up, no limits.",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  applicationName: SITE_NAME,
  keywords: [
    "pdf to word",
    "word to pdf",
    "merge pdf",
    "compress pdf",
    "split pdf",
    "excel to pdf",
    "image compressor",
    "video to mp3",
    "free online pdf tools",
    "convert files online",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // Search Console / Bing verification tokens go here once the property is
  // claimed; an empty string would emit an empty meta tag, so leave them out
  // until you have the real values.
  verification: { google: "38bN_2uc3C49sE0SB4GEXeRlRH6c6j2g5gb9XwKFtbc" },
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Free Online PDF, Image, Audio & Video Tools`,
    description:
      "Merge, split, compress and convert PDF, image, audio and video files — free, in your browser, with nothing uploaded.",
    images: [
      {
        url: "/card.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — free file tools that run in your browser`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Free Online PDF, Image, Audio & Video Tools`,
    description:
      "Merge, split, compress and convert PDF, image, audio and video files — free, in your browser, with nothing uploaded.",
    images: ["/card.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSans.variable}`}>
      <head>
        {/*
          One @graph rather than three separate <script> blocks, so the nodes
          can reference each other by @id — the Organization is the publisher
          of the WebSite, and the WebApplication is published by the same
          Organization. Google reads a disconnected pile of nodes, but the
          links are what let it treat the brand, the site and the app as one
          entity rather than three coincidental ones.

          No SearchAction: the site search is a client-side dropdown with no
          results URL to hand a query to, and declaring one that 404s is worse
          than declaring none.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${SITE_URL}/#organization`,
                  name: SITE_NAME,
                  url: `${SITE_URL}/`,
                  logo: {
                    "@type": "ImageObject",
                    url: `${SITE_URL}/icon.png`,
                    width: 512,
                    height: 512,
                  },
                  description:
                    "Free file utilities that run entirely in the browser — no uploads, no accounts.",
                  email: CREATOR.email,
                  // Names the operator behind the brand. `parentOrganization`
                  // rather than `founder`: DailyOrbit Studio runs the site, it
                  // is not a person who started it.
                  parentOrganization: {
                    "@type": "Organization",
                    name: CREATOR.name,
                    url: `https://${CREATOR.domain}`,
                  },
                  // sameAs is how a search engine ties this site to the
                  // accounts that operate it. The studio site plus its public
                  // profiles — the same set the footer links to, read from one
                  // constant so the two cannot drift apart.
                  sameAs: [
                    `https://${CREATOR.domain}`,
                    ...SOCIAL_LINKS.map((social) => social.href),
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": `${SITE_URL}/#website`,
                  name: SITE_NAME,
                  url: `${SITE_URL}/`,
                  inLanguage: "en",
                  publisher: { "@id": `${SITE_URL}/#organization` },
                },
                {
                  "@type": "WebApplication",
                  "@id": `${SITE_URL}/#webapp`,
                  name: SITE_NAME,
                  url: `${SITE_URL}/`,
                  description:
                    "Free browser-based file tools. Convert, compress, and edit PDF, image, audio and video files without uploading them.",
                  applicationCategory: "UtilityApplication",
                  operatingSystem: "Any",
                  isAccessibleForFree: true,
                  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                  browserRequirements: "Requires a modern browser with JavaScript enabled",
                  publisher: { "@id": `${SITE_URL}/#organization` },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ConsentBanner />
        <ThirdPartyScripts />
      </body>
    </html>
  );
}
