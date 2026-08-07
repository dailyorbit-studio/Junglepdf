import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ResumeBuilderTool from "./ResumeBuilderTool";

export const metadata: Metadata = toolMetadata({
  category: "resume",
  slug: "resume-builder",
  title: "Resume Builder — Free, Private, In Your Browser",
  description:
    "Fill in your details and get a clean, structured resume to copy or download as text. Runs in your browser — your career details are never uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What format is the resume?",
    answer:
      "Clean, structured plain text with clear section headers. You can copy it straight into a document, an email, or an online application form, then style it in your editor of choice.",
  },
  {
    question: "Are my details uploaded?",
    answer:
      "No. Everything is assembled in your browser as you type. Nothing about your work history is sent anywhere, which is exactly why a resume builder ought to run locally.",
  },
  {
    question: "How should I write the experience section?",
    answer:
      "One role per block, with bullet points that start with an action verb and quantify impact where you can. Run the result through the Resume Checker to catch common weaknesses.",
  },
];

export default function ResumeBuilderPage() {
  return (
    <ToolPageShell
      category="resume"
      slug="resume-builder"
      title="Resume Builder"
      description="Fill in your details and get a clean, structured resume to copy or download. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Resume", href: "/resume" },
        { label: "Resume Builder" },
      ]}
      steps={["Fill in your contact details and sections.", "Watch the resume build in the preview.", "Copy it or download as text."]}
      articleContent={
        <>
          <h2>A tidy resume, without the upload</h2>
          <p>
            Most online resume builders ask you to hand over your entire work
            history to their servers. This one does not — you fill in your
            details, it structures them into a clean resume with clear headers,
            and the whole thing stays in your browser. Copy it out or download it
            as text.
          </p>
          <h2>Structure you can build on</h2>
          <p>
            The output is deliberately plain so it drops cleanly into any
            document or application form for you to format. Pair it with the
            Resume Checker and ATS Keyword Checker to tighten the content before
            you send it.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ResumeBuilderTool />
    </ToolPageShell>
  );
}
