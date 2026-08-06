import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import TextStatsTool from "@/components/TextStatsTool";

export const metadata: Metadata = toolMetadata({
  category: "text",
  slug: "character-counter",
  title: "Character Counter — Count Characters Online",
  description:
    "Count characters with and without spaces, live, with running tallies against SMS, tweet, title and meta-description limits. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Does it count characters with or without spaces?",
    answer:
      "Both, side by side. The total includes spaces; the second figure excludes all whitespace — which is the distinction that matters for many form and database limits.",
  },
  {
    question: "What are the limit bars for?",
    answer:
      "They show your text against common length limits — SMS (160), a tweet (280), an SEO title tag (~60) and a meta description (~160) — and turn red when you go over, so you can trim to fit at a glance.",
  },
  {
    question: "How are emoji counted?",
    answer:
      "Characters are counted by Unicode code point, so most emoji count as one. Note that some platforms bill a complex emoji as several characters for their own limits, so treat the SMS and tweet bars as a close guide.",
  },
  {
    question: "Is my text uploaded?",
    answer: "No. Everything is counted in your browser as you type.",
  },
];

export default function CharacterCounterPage() {
  return (
    <ToolPageShell
      category="text"
      slug="character-counter"
      title="Character Counter"
      description="Count characters with and without spaces, live, against common length limits. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Text", href: "/text" },
        { label: "Character Counter" },
      ]}
      steps={[
        "Type or paste your text.",
        "Read the character counts, with and without spaces.",
        "Trim to fit the limit bars if you are over.",
      ]}
      articleContent={
        <>
          <h2>Fit the limit exactly</h2>
          <p>
            Plenty of fields have a hard character cap — a text message, a tweet,
            an SEO title, a bio, a form input. This counter shows your total with
            and without spaces and tracks it against the common limits, colouring
            the bar red the moment you go over, so you can tighten the wording
            until it fits.
          </p>
          <h2>Counted the way software counts</h2>
          <p>
            Characters are tallied by Unicode code point, which matches how most
            systems measure length. It all happens in your browser as you type —
            nothing is uploaded — so counting a private message or an unpublished
            headline is completely safe.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <TextStatsTool variant="characters" />
    </ToolPageShell>
  );
}
