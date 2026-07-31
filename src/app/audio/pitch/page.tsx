import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import PitchShifterTool from "./PitchShifterTool";

export const metadata: Metadata = toolMetadata({
  category: "audio",
  slug: "pitch",
  title: "Pitch Shifter — Change Audio Pitch Without Changing Speed",
  description:
    "Shift audio up or down by semitones while keeping the original length. Transpose a backing track or move a song into your vocal range. No uploads.",
});

const FAQ_ITEMS = [
  {
    question: "Does the file get longer or shorter?",
    answer:
      "No. The tempo correction puts the duration back exactly where it started, which is the entire point of this tool as opposed to the speed tool. A three-minute track is still three minutes at any shift.",
  },
  {
    question: "How many semitones should I use to change key?",
    answer:
      "Count the distance between the keys in semitones — C to D is two, C to E is four, C to G is seven. If you are matching a singer rather than a written key, start at plus or minus two and adjust from there.",
  },
  {
    question: "Why does my voice sound like a chipmunk at large shifts?",
    answer:
      "Because the vocal formants shift with the pitch. A real voice keeps its resonances fixed as it sings higher; resampling moves them, and past about five semitones the difference becomes obvious. Smaller shifts avoid it entirely.",
  },
  {
    question: "Can I shift by half a semitone or a few cents?",
    answer:
      "Not in this tool — the slider works in whole semitones, which covers musical transposition. Fine tuning by cents is a mastering task rather than a conversion one, and it needs the reference pitch of the source to be worth doing.",
  },
  {
    question: "Is my audio uploaded to a server?",
    answer:
      "No. Both the resampling and the tempo correction run in a WebAssembly build of FFmpeg in your browser. Your file is never transmitted.",
  },
];

export default function Page() {
  return (
    <ToolPageShell
      category="audio"
      slug="pitch"
      title="Pitch Shifter"
      description="Move audio up or down in semitones — the length stays exactly the same."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Audio", href: "/audio" },
        { label: "Pitch Shifter" },
      ]}
      steps={[
        "Drop in an MP3, WAV, OGG, M4A or FLAC file",
        "Choose how many semitones to shift, up or down",
        "Run it, then download the retuned audio",
      ]}
      articleContent={
        <>
          <h2>How pitch shifting works here</h2>
          <p>
            FFmpeg has no single pitch filter, so this is done in two moves. First the
            sample rate is reinterpreted — playing a recording faster raises its pitch
            exactly the way speeding up a tape does. That gets the pitch right and the
            length wrong.
          </p>
          <p>
            Then the tempo is corrected back by the inverse amount, using the same
            time-stretching filter the Audio Speed tool uses. The two changes cancel on
            duration and compound on pitch, which leaves a file the same length as the
            original at a different key.
          </p>
          <h2>Semitones, and what they mean musically</h2>
          <p>
            Twelve semitones make an octave, which is a doubling of frequency. Two
            semitones is a whole tone, seven is a perfect fifth, and five is a perfect
            fourth — the three intervals most often wanted when moving a backing track to
            suit a singer.
          </p>
          <p>
            Small shifts are the useful ones. One to three semitones is usually enough to
            bring a song into a comfortable range, and it stays clean.
          </p>
          <h2>Where it starts to sound artificial</h2>
          <p>
            This approach is resampling plus time-stretching, not a true phase vocoder.
            Past roughly five semitones the formants — the resonances that make a voice
            sound like a particular person — move along with the pitch, and voices take
            on the chipmunk quality going up or a growl going down.
          </p>
          <p>
            That is a property of the method rather than a bug, and for a full octave it
            is unavoidable. If you actually want the tape effect, with the speed changing
            too, the Audio Speed tool in tape mode is the more direct route.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <PitchShifterTool />
    </ToolPageShell>
  );
}
