import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import UnzipTool from "./UnzipTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "unzip",
  title: "Unzip Files Online — Open and Extract ZIP Archives",
  description:
    "Open a ZIP archive in your browser, see what is inside, and extract one file or all of them. Nothing is uploaded — the archive never leaves your device.",
});

const FAQ_ITEMS = [
  {
    question: "Can it open RAR or 7z files?",
    answer:
      "No. Those are different formats with different compression algorithms — the extension is the smallest part of the difference. This tool opens ZIP archives, which covers the overwhelming majority of what people are sent.",
  },
  {
    question: "What about password-protected archives?",
    answer:
      "Encrypted entries cannot be extracted here. The listing will still show what is in the archive, but the contents stay locked. Password recovery is not something a client-side tool can meaningfully offer.",
  },
  {
    question: "How large an archive can I open?",
    answer:
      "The listing is cheap, so very large archives open fine. Extraction is bounded by your browser’s memory, since everything is held in the tab — on a phone, a very large extraction may fail. Pulling out individual files uses far less memory than extracting all.",
  },
  {
    question: "Why does the extracted ZIP look bigger than the original?",
    answer:
      "Because it is stored rather than compressed. The contents were just decompressed and re-compressing them would take time to reach a size they already had. Your unzipping tool will open it instantly either way.",
  },
  {
    question: "Is my archive uploaded?",
    answer:
      "No. It is read and unpacked entirely in your browser using JSZip. Nothing is transmitted, which is exactly why this is worth doing here rather than on a random web service.",
  },
];

export default function Page() {
  return (
    <ToolPageShell
      category="pdf"
      slug="unzip"
      title="Unzip Files"
      description="Open a ZIP, look inside, and pull out what you need."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Unzip Files" },
      ]}
      steps={[
        "Drop in a ZIP file",
        "Browse the contents",
        "Save one file, or extract everything",
      ]}
      articleContent={
        <>
          <h2>Listing first, extracting second</h2>
          <p>
            Opening the archive reads its table of contents without decompressing
            anything. That is a cheap operation even on a very large file, and it means
            you can see what is inside a 2GB archive and pull out the one document you
            wanted without unpacking the rest.
          </p>
          <p>
            It matters here more than in a desktop tool because everything runs in your
            browser tab, against the memory the tab is allowed. Extracting everything
            first and then showing a list would put a hard ceiling on what could be
            opened at all.
          </p>
          <h2>Why “extract all” hands back another ZIP</h2>
          <p>
            Browsers deliberately block a rapid sequence of downloads — after the first
            few, the rest are silently dropped. An archive with forty files in it would
            appear to work and then deliver three of them.
          </p>
          <p>
            So everything is decompressed and rebuilt into a single uncompressed archive
            for a one-click download. It is stored rather than re-compressed, because the
            contents have just been inflated and squeezing them again would cost seconds
            to arrive back at the size they already were.
          </p>
          <h2>Paths that point outside the archive</h2>
          <p>
            A ZIP entry can technically contain a path like <strong>../../etc/passwd</strong>,
            which is a real attack against tools that write files straight to disk. This
            runs in a browser and never writes to your filesystem, so it cannot be
            exploited that way.
          </p>
          <p>
            Even so, such entries are flagged in the listing and downloaded using only
            the file name, so nothing is presented as an ordinary file when it is not.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <UnzipTool />
    </ToolPageShell>
  );
}
