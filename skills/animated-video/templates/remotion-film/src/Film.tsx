// Film shell: picks the act for the frame and mixes the VO, a room-tone floor and scene SFX.
// Add one entry per act in lib.ts ACTS; replace Placeholder with each act's scene as it is built.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ACTS, ActName, FPS, Sfx } from "./lib";
import { Placeholder } from "./scenes/Placeholder";

const SCENES: Record<ActName, React.FC<{ fr: number }>> = { hook: Placeholder, ending: Placeholder };
const SFX: Sfx[] = []; // e.g. [...hookSfx(), ...endingSfx()], each scene exporting its own list

export const Film: React.FC = () => {
  const fr = useCurrentFrame(), t = fr / FPS;
  const acts = Object.keys(ACTS) as ActName[];
  const act = acts.find((k) => t >= ACTS[k][0] && t < ACTS[k][1]) ?? acts[acts.length - 1];
  const Scene = SCENES[act];
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      <Scene fr={fr} />
      <Audio src={staticFile("vo.wav")} />
      {/* a continuous floor so pauses never fall to digital zero; make it at least as long as the film */}
      <Audio src={staticFile("roomtone.wav")} loop />
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.at}><Audio src={staticFile(`sfx/${s.src}`)} volume={s.vol ?? 0.3} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
