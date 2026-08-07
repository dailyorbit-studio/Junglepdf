import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import EmailPromptTool from "./EmailPromptTool";

export const metadata: Metadata = toolMetadata({
  category: "prompt",
  slug: "email-prompt",
  title: "Email Prompt Generator — AI Email Draft Prompts",
  description:
    "Create a prompt that gets an AI to draft the email you need, in the right tone and length. Copy it into ChatGPT. Runs in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "What does the prompt produce?",
    answer:
      "Pasted into an AI assistant, it drafts a complete email — subject line, body and a call to action — in the tone and length you chose, covering the points you listed.",
  },
  {
    question: "Can I control the tone?",
    answer:
      "Yes. Pick from professional, friendly, formal, apologetic and more, and set the length. Those two choices are what most change how the resulting email reads.",
  },
  {
    question: "Is anything uploaded?",
    answer: "No. The prompt is built on your device and only sent when you paste it into your assistant of choice.",
  },
];

export default function EmailPromptPage() {
  return (
    <ToolPageShell
      category="prompt"
      slug="email-prompt"
      title="Email Prompt Generator"
      description="Create a prompt that gets an AI to draft the email you need, in the right tone. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "AI Prompts", href: "/prompt" },
        { label: "Email Prompt Generator" },
      ]}
      steps={["State the purpose and recipient.", "List the key points and pick a tone.", "Copy the prompt into an AI assistant."]}
      articleContent={
        <>
          <h2>Draft the awkward emails faster</h2>
          <p>
            Some emails are hard to start — a follow-up, an apology, a delicate
            ask. This tool builds a prompt that hands an AI the purpose, the
            recipient, your key points and the tone you want, so the draft comes
            back close to send-ready and in the register you intended.
          </p>
          <h2>Private by default</h2>
          <p>
            The prompt is assembled in your browser and nothing is uploaded. You
            decide when it leaves your device by pasting it into your assistant,
            keeping the details of the email under your control until then.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <EmailPromptTool />
    </ToolPageShell>
  );
}
