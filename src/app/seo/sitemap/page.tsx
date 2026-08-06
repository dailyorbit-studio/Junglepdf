import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import SitemapTool from "./SitemapTool";

export const metadata: Metadata = toolMetadata({
  category: "seo",
  slug: "sitemap",
  title: "Sitemap Generator — Build an XML Sitemap",
  description:
    "Turn a list of URLs into a valid XML sitemap with changefreq and priority, ready to upload and submit. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What is an XML sitemap for?",
    answer:
      "It lists the pages you want search engines to know about, helping them discover and crawl your site more completely — especially useful for new sites or pages that are not well linked internally.",
  },
  {
    question: "Do changefreq and priority matter?",
    answer:
      "Only as hints. Google treats them as advisory and largely relies on its own crawling signals, but they are part of the sitemap standard and other engines may read them, so the generator includes them.",
  },
  {
    question: "What do I do with the file?",
    answer:
      "Save it as sitemap.xml at your site root, reference it in robots.txt, and submit it in Google Search Console and Bing Webmaster Tools so the crawlers pick it up.",
  },
];

export default function SitemapPage() {
  return (
    <ToolPageShell
      category="seo"
      slug="sitemap"
      title="Sitemap Generator"
      description="Turn a list of URLs into a valid XML sitemap for search engines. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "SEO", href: "/seo" },
        { label: "Sitemap Generator" },
      ]}
      steps={[
        "Paste your URLs, one per line.",
        "Set a default change frequency and priority.",
        "Copy the XML and save it as sitemap.xml.",
      ]}
      articleContent={
        <>
          <h2>A map of your site for search engines</h2>
          <p>
            An XML sitemap is a machine-readable list of your pages that helps
            crawlers find everything you want indexed. Paste your URLs and this
            generator wraps them in valid sitemap XML — properly escaped, with the
            changefreq and priority fields the standard defines.
          </p>
          <h2>Then submit it</h2>
          <p>
            Save the output as sitemap.xml at your site root, add a Sitemap line to
            your robots.txt, and submit the URL in Search Console and Bing
            Webmaster Tools. The whole file is built on your device, so your list
            of URLs is never uploaded.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <SitemapTool />
    </ToolPageShell>
  );
}
