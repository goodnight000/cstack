// A modelled iPhone whose screen is a real-looking iMessage thread (dark mode) or lock screen,
// redrawn every frame from a plain state object. Fonts fall back from SF Pro to system UI.
//
//   const phone = usePhone('photo.jpg');            // in the scene component, OUTSIDE <ThreeCanvas>
//   <Phone3D assets={phone} state={{...}} />        // inside the canvas
//
// Phone3D is 1 unit wide, PHONE.h (~2.06) tall, PHONE.t thick; the screen faces +z with its glass
// at z = 0 and the origin at the centre of the screen. Scale/rotate it with a parent <group>.
// It carries its own soft screen light (prop `light`, 0 to turn it off) so a lit screen lights a
// thumb or a table; add your own key/rim lights for the body.
//
// PhoneState (everything optional except `time`):
//   mode        'thread' (default) | 'lock'
//   time        '7:02' — status bar clock (thread) and the big clock (lock)
//   stamp       the grey line above the thread, e.g. 'Today 7:02 PM' (default `Today ${time}`)
//   contact     header name and avatar initial in the thread; '' draws a blank silhouette avatar
//   messages    [{from: 'me' | 'them', text?, photo?, appear?}] — 'me' is blue on the right.
//               `appear` 0..1 animates a message in (default 1). A photo sent by 'me' flies up out
//               of the compose bar as it appears, like the real send animation.
//   compose     {photo?: 0..1, pressed?: 0..1} — photo: the picture staged in the message field
//               with the blue send arrow (1 = staged, 0 = empty field); pressed: the arrow pushed in
//   keyboard    0..1 — the keyboard slid up
//   delivered   0..1 — "Delivered" under the last message you sent
//   sending     0..1 — the thin progress line under the header while a photo uploads
//   notif       lock mode: 0..1 — the notification from `contact` with the photo thumbnail arriving
//   date        lock mode: e.g. 'Thursday, October 8' (omitted if not given)
//   brightness  0 (screen off, black glass) .. 1 (default)
//
// phoneLayout(state) gives where things are on the screen, in screen points (393 x 852):
//   {send: {x, y, r}, staged: Rect, lastPhoto: Rect | null, notif: Rect}
// and screenPoint(x, y, lift) turns a screen point into Phone3D-local [x, y, z], so a thumb can
// press the real send arrow and a card can lift off the real photo.
import React, {useEffect, useMemo, useState} from 'react';
import {settle} from './three-canvas';
import {continueRender, delayRender, staticFile} from 'remotion';
import * as THREE from 'three';

export type Msg = {from: 'me' | 'them'; text?: string; photo?: boolean; appear?: number};
export type PhoneState = {
  mode?: 'thread' | 'lock';
  time: string;
  stamp?: string;
  contact?: string;
  messages?: Msg[];
  compose?: {photo?: number; pressed?: number};
  keyboard?: number;
  delivered?: number;
  sending?: number;
  notif?: number;
  date?: string;
  brightness?: number;
};
export type Rect = {x: number; y: number; w: number; h: number};
export type PhoneAssets = {photo: HTMLImageElement};

const W = 393, H = 852; // screen points (iPhone 16)
const BH = 147.6 / 71.6, TH = 7.8 / 71.6, SW = 65.1 / 71.6, SH = SW * (H / W), SR = SW * (55 / W);
export const PHONE = {w: 1, h: BH, t: TH, screenW: SW, screenH: SH} as const;
export const screenPoint = (x: number, y: number, lift = 0): [number, number, number] => [(x / W - 0.5) * SW, (0.5 - y / H) * SH, lift];

const SF = 'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", sans-serif';
const BLUE = '#0a84ff', GREY = '#8e8e93', BUBBLE = '#262629';
const HEAD = 142, PHOTO = 232, KB = 336;
const ease = (t: number) => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// Load the phone's assets: `photo`, a file in public/ shown in photo messages, the compose field
// and the notification. Call OUTSIDE the canvas; the frame waits until it is ready.
export const usePhone = (photo: string): PhoneAssets | null => {
  const [a, setA] = useState<PhoneAssets | null>(null);
  const [handle] = useState(() => delayRender('phone assets'));
  useEffect(() => {
    const img = new Image();
    img.onload = () => { setA({photo: img}); settle(handle); };
    img.src = staticFile(photo);
  }, [handle, photo]);
  return a;
};

