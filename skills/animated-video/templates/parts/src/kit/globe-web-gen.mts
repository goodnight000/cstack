// @ts-nocheck -- a Node build script (node src/kit/globe-web-gen.mts), not part of the film's type check.
// Bakes the illustrative undersea cable web used by <CableWeb> into globe-web-data.ts.
//   node src/kit/globe-web-gen.mts [debug.ppm]      (needs ffmpeg on PATH to decode the day map)
// Nothing here is a real cable: landing points are coastal cities picked from general geography,
// the links between them are invented (hand-written coastal chains, pseudo-random long hauls
// between regions, nearest-neighbour festoons), and every link is routed through the sea on a
// 0.5-degree grid whose land mask is read off public/earth_day.jpg. Not imported by the film.
import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {join} from 'node:path';

type V = [number, number, number];
const D = Math.PI / 180;
const W = 720, H = 360, CELL = 360 / W, SS = 4;
const vec = (lat: number, lon: number): V => [Math.cos(lat * D) * Math.cos(lon * D), Math.cos(lat * D) * Math.sin(lon * D), Math.sin(lat * D)];
const toLL = (v: V): [number, number] => [Math.asin(Math.max(-1, Math.min(1, v[2]))) / D, Math.atan2(v[1], v[0]) / D];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const ang = (a: V, b: V) => Math.acos(Math.max(-1, Math.min(1, dot(a, b))));
const norm = (v: V): V => { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; };
const mix = (a: V, b: V, t: number): V => norm([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
const slerp = (a: V, b: V, t: number): V => { const w = ang(a, b); if (w < 1e-9) return a; const s = Math.sin(w), p = Math.sin((1 - t) * w) / s, q = Math.sin(t * w) / s; return [a[0] * p + b[0] * q, a[1] * p + b[1] * q, a[2] * p + b[2] * q]; };
const cellOf = (v: V) => { const [lat, lon] = toLL(v); return Math.min(H - 1, Math.max(0, Math.floor((90 - lat) / CELL))) * W + ((Math.floor((lon + 180) / CELL) % W) + W) % W; };
const cellVec = (i: number) => vec(90 - (Math.floor(i / W) + 0.5) * CELL, -180 + ((i % W) + 0.5) * CELL);
// Deterministic 0..1 from a string (the bake must give the same web every time).
const rnd = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); h ^= h >>> 15; h = Math.imul(h, 2246822507); h ^= h >>> 13; h = Math.imul(h, 3266489909); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

/* ---------- land mask from the day map ---------- */
const root = join(import.meta.dirname, '../..');
const raw = execFileSync('ffmpeg', ['-loglevel', 'error', '-i', join(root, 'public/earth_day.jpg'), '-vf', `scale=${W * SS}:${H * SS}:flags=area`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], {maxBuffer: 1 << 28});
const fine = new Uint8Array(W * SS * H * SS); // 1 = land at 1/8 degree, used only to verify the result
for (let i = 0; i < fine.length; i++) { const r = raw[i * 3], g = raw[i * 3 + 1], b = raw[i * 3 + 2]; fine[i] = Math.max(1.35 * r, 0.9 * g) - b > 0 ? 1 : 0; }
const land = new Uint8Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  let n = 0;
  for (let j = 0; j < SS; j++) for (let i = 0; i < SS; i++) n += fine[(y * SS + j) * W * SS + x * SS + i];
  const lat = 90 - (y + 0.5) * CELL;
  land[y * W + x] = n >= 2 || lat > 72 || lat < -58 ? 1 : 0; // no polar routes
}
// Straits and canals narrower than a cell, opened by hand so the famous routes exist.
const carve = (pts: [number, number][]) => { for (let k = 0; k + 1 < pts.length; k++) { const a = vec(...pts[k]), b = vec(...pts[k + 1]); for (let t = 0; t <= 1; t += 0.01) land[cellOf(mix(a, b, t))] = 0; } };
[
  [[35.95, -6.6], [36.0, -4.6]], // Gibraltar
  [[27.4, 34.0], [29.6, 32.6], [30.3, 32.4], [31.6, 32.3]], // Gulf of Suez and the canal
  [[11.9, 44.0], [12.6, 43.4], [13.6, 42.6]], // Bab-el-Mandeb
  [[6.0, 97.8], [3.4, 100.4], [1.9, 102.4], [1.15, 103.6], [1.25, 104.6]], // Malacca and Singapore straits
  [[50.3, 0.2], [51.0, 1.5], [51.7, 2.4]], // Dover
  [[39.6, 25.6], [40.3, 26.5], [40.7, 27.6], [40.9, 28.9], [41.5, 29.2]], // Dardanelles and Bosporus
  [[57.6, 11.2], [56.3, 12.2], [55.5, 12.8], [54.7, 12.9]], // Oresund
  [[25.6, 57.0], [26.5, 56.5], [26.2, 55.4]], // Hormuz
  [[-5.5, 106.2], [-6.6, 105.0]], // Sunda
  [[-8.0, 115.8], [-9.2, 115.6]], // Lombok
  [[28.0, 34.6], [29.4, 34.9]], // Gulf of Aqaba
] .forEach((p) => carve(p as [number, number][]));

