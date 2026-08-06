/**
 * Lorem ipsum / random placeholder text generator.
 *
 * Deterministic word bank, random sentence and paragraph lengths. Everything
 * is assembled in memory — no external service, no seed sent anywhere.
 */

const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur", "excepteur",
  "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui",
  "officia", "deserunt", "mollit", "anim", "id", "est", "laborum",
];

const CLASSIC_OPENER = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = () => WORDS[Math.floor(Math.random() * WORDS.length)];

function makeSentence(): string {
  const length = rand(6, 15);
  const words = Array.from({ length }, pick);
  // Sprinkle in the odd comma for a more natural rhythm.
  if (length > 8) words.splice(rand(3, length - 3), 0, `${pick()},`);
  const sentence = words.join(" ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

function makeParagraph(): string {
  return Array.from({ length: rand(3, 6) }, makeSentence).join(" ");
}

export type LoremUnit = "paragraphs" | "sentences" | "words";

export function generateLorem(count: number, unit: LoremUnit, classicStart: boolean): string {
  const n = Math.max(1, Math.min(100, Math.floor(count) || 1));

  if (unit === "words") {
    const words = Array.from({ length: n }, pick);
    let text = words.join(" ");
    if (classicStart) text = `Lorem ipsum ${text}`;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  if (unit === "sentences") {
    const sentences = Array.from({ length: n }, makeSentence);
    if (classicStart) sentences[0] = `${CLASSIC_OPENER}.`;
    return sentences.join(" ");
  }

  const paragraphs = Array.from({ length: n }, makeParagraph);
  if (classicStart) paragraphs[0] = `${CLASSIC_OPENER}, ${paragraphs[0].charAt(0).toLowerCase()}${paragraphs[0].slice(1)}`;
  return paragraphs.join("\n\n");
}