type G = CanvasRenderingContext2D;
let measurer: G | null = null;
const mctx = () => (measurer ??= document.createElement('canvas').getContext('2d')!);

const wrap = (g: G, text: string, max: number) => {
  const lines: string[] = [];
  let cur = '';
  text.split(' ').forEach((w) => {
    const t = cur ? `${cur} ${w}` : w;
    if (cur && g.measureText(t).width > max) { lines.push(cur); cur = w; } else cur = t;
  });
  if (cur) lines.push(cur);
  return lines;
};

type Laid = {m: Msg; lines: string[]; r: Rect; e: number};
// Where everything sits for a thread state. Messages stack up from the compose bar.
const layout = (g: G, s: PhoneState) => {
  const kb = (s.keyboard ?? 0) * KB, bottom = H - Math.max(34, kb);
  const staged = s.compose?.photo ?? 0;
  const fieldH = 36 + ease(staged) * 138;
  const field: Rect = {x: 58, y: bottom - 8 - fieldH, w: W - 58 - 16, h: fieldH};
  const stagedR: Rect = {x: field.x + 7, y: field.y + 7, w: 128, h: 128};
  const send = {x: field.x + field.w - 18, y: field.y + field.h - 18, r: 14};
  g.font = `400 17px ${SF}`;
  const laid: Laid[] = (s.messages ?? []).map((m) => {
    const e = ease(m.appear ?? 1);
    if (m.photo) return {m, lines: [], r: {x: m.from === 'me' ? W - 16 - PHOTO : 16, y: 0, w: PHOTO, h: PHOTO}, e};
    const lines = wrap(g, m.text ?? '', 250);
    const w = Math.max(...lines.map((l) => g.measureText(l).width)) + 26;
    return {m, lines, r: {x: m.from === 'me' ? W - 16 - w : 16, y: 0, w, h: 14 + lines.length * 22}, e};
  });
  // stack from the bottom; a message that is still appearing takes only part of its height
  let y = field.y - 10 - ((s.delivered ?? 0) > 0 ? 18 : 0);
  for (let i = laid.length - 1; i >= 0; i--) {
    const L = laid[i];
    L.r.y = y - L.r.h;
    const gap = i > 0 && laid[i - 1].m.from === L.m.from ? 3 : 10;
    y -= (L.r.h + gap) * L.e;
  }
  const lastPhoto = [...laid].reverse().find((L) => L.m.photo)?.r ?? null;
  return {field, staged: stagedR, send, laid, top: y, lastPhoto, kb, bottom};
};
const NOTIF = (n: number): Rect => ({x: 10, y: H - 210 + (1 - ease(n)) * 46, w: W - 20, h: 74});
export const phoneLayout = (s: PhoneState) => {
  const l = layout(mctx(), s);
  return {send: l.send, staged: l.staged, lastPhoto: l.lastPhoto, notif: NOTIF(s.notif ?? 1)};
};