// Distance to land in cells (0 = land), 8-connected, capped.
const dist = new Uint8Array(W * H).fill(255);
{
  let q: number[] = [];
  for (let i = 0; i < W * H; i++) if (land[i]) { dist[i] = 0; q.push(i); }
  for (let d = 1; d <= 8 && q.length; d++) {
    const nq: number[] = [];
    for (const i of q) { const x = i % W, y = Math.floor(i / W); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const yy = y + dy; if (yy < 0 || yy >= H) continue; const j = yy * W + (x + dx + W) % W; if (dist[j] === 255) { dist[j] = d; nq.push(j); } } }
    q = nq;
  }
  for (let i = 0; i < W * H; i++) if (dist[i] === 255) dist[i] = 9;
}

/* ---------- landing points (lat, lon), by region ---------- */
const HUB: Record<string, [number, number]> = {
  // East Asia
  sha: [31.23, 121.47], qin: [36.07, 120.38], dal: [38.92, 121.63], tia: [38.98, 117.75], sht: [23.35, 116.72], hkg: [22.25, 114.17], xia: [24.45, 118.08], fuz: [25.95, 119.65], hai: [20.05, 110.33],
  tam: [25.18, 121.42], tou: [24.85, 121.83], fan: [22.35, 120.58], bus: [35.1, 129.04], tae: [36.75, 126.13], jej: [33.5, 126.53],
  chi: [34.95, 139.95], shi: [34.33, 136.85], kit: [36.8, 140.75], sen: [38.27, 141.0], fuk: [33.6, 130.38], kag: [31.55, 130.55], oki: [26.33, 127.8], nao: [37.17, 138.25], ish: [43.23, 141.33], kus: [42.98, 144.38],
  vla: [42.82, 132.88], sak: [46.63, 142.78], mag: [59.55, 150.8], pet: [53.02, 158.65],
  // South-East Asia and the western Pacific
  bat: [13.75, 121.05], lun: [16.62, 120.32], dav: [7.07, 125.61], ceb: [10.3, 123.9], dan: [16.07, 108.22], qui: [13.77, 109.23], vun: [10.35, 107.08], sih: [10.62, 103.52], sri: [13.17, 100.93], son: [7.2, 100.6], sat: [6.62, 100.07],
  sin: [1.3, 103.85], tua: [1.32, 103.63], mel: [2.2, 102.25], pen: [5.42, 100.33], kua: [3.82, 103.33], mer: [2.43, 103.83], kki: [5.98, 116.07], kuc: [1.56, 110.35], bru: [4.93, 114.93],
  jak: [-6.1, 106.83], btm: [1.13, 104.05], sur: [-7.2, 112.75], med: [3.78, 98.68], pad: [-0.95, 100.35], mak: [-5.13, 119.42], mnd: [1.49, 124.84], bal: [-8.68, 115.22], blk: [-1.27, 116.83], jay: [-2.53, 140.72], amb: [-3.7, 128.18], kup: [-10.17, 123.58], dil: [-8.55, 125.57],
  yan: [16.85, 94.4], gua: [13.47, 144.75], sai: [15.18, 145.75], plu: [7.35, 134.47], yap: [9.51, 138.12], chu: [7.45, 151.85], poh: [6.97, 158.21], kwa: [8.72, 167.73], maj: [7.1, 171.37], tar: [1.33, 172.98], pom: [-9.48, 147.15], mad: [-5.21, 145.8],
  // South Asia
  che: [13.08, 80.29], mum: [19.08, 72.82], koc: [9.97, 76.24], tut: [8.8, 78.15], viz: [17.7, 83.3], dig: [21.63, 87.52], col: [6.93, 79.85], mat: [5.95, 80.55], mle: [4.17, 73.51], kar: [24.82, 66.98], gwa: [25.12, 62.33], cox: [21.43, 91.98],
  // Middle East
  fuj: [25.12, 56.35], dub: [25.27, 55.3], mus: [23.6, 58.55], sal: [17.0, 54.1], doh: [25.3, 51.55], kuw: [29.35, 48.0], bah: [26.22, 50.6], bnd: [27.18, 56.27],
  jed: [21.5, 39.17], ynb: [24.08, 38.05], ade: [12.8, 45.0], dji: [11.6, 43.15], psu: [19.6, 37.22], aqa: [29.52, 35.0], sue: [29.95, 32.55], ale: [31.2, 29.9], psa: [31.27, 32.3], tel: [32.08, 34.77], bei: [33.9, 35.5], cyp: [34.7, 33.3], ist: [41.0, 28.95], mrm: [36.85, 28.27],
  // Mediterranean and Europe
  mrs: [43.3, 5.37], gen: [44.4, 8.93], plm: [38.12, 13.36], maz: [37.65, 12.59], cat: [37.5, 15.09], bar: [41.12, 16.87], ath: [37.94, 23.64], cha: [35.51, 24.02], bcn: [41.38, 2.18], vlc: [39.47, -0.33], mlt: [35.9, 14.5], tri: [32.9, 13.19], biz: [37.27, 9.87], alg: [36.77, 3.06], ann: [36.9, 7.77], ora: [35.7, -0.63], ben: [32.12, 20.07],
  lis: [38.68, -9.34], sns: [37.95, -8.87], bil: [43.35, -3.0], vig: [42.24, -8.72], con: [36.28, -6.09], asi: [35.47, -6.03], cas: [33.6, -7.62],
  bud: [50.83, -4.55], por: [50.04, -5.65], hig: [51.22, -2.98], low: [52.48, 1.75], sou: [53.65, -3.02], dbl: [53.35, -6.2], cor: [51.85, -8.3], kil: [54.21, -9.22], edi: [56.0, -2.5],
  shr: [46.72, -1.95], pnm: [47.8, -4.37], lan: [48.73, -3.46], lep: [44.87, -1.2], kat: [52.2, 4.4], ost: [51.23, 2.92], nor: [53.6, 7.2], bla: [55.75, 8.2], kri: [58.15, 8.0], sta: [58.97, 5.73], ber: [60.39, 5.32], tro: [63.43, 10.4],
  got: [57.7, 11.97], sto: [59.33, 18.07], hel: [60.17, 24.94], tal: [59.44, 24.75], gda: [54.4, 18.67], ros: [54.45, 12.3], cop: [55.68, 12.57],
  rey: [63.84, -22.43], sey: [65.26, -14.0], tor: [62.0, -6.77], nuu: [64.18, -51.72], qaq: [60.72, -46.03],
  vrn: [43.2, 27.92], ode: [46.48, 30.73], pot: [42.15, 41.67], nov: [44.72, 37.77], sam: [41.29, 36.33],
  ten: [28.47, -16.25], mdr: [32.65, -16.9], azo: [37.74, -25.67],
  // Africa
  nkc: [18.08, -15.98], dak: [14.7, -17.45], pra: [14.92, -23.51], bjl: [13.45, -16.58], cky: [9.51, -13.71], fre: [8.48, -13.23], mon: [6.3, -10.8], abi: [5.3, -4.0], acc: [5.55, -0.2], lom: [6.13, 1.22], cot: [6.36, 2.42], lag: [6.42, 3.4], krb: [2.94, 9.91], lib: [0.39, 9.45], sao: [0.34, 6.73], pnr: [-4.78, 11.86], mua: [-5.93, 12.35], lua: [-8.84, 13.23], wal: [-22.68, 14.53],
  cpt: [-33.72, 18.44], pel: [-33.96, 25.6], mtu: [-28.95, 31.76], map: [-25.97, 32.58], nac: [-14.54, 40.67], dar: [-6.8, 39.28], mom: [-4.05, 39.67], mog: [2.04, 45.34], brb: [10.44, 45.01], tol: [-23.35, 43.67], toa: [-18.15, 49.4], mhj: [-15.72, 46.32], mau: [-20.16, 57.5], reu: [-20.9, 55.45], sez: [-4.62, 55.45], mor: [-11.7, 43.25],
  // North America, Pacific side
  lax: [34.05, -118.24], gro: [35.12, -120.63], sfo: [37.78, -122.51], pta: [38.97, -123.7], eur: [40.8, -124.17], ban: [43.12, -124.42], pcy: [45.2, -123.96], wes: [46.9, -124.1], van: [49.15, -125.9], pru: [54.3, -130.33], jun: [57.05, -135.6], sew: [60.1, -149.44], kod: [57.79, -152.4], una: [53.87, -166.53],
  sdg: [32.72, -117.2], mzt: [23.22, -106.42], pva: [20.65, -105.25], slc: [16.17, -95.2], hon: [21.35, -158.13], hil: [20.03, -155.83],
  // North America, Atlantic side, the Gulf and the Caribbean
  hal: [44.65, -63.57], stj: [47.56, -52.71], bos: [42.46, -70.94], shl: [40.75, -72.87], mnq: [40.12, -74.03], tuc: [39.6, -74.34], vab: [36.85, -75.98], myr: [33.69, -78.88], jax: [30.33, -81.4], boc: [26.36, -80.07], mia: [25.77, -80.13], brm: [32.3, -64.78],
  tpa: [27.95, -82.8], fpt: [28.95, -95.36], nol: [29.25, -90.0], can: [21.16, -86.83], ver: [19.2, -96.13], hav: [23.13, -82.38], nas: [25.06, -77.35], kin: [17.97, -76.79], sdq: [18.47, -69.9], pap: [18.55, -72.35], sju: [18.47, -66.1], stx: [17.75, -64.7], gdl: [16.24, -61.53], mtq: [14.6, -61.07], bgi: [13.1, -59.62], pos: [10.65, -61.52], cur: [12.11, -68.93], cay: [19.3, -81.38],
  bze: [17.5, -88.2], pbr: [15.73, -88.6], lim: [10.0, -83.03], cln: [9.36, -79.9], ctg: [10.4, -75.53], baq: [11.0, -74.8], pfj: [11.7, -70.2], lgu: [10.6, -66.93], geo: [6.8, -58.16], pbo: [5.85, -55.17], cyn: [4.93, -52.33],
  // Central and South America
  pty: [8.55, -79.45], psj: [13.92, -90.82], pun: [9.97, -84.83], bue: [3.88, -77.07], sls: [-2.2, -80.97], lur: [-12.27, -76.87], ari: [-18.48, -70.33], ant: [-23.65, -70.4], vap: [-33.03, -71.63], ccp: [-36.8, -73.05], pmo: [-41.47, -72.94], pua: [-52.5, -68.2], gal: [-0.9, -89.6],
  slp: [-0.62, -47.35], for: [-3.72, -38.52], nat: [-5.78, -35.2], rec: [-8.05, -34.88], ssa: [-12.97, -38.5], rio: [-22.97, -43.2], san: [-24.0, -46.4], flo: [-27.6, -48.55], mdo: [-34.9, -54.95], bai: [-36.48, -56.7],
  // Oceania
  syd: [-33.87, 151.25], bne: [-26.65, 153.1], mlb: [-38.35, 144.9], adl: [-34.93, 138.5], per: [-31.95, 115.75], drw: [-12.45, 130.83], phe: [-20.3, 118.6], hob: [-42.88, 147.33], cns: [-16.92, 145.78],
  akl: [-36.78, 174.78], wlg: [-41.3, 174.8], inv: [-46.4, 168.35], suv: [-18.13, 178.43], nou: [-22.28, 166.45], vil: [-17.73, 168.32], hir: [-9.43, 159.95], api: [-13.83, -171.77], nuk: [-21.13, -175.2], ppt: [-17.53, -149.57], rar: [-21.2, -159.78], kir: [1.87, -157.4], nru: [-0.53, 166.93], fun: [-8.52, 179.2],
};
const NAMES = Object.keys(HUB), HV = NAMES.map((k) => vec(...HUB[k])), hubIx = (k: string) => { const i = NAMES.indexOf(k); if (i < 0) throw new Error(`no hub ${k}`); return i; };

