import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ImageMetadataTool from "./ImageMetadataTool";

export const metadata: Metadata = toolMetadata({
  category: "image",
  slug: "metadata",
  title: "Remove EXIF Data — See and Strip Photo Metadata, Free",
  description:
    "See the GPS location, camera and timestamps hidden in your photos, then remove every trace. Runs in your browser — the photo is never uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What is EXIF data, and why should I care?",
    answer:
      "EXIF is a block of information cameras write into photo files alongside the pixels. It typically records the make and model of the device, the exact date and time, the camera settings, and — if location services were on — GPS coordinates accurate to a few metres. None of it is visible when you look at the picture, and all of it travels with the file when you send it.",
  },
  {
    question: "Do social networks already strip this?",
    answer:
      "Most large platforms do strip EXIF from photos they re-encode, but relying on that is risky. It does not apply to files sent as documents or attachments rather than as photos, to email, to messaging apps in file mode, to cloud links, or to any site that stores the original. The safe assumption is that a file you hand to someone carries everything it carried when you took it.",
  },
  {
    question: "How does removal work — is anything left behind?",
    answer:
      "The image is decoded to raw pixels and re-encoded from scratch. A canvas holds pixels and nothing else, so every metadata block — EXIF, IPTC, XMP, colour profiles, thumbnails — is gone by construction rather than by a list of tags someone remembered to delete. There is no hidden block that survives, because nothing but the pixels is carried across.",
  },
  {
    question: "Will the image quality change?",
    answer:
      "Slightly, if you output JPEG — re-encoding costs one generation of lossy compression. It is normally invisible, but it is real. Choosing PNG avoids it entirely at the cost of a much larger file. For most purposes, JPEG at high quality is the right trade.",
  },
  {
    question: "Why does my photo stay upright even though the orientation tag is gone?",
    answer:
      "Because the rotation is baked into the pixels before the tag is dropped. Phones often store a photo sideways with an EXIF tag telling viewers to rotate it — remove the tag naively and the photo displays sideways forever. This tool applies the rotation to the actual pixels first, so the result is upright without needing a tag at all.",
  },
  {
    question: "Is my photo uploaded to read its metadata?",
    answer:
      "No, and that would rather defeat the point. The EXIF block is parsed by JavaScript in your browser and the re-encode happens on a local canvas. A photo whose location you are trying to hide is not sent to a server on the way to hiding it.",
  },
];

export default function ImageMetadataPage() {
  return (
    <ToolPageShell
      category="image"
      slug="metadata"
      title="Remove EXIF Data from Photos"
      description="See exactly what your photos reveal — location, camera, timestamps — then strip all of it."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Image", href: "/image" },
        { label: "Remove EXIF Data" },
      ]}
      steps={[
        "Drop a photo into the box above — it stays on your device.",
        "Read what the file is carrying, including GPS coordinates if present.",
        "Remove the metadata and download the clean image.",
      ]}
      articleContent={
        <>
          <h2>What your photos are carrying</h2>
          <p>
            Every photo taken on a phone or a modern camera contains more than the
            picture. Tucked into the file, invisible unless you go looking, is a
            block called EXIF that typically records:
          </p>
          <ul>
            <li>The exact date and time the shutter fired, to the second</li>
            <li>The make and model of the device — often enough to identify a specific person&apos;s phone</li>
            <li>GPS coordinates, if location services were enabled, accurate to within a few metres</li>
            <li>Camera settings, lens information, and sometimes editing software</li>
            <li>Occasionally a name, if the device or software was configured with one</li>
          </ul>
          <p>
            All of it travels with the file. Send a photo and you send its history
            along with it.
          </p>

          <h2>Why the location field is the one that matters</h2>
          <p>
            The others are mildly identifying. GPS coordinates are a different
            category of information, because a handful of geotagged photos from
            someone&apos;s ordinary life reveals where they live, where they work,
            where their children go to school, and when they are away from home.
          </p>
          <p>
            This is not theoretical. Photos posted for sale listings have revealed
            sellers&apos; home addresses. Holiday photos have advertised empty
            houses. The information is precise, permanent, and completely
            invisible to whoever shared it — which is exactly what makes it worth
            checking rather than assuming.
          </p>
          <p>
            That is why this tool shows you the data before removing it. &ldquo;Strip
            metadata&rdquo; is an abstraction nobody acts on. Seeing your own
            coordinates on screen is not.
          </p>

          <h2>Do platforms not handle this already?</h2>
          <p>
            Partly, and inconsistently enough that it is not something to rely on.
            Large social networks generally strip EXIF from images they re-encode
            for display. But that covers one path out of many.
          </p>
          <p>
            Files sent as attachments or documents rather than as photos usually
            keep everything. Email keeps everything. Messaging apps in file mode
            keep everything. Cloud storage links serve the original file. Marketplace
            and forum sites vary enormously. And a platform stripping EXIF on the
            copy it displays does not mean it discarded the original it received.
          </p>

          <h2>How removal actually works here</h2>
          <p>
            The image is decoded to raw pixels and re-encoded from nothing. A canvas
            holds an array of colour values and has no concept of a metadata block,
            so there is nowhere for EXIF, IPTC, XMP, embedded thumbnails or colour
            profiles to survive. They are not deleted from a list — they are simply
            never carried across.
          </p>
          <p>
            One detail matters enough to call out. EXIF can carry an{" "}
            <strong>orientation</strong> tag: phones frequently store a photo
            sideways and rely on that tag to tell viewers to rotate it. Strip it
            naively and the photo displays sideways from then on. This tool reads
            the orientation, applies it to the pixels, and only then drops the tag —
            so the result is upright on its own terms.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Removing your home location before posting a marketplace listing</li>
            <li>Cleaning photos before sending them to someone you do not know</li>
            <li>Stripping device identifiers from images shared publicly</li>
            <li>Checking what a photo someone sent you reveals about them</li>
            <li>Preparing images for publication without embedded personal data</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ImageMetadataTool />
    </ToolPageShell>
  );
}
