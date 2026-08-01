import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolPageShell from "@/components/ToolPageShell";
import ImageConverterTool from "@/app/image/converter/ImageConverterTool";
import AudioConverterTool from "@/app/audio/converter/AudioConverterTool";
import VideoConverterTool from "@/app/video/converter/VideoConverterTool";
import VideoToMp3Tool from "@/app/audio/video-to-mp3/VideoToMp3Tool";
import AnimatedConvertTool from "@/components/AnimatedConvertTool";
import VideoToGifTool from "@/app/video/to-gif/VideoToGifTool";
import {
  CONVERSIONS,
  findConversion,
  conversionLabel,
  conversionCaveat,
  FORMAT_INFO,
  type ConversionPair,
} from "@/lib/conversions";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import type { OutputFormat } from "@/lib/image-converter";
import type { AudioFormat } from "@/lib/audio-converter";
import type { VideoFormat } from "@/lib/video-tools";

/**
 * One statically-exported page per entry in the conversion registry.
 *
 * `output: "export"` means every one of these is rendered to HTML at build time
 * and served as a flat file — there is no dynamic segment left at runtime, so
 * a crawler sees a complete document on first request with no JavaScript.
 */
export function generateStaticParams() {
  return CONVERSIONS.map((c) => ({ pair: c.slug }));
}

export const dynamicParams = false;

function titleFor(pair: ConversionPair): string {
  return `${conversionLabel(pair)} Converter — Free & In Your Browser`;
}

function descriptionFor(pair: ConversionPair): string {
  const label = conversionLabel(pair);
  const from = FORMAT_INFO[pair.from].label;
  const to = FORMAT_INFO[pair.to].label;
  return `Convert ${from} to ${to} free, right in your browser. No upload, no sign-up, no watermark — your file never leaves your device. ${label} in seconds.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pair: string }>;
}): Promise<Metadata> {
  const { pair: slug } = await params;
  const pair = findConversion(slug);
  if (!pair) return {};

  const canonical = `${SITE_URL}/convert/${slug}/`;

  return {
    title: titleFor(pair),
    description: descriptionFor(pair),
    alternates: { canonical },
    openGraph: {
      title: titleFor(pair),
      description: descriptionFor(pair),
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: titleFor(pair),
      description: descriptionFor(pair),
    },
  };
}

function ToolFor({ pair }: { pair: ConversionPair }) {
  switch (pair.component) {
    case "image":
      return <ImageConverterTool initialFormat={pair.target as OutputFormat} />;
    case "audio":
      return <AudioConverterTool initialFormat={pair.target as AudioFormat} />;
    case "video":
      return <VideoConverterTool initialFormat={pair.target as VideoFormat} />;
    case "video-to-mp3":
      return <VideoToMp3Tool />;
    case "video-to-gif":
      return <VideoToGifTool />;
    case "gif-to-mp4":
      return <AnimatedConvertTool mode="gif-to-mp4" />;
    case "apng-to-gif":
      return <AnimatedConvertTool mode="apng-to-gif" />;
  }
}

export default async function ConversionPage({
  params,
}: {
  params: Promise<{ pair: string }>;
}) {
  const { pair: slug } = await params;
  const pair = findConversion(slug);
  if (!pair) notFound();

  const from = FORMAT_INFO[pair.from];
  const to = FORMAT_INFO[pair.to];
  const label = conversionLabel(pair);
  const caveat = conversionCaveat(pair);

  // The GIF group sits under Video in the breadcrumb: every member of it is
  // either a video going in or a video coming out.
  const isVideoish = pair.kind === "video" || pair.kind === "gif";
  const categoryLabel = pair.kind === "image" ? "Image" : isVideoish ? "Video" : "Audio";
  const categoryHref = pair.kind === "image" ? "/image" : isVideoish ? "/video" : "/audio";

  return (
    <ToolPageShell
      category={pair.kind === "image" ? "image" : isVideoish ? "video" : "audio"}
      slug={
        pair.component === "video-to-mp3"
          ? "video-to-mp3"
          : pair.component === "video-to-gif" || pair.component === "apng-to-gif"
            ? "to-gif"
            : "converter"
      }
      title={`${label} Converter`}
      description={`Convert ${from.label} files to ${to.label} without uploading them. Everything runs on your own device.`}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: categoryLabel, href: categoryHref },
        { label },
      ]}
      steps={[
        `Drop your ${from.label} file into the box above — it stays on your device.`,
        pair.component === "video-to-gif"
          ? "Pick the seconds you want and the size, then build the GIF."
          : `${to.label} is already selected as the output, so there is nothing to configure.`,
        `Download the converted ${to.label} file.`,
      ]}
      articleContent={
        <>
          <h2>Converting {from.label} to {to.label}</h2>
          <p>
            This page is the {label} setting of our{" "}
            <a href={pair.toolHref}>converter</a>, with {to.label} already
            chosen. Drop a {from.label} file in and the result comes back as{" "}
            {to.label} — no account, no queue, and no watermark on the output.
          </p>
          <p>
            The conversion runs entirely inside your browser tab. Your file is
            read into memory on your own machine, converted there, and handed
            straight back. Nothing is uploaded, which means there is no size
            limit imposed by someone else&apos;s bandwidth and no copy of your
            file sitting on a server after you close the tab.
          </p>

          <h2>What is {from.label}?</h2>
          <p>{from.blurb}</p>

          <h2>What is {to.label}?</h2>
          <p>{to.blurb}</p>

          {caveat && (
            <>
              <h2>What changes in this conversion</h2>
              <p>{caveat}</p>
            </>
          )}

          <h2>Is it really free?</h2>
          <p>
            Yes, and there is no catch to explain. Because the work happens on
            your device rather than on a server, running this costs us nothing
            per conversion — so there is no bill to recover and nothing to gate
            behind a sign-up, a daily quota or a watermark.
          </p>
        </>
      }
      faqItems={[
        {
          question: `How do I convert ${from.label} to ${to.label}?`,
          answer: `Drop your ${from.label} file into the box on this page. ${to.label} is already selected as the output format, so you can go straight to converting and then download the result. The whole thing happens in your browser — there is no upload step to wait through.`,
        },
        {
          question: `Is this ${label} converter free?`,
          answer: `Yes, with no sign-up, no daily limit and no watermark. The conversion runs on your own device, so it costs nothing to provide and there is nothing to gate.`,
        },
        {
          question: "Is my file uploaded to a server?",
          answer: `No. The file is read into your browser's memory and converted there. It never crosses the network, which is why this works on a private document as safely as on a holiday photo. You can even disconnect after the page loads and the conversion still works.`,
        },
        ...(caveat
          ? [
              {
                question: `Does converting ${from.label} to ${to.label} lose quality?`,
                answer: caveat,
              },
            ]
          : []),
        {
          question: `Can I convert several ${from.label} files at once?`,
          answer: `This page handles one file at a time so the settings stay clear. For batch work, open the full converter from the link in the article below — and if you need to change dimensions as well as format, use the Image Resizer instead of converting twice.`,
        },
      ]}
    >
      <ToolFor pair={pair} />
    </ToolPageShell>
  );
}
