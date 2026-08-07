import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ResumePromptTool from "./ResumePromptTool";

export const metadata: Metadata = toolMetadata({
  category: "prompt",
  slug: "resume-prompt",
  title: "Resume Prompt Generator — AI Resume Bullet Points",
  description:
    "Generate a prompt that gets an AI to write or sharpen your resume bullet points, tailored to a role. Copy it into ChatGPT. Runs in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "What do I do with the prompt?",
    answer:
      "Copy it into ChatGPT, Claude or any assistant. It asks the model to turn your experience into strong, quantified resume bullet points aimed at the role you specify.",
  },
  {
    question: "Why not just ask the AI directly?",
    answer:
      "You can, but a vague request gives generic lines. This prompt supplies the role, your skills and your real achievements, and asks for action verbs and numbers — which is what produces bullets a recruiter actually notices.",
  },
  {
    question: "Is my information uploaded?",
    answer: "No. The prompt is built in your browser and only leaves your device when you paste it yourself.",
  },
];

export default function ResumePromptPage() {
  return (
    <ToolPageShell
      category="prompt"
      slug="resume-prompt"
      title="Resume Prompt Generator"
      description="Generate a prompt that gets an AI to write or sharpen your resume bullet points. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "AI Prompts", href: "/prompt" },
        { label: "Resume Prompt Generator" },
      ]}
      steps={["Enter the target role and your experience.", "List your skills and achievements.", "Copy the prompt into an AI assistant."]}
      articleContent={
        <>
          <h2>Turn experience into strong bullets</h2>
          <p>
            The hardest part of a resume is phrasing what you did as tight,
            results-focused bullet points. This tool builds a prompt that hands an
            AI your role, skills and raw achievements and asks specifically for
            action-oriented, quantified lines tailored to the job — the format
            that gets read.
          </p>
          <h2>Yours, and private</h2>
          <p>
            Everything is assembled on your device. Nothing about your career is
            uploaded here; the prompt only reaches an AI when you paste it in
            yourself, so you stay in control of what you share.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ResumePromptTool />
    </ToolPageShell>
  );
}
