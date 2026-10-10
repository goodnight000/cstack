import { Easing, interpolate, spring } from "remotion";
import words from "./words.json";
import env from "./vo_env.json";

export const FPS = 30;
export type Word = { w: string; s: number; e: number };
export const WORDS = words as Word[];
const ENV = env as number[];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
// Start time (sec) of the nth occurrence of `phrase` in the VO transcript. Matching ignores punctuation,
// so a phrase said more than once needs an explicit nth; without one it would land on the first, earlier
// occurrence ("company" in "billion dollar company?" instead of "into a company").
export const cue = (phrase: string, nth?: number): number => {
  const p = phrase.split(/\s+/).map(norm), hits: number[] = [];
  for (let i = 0; i + p.length <= WORDS.length; i++) {
    if (p.every((x, j) => norm(WORDS[i + j].w) === x)) hits.push(WORDS[i].s);
  }
  if (nth === undefined && hits.length > 1) throw new Error(`cue "${phrase}" is said ${hits.length} times; pass nth`);
  const s = hits[nth ?? 0];
  if (s === undefined) throw new Error(`cue not found: ${phrase}`);
  return s;
};
export const cueEnd = (phrase: string, nth?: number): number => {
  const i = WORDS.findIndex((w) => w.s === cue(phrase, nth));
  return WORDS[i + phrase.split(/\s+/).length - 1].e;
};

export const f = (sec: number) => Math.round(sec * FPS);
export const VO_END = WORDS[WORDS.length - 1].e;
export const TOTAL = f(VO_END + 1.2);
// VO loudness 0..1 at an absolute frame (for mouth flaps when a character speaks on camera).
export const voLevel = (fr: number) => ENV[fr] ?? 0;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
export const easeInOut = Easing.bezier(0.45, 0, 0.55, 1);
// 0→1 over `dur` frames starting at frame `at`.
export const prog = (fr: number, at: number, dur = 12, e = ease) =>
  interpolate(fr, [at, at + dur], [0, 1], { ...clamp, easing: e });
export const pop = (fr: number, at: number, damping = 14) =>
  spring({ frame: fr - at, fps: FPS, config: { damping, stiffness: 180, mass: 0.7 } });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Caption chunks, authored by hand so every break falls on a sense unit. Each line must
// match the transcript word for word; a mismatch throws at load.
export type Chunk = { s: number; e: number; words: Word[] };
export const chunk = (ws: Word[], lines: string[]): Chunk[] => {
  let i = 0;
  const groups = lines.map((l) => {
    const n = l.split(/\s+/).length;
    const g = ws.slice(i, i + n);
    if (g.map((w) => norm(w.w)).join(" ") !== l.split(/\s+/).map(norm).join(" ")) throw new Error(`caption mismatch at "${l}"`);
    i += n;
    return g;
  });
  if (i !== ws.length) throw new Error(`captions cover ${i} of ${ws.length} words`);
  return groups.map((g) => {
    const last = g[g.length - 1];
    const next = ws[ws.indexOf(last) + 1];
    return { s: g[0].s, e: next ? Math.min(next.s, last.e + 0.5) : last.e + 0.8, words: g };
  });
};

// The film's acts: each owns [start, end) in seconds and one file in src/scenes/.
// Cut a beat (~0.08s) before the act's first word. Replace with your script's acts.
export const ACTS = {
  hook: [0, cue("second line first words") - 0.08],
  // ...
  ending: [cue("last line first words") - 0.08, VO_END + 1.2],
} as const;
export type ActName = keyof typeof ACTS;
export type SceneProps = { fr: number };
// A visible event worth hearing, exported by each act (src/scenes/<act>-events.ts) for the cue sheet.
// `fr` is the absolute frame it visibly happens, `dur` frames if it lasts, `x` -1..1 left to right.
export type SoundEvent = { id: string; fr: number; dur?: number; what: string; x?: number };
