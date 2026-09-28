// HTML camera: <Camera> draws SVG, so HTML content (KaTeX equations, flex-laid-out labels) goes in a
// <World> driven by the same camAt() keys, and moves with the scene. Place things in world coordinates.
import React from "react";
import { W, H } from "../lib";
import { camAt, Key } from "./camera";

export const World: React.FC<{ fr: number; keys: Key[]; children: React.ReactNode }> = ({ fr, keys, children }) => {
  const c = camAt(fr, keys);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", width: W, height: H, transformOrigin: "0 0",
        transform: `translate(${W / 2}px, ${H / 2}px) scale(${c.zoom}) rotate(${c.rot}deg) translate(${-c.x}px, ${-c.y}px)` }}>
        {children}
      </div>
    </div>
  );
};

// Absolutely placed box centred on world point (x, y).
export const At: React.FC<{ x: number; y: number; o?: number; s?: number; children: React.ReactNode }> = ({ x, y, o = 1, s = 1, children }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, opacity: o, whiteSpace: "nowrap" }}>{children}</div>
);
