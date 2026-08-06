import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import RobotsTxtTool from "./RobotsTxtTool";

export const metadata: Metadata = toolMetadata({
  category: "seo",
  slug: "robots-txt",
  title: "Robots.txt Generator — Build a robots.txt File",
  description:
    "Build a valid robots.txt with allow, disallow and sitemap directives. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Where does robots.txt go?",
    answer:
      "At the root of your domain — example.com/robots.txt. Crawlers look for it there and nowhere else, so it must sit at the top level, not in a subfolder.",
  },
  {
    question: "Does Disallow hide a page from Google?",
    answer:
      "Not exactly. It asks crawlers not to fetch the page, but a disallowed URL can still be indexed if it is linked from elsewhere. To keep a page out of results, use a noindex meta tag instead — and do not disallow it, or the crawler will never see the noindex.",
  },
  {
    question: "Should I list my sitemap here?",
    answer:
      "Yes, it is good practice. Adding a Sitemap line helps search engines discover your sitemap even if you have not submitted it in their webmaster tools.",
  },
];

export default function RobotsTxtPage() {
  return (
    <ToolPageShell
      category="seo"
      slug="robots-txt"
      title="Robots.txt Generator"
      description="Build a robots.txt file with allow, disallow and sitemap directives. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "SEO", href: "/seo" },
        { label: "Robots.txt Generator" },
      ]}
      steps={[
        "Choose to allow all, block all, or list custom paths.",
        "Add your sitemap URL.",
        "Copy the file to your site root as robots.txt.",
      ]}
      articleContent={
        <>
          <h2>Guiding the crawlers</h2>
          <p>
            A robots.txt file tells search-engine crawlers which parts of your
            site they may fetch. It is the first file a crawler looks for, and a
            malformed one can accidentally hide your whole site or expose paths you
            meant to keep quiet. This generator writes a valid file from a few
            simple choices.
          </p>
          <h2>Allow, block, or fine-tune</h2>
          <p>
            Open the whole site, block everything while you are building, or list
            specific paths to keep crawlers out of — admin, cart, checkout — and
            add your sitemap URL so it is easy to find. Place the result at your
            domain root. It is all generated on your device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <RobotsTxtTool />
    </ToolPageShell>
  );
}
