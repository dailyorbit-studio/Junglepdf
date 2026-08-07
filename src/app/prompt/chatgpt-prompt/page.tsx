import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ChatgptPromptTool from "./ChatgptPromptTool";

export const metadata: Metadata = toolMetadata({
  category: "prompt",
  slug: "chatgpt-prompt",
  title: "ChatGPT Prompt Generator — Build Better Prompts",
  description:
    "Turn a rough idea into a structured ChatGPT prompt with role, task, context, tone and format. Copy it into ChatGPT. Runs in your browser — no AI, no sign-up.",
});

const FAQ_ITEMS = [
  {
    question: "Does this run ChatGPT for me?",
    answer:
      "No. It builds a well-structured prompt that you copy and paste into ChatGPT, Claude or any other assistant. There is no AI running here and no account needed — it is a template builder.",
  },
  {
    question: "Why does prompt structure matter?",
    answer:
      "Assistants respond far better to a clear role, a specific task, relevant context and a stated format than to a vague one-liner. Filling those in deliberately is the single easiest way to get more useful answers.",
  },
  {
    question: "Is anything uploaded?",
    answer: "No. The prompt is assembled in your browser and never sent anywhere until you paste it yourself.",
  },
];

export default function ChatgptPromptPage() {
  return (
    <ToolPageShell
      category="prompt"
      slug="chatgpt-prompt"
      title="ChatGPT Prompt Generator"
      description="Turn a rough idea into a structured ChatGPT prompt. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "AI Prompts", href: "/prompt" },
        { label: "ChatGPT Prompt Generator" },
      ]}
      steps={["Describe the role, task and context.", "Pick a tone and output format.", "Copy the prompt into ChatGPT."]}
      articleContent={
        <>
          <h2>A better prompt, by construction</h2>
          <p>
            The quality of an AI answer tracks the quality of the prompt. This
            builder walks you through the parts that matter — who the assistant
            should act as, the specific task, the context it needs, the tone and
            the format you want back — and assembles them into a clean prompt you
            can paste straight into ChatGPT.
          </p>
          <h2>Just a template, run locally</h2>
          <p>
            No AI runs on this page and nothing is uploaded; it simply composes
            text on your device. That makes it a fast, private way to draft and
            refine prompts before spending them on the actual model.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ChatgptPromptTool />
    </ToolPageShell>
  );
}