/* ---------- which points are linked ---------- */
// Coastal systems: each consecutive pair is one cable.
const CHAINS = [
  'sha lax', // cable 0, always the first link; its first end should be ORIGIN
  'dal tia qin tae', 'qin sha fuz xia sht hkg hai', 'sha tam', 'sha oki', 'sha bus', 'sha fuk', 'sha chi', 'tae jej fuk bus', 'jej sha', 'tam tou fan hkg', 'fan bat', 'tou oki kag shi chi kit sen kus', 'fuk kag', 'bus nao ish', 'nao vla sak', 'ish sak mag', 'kus pet', 'kus una kod sew jun pru van wes pcy ban eur pta sfo gro lax sdg',
  'hkg lun bat ceb dav mnd', 'hkg dan qui vun sih sri son', 'hai dan', 'vun kua mer sin', 'son kua', 'sin btm jak sur bal kup dil drw', 'sin tua mel pen sat yan cox dig viz che tut col mat', 'pen med', 'mel med', 'med pad jak', 'kuc btm', 'kuc bru kki', 'bru hkg', 'kki bat', 'kki mnd', 'sur mak blk', 'mak mnd', 'mak amb jay mad pom', 'mnd amb', 'dav plu yap gua', 'gua sai', 'gua chu poh kwa maj', 'kwa hon', 'maj tar nru hir pom', 'tar fun suv', 'hir vil nou', 'vil suv', 'jay plu',
  'col koc mum kar gwa mus fuj', 'tut koc', 'koc mle col', 'mle mat', 'fuj dub doh bah kuw', 'bnd dub', 'bnd fuj', 'mus sal ade dji', 'dji psu jed ynb sue psa ale', 'ynb aqa', 'jed sue', 'dji brb mog mom dar nac map mtu pel cpt', 'mom sez', 'dar mor mhj', 'mhj nac', 'tol mtu', 'tol map', 'toa reu mau', 'toa mhj', 'sez mau',
  'psa tel bei cyp mrm ath', 'cyp ale', 'ale cha ath', 'ale ben mlt', 'ben tri', 'mrm ist', 'ist ath', 'ist vrn ode nov pot sam ist', 'ath cat', 'ath bar', 'bar cat mlt tri', 'cat plm', 'maz biz', 'maz tri', 'plm gen mrs bcn vlc ora asi', 'mrs ann', 'mrs alg', 'biz ann alg ora', 'vlc alg', 'plm biz', 'gen bcn',
  'cas asi con sns lis vig bil lep shr pnm lan por bud hig', 'por cor', 'cor dbl sou', 'bud cor', 'kil rey', 'lan bud', 'ost low kat nor bla kri sta ber tro', 'ost lan', 'low edi', 'edi sta', 'edi tor', 'bla got cop ros', 'kri got', 'cop gda sto hel tal', 'sto tal', 'ros gda', 'tor rey', 'tor sey', 'tor ber', 'rey qaq nuu', 'qaq stj',
  'lis mdr ten', 'lis azo', 'mdr azo', 'cas ten nkc dak bjl cky fre mon abi acc lom cot lag krb lib pnr mua lua wal cpt', 'dak pra', 'ten pra', 'lag sao lib', 'acc sao',
  'stj hal bos shl mnq tuc vab myr jax boc mia', 'hal brm', 'brm vab', 'mia nas', 'boc nas', 'mia hav', 'mia tpa nol fpt ver can', 'tpa can', 'hav can', 'can cay kin', 'can bze pbr lim cln ctg baq pfj cur lgu pos', 'nas pap', 'kin pap', 'kin cln', 'kin ctg', 'pap sdq sju stx gdl mtq bgi pos geo pbo cyn slp for', 'sdq cur', 'sju cur', 'jax sju', 'brm sju',
  'for nat rec ssa rio san flo mdo bai pua', 'pty bue sls lur ari ant vap ccp pmo pua', 'gal sls', 'gal pty', 'pty pun psj slc pva mzt sdg', 'mzt lax',
  'drw phe per adl mlb syd bne cns pom', 'mlb hob', 'hob syd', 'syd akl wlg inv', 'syd wlg', 'akl nuk', 'akl suv', 'suv api', 'nuk suv', 'nuk rar ppt', 'api ppt', 'api kir hon', 'hon hil', 'ppt hil', 'syd nou', 'bne nou', 'bne hir',
];
// Long hauls: `n` pseudo-random pairs between two regions.
const FANS: [string, string, number][] = [
  ['chi shi kit sen kus', 'wes pcy ban eur pta sfo gro lax sdg van', 15], // trans-Pacific, north
  ['sha tou hkg bat lun qin bus', 'pcy sfo gro lax sdg ban', 9], // trans-Pacific from China and the Philippines
  ['chi shi oki tou hkg bat', 'gua', 6], ['gua', 'hon hil lax sfo pcy', 4], ['hon hil', 'pcy ban sfo gro lax sdg', 7], ['chi shi kit', 'hon', 3],
  ['syd akl bne suv', 'hon lax pcy gro', 6], ['syd bne drw per phe', 'gua sin jak bat chi', 8], ['vap lur', 'ppt akl syd', 2],
  ['hal stj bos shl mnq tuc vab myr', 'bud por hig cor kil shr pnm lan lep bil lis bla kri', 22], // trans-Atlantic, north
  ['boc mia jax vab sju brm', 'lis sns con cas ten dak bil', 8], ['for rec nat ssa rio san', 'lua cpt dak krb lag pra lis ten', 8],
  ['mnq vab jax boc mia tuc', 'sju for sdq stx cur ctg cln can rio', 11], ['lax sdg gro sfo', 'mzt psj pty sls lur vap', 7],
  ['mrs gen plm maz cat bar ath cha ale mrm', 'mum kar fuj mus dji jed col che sin koc', 14], // Europe-Asia through Suez
  ['lis sns bud pnm cas con', 'dak abi acc lag lua cpt pra krb', 9], ['mom dar dji mtu map mog sez mau', 'mum kar fuj mus col koc sal per', 10],
  ['che col mum koc viz cox mat', 'sin pen sat med yan tua', 10], ['sin tua btm kua mer', 'hkg bat tou sha bus chi shi jak kki vun per', 14], ['chi shi bus sha qin oki', 'hkg tou bat sin vun dan fan', 10],
  ['mrs bcn gen vlc', 'alg ann biz tri plm mlt ale tel bei ath', 8],
];
const links: [number, number][] = [], seen = new Set<string>();
const link = (a: number, b: number) => { const k = a < b ? `${a}-${b}` : `${b}-${a}`; if (a === b || seen.has(k)) return false; seen.add(k); links.push([a, b]); return true; };
CHAINS.forEach((c) => { const h = c.split(' ').map(hubIx); for (let i = 0; i + 1 < h.length; i++) link(h[i], h[i + 1]); });
FANS.forEach(([a, b, n], f) => { const A = a.split(' ').map(hubIx), B = b.split(' ').map(hubIx); for (let k = 0, made = 0; made < n && k < n * 20; k++) if (link(A[Math.floor(rnd(`fa${f}.${k}`) * A.length)], B[Math.floor(rnd(`fb${f}.${k}`) * B.length)])) made++; });
// Festoons: every landing point also reaches its nearest neighbour if nothing links them yet.
HV.forEach((v, i) => { const near = HV.map((u, j) => ({j, a: ang(u, v)})).filter((x) => x.j !== i && x.a < 9 * D).sort((p, q) => p.a - q.a); if (near.length) link(i, near[0].j); });