const rr = (g: G, r: Rect, rad: number) => { g.beginPath(); g.roundRect(r.x, r.y, r.w, r.h, rad); };
const photoIn = (g: G, img: HTMLImageElement, r: Rect, rad: number) => {
  g.save(); rr(g, r, rad); g.clip(); g.drawImage(img, r.x, r.y, r.w, r.h); g.restore();
};
const avatar = (g: G, x: number, y: number, r: number, name: string) => {
  const gr = g.createLinearGradient(0, y - r, 0, y + r);
  gr.addColorStop(0, '#b3b8c3'); gr.addColorStop(1, '#82868e');
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  g.fillStyle = '#fff';
  if (name) {
    g.font = `500 ${r * 0.96}px ${SF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(name[0].toUpperCase(), x, y + r * 0.04);
  } else {
    g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.clip();
    g.beginPath(); g.arc(x, y - r * 0.2, r * 0.36, 0, 7); g.fill();
    g.beginPath(); g.ellipse(x, y + r * 0.92, r * 0.68, r * 0.56, 0, 0, 7); g.fill();
    g.restore();
  }
};
const statusBar = (g: G, time: string | null) => {
  g.fillStyle = '#fff'; g.textBaseline = 'middle';
  if (time) { g.font = `600 17px ${SF}`; g.textAlign = 'center'; g.fillText(time, 52, 24); }
  [4, 6.5, 9, 11.5].forEach((h, i) => { g.beginPath(); g.roundRect(288 + i * 5, 30 - h, 3.2, h, 1); g.fill(); });
  g.font = `600 14px ${SF}`; g.textAlign = 'left'; g.fillText('5G', 311, 24.5);
  g.globalAlpha = 0.45; g.lineWidth = 1; g.strokeStyle = '#fff'; g.beginPath(); g.roundRect(335.5, 18, 25, 12, 3.8); g.stroke();
  g.beginPath(); g.roundRect(362, 21.5, 1.6, 5, 1); g.fill();
  g.globalAlpha = 1; g.beginPath(); g.roundRect(337.5, 20, 16, 8, 2); g.fill();
  // Dynamic Island with its camera lens
  g.fillStyle = '#000'; g.beginPath(); g.roundRect((W - 124) / 2, 11, 124, 36, 18); g.fill();
  g.fillStyle = '#0c0d18'; g.beginPath(); g.arc(W / 2 + 40, 29, 5.5, 0, 7); g.fill();
  g.fillStyle = '#1b2140'; g.beginPath(); g.arc(W / 2 + 41.5, 27.5, 1.6, 0, 7); g.fill();
};
const homeBar = (g: G) => { g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.roundRect((W - 138) / 2, H - 13, 138, 5, 2.5); g.fill(); };

const keyboard = (g: G, top: number) => {
  g.fillStyle = '#1f1f21'; g.fillRect(0, top, W, H - top + 400);
  const key = (x: number, y: number, w: number, label: string, special = false, size = 22) => {
    g.fillStyle = 'rgba(0,0,0,0.5)'; g.beginPath(); g.roundRect(x, y + 1, w, 42, 5.5); g.fill();
    g.fillStyle = special ? '#3d3d40' : '#6a6a6d'; g.beginPath(); g.roundRect(x, y, w, 42, 5.5); g.fill();
    g.fillStyle = '#fff'; g.font = `400 ${size}px ${SF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(label, x + w / 2, y + 20);
  };
  const kw = 33.3, gap = 6, y0 = top + 53;
  [...'qwertyuiop'].forEach((c, i) => key(3 + i * (kw + gap), y0, kw, c));
  [...'asdfghjkl'].forEach((c, i) => key(22.6 + i * (kw + gap), y0 + 54, kw, c));
  key(3, y0 + 108, 43, '⇧', true, 19);
  [...'zxcvbnm'].forEach((c, i) => key(61.9 + i * (kw + gap), y0 + 108, kw, c));
  key(W - 46, y0 + 108, 43, '⌫', true, 18);
  key(3, y0 + 162, 88, '123', true, 16);
  key(97, y0 + 162, 199, 'space', false, 16);
  key(W - 91, y0 + 162, 88, 'return', true, 16);
  // emoji and dictation glyphs under the keys
  g.strokeStyle = '#8f8f94'; g.lineWidth = 1.8; g.lineCap = 'round';
  g.beginPath(); g.arc(35, top + 292, 12, 0, 7); g.stroke();
  g.beginPath(); g.arc(35, top + 293, 6.5, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
  g.fillStyle = '#8f8f94'; [-4.5, 4.5].forEach((d) => { g.beginPath(); g.arc(35 + d, top + 288, 1.5, 0, 7); g.fill(); });
  g.beginPath(); g.roundRect(W - 40, top + 279, 9, 17, 4.5); g.stroke();
  g.beginPath(); g.arc(W - 35.5, top + 290, 9, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke();
  g.beginPath(); g.moveTo(W - 35.5, top + 299); g.lineTo(W - 35.5, top + 305); g.stroke();
};

const thread = (g: G, s: PhoneState, a: PhoneAssets) => {
  const L = layout(g, s);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  // messages (clipped under the header)
  g.save(); g.beginPath(); g.rect(0, HEAD, W, L.field.y - HEAD + 4); g.clip();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = GREY;
  g.font = `600 11px ${SF}`; g.fillText('iMessage', W / 2, L.top - 30);
  g.font = `400 11px ${SF}`; g.fillText(s.stamp ?? `Today ${s.time}`, W / 2, L.top - 16);
  L.laid.forEach(({m, lines, r, e}) => {
    if (e <= 0) return;
    const me = m.from === 'me';
    if (m.photo) {
      const from = me && e < 1 ? L.staged : r;
      const q: Rect = {x: mix(from.x, r.x, e), y: mix(from.y + (me ? 0 : 20), r.y, e), w: mix(from.w, r.w, e), h: mix(from.h, r.h, e)};
      g.globalAlpha = me ? 1 : e;
      photoIn(g, a.photo, q, mix(12, 18, e));
      g.globalAlpha = 1;
      return;
    }
    g.save();
    g.globalAlpha = Math.min(1, e * 2);
    const ox = me ? r.x + r.w : r.x, oy = r.y + r.h, sc = 0.6 + 0.4 * e;
    g.translate(ox, oy + (1 - e) * 26); g.scale(sc, sc); g.translate(-ox, -oy);
    if (me) {
      const gr = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      gr.addColorStop(0, '#2b93ff'); gr.addColorStop(1, '#0a7cff');
      g.fillStyle = gr;
    } else g.fillStyle = BUBBLE;
    rr(g, r, 18); g.fill();
    // the tail
    const X = me ? r.x + r.w : r.x, Y = r.y + r.h, d = me ? 1 : -1;
    g.beginPath(); g.moveTo(X - 13 * d, Y); g.quadraticCurveTo(X - 1 * d, Y + 0.6, X + 6 * d, Y);
    g.quadraticCurveTo(X + 0.6 * d, Y - 3.5, X, Y - 15); g.closePath(); g.fill();
    g.fillStyle = '#fff'; g.font = `400 17px ${SF}`; g.textAlign = 'left'; g.textBaseline = 'middle';
    lines.forEach((l, i) => g.fillText(l, r.x + 13, r.y + 18.5 + i * 22));
    g.restore();
  });
  if ((s.delivered ?? 0) > 0) {
    g.globalAlpha = s.delivered!; g.fillStyle = GREY; g.font = `600 11px ${SF}`; g.textAlign = 'right'; g.textBaseline = 'middle';
    g.fillText('Delivered', W - 18, L.field.y - 17); g.globalAlpha = 1;
  }
  g.restore();
  // header
  g.fillStyle = 'rgba(22,22,24,0.96)'; g.fillRect(0, 0, W, HEAD);
  g.fillStyle = 'rgba(84,84,88,0.55)'; g.fillRect(0, HEAD - 0.5, W, 0.5);
  statusBar(g, s.time);
  g.strokeStyle = BLUE; g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(26, 73); g.lineTo(16, 84); g.lineTo(26, 95); g.stroke();
  g.lineWidth = 2; g.beginPath(); g.roundRect(337, 76, 22, 16, 4.5); g.stroke();
  g.beginPath(); g.moveTo(361.5, 81); g.lineTo(371, 76.5); g.lineTo(371, 91.5); g.lineTo(361.5, 87); g.stroke();
  avatar(g, W / 2, 80, 25, s.contact ?? '');
  if (s.contact) {
    g.fillStyle = '#fff'; g.font = `400 11px ${SF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(s.contact, W / 2 - 3, 121);
    const nw = g.measureText(s.contact).width;
    g.strokeStyle = GREY; g.lineWidth = 1.2; g.beginPath(); g.moveTo(W / 2 + nw / 2 + 1, 118); g.lineTo(W / 2 + nw / 2 + 4, 121); g.lineTo(W / 2 + nw / 2 + 1, 124); g.stroke();
  }
  const sending = s.sending ?? 0;
  if (sending > 0 && sending < 1) { g.fillStyle = BLUE; g.fillRect(0, HEAD, W * sending, 2.5); }
  // compose bar
  g.fillStyle = '#000'; g.fillRect(0, L.field.y - 8, W, H);
  g.fillStyle = '#1e1e20'; g.beginPath(); g.arc(33, L.field.y + L.field.h - 18, 17, 0, 7); g.fill();
  g.strokeStyle = '#9a9aa0'; g.lineWidth = 2; g.lineCap = 'round';
  g.beginPath(); g.moveTo(26, L.field.y + L.field.h - 18); g.lineTo(40, L.field.y + L.field.h - 18); g.moveTo(33, L.field.y + L.field.h - 25); g.lineTo(33, L.field.y + L.field.h - 11); g.stroke();
  g.strokeStyle = '#3a3a3c'; g.lineWidth = 1; rr(g, L.field, 18); g.stroke();
  const staged = s.compose?.photo ?? 0;
  if (staged > 0.02) {
    g.globalAlpha = Math.min(1, staged * 1.5);
    photoIn(g, a.photo, L.staged, 12);
    g.fillStyle = 'rgba(60,60,64,0.95)'; g.beginPath(); g.arc(L.staged.x + L.staged.w - 13, L.staged.y + 13, 9.5, 0, 7); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(L.staged.x + L.staged.w - 16.5, L.staged.y + 9.5); g.lineTo(L.staged.x + L.staged.w - 9.5, L.staged.y + 16.5);
    g.moveTo(L.staged.x + L.staged.w - 9.5, L.staged.y + 9.5); g.lineTo(L.staged.x + L.staged.w - 16.5, L.staged.y + 16.5); g.stroke();
    const p = s.compose?.pressed ?? 0, r = L.send.r * (1 - 0.14 * p);
    g.fillStyle = p > 0 ? '#3d9bff' : BLUE; g.beginPath(); g.arc(L.send.x, L.send.y, r, 0, 7); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 2.4; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(L.send.x, L.send.y + 6); g.lineTo(L.send.x, L.send.y - 6); g.moveTo(L.send.x - 5.5, L.send.y - 1); g.lineTo(L.send.x, L.send.y - 6.5); g.lineTo(L.send.x + 5.5, L.send.y - 1); g.stroke();
    g.globalAlpha = 1;
  } else {
    g.fillStyle = '#5b5b60'; g.font = `400 17px ${SF}`; g.textAlign = 'left'; g.textBaseline = 'middle';
    g.fillText('iMessage', L.field.x + 13, L.field.y + 18.5);
    const mx = L.field.x + L.field.w - 20, my = L.field.y + 18;
    g.strokeStyle = '#8f8f94'; g.lineWidth = 1.6;
    g.beginPath(); g.roundRect(mx - 3.5, my - 9, 7, 12, 3.5); g.stroke();
    g.beginPath(); g.arc(mx, my, 7, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke();
    g.beginPath(); g.moveTo(mx, my + 7); g.lineTo(mx, my + 10.5); g.stroke();
  }
  if (L.kb > 34) keyboard(g, H - L.kb);
  homeBar(g);
};

const lock = (g: G, s: PhoneState, a: PhoneAssets) => {
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0b1a52'); bg.addColorStop(0.55, '#060d2e'); bg.addColorStop(1, '#01030c');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  ([[90, 300, 320, 'rgba(60,120,255,0.38)'], [330, 560, 300, 'rgba(120,80,255,0.22)'], [140, 760, 260, 'rgba(0,160,220,0.16)']] as [number, number, number, string][]).forEach(([x, y, r, c]) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  });
  statusBar(g, null);
  // the small padlock, the date and the big clock
  g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = 2;
  g.beginPath(); g.arc(W / 2, 70, 4.6, Math.PI, 0); g.lineTo(W / 2 + 4.6, 74); g.moveTo(W / 2 - 4.6, 70); g.lineTo(W / 2 - 4.6, 74); g.stroke();
  g.beginPath(); g.roundRect(W / 2 - 7, 73, 14, 11, 3); g.fill();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `600 21px ${SF}`; g.globalAlpha = 0.92; if (s.date) g.fillText(s.date, W / 2, 116);
  g.font = `600 100px ${SF}`; g.globalAlpha = 0.96; g.fillText(s.time, W / 2, 184); g.globalAlpha = 1;
  // flashlight and camera buttons
  [[62, 0], [W - 62, 1]].forEach(([x, cam]) => {
    g.fillStyle = 'rgba(70,74,92,0.55)'; g.beginPath(); g.arc(x, H - 84, 25, 0, 7); g.fill();
    g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = 1.8; g.lineJoin = 'round';
    if (cam) {
      g.beginPath(); g.roundRect(x - 11, H - 91, 22, 15, 3.5); g.stroke();
      g.beginPath(); g.arc(x, H - 83.5, 4.2, 0, 7); g.stroke();
      g.beginPath(); g.roundRect(x - 4, H - 94.5, 8, 4, 1.5); g.fill();
    } else {
      g.beginPath(); g.moveTo(x - 6, H - 96); g.lineTo(x + 6, H - 96); g.lineTo(x + 6, H - 91); g.lineTo(x + 3.2, H - 87); g.lineTo(x + 3.2, H - 72); g.lineTo(x - 3.2, H - 72); g.lineTo(x - 3.2, H - 87); g.lineTo(x - 6, H - 91); g.closePath(); g.stroke();
    }
  });
  const n = s.notif ?? 0;
  if (n > 0) {
    const r = NOTIF(n), e = ease(n);
    g.save(); g.globalAlpha = Math.min(1, e * 1.6);
    g.translate(r.x + r.w / 2, r.y + r.h / 2); g.scale(0.94 + 0.06 * e, 0.94 + 0.06 * e); g.translate(-r.x - r.w / 2, -r.y - r.h / 2);
    g.fillStyle = 'rgba(58,62,84,0.82)'; rr(g, r, 24); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.10)'; g.lineWidth = 1; g.stroke();
    avatar(g, r.x + 33, r.y + r.h / 2, 19, s.contact ?? '');
    // the Messages badge on the avatar
    g.fillStyle = '#34c759'; g.beginPath(); g.roundRect(r.x + 41, r.y + r.h / 2 + 6, 16, 16, 4.5); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(r.x + 49, r.y + r.h / 2 + 13.4, 5.2, 4.3, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(r.x + 45, r.y + r.h / 2 + 16); g.lineTo(r.x + 44.4, r.y + r.h / 2 + 19); g.lineTo(r.x + 48, r.y + r.h / 2 + 17.4); g.fill();
    g.fillStyle = '#fff'; g.textAlign = 'left'; g.textBaseline = 'middle';
    g.font = `600 15px ${SF}`; g.fillText(s.contact ?? '', r.x + 66, r.y + 26);
    g.font = `400 15px ${SF}`; g.globalAlpha *= 0.92; g.fillText('Attachment: 1 Image', r.x + 66, r.y + 47);
    g.fillStyle = 'rgba(235,235,245,0.6)'; g.font = `400 13px ${SF}`; g.textAlign = 'right'; g.fillText('now', r.x + r.w - 62, r.y + 26);
    g.globalAlpha = Math.min(1, e * 1.6);
    photoIn(g, a.photo, {x: r.x + r.w - 52, y: r.y + r.h / 2 - 19, w: 38, h: 38}, 8);
    g.restore();
  }
  homeBar(g);
};

// Paint the screen for a state into a canvas context that is `res` px per screen point.
export const drawPhoneScreen = (g: G, s: PhoneState, a: PhoneAssets, res: number) => {
  g.save(); g.setTransform(res, 0, 0, res, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  if (s.mode === 'lock') lock(g, s, a); else thread(g, s, a);
  const b = s.brightness ?? 1;
  if (b < 1) { g.fillStyle = `rgba(0,0,0,${1 - b})`; g.fillRect(0, 0, W, H); }
  g.restore();
};

const rrShape = (w: number, h: number, r: number) => {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
};

// The iPhone. See the header of this file for the state and the coordinate convention.
// `res`: screen pixels per point (2 is sharp for a phone up to ~800 px wide on screen; use 3 for
// close-ups). `light`: strength of the light the screen throws (0 = none). `glare`: glass sheen.
export const Phone3D = ({assets, state, res = 2, light = 1, glare = 0.07}: {assets: PhoneAssets | null; state: PhoneState; res?: number; light?: number; glare?: number}) => {
  const parts = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = W * res; canvas.height = H * res;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.generateMipmaps = true;
    const b = 0.02, R = SR + (1 - SW) / 2;
    const body = new THREE.ExtrudeGeometry(rrShape(1 - 2 * b, BH - 2 * b, R - b), {depth: TH - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 6, curveSegments: 20});
    body.translate(0, 0, -TH + b - 0.004);
    const glass = new THREE.ShapeGeometry(rrShape(0.958, BH - 0.042, R - 0.021), 20); // leaves the metal band showing around it
    glass.translate(0, 0, -0.002);
    const screen = new THREE.ShapeGeometry(rrShape(SW, SH, SR), 20);
    const p = screen.attributes.position, uv = screen.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / SW + 0.5, p.getY(i) / SH + 0.5);
    // a diagonal sheen across the glass
    const gc = document.createElement('canvas'); gc.width = gc.height = 128;
    const gg = gc.getContext('2d')!, gr = gg.createLinearGradient(0, 128, 128, 0);
    gr.addColorStop(0.3, 'rgba(255,255,255,0)'); gr.addColorStop(0.52, 'rgba(255,255,255,1)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.15)'); gr.addColorStop(0.75, 'rgba(255,255,255,0)');
    gg.fillStyle = gr; gg.fillRect(0, 0, 128, 128);
    return {
      canvas, tex, body, glass, screen,
      frame: new THREE.MeshStandardMaterial({color: '#8b909c', metalness: 0.6, roughness: 0.3, emissive: '#1b1e28'}),
      black: new THREE.MeshStandardMaterial({color: '#030305', metalness: 0.2, roughness: 0.16}),
      // polygonOffset keeps the screen in front of the glass at any scale (a phone at true size is 0.07 units wide)
      lit: new THREE.MeshBasicMaterial({map: tex, toneMapped: false, fog: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2}),
      sheen: new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(gc), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4}),
    };
  }, [res]);
  if (assets) {
    drawPhoneScreen(parts.canvas.getContext('2d')!, state, assets, res);
    parts.tex.needsUpdate = true;
  }
  parts.sheen.opacity = glare;
  const b = state.brightness ?? 1;
  const lum = b * (state.mode === 'lock' ? 0.55 + 0.45 * (state.notif ?? 0) : 0.35 + 0.45 * Math.max(0, ...(state.messages ?? []).map((m) => (m.photo ? m.appear ?? 1 : 0)), state.compose?.photo ?? 0));
  const btn = (x: number, y: number, h: number) => (
    <mesh position={[x, y, -TH / 2]} material={parts.frame}>
      <boxGeometry args={[0.014, h, 0.034]} />
    </mesh>
  );
  return (
    <group>
      <mesh geometry={parts.body} material={parts.frame} />
      <mesh geometry={parts.glass} material={parts.black} />
      <mesh geometry={parts.screen} material={parts.lit} />
      <mesh geometry={parts.screen} material={parts.sheen} position={[0, 0, 0.0015]} />
      {btn(-0.503, 0.66, 0.07)}{btn(-0.503, 0.49, 0.13)}{btn(-0.503, 0.32, 0.13)}{btn(0.503, 0.42, 0.21)}{btn(0.503, -0.3, 0.15)}
      {light > 0 ? <pointLight position={[0, 0.1, 0.55]} color={state.mode === 'lock' ? '#8fb0ff' : '#b9c8ff'} intensity={light * lum * 2.2} distance={7} decay={2} /> : null}
    </group>
  );
};
