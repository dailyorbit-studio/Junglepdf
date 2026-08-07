import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import AtsCheckerTool from "./AtsCheckerTool";

export const metadata: Metadata = toolMetadata({
  category: "resume",
  slug: "ats-checker",
  title: "ATS Keyword Checker — Match Resume to Job",
  description:
    "Compare your resume to a job description and see which key terms are present and which are missing. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "How does it pick the keywords?",
    answer:
      "It reads the job description, strips out common filler words, and takes the most frequent remaining terms as the keywords that matter. It then checks which of those appear in your resume and reports the match rate.",
  },
  {
    question: "Will a higher match guarantee I pass the ATS?",
    answer:
      "No. Applicant tracking systems vary, and relevance is about more than word overlap. Treat the match as a prompt to make sure the genuinely relevant terms from the posting appear in your resume — never as a target to game.",
  },
  {
    question: "Is my resume or the job description uploaded?",
    answer: "No. Both stay in your browser; the comparison is done entirely on your device.",
  },
];

export default function AtsCheckerPage() {
  return (
    <ToolPageShell
      category="resume"
      slug="ats-checker"
      title="ATS Keyword Checker"
      description="Compare your resume to a job description and see which keywords are missing. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Resume", href: "/resume" },
        { label: "ATS Keyword Checker" },
      ]}
      steps={["Paste your resume and the job description.", "See the keyword match rate.", "Work in the missing terms that truly apply to you."]}
      articleContent={
        <>
          <h2>Speak the job&apos;s language</h2>
          <p>
            Many applications are first read by software that scans for terms from
            the job description. This checker pulls the key terms out of a posting
            and shows which ones your resume already uses and which are missing, so
            you can align your wording with the role you actually want.
          </p>
          <h2>Match honestly, on your device</h2>
          <p>
            The goal is to surface relevant terms you genuinely qualify for but
            forgot to mention — not to stuff your resume with keywords. Add only
            what is true. Both documents stay in your browser, so nothing about
            your application is uploaded.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <AtsCheckerTool />
    </ToolPageShell>
  );
}