/* ---------- routing through the sea ---------- */
const RAMP = 1.2 * D;
// How many cells from land a cable with clearance c wants to be, easing in from its two ends.
const want = (v: V, c: number, s: V, g: V) => Math.min(c, 1 + Math.floor(Math.min(ang(v, s), ang(v, g)) / RAMP));
const NB = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1], [2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
const CV = Array.from({length: W * H}, (_, i) => cellVec(i));
const gScore = new Float32Array(W * H), from = new Int32Array(W * H);
const astar = (s: number, g: number, c: number, sv: V, gv: V): number[] | null => {
  gScore.fill(Infinity); gScore[s] = 0; from[s] = -1;
  const hf: number[] = [], hn: number[] = []; // binary heap of (f, node)
  const push = (f: number, n: number) => { let i = hf.length; hf.push(f); hn.push(n); while (i > 0) { const p = (i - 1) >> 1; if (hf[p] <= f) break; hf[i] = hf[p]; hn[i] = hn[p]; i = p; } hf[i] = f; hn[i] = n; };
  const pop = () => { const n = hn[0], lf = hf.pop()!, ln = hn.pop()!; const len = hf.length; if (len) { let i = 0; for (;;) { let k = 2 * i + 1; if (k >= len) break; if (k + 1 < len && hf[k + 1] < hf[k]) k++; if (hf[k] >= lf) break; hf[i] = hf[k]; hn[i] = hn[k]; i = k; } hf[i] = lf; hn[i] = ln; } return n; };
  push(ang(CV[s], CV[g]), s);
  while (hf.length) {
    const f0 = hf[0], cur = pop();
    if (cur === g) { const path = [g]; for (let p = from[g]; p >= 0; p = from[p]) path.push(p); return path.reverse(); }
    if (f0 > gScore[cur] + ang(CV[cur], CV[g]) + 1e-6) continue; // stale entry
    const x = cur % W, y = Math.floor(cur / W);
    for (const [dx, dy] of NB) {
      const yy = y + dy; if (yy < 0 || yy >= H) continue;
      const nb = yy * W + (x + dx + W) % W;
      if (!dist[nb]) continue;
      if (Math.abs(dx) + Math.abs(dy) === 3) { // a knight's move must not jump a land corner
        const sx = Math.sign(dx), sy = Math.sign(dy);
        const m1 = Math.abs(dx) === 2 ? y * W + (x + sx + W) % W : (y + sy) * W + x, m2 = (y + sy) * W + (x + sx + W) % W;
        if (!dist[m1] || !dist[m2]) continue;
      }
      const w = want(CV[nb], c, sv, gv), t = gScore[cur] + ang(CV[cur], CV[nb]) * (1 + 2.5 * Math.max(0, w - dist[nb]));
      if (t < gScore[nb]) { gScore[nb] = t; from[nb] = cur; push(t + ang(CV[nb], CV[g]), nb); }
    }
  }
  return null;
};
// Straight (great-circle) run from a to b that stays as clear of land as the cable wants, or as
// clear as `floor` where the grid path itself had to squeeze through.
const clear = (a: V, b: V, c: number, floor: number, sv: V, gv: V) => {
  const n = Math.max(2, Math.ceil(ang(a, b) / (0.12 * D)));
  for (let i = 1; i < n; i++) { const p = mix(a, b, i / n), d = dist[cellOf(p)]; if (!d || d < Math.min(floor, want(p, c, sv, gv))) return false; }
  return true;
};
const seaCell = (v: V) => { // nearest sea cell to a landing point
  const c0 = cellOf(v); if (dist[c0]) return c0;
  let best = -1, bd = 9;
  const x0 = c0 % W, y0 = Math.floor(c0 / W);
  for (let dy = -8; dy <= 8; dy++) for (let dx = -12; dx <= 12; dx++) { const y = y0 + dy; if (y < 0 || y >= H) continue; const j = y * W + (x0 + dx + W) % W; if (!dist[j]) continue; const a = ang(CV[j], v); if (a < bd) { bd = a; best = j; } }
  if (best < 0) throw new Error('landing point too far inland');
  return best;
};
// One leg between two points at sea: corner points of a taut path.
const leg = (a: V, b: V, c: number, sv: V, gv: V): V[] | null => {
  if (clear(a, b, c, c, sv, gv)) return [a, b];
  const path = astar(cellOf(a), cellOf(b), c, sv, gv);
  if (!path) return null;
  const P = [a, ...path.slice(1, -1).map((i) => CV[i]), b], cl = [9, ...path.slice(1, -1).map((i) => dist[i]), 9];
  const out = [P[0]];
  for (let i = 0; i < P.length - 1;) {
    const ok = (j: number) => { let m = 9; for (let k = i; k <= j; k++) m = Math.min(m, cl[k]); return clear(P[i], P[j], c, m, sv, gv); };
    let lo = i + 1, hi = P.length - 1;
    if (ok(hi)) lo = hi; else while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (ok(mid)) lo = mid; else hi = mid; }
    out.push(P[lo]); i = lo;
  }
  return out;
};
const lengthOf = (p: V[]) => { let s = 0; for (let i = 1; i < p.length; i++) s += ang(p[i - 1], p[i]); return s; };
const resample = (p: V[], step: number): V[] => {
  const total = lengthOf(p), n = Math.max(1, Math.round(total / step)), out: V[] = [p[0]];
  let k = 1, acc = 0;
  for (let i = 1; i < n; i++) {
    const target = (total * i) / n;
    while (k < p.length - 1 && acc + ang(p[k - 1], p[k]) < target) { acc += ang(p[k - 1], p[k]); k++; }
    const seg = ang(p[k - 1], p[k]);
    out.push(slerp(p[k - 1], p[k], seg > 1e-9 ? (target - acc) / seg : 0));
  }
  out.push(p[p.length - 1]);
  return out;
};
const route = (ia: number, ib: number, id: number): V[] | null => {
  const sv = HV[ia], gv = HV[ib], c = id === 0 ? 2 : 1 + Math.floor(rnd(`c${id}`) * 4);
  const a = CV[seaCell(sv)], b = CV[seaCell(gv)], w = ang(a, b);
  const through = (stops: V[]) => { let out: V[] = [sv]; for (let i = 0; i + 1 < stops.length; i++) { const l = leg(stops[i], stops[i + 1], c, sv, gv); if (!l) return null; out = out.concat(i ? l.slice(1) : l); } return [...out, gv]; };
  let corners = through([a, b]);
  if (!corners) return null;
  // Long hauls bow to one side so that parallel systems fan out instead of stacking up (unless
  // the bow would send the cable round a continent).
  if (w > 35 * D && id !== 0) {
    const pole = norm([a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]), bow = (rnd(`bow${id}`) * 2 - 1) * Math.min(7 * D, 0.085 * w);
    const stops = [0.25, 0.5, 0.75].map((t) => { const m = slerp(a, b, t), d = bow * Math.sin(Math.PI * t); return norm([m[0] * Math.cos(d) + pole[0] * Math.sin(d), m[1] * Math.cos(d) + pole[1] * Math.sin(d), m[2] * Math.cos(d) + pole[2] * Math.sin(d)]); }).filter((v) => dist[cellOf(v)] >= c);
    const bowed = through([a, ...stops, b]);
    if (bowed && lengthOf(bowed) < 1.1 * lengthOf(corners)) corners = bowed;
  }
  // Round the corners: each point relaxes toward its neighbours unless that takes it nearer land.
  const p = resample(corners, 0.5 * D);
  for (let it = 0; it < 60; it++) for (let i = 1; i < p.length - 1; i++) {
    const q = mix(p[i], norm([p[i - 1][0] + p[i + 1][0], p[i - 1][1] + p[i + 1][1], p[i - 1][2] + p[i + 1][2]]), 0.6), d = dist[cellOf(q)];
    if (d >= Math.min(dist[cellOf(p[i])], want(q, c, sv, gv))) p[i] = q;
  }
  return resample(p, 1.1 * D);
};

