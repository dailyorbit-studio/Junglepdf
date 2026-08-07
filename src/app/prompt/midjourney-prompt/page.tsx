import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import MidjourneyPromptTool from "./MidjourneyPromptTool";

export const metadata: Metadata = toolMetadata({
  category: "prompt",
  slug: "midjourney-prompt",
  title: "Midjourney Prompt Builder — Image Prompt Generator",
  description:
    "Build a detailed Midjourney prompt with subject, style, lighting, colours and the --ar and --v parameters. Copy and paste it into Midjourney. Runs in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "What do --ar and --v mean?",
    answer:
      "--ar sets the aspect ratio (16:9 for widescreen, 1:1 for a square, and so on), and --v selects the Midjourney model version. The builder appends both to the end of your prompt in the correct syntax.",
  },
  {
    question: "How should I describe the image?",
    answer:
      "Midjourney responds well to comma-separated descriptors: the subject first, then style, lighting, mood and colour. Each field here maps to one of those, so the prompt reads the way the model expects.",
  },
  {
    question: "Does this generate the image?",
    answer:
      "No. It builds the text prompt for you to paste into Midjourney. Nothing runs here and nothing is uploaded.",
  },
];

export default function MidjourneyPromptPage() {
  return (
    <ToolPageShell
      category="prompt"
      slug="midjourney-prompt"
      title="Midjourney Prompt Builder"
      description="Build a detailed Midjourney image prompt with style, lighting and parameters. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "AI Prompts", href: "/prompt" },
        { label: "Midjourney Prompt Builder" },
      ]}
      steps={["Describe the subject and style.", "Set the aspect ratio and version.", "Copy the prompt into Midjourney."]}
      articleContent={
        <>
          <h2>Describe an image the way Midjourney reads it</h2>
          <p>
            Midjourney works best with a stack of comma-separated descriptors —
            subject, style, lighting, mood, colour — followed by parameters. This
            builder gives each of those its own field and assembles them in the
            right order, with the aspect-ratio and version flags added
            automatically, so your prompt is well-formed every time.
          </p>
          <h2>A prompt, not an image</h2>
          <p>
            The tool produces the text you paste into Midjourney; it does not
            generate art itself and sends nothing anywhere. Use it to iterate on
            wording quickly before committing a generation.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <MidjourneyPromptTool />
    </ToolPageShell>
  );
}
