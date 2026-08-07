import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ResumeCheckerTool from "./ResumeCheckerTool";

export const metadata: Metadata = toolMetadata({
  category: "resume",
  slug: "resume-checker",
  title: "Resume Checker — Score Your Resume Free",
  description:
    "Check your resume against common rules — length, action verbs, quantified impact, contact details and clichés — and get a score. Runs in your browser, nothing uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "How does the score work?",
    answer:
      "It runs a set of rule-based checks — reasonable length, contact details, quantified achievements, strong action verbs, clear sections and an absence of clichés — and scores the share that pass. Each failed check comes with a specific tip.",
  },
  {
    question: "Is this the same as what recruiters use?",
    answer:
      "It reflects the fundamentals recruiters and resume guides consistently recommend, but it is a heuristic, not a verdict. A strong resume can still miss a rule, and passing every rule does not guarantee an interview. Use it to catch obvious gaps.",
  },
  {
    question: "Is my resume uploaded?",
    answer: "No. The analysis runs entirely in your browser; your resume text is never sent anywhere.",
  },
];

export default function ResumeCheckerPage() {
  return (
    <ToolPageShell
      category="resume"
      slug="resume-checker"
      title="Resume Checker"
      description="Check your resume against common rules and get a score. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Resume", href: "/resume" },
        { label: "Resume Checker" },
      ]}
      steps={["Paste your resume text.", "Read the score and the per-rule verdicts.", "Fix the flagged items and re-check."]}
      articleContent={
        <>
          <h2>Catch the obvious weaknesses first</h2>
          <p>
            Before a resume reaches a person, it should clear a few basics: the
            right length, real contact details, achievements backed by numbers,
            strong action verbs, clear sections, and none of the clichés
            recruiters have read a thousand times. This checker tests all of those
            and scores the result, with a specific fix for anything it flags.
          </p>
          <h2>Heuristics, run privately</h2>
          <p>
            The checks are rules of thumb rather than a definitive judgment — the
            job you are applying for always matters more. But they reliably catch
            the avoidable problems, and because it all runs in your browser, your
            resume is never uploaded.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ResumeCheckerTool />
    </ToolPageShell>
  );
}