/* ---------- build, order, write ---------- */
const ORIGIN = 'sha'; // where <CableWeb>'s draw-on wave starts (the hub nearest each cable's first end)
const SH = HV[hubIx(ORIGIN)];
type Cable = {a: number; b: number; pts: V[]; t0: number; len: number};
const cables: Cable[] = [];
let dropped = 0;
links.forEach(([a, b], id) => {
  const direct = ang(HV[a], HV[b]);
  let pts = route(a, b, id);
  if (!pts || (id > 0 && lengthOf(pts) > Math.max(2.3 * direct, direct + 6 * D) && lengthOf(pts) > 12 * D)) { dropped++; console.log('dropped', NAMES[a], NAMES[b], pts ? (lengthOf(pts) / direct).toFixed(2) : 'no path'); return; }
  if (ang(HV[b], SH) < ang(HV[a], SH)) { pts = pts.reverse(); [a, b] = [b, a]; } // draw from the end nearer Shanghai
  cables.push({a, b, pts, t0: ang(HV[a], SH), len: lengthOf(pts)});
});
const used = new Set(cables.flatMap((c) => [c.a, c.b])), keep = NAMES.map((_, i) => i).filter((i) => used.has(i)), remap = new Map(keep.map((h, i) => [h, i]));
const q = (x: number) => Math.round(x * 100);
const hubs = keep.flatMap((h) => [q(HUB[NAMES[h]][0]), q(HUB[NAMES[h]][1])]);
const data = {
  hubs, // lat*100, lon*100 per landing point
  ends: cables.flatMap((c) => [remap.get(c.a)!, remap.get(c.b)!]), // landing point at each end, the one nearer Shanghai first
  size: cables.map((c) => c.pts.length),
  pts: cables.flatMap((c) => c.pts.flatMap((v) => toLL(v).map(q))), // lat*100, lon*100 along every cable
};
writeFileSync(join(import.meta.dirname, 'globe-web-data.ts'), `// GENERATED by globe-web-gen.mts (node src/kit/globe-web-gen.mts). Do not edit by hand.\n// An illustrative web, not a map of real cables: ${keep.length} landing points, ${cables.length} cables.\nexport const WEB: {hubs: number[]; ends: number[]; size: number[]; pts: number[]} = ${JSON.stringify(data)};\n`);

