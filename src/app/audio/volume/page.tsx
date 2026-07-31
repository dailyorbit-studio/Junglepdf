import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import VolumeTool from "./VolumeTool";

export const metadata: Metadata = toolMetadata({
  category: "audio",
  slug: "volume",
  title: "Change Audio Volume & Add Fades — Free Online Tool",
  description:
    "Raise or lower the volume of an audio file, normalise it, and add fade-in and fade-out. Runs entirely in your browser — no uploads.",
});

const FAQ_ITEMS = [
  {
    question: "What does normalise do that the volume slider doesn't?",
    answer:
      "It measures the loudest sample in your file and works out exactly how much gain fits before anything would clip, then applies that. The slider makes you guess; normalise calculates. If your goal is simply 'as loud as it can safely go', normalise gets you there in one step and cannot overshoot.",
  },
  {
    question: "What is clipping and why does it matter?",
    answer:
      "Digital audio has a hard ceiling — full scale. Multiplying a sample past that ceiling means the value has to be cut off, and the flattened waveform that results sounds like harsh distortion, most obviously on drums and vocals. The tool measures your file's peak up front, warns you before you commit to a gain that would clip, and reports afterwards if any samples were affected.",
  },
  {
    question: "Is this the same as loudness normalisation (LUFS)?",
    answer:
      "No. This is peak normalisation: it scales the file so its single loudest sample sits just under full scale. Loudness normalisation targets perceived average loudness instead, which is what streaming platforms use and what makes tracks feel equally loud. Peak normalisation is the right tool for making a quiet recording usable; it is not the right tool for matching several tracks to each other.",
  },
  {
    question: "Why are the fades linear rather than curved?",
    answer:
      "Because for a fade to and from silence, linear is what people expect to hear. Equal-power and logarithmic curves exist to solve a different problem — crossfading two sources so their combined level stays constant. Applying one to a simple fade-in makes it feel like it starts abruptly.",
  },
  {
    question: "Why is the output a WAV?",
    answer:
      "Because encoding to MP3 would put your audio through a lossy encoder you did not ask for, on top of whatever the source already carried. WAV holds exactly the samples that came out of the processing. If you want a compressed file, run the result through the Audio Converter so the encode happens once, deliberately.",
  },
  {
    question: "Is my audio uploaded anywhere?",
    answer:
      "No. The file is decoded and processed sample by sample through the Web Audio API in your browser. Nothing is transmitted.",
  },
];

export default function VolumePage() {
  return (
    <ToolPageShell
      category="audio"
      slug="volume"
      title="Volume & Fade"
      description="Turn a track up or down, normalise it to the loudest safe level, and add fades at either end. Nothing gets uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Audio", href: "/audio" },
        { label: "Volume & Fade" },
      ]}
      articleContent={
        <>
          <h2>Gain, measured rather than guessed</h2>
          <p>
            Changing volume digitally means multiplying every sample by a
            constant. That part is trivial. The interesting question is which
            constant, and the answer depends on how loud the file already is —
            which is why this tool measures your file&apos;s peak level while
            decoding it and shows you the number before you touch anything.
          </p>
          <p>
            A recording peaking at 30% of full scale has plenty of room: you
            can more than triple it. One already peaking at 95% has almost
            none. The same slider position means completely different things in
            those two cases, and knowing the peak turns the adjustment from a
            guess into a decision.
          </p>
          <h2>Decibels and why the scale feels odd</h2>
          <p>
            The readout is in decibels because human hearing is logarithmic.
            Doubling a signal&apos;s amplitude is +6 dB, and halving it is −6
            dB — the same perceived step in both directions, which a linear
            multiplier does not give you.
          </p>
          <p>
            A useful reference: 3 dB is roughly the smallest change most people
            notice on music, 6 dB is clearly audible, and 10 dB is commonly
            described as about twice as loud. If a recording sounds slightly
            quiet, you are usually looking for 3 to 6 dB rather than doubling.
          </p>
          <h2>Clipping</h2>
          <p>
            Samples are stored in a fixed range, and there is nothing above the
            top of it. When gain pushes a sample past full scale the value has
            to be truncated, flattening the top of the waveform. That flattening
            introduces harmonics that were never in the recording, heard as a
            harsh crackle or fuzz — worst on transients such as drum hits and
            consonants.
          </p>
          <p>
            Clipping is permanent. The samples that were cut off cannot be
            recovered by turning the file back down afterwards, which is why
            the warning appears before processing rather than after.
          </p>
          <h2>Peak normalisation and its limits</h2>
          <p>
            Normalising computes the exact gain that puts the loudest sample
            just below full scale, and applies it. For a quiet recording that
            needs to be usable, this is the correct one-click answer.
          </p>
          <p>
            What it will not do is make several files sound equally loud. Peak
            level and perceived loudness are only loosely related — a
            heavily-compressed pop track and a sparse acoustic recording can
            share an identical peak while one sounds obviously louder.
            Matching perceived loudness requires measuring in LUFS and is a
            different operation.
          </p>
          <h2>Fades</h2>
          <p>
            A fade multiplies by a ramp instead of a constant: from zero up to
            full over the fade-in, and back down over the fade-out. Even half a
            second at each end removes the click that an abrupt start or stop
            produces when a waveform is cut mid-cycle.
          </p>
          <p>
            Longer fades are an editorial choice — two or three seconds reads
            as a deliberate ending on music, while anything over about five
            starts to feel like the track is drifting away.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <VolumeTool />
    </ToolPageShell>
  );
}
