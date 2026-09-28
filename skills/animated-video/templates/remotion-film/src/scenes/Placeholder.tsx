// Walking-skeleton scene: the act name and the words being spoken, so the whole film renders end to end.
import React from "react";
import { AbsoluteFill } from "remotion";
import { ACTS, FPS, WORDS } from "../lib";

export const Placeholder: React.FC<{ fr: number }> = ({ fr }) => {
  const t = fr / FPS;
  const act = Object.keys(ACTS).find((k) => t >= ACTS[k as keyof typeof ACTS][0] && t < ACTS[k as keyof typeof ACTS][1]);
  const line = WORDS.filter((w) => w.s <= t + 1.5 && w.e >= t - 1.5).map((w) => w.w).join(" ");
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", color: "#ddd", fontFamily: "sans-serif", gap: 24 }}>
      <div style={{ fontSize: 28, opacity: 0.5 }}>{act}</div>
      <div style={{ fontSize: 48, maxWidth: "80%", textAlign: "center" }}>{line}</div>
    </AbsoluteFill>
  );
};