// Self-check: how much of the web lies over land at 1/8 degree (landing spurs excluded).
let over = 0, total = 0;
const worst: [number, string][] = [];
for (const c of cables) {
  let mine = 0;
  for (let i = 1; i < c.pts.length; i++) for (let t = 0; t < 1; t += 0.25) {
    const v = mix(c.pts[i - 1], c.pts[i], t);
    if (Math.min(ang(v, HV[c.a]), ang(v, HV[c.b])) < 1.0 * D) continue;
    const [lat, lon] = toLL(v), x = ((Math.floor((lon + 180) / CELL * SS) % (W * SS)) + W * SS) % (W * SS), y = Math.min(H * SS - 1, Math.floor((90 - lat) / CELL * SS));
    total++; mine += fine[y * W * SS + x];
  }
  over += mine;
  if (mine > 3) worst.push([mine, `${NAMES[c.a]}-${NAMES[c.b]}`]);
}
if (process.argv[2]) console.log('most samples over land:', worst.sort((p, q) => q[0] - p[0]).slice(0, 25).map(([n, k]) => `${k} ${n}`).join(', '));
console.log(`${keep.length} landing points, ${cables.length} cables (${dropped} dropped), ${data.pts.length / 2} points, ${(100 * over / total).toFixed(2)}% of samples over land`);
if (over / total > 0.01) throw new Error('cables cross land');

