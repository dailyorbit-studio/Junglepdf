import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import CoverLetterTool from "./CoverLetterTool";

export const metadata: Metadata = toolMetadata({
  category: "resume",
  slug: "cover-letter",
  title: "Cover Letter Template Generator — Free & Private",
  description:
    "Generate a tailored cover letter draft from a few details about the role. Copy or download it. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Is the letter ready to send?",
    answer:
      "It is a strong first draft that follows a proven structure — opening, your pitch, and a closing call to action. Read it through and add a specific detail or two about the company to make it genuinely yours before sending.",
  },
  {
    question: "What if I don't know the hiring manager's name?",
    answer:
      "Leave that field blank and it uses 'Dear Hiring Manager', which is the accepted fallback. A name is better when you have it, so it is worth a quick check of the job post or company page.",
  },
  {
    question: "Are my details uploaded?",
    answer: "No. The letter is composed in your browser and never sent anywhere.",
  },
];

export default function CoverLetterPage() {
  return (
    <ToolPageShell
      category="resume"
      slug="cover-letter"
      title="Cover Letter Template"
      description="Generate a tailored cover letter draft from a few details about the role. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Resume", href: "/resume" },
        { label: "Cover Letter Template" },
      ]}
      steps={["Enter the company, role and your name.", "Add your pitch, or use the default.", "Copy or download the draft."]}
      articleContent={
        <>
          <h2>A cover letter draft in seconds</h2>
          <p>
            The hardest part of a cover letter is the blank page. This tool fills
            a proven structure — a clear opening, your pitch, and a closing call to
            action — with the company, the role and your own points, so you start
            from a solid draft instead of nothing.
          </p>
          <h2>Make it yours, privately</h2>
          <p>
            Treat the output as a first draft: add a specific reason you want this
            particular role, and it will read far better than a generic letter.
            Everything is generated on your device, so none of your application
            details are uploaded.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <CoverLetterTool />
    </ToolPageShell>
  );
}
