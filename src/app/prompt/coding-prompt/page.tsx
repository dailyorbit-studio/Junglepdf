import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import CodingPromptTool from "./CodingPromptTool";

export const metadata: Metadata = toolMetadata({
  category: "prompt",
  slug: "coding-prompt",
  title: "Coding Prompt Generator — AI Code Prompts",
  description:
    "Build a precise coding prompt with language, task, constraints and input/output details so an AI returns code that fits. Copy it into ChatGPT. Runs in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "Why be so specific?",
    answer:
      "Vague coding requests get code that compiles but misses your constraints. Stating the language, the exact task, the requirements and the input/output shape is what gets the model to return something you can actually drop in.",
  },
  {
    question: "Does it write the code?",
    answer:
      "No. It builds the prompt; you paste it into ChatGPT, Claude or another assistant to get the code. Nothing runs here and nothing is uploaded.",
  },
  {
    question: "Which languages are supported?",
    answer:
      "The common ones — JavaScript, TypeScript, Python, Java, Go, Rust, SQL and more — but the prompt works for any language you name; the list is just for convenience.",
  },
];

export default function CodingPromptPage() {
  return (
    <ToolPageShell
      category="prompt"
      slug="coding-prompt"
      title="Coding Prompt Generator"
      description="Build a precise coding prompt with language, task, constraints and I/O details. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "AI Prompts", href: "/prompt" },
        { label: "Coding Prompt Generator" },
      ]}
      steps={["Pick the language and describe the task.", "Add constraints and the input/output shape.", "Copy the prompt into an AI assistant."]}
      articleContent={
        <>
          <h2>Specific prompts, usable code</h2>
          <p>
            The gap between a coding prompt that returns throwaway code and one
            that returns something you can ship is specificity. This builder makes
            you state the language, the precise task, the constraints and the
            input/output shape, then assembles them into a prompt that leaves the
            model far less to guess at.
          </p>
          <h2>Built locally</h2>
          <p>
            The prompt is composed in your browser and nothing is uploaded. It is
            a quick way to think through requirements before handing the task to
            an assistant — and often clarifying the prompt clarifies the problem.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <CodingPromptTool />
    </ToolPageShell>
  );
}