if (process.argv[2]) { // debug picture: equirectangular, 4 px per cell
  const S = 4, pw = W * S, ph = H * S, img = new Uint8Array(pw * ph * 3);
  for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) { const l = fine[Math.floor(y * SS / S) * W * SS + Math.floor(x * SS / S)]; img.set(l ? [38, 44, 60] : [6, 12, 30], (y * pw + x) * 3); }
  const plot = (v: V, r: number, g: number, b: number, k = 0) => { const [lat, lon] = toLL(v), x0 = Math.floor((lon + 180) / 360 * pw), y0 = Math.floor((90 - lat) / 180 * ph); for (let dy = -k; dy <= k; dy++) for (let dx = -k; dx <= k; dx++) { const x = (x0 + dx + pw) % pw, y = y0 + dy; if (y >= 0 && y < ph) img.set([r, g, b], (y * pw + x) * 3); } };
  cables.forEach((c, id) => { for (let i = 1; i < c.pts.length; i++) for (let t = 0; t < 1; t += 0.05) plot(mix(c.pts[i - 1], c.pts[i], t), id ? 127 : 255, id ? 216 : 194, id ? 255 : 26); });
  keep.forEach((h) => plot(HV[h], 255, 255, 255, 1));
  writeFileSync(process.argv[2], Buffer.concat([Buffer.from(`P6\n${pw} ${ph}\n255\n`), img]));
}
