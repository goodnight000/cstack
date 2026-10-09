/*
THE GLOBE KIT. Everything sits on a unit sphere unless you pass `radius`. Use it inside a
<ThreeCanvas> (three-canvas.tsx) with a perspective camera; nothing here needs lights in the
scene. Textures: public/earth_day.jpg and public/earth_night.jpg, 4096x2048 equirectangular (NASA
Blue Marble and Black Marble, public domain; credit NASA). The shader assumes that size. A space
shot is:

  const earth = useEarth();                      // in the scene component, outside the canvas
  <Stars fr={fr} /> <Earth tex={earth} /> <CableWeb progress={p} fr={fr} pulses={1} />

  ll(p, r = 1)             lat/lon -> THREE.Vector3 on the sphere (matches the textures).
  arc(a, b, r, lift, n)    great-circle arc a -> b, lifted off the surface in the middle; n+1 points.
  over(p, dist = 3)        camera position looking straight down at a lat/lon from `dist` radii.
  type LL, type EarthTex

  useEarth()               returns the planet's textures, or null while they load (the frame waits).
  <Earth tex radius night day sun air />
      The planet on its night side: moonlit navy ocean with lighter shelves, land a step lighter
      with its relief, a soft sheen on the water, warm city lights that bloom, a thin bright line
      of atmosphere exactly on the limb and a soft halo outside it. The moonlight comes from the
      upper left OF THE CAMERA, so every view is shaped the same way with no tuning. Only the
      lights and the limb are bright enough to bloom.
        night 0..1.5 (1)    city lights.
        day   0..1.5 (0.5)  how much of the real daytime map shows through the navy: 0 is pure
                            graphic navy, 1 and above is clearly the photographic map.
        sun   LL (none)     the point where the sun is overhead. Adds a real day side and a
                            terminator fixed to the geography; city lights go out in daylight.
                            SUN_EXAMPLE (7:02 PM in Shanghai): Africa and Europe in daylight, dusk
                            over India, the whole Pacific dark. Compute your own for your moment.
        air   0..2 (1)      strength of the limb line and halo.
  <Stars fr count opacity />
      Star field: varied size, brightness and tint, a faint milky band, one star in ten twinkling
      slowly with `fr`. It is infinitely far (turns with the camera, never shifts) and always
      behind everything else in the canvas. From over the Pacific the band crosses the frame on a
      diagonal behind the planet. `count` (7000) is for the whole sky; the band adds as many again.
  <CableWeb radius progress fr pulses opacity density color />
      The undersea cable web in two draw calls: 608 cables between 315 landing points, routed
      through the sea. They hug coasts, round capes, cross oceans, thread Malacca and Suez, and
      stay off the land; long hauls fan out. ILLUSTRATIVE: invented links between real coastal
      cities, not a map of real cables (globe-web-gen.mts bakes it into globe-web-data.ts).
        progress 0..1 (1)   draws the web on as a wave spreading out from the web's origin
                            (Shanghai in the baked data; ORIGIN in globe-web-gen.mts): each cable
                            grows from its end nearer the origin, its tip glowing, and each landing
                            point lights up as the wave reaches it. The trans-Pacific cables set
                            off within the first tenth. From over the Pacific the visible half is
                            complete at about 0.55; ease it yourself.
        pulses   0..1 (0)   small white lights running along the cables, moving with `fr`.
        opacity  0..1 (1)
        density  0..1 (1)   keeps that share of the cables (0.6 is about 360, 0.4 about 240).
        color    ('#7fd8ff')
      Lines hold a fine, legible width at any planet size (1.1 to 2 px of the 1080 frame; on a
      small planet they dim instead of thinning) and fade toward the limb. Draw it together with
      <Earth>, which hides the far side.
  webCable(i = 0, r = 1.004)
      The points of cable i, for a <Route> or a light travelling along it. Cable 0 is the first
      link in globe-web-gen.mts: Shanghai -> Los Angeles, south of Japan and across the Pacific.
  WEB_CABLES, WEB_LANDINGS   how many there are.
  <Route points color width progress opacity glow head />
      A glowing tube through 3D points, drawn up to `progress`. glow 0..1 (0) adds a soft sheath
      around the core; head (0) is the size of a light at the drawn tip, in the route's colour.
  <Dot at size cyan opacity color />
      A glow dot (city, packet, head of a route): amber, `cyan`, or any `color`.
*/
import {useEffect, useMemo, useState} from 'react';
import {settle} from './three-canvas';
import {continueRender, delayRender, random, staticFile, useVideoConfig} from 'remotion';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {WEB} from './globe-web-data';

// Soft radial dot for additive glows; the default stops are amber.
const glowTexture = (stops: [number, string][] = [[0, 'rgba(255,246,214,1)'], [0.07, 'rgba(255,196,84,0.85)'], [0.35, 'rgba(255,140,20,0.16)'], [1, 'rgba(255,120,0,0)']]) => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!, grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  stops.forEach(([o, col]) => grad.addColorStop(o, col));
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
};
const CYAN_GLOW: [number, string][] = [[0, 'rgba(235,250,255,1)'], [0.08, 'rgba(127,216,255,0.85)'], [0.35, 'rgba(60,140,255,0.16)'], [1, 'rgba(40,100,255,0)']];
// Additive sprite material that ignores fog and tone mapping, so glows keep their colour.
const glowMaterial = (map: THREE.Texture, opacity = 1) =>
  new THREE.SpriteMaterial({map, opacity, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true, toneMapped: false, fog: false});

export type LL = {lat: number; lon: number};
// Latitude/longitude to a point on a sphere that matches the Earth texture mapping.
export const ll = ({lat, lon}: LL, r = 1) => {
  const phi = ((90 - lat) * Math.PI) / 180, theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
};
// Great-circle arc from a to b, lifted off the surface in the middle. n+1 points.
export const arc = (a: LL, b: LL, r = 1, lift = 0.06, n = 64) => {
  const va = ll(a).normalize(), vb = ll(b).normalize(), w = va.angleTo(vb);
  return Array.from({length: n + 1}, (_, i) => {
    const t = i / n;
    const v = va.clone().multiplyScalar(Math.sin((1 - t) * w) / Math.sin(w)).add(vb.clone().multiplyScalar(Math.sin(t * w) / Math.sin(w)));
    return v.multiplyScalar(r * (1 + lift * Math.sin(Math.PI * t)));
  });
};
// Camera position that looks straight down at a lat/lon from `dist` sphere radii away.
export const over = (p: LL, dist = 3) => ll(p, dist).toArray() as [number, number, number];

export type EarthTex = {day: THREE.Texture; night: THREE.Texture};
// Load the planet's textures. Call this in the scene component, OUTSIDE <ThreeCanvas>, and pass
// the result to <Earth tex={...} />. The frame waits until they are loaded.
export const useEarth = (): EarthTex | null => {
  const [tex, setTex] = useState<EarthTex | null>(null);
  const [handle] = useState(() => delayRender('earth textures'));
  useEffect(() => {
    const l = new THREE.TextureLoader();
    Promise.all([l.loadAsync(staticFile('earth_day.jpg')), l.loadAsync(staticFile('earth_night.jpg'))]).then(([d, n]) => {
      d.colorSpace = n.colorSpace = THREE.SRGBColorSpace;
      d.anisotropy = n.anisotropy = 8;
      setTex({day: d, night: n});
      settle(handle);
    });
  }, [handle]);
  return tex;
};

// Where the sun is overhead at 7:02 PM in Shanghai (4:02 AM in Los Angeles); an example for `sun`.
export const SUN_EXAMPLE: LL = {lat: -6, lon: 11};

// Additive light that leaves the canvas alpha alone, so it adds to whatever is behind the canvas.
const ADD = {transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor} as const;
// The moon, in view space, and the two light directions every planet shader shares. All planet
// shaders work in display colours and write them straight out (no tone mapping, no fog).
const LIGHTS = /* glsl */ `
  uniform vec3 uSun; uniform float uSunOn;
  vec3 moonDir() { return normalize(vec3(-0.5, 0.6, 0.62) * mat3(viewMatrix)); }
  vec3 sunDir() { return normalize(mat3(modelMatrix) * uSun); }
`;
const SURFACE_VERT = /* glsl */ `
  varying vec2 vUv; varying vec3 vNl; varying vec3 vNw; varying vec3 vPw;
  void main() {
    vUv = uv; vNl = normalize(position);
    vec4 w = modelMatrix * vec4(position, 1.0);
    vPw = w.xyz; vNw = normalize(mat3(modelMatrix) * vNl);
    gl_Position = projectionMatrix * viewMatrix * w;
  }`;
const SURFACE_FRAG = /* glsl */ `
  uniform sampler2D uDayMap; uniform sampler2D uNightMap; uniform float uDay; uniform float uNight; uniform float uAir;
  uniform mat4 modelMatrix;
  varying vec2 vUv; varying vec3 vNl; varying vec3 vNw; varying vec3 vPw;
  ${LIGHTS}
  void main() {
    vec3 N = normalize(vNw), V = normalize(cameraPosition - vPw), moon = moonDir();
    vec3 d = pow(texture2D(uDayMap, vUv).rgb, vec3(0.4545)), n = pow(texture2D(uNightMap, vUv, -1.0).rgb, vec3(0.4545));
    // Land is whatever is not blue in the day map; the map's own bathymetry gives the shelves.
    float land = smoothstep(-0.03, 0.05, max(1.35 * d.r, 0.9 * d.g) - d.b);
    float relief = smoothstep(0.05, 0.95, dot(d, vec3(0.35, 0.45, 0.2))), shelf = smoothstep(0.1, 0.52, d.b);
    vec3 col = mix(mix(vec3(0.02, 0.062, 0.17), vec3(0.036, 0.125, 0.29), shelf), mix(vec3(0.08, 0.125, 0.235), vec3(0.18, 0.25, 0.41), relief), land);
    col += vec3(0.05, 0.11, 0.22) * land * (1.0 - land) * 2.4; // a faint line of surf along the coasts
    col = mix(col, col * 0.5 + mix(vec3(dot(d, vec3(0.3, 0.5, 0.2))), d, 0.25 + 0.5 * clamp(uDay, 0.0, 1.0)) * vec3(0.42, 0.62, 1.0) * 0.6, clamp(uDay, 0.0, 1.5) * 0.5) * (0.8 + 0.4 * uDay);
    float ml = smoothstep(-0.65, 0.95, dot(N, moon));
    col *= 0.4 + 0.92 * ml;
    col += vec3(0.16, 0.3, 0.55) * pow(max(dot(N, normalize(moon + V)), 0.0), 18.0) * 0.36 * (1.0 - land);
    col = min(col, 0.42 + (col - 0.42) * 0.3);
    // Daylight, if there is a sun.
    float sd = dot(normalize(vNl), uSun), lit = uSunOn * smoothstep(-0.1, 0.25, sd), up = clamp(sd, 0.0, 1.0);
    vec3 dayc = mix(vec3(dot(d, vec3(0.3, 0.5, 0.2))), d, 0.72) * vec3(0.93, 0.97, 1.06) * (0.32 + 0.5 * up) + vec3(0.03, 0.09, 0.2) * pow(up, 0.6);
    dayc += vec3(1.0, 0.95, 0.85) * pow(max(dot(N, normalize(sunDir() + V)), 0.0), 60.0) * 0.5 * (1.0 - land);
    col = mix(col, min(dayc, 0.58 + (dayc - 0.58) * 0.25), lit);
    // City lights: the warm part of the night map.
    // They get stronger as the planet gets smaller, where the map's own lights average away.
    vec2 texel = vUv * vec2(4096.0, 2048.0);
    float small = clamp(log2(max(length(dFdx(texel)), length(dFdy(texel)))), 0.0, 4.0);
    float L = clamp((n.r - 0.62 * n.b - 0.03) / 0.4, 0.0, 1.0);
    col += (vec3(1.0, 0.72, 0.4) * pow(L, 1.15) + vec3(1.0, 0.93, 0.8) * pow(L, 5.0) * 0.3) * (0.95 + 0.4 * small) * uNight * (1.0 - lit);
    // Air seen edge-on brightens toward the limb.
    float f = pow(1.0 - max(dot(N, V), 0.0), 4.5), side = mix(0.3 + 0.95 * ml, 0.35 + 1.5 * smoothstep(-0.3, 0.3, sd), uSunOn);
    col += (vec3(0.1, 0.36, 1.0) * f * 0.7 + vec3(0.4, 0.62, 1.0) * f * f * f * 0.45) * side * uAir;
    gl_FragColor = vec4(col, 1.0);
  }`;
// The halo outside the limb: a shell a little larger than the planet, shaded by how close each
// sight line passes to the surface, so the bright line sits exactly on the limb at any distance.
const AIR = 1.2;
const AIR_VERT = /* glsl */ `
  uniform float uRadius;
  varying vec3 vPw; varying vec3 vCentre; varying float vR;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vPw = w.xyz; vCentre = modelMatrix[3].xyz; vR = length(modelMatrix[0].xyz) * uRadius;
    gl_Position = projectionMatrix * viewMatrix * w;
  }`;
const AIR_FRAG = /* glsl */ `
  uniform float uAir; uniform mat4 modelMatrix;
  varying vec3 vPw; varying vec3 vCentre; varying float vR;
  ${LIGHTS}
  void main() {
    vec3 ro = cameraPosition - vCentre, rd = normalize(vPw - cameraPosition);
    vec3 near = ro - rd * dot(ro, rd); // the sight line's closest point to the planet's centre
    float h = max(length(near) - vR, 0.0) / vR;
    vec3 p = normalize(near);
    float side = mix(0.35 + 0.9 * smoothstep(-0.5, 0.8, dot(p, moonDir())), 0.3 + 1.6 * smoothstep(-0.3, 0.35, dot(p, sunDir())), uSunOn);
    vec3 col = vec3(0.42, 0.7, 1.0) * exp(-h / 0.009) * 0.85 + vec3(0.08, 0.26, 1.0) * exp(-h / 0.04) * 0.2;
    gl_FragColor = vec4(col * side * uAir * smoothstep(${(AIR - 1).toFixed(2)}, ${((AIR - 1) * 0.5).toFixed(2)}, h), 0.0);
  }`;

// The planet. See the header for the look and the props.
export const Earth = ({tex, radius = 1, night = 1, day = 0.5, sun, air = 1}: {tex: EarthTex | null; radius?: number; night?: number; day?: number; sun?: LL | null; air?: number}) => {
  // The canvas only draws when the frame changes, so textures that land after that draw would
  // leave the planet out of the captured frame. Hold the frame until it is drawn with the planet.
  const advance = useThree((st) => st.advance);
  const [drawn] = useState(() => delayRender('earth drawn'));
  useEffect(() => {
    if (!tex) return () => continueRender(drawn);
    advance(performance.now());
    continueRender(drawn);
  }, [tex, advance, drawn]);
  const mats = useMemo(() => {
    if (!tex) return null;
    const uniforms = {uDayMap: {value: tex.day}, uNightMap: {value: tex.night}, uDay: {value: 0.5}, uNight: {value: 1}, uAir: {value: 1}, uSun: {value: new THREE.Vector3(1, 0, 0)}, uSunOn: {value: 0}, uRadius: {value: 1}};
    return {uniforms, surface: new THREE.ShaderMaterial({uniforms, vertexShader: SURFACE_VERT, fragmentShader: SURFACE_FRAG}), air: new THREE.ShaderMaterial({uniforms, vertexShader: AIR_VERT, fragmentShader: AIR_FRAG, side: THREE.BackSide, ...ADD})};
  }, [tex]);
  if (!mats) return null;
  const u = mats.uniforms;
  u.uDay.value = day; u.uNight.value = night; u.uAir.value = air; u.uRadius.value = radius; u.uSunOn.value = sun ? 1 : 0;
  if (sun) u.uSun.value.copy(ll(sun));
  return (
    <group>
      <mesh material={mats.surface}>
        <sphereGeometry args={[radius, 128, 96]} />
      </mesh>
      <mesh material={mats.air}>
        <sphereGeometry args={[radius * AIR, 64, 48]} />
      </mesh>
    </group>
  );
};

/* ---------- stars ---------- */
// Directions only: the sky turns with the camera but is infinitely far, and it sits on the far
// plane so that anything else in the scene covers it.
const SKY = /* glsl */ `
  vec4 sky(vec3 dir) { vec4 c = projectionMatrix * vec4(mat3(viewMatrix) * mat3(modelMatrix) * dir, 1.0); return vec4(c.xy, c.w * 0.99999, c.w); }
`;
const STAR_VERT = /* glsl */ `
  attribute vec3 tint; attribute vec3 look; // look: size in px, twinkle speed (0 = steady), phase
  uniform float uFr; uniform float uPx; uniform float uOpacity;
  varying vec3 vCol;
  ${SKY}
  void main() {
    gl_Position = sky(position);
    gl_PointSize = look.x * uPx;
    vCol = tint * uOpacity * (1.0 - 0.45 * step(0.001, look.y) * (0.5 + 0.5 * sin(uFr * look.y + look.z)));
  }`;
const STAR_FRAG = /* glsl */ `
  varying vec3 vCol;
  void main() { gl_FragColor = vec4(vCol * smoothstep(1.0, 0.25, length(gl_PointCoord - 0.5) * 2.0), 0.0); }`;
const HAZE_VERT = /* glsl */ `
  varying vec3 vDir;
  ${SKY}
  void main() { vDir = position; gl_Position = sky(position); }`;
const HAZE_FRAG = /* glsl */ `
  uniform vec3 uAxis; uniform float uOpacity;
  varying vec3 vDir;
  float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float noise(vec3 p) {
    vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y), mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
  }
  void main() {
    // Each octave is turned so the noise lattice never lines up into boxes.
    mat3 turn = mat3(0.36, 0.48, -0.8, -0.8, 0.6, 0.0, 0.48, 0.64, 0.6);
    vec3 d = normalize(vDir), q = turn * d;
    float b = dot(d, uAxis), clouds = noise(q * 4.0) * 0.5 + noise(turn * q * 9.0) * 0.3 + noise(turn * turn * q * 21.0) * 0.2;
    gl_FragColor = vec4(vec3(0.055, 0.09, 0.2) * exp(-b * b / 0.012) * smoothstep(0.25, 0.8, clouds) * uOpacity, 0.0);
  }`;
const TINTS = [[0.8, 0.88, 1], [1, 1, 1], [0.72, 0.82, 1], [1, 0.94, 0.84], [1, 0.86, 0.72], [0.9, 0.95, 1]];
// Pole of the milky band's great circle, placed so that from over the Pacific the band crosses
// the frame on a diagonal behind the planet.
const MILKY = new THREE.Vector3(-0.365, -0.756, -0.543).normalize();
// A star field behind everything. See the header.
export const Stars = ({fr = 0, count = 7000, opacity = 1}: {fr?: number; count?: number; opacity?: number}) => {
  const px = useThree((st) => (st.viewport.dpr * st.size.height) / 1920);
  const built = useMemo(() => {
    const n = Math.round(count * 1.8); // the last 0.8 x count crowd into the milky band
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), look = new Float32Array(n * 3);
    const e1 = new THREE.Vector3(1, 0, 0).cross(MILKY).normalize(), e2 = MILKY.clone().cross(e1);
    for (let i = 0; i < n; i++) {
      const r = (k: string) => random(`star${k}${i}`), v = new THREE.Vector3(), inBand = i >= count;
      if (inBand) {
        const a = r('l') * Math.PI * 2, lat = (r('a') + r('b') + r('c') - 1.5) * 0.16;
        v.copy(e1).multiplyScalar(Math.cos(a) * Math.cos(lat)).addScaledVector(e2, Math.sin(a) * Math.cos(lat)).addScaledVector(MILKY, Math.sin(lat));
      } else {
        const z = r('z') * 2 - 1, a = r('l') * Math.PI * 2, s = Math.sqrt(1 - z * z);
        v.set(s * Math.cos(a), z, s * Math.sin(a));
      }
      v.toArray(pos, i * 3);
      const m = r('m'), big = Math.pow(m, 7); // a few bright stars, many faint ones
      const tint = TINTS[Math.floor(r('t') * TINTS.length)], b = inBand ? 0.14 + 0.4 * m * m : 0.16 + 0.55 * m * m * m + 0.6 * big;
      col.set([tint[0] * b, tint[1] * b, tint[2] * b], i * 3);
      look.set([inBand ? 1.4 + 1.2 * m : 1.5 + 1.5 * m * m + 3.6 * big, r('w') < 0.1 ? 0.035 + 0.06 * r('v') : 0, r('p') * 6.283], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('tint', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('look', new THREE.BufferAttribute(look, 3));
    const uniforms = {uFr: {value: 0}, uPx: {value: 1}, uOpacity: {value: 1}, uAxis: {value: MILKY}};
    return {geo, uniforms, stars: new THREE.ShaderMaterial({uniforms, vertexShader: STAR_VERT, fragmentShader: STAR_FRAG, ...ADD}), haze: new THREE.ShaderMaterial({uniforms, vertexShader: HAZE_VERT, fragmentShader: HAZE_FRAG, side: THREE.BackSide, ...ADD})};
  }, [count]);
  const u = built.uniforms;
  u.uFr.value = fr; u.uPx.value = px; u.uOpacity.value = opacity;
  return (
    <group renderOrder={-10}>
      <mesh material={built.haze} frustumCulled={false}>
        <icosahedronGeometry args={[1, 3]} />
      </mesh>
      <points geometry={built.geo} material={built.stars} frustumCulled={false} />
    </group>
  );
};

/* ---------- the cable web ---------- */
type Web = {cables: THREE.Vector3[][]; lines: THREE.BufferGeometry; dots: THREE.BufferGeometry};
let webCache: Web | null = null;
// Decode the baked web and build its geometry, once per page.
const web = (): Web => {
  if (webCache) return webCache;
  const at = (lat: number, lon: number) => ll({lat: lat / 100, lon: lon / 100});
  const cables: THREE.Vector3[][] = [];
  WEB.size.reduce((o, n) => (cables.push(Array.from({length: n}, (_, i) => at(WEB.pts[(o + i) * 2], WEB.pts[(o + i) * 2 + 1]))), o + n), 0);
  // Draw time: a wave leaves the origin (where cable 0 starts); a cable starts when the wave
  // reaches its near end (its first point) and then grows at the wave's speed.
  const home = cables[0][0];
  const along = cables.map((p) => p.reduce<number[]>((s, v, i) => (s.push(i ? s[i - 1] + v.angleTo(p[i - 1]) : 0), s), []));
  const t0 = cables.map((p) => p[0].angleTo(home)), tMax = Math.max(...cables.map((_, c) => t0[c] + along[c][along[c].length - 1]));
  const segs = cables.reduce((s, p) => s + p.length - 1, 0);
  const pos = new Float32Array(segs * 12), other = new Float32Array(segs * 12), info = new Float32Array(segs * 16), seed = new Float32Array(segs * 4), index = new Uint32Array(segs * 6);
  const nh = WEB.hubs.length / 2, hp = new Float32Array(nh * 3), born = new Float32Array(nh * 2).fill(1);
  let k = 0;
  cables.forEach((p, c) => {
    const sd = c ? 0.02 + 0.98 * random(`cable${c}`) : 0; // cable 0 survives any `density`
    for (const h of [WEB.ends[c * 2], WEB.ends[c * 2 + 1]]) born[h * 2 + 1] = Math.min(born[h * 2 + 1], sd); // a landing point shows with its first cable
    for (let i = 0; i + 1 < p.length; i++, k++) {
      for (let v = 0; v < 4; v++) {
        const j = i + (v >> 1), here = p[j], there = p[i + 1 - (v >> 1)], sideways = v & 1 ? 1 : -1;
        here.toArray(pos, (k * 4 + v) * 3); there.toArray(other, (k * 4 + v) * 3);
        // which way to push the vertex off the line, the same value as a profile coordinate, draw time, length along
        info.set([v >> 1 ? -sideways : sideways, sideways, (t0[c] + along[c][j]) / tMax, along[c][j]], (k * 4 + v) * 4);
        seed[k * 4 + v] = sd;
      }
      index.set([k * 4, k * 4 + 1, k * 4 + 2, k * 4 + 2, k * 4 + 1, k * 4 + 3], k * 6);
    }
  });
  const lines = new THREE.BufferGeometry();
  lines.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  lines.setAttribute('other', new THREE.BufferAttribute(other, 3));
  lines.setAttribute('info', new THREE.BufferAttribute(info, 4));
  lines.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  lines.setIndex(new THREE.BufferAttribute(index, 1));
  for (let h = 0; h < nh; h++) { const v = at(WEB.hubs[h * 2], WEB.hubs[h * 2 + 1]); v.toArray(hp, h * 3); born[h * 2] = v.angleTo(home) / tMax; }
  const dots = new THREE.BufferGeometry();
  dots.setAttribute('position', new THREE.BufferAttribute(hp, 3));
  dots.setAttribute('born', new THREE.BufferAttribute(born, 2)); // draw time, seed of its first cable
  return (webCache = {cables, lines, dots});
};
export const WEB_CABLES = WEB.size.length, WEB_LANDINGS = WEB.hubs.length / 2;
// Points of one cable of the web, for a <Route> or a light travelling along it. Cable 0 runs from
// Shanghai to Los Angeles.
export const webCable = (i = 0, r = 1.004) => web().cables[i].map((v) => v.clone().multiplyScalar(r));

const WEB_SHARED = /* glsl */ `
  uniform vec2 uRes; uniform float uProgress;
  varying float vFace;
  // Size on screen of one sphere radius at this vertex, in px of the 1080x1920 frame, and how
  // squarely the surface here faces the camera.
  float pxPerUnit(vec4 clip) { return length(modelMatrix[0].xyz) * projectionMatrix[1][1] * 960.0 / clip.w; }
  float facing(vec3 w) { return dot(normalize(w - modelMatrix[3].xyz), normalize(cameraPosition - w)); }
`;
const LINE_VERT = /* glsl */ `
  attribute vec3 other; attribute vec4 info; attribute float seed;
  varying float vAcross; varying float vT; varying float vS; varying float vSeed; varying float vThin;
  ${WEB_SHARED}
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0), c = projectionMatrix * viewMatrix * w, c1 = projectionMatrix * viewMatrix * modelMatrix * vec4(other, 1.0);
    vec2 along = normalize((c1.xy / c1.w - c.xy / c.w) * uRes + 1e-6);
    // The line is a ribbon of constant width on screen: thin enough to stay fine close up, wide
    // enough to survive encoding when the planet is small (where it dims instead of thinning).
    float natural = 0.0034 * pxPerUnit(c), width = clamp(natural, 1.1, 2.0) * uRes.y / 1920.0;
    c.xy += vec2(-along.y, along.x) * info.x * width * 2.5 / uRes * c.w * 2.0;
    vAcross = info.y * 5.0; vT = info.z; vS = info.w; vSeed = seed; vFace = facing(w.xyz);
    vThin = clamp(natural / 1.1, 0.4, 1.0);
    gl_Position = c;
  }`;
const LINE_FRAG = /* glsl */ `
  uniform float uProgress; uniform float uTime; uniform float uPulses; uniform float uOpacity; uniform float uDensity; uniform vec3 uColor;
  varying float vAcross; varying float vT; varying float vS; varying float vSeed; varying float vThin; varying float vFace;
  void main() {
    if (vSeed > uDensity || vT > uProgress || uProgress <= 0.0) discard;
    float x = abs(vAcross); // distance from the centre line, in half line widths
    float tip = smoothstep(0.03, 0.0, uProgress - vT) * step(uProgress, 0.9995);
    // A light every 0.45 rad of cable, each cable with its own speed, phase and direction.
    float way = step(0.5, fract(vSeed * 13.7)) * 2.0 - 1.0;
    float ph = fract(way * vS / 0.45 - uTime * (0.22 + 0.2 * fract(vSeed * 7.3)) + vSeed * 31.0) - 0.96;
    // a round head and a short thin tail behind it
    float pulse = (exp(-ph * ph / 0.00012 - x * x * 0.22) * 1.5 + step(ph, 0.0) * exp(ph / 0.03 - x * x * 1.1) * 0.55) * uPulses;
    float a = (smoothstep(1.7, 0.6, x) * 0.45 + exp(-x * x * 0.3) * 0.1) * (1.0 + 1.6 * tip) + pulse;
    vec3 col = mix(uColor, vec3(0.93, 0.98, 1.0), clamp(pulse + tip * 0.6, 0.0, 1.0));
    gl_FragColor = vec4(col * a * uOpacity * vThin * smoothstep(0.02, 0.3, vFace), 0.0);
  }`;
const LAND_VERT = /* glsl */ `
  attribute vec2 born;
  uniform float uDensity;
  varying float vOn;
  ${WEB_SHARED}
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0), c = projectionMatrix * viewMatrix * w;
    float age = uProgress - born.x;
    gl_PointSize = clamp(0.012 * pxPerUnit(c), 3.0, 7.5) * uRes.y / 1920.0 * (1.0 + 1.3 * smoothstep(0.03, 0.0, age) * step(uProgress, 0.9995));
    vOn = step(0.0, age) * step(0.0001, uProgress) * step(born.y, uDensity); vFace = facing(w.xyz);
    gl_Position = c;
  }`;
const LAND_FRAG = /* glsl */ `
  uniform float uOpacity; uniform vec3 uColor;
  varying float vOn; varying float vFace;
  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    vec3 col = mix(uColor, vec3(0.95, 0.99, 1.0), exp(-r * r * 9.0));
    gl_FragColor = vec4(col * exp(-r * r * 4.0) * (1.0 - smoothstep(0.8, 1.0, r)) * vOn * uOpacity * smoothstep(0.02, 0.3, vFace), 0.0);
  }`;
// The undersea cable web. See the header.
export const CableWeb = ({radius = 1, progress = 1, fr = 0, pulses = 0, opacity = 1, density = 1, color = '#7fd8ff'}: {radius?: number; progress?: number; fr?: number; pulses?: number; opacity?: number; density?: number; color?: string}) => {
  const size = useThree((st) => st.size), dpr = useThree((st) => st.viewport.dpr), {fps} = useVideoConfig();
  const built = useMemo(() => {
    const uniforms = {uRes: {value: new THREE.Vector2()}, uProgress: {value: 1}, uTime: {value: 0}, uPulses: {value: 0}, uOpacity: {value: 1}, uDensity: {value: 1}, uColor: {value: new THREE.Vector3()}};
    return {uniforms, line: new THREE.ShaderMaterial({uniforms, vertexShader: LINE_VERT, fragmentShader: LINE_FRAG, side: THREE.DoubleSide, ...ADD}), land: new THREE.ShaderMaterial({uniforms, vertexShader: LAND_VERT, fragmentShader: LAND_FRAG, ...ADD})};
  }, []);
  const u = built.uniforms, w = web(), c = new THREE.Color(color).convertLinearToSRGB();
  u.uRes.value.set(size.width * dpr, size.height * dpr);
  u.uTime.value = fr / fps;
  u.uProgress.value = progress; u.uPulses.value = pulses; u.uOpacity.value = opacity; u.uDensity.value = density;
  u.uColor.value.set(c.r, c.g, c.b);
  return (
    <group scale={radius * 1.003}>
      <mesh geometry={w.lines} material={built.line} frustumCulled={false} />
      <points geometry={w.dots} material={built.land} frustumCulled={false} />
    </group>
  );
};

/* ---------- routes and dots ---------- */
// A glowing line through 3D points, drawn up to `progress` (0..1). Use for routes and cables.
// `glow` adds a soft sheath, `head` a light of that size at the drawn tip.
export const Route = ({points, color = '#ffc21a', width = 0.004, progress = 1, opacity = 1, glow = 0, head = 0}: {points: THREE.Vector3[]; color?: string; width?: number; progress?: number; opacity?: number; glow?: number; head?: number}) => {
  const sheathed = glow > 0, p = Math.max(0, Math.min(1, progress));
  const {curve, geo, sheath} = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points);
    return {curve, geo: new THREE.TubeGeometry(curve, points.length * 2, width, 6), sheath: sheathed ? new THREE.TubeGeometry(curve, points.length * 2, width * 3.4, 6) : null};
  }, [points, width, sheathed]);
  const range = Math.floor((geo.index!.count * p) / 36) * 36;
  geo.setDrawRange(0, range);
  sheath?.setDrawRange(0, range);
  return (
    <>
      <mesh geometry={geo}>
        <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} fog={false} />
      </mesh>
      {sheath ? (
        <mesh geometry={sheath}>
          <meshBasicMaterial color={color} transparent opacity={opacity * glow * 0.2} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
        </mesh>
      ) : null}
      {head > 0 && p > 0 ? <Dot at={curve.getPointAt(p)} size={head} color={color} opacity={opacity} /> : null}
    </>
  );
};

const WHITE_GLOW: [number, string][] = [[0, 'rgba(255,255,255,1)'], [0.08, 'rgba(255,255,255,0.8)'], [0.35, 'rgba(255,255,255,0.15)'], [1, 'rgba(255,255,255,0)']];
const glows: Record<string, THREE.Texture> = {};
const glowOf = (kind: 'amber' | 'cyan' | 'white') => (glows[kind] ??= glowTexture(kind === 'amber' ? undefined : kind === 'cyan' ? CYAN_GLOW : WHITE_GLOW));
// A glow dot at a point (a city, a packet, the head of a route).
export const Dot = ({at, size = 0.08, cyan = false, opacity = 1, color}: {at: THREE.Vector3; size?: number; cyan?: boolean; opacity?: number; color?: string}) => {
  const mat = useMemo(() => {
    const m = glowMaterial(glowOf(color ? 'white' : cyan ? 'cyan' : 'amber'));
    if (color) m.color.set(color);
    return m;
  }, [cyan, color]);
  mat.opacity = opacity;
  return <sprite position={at} scale={[size, size, 1]} material={mat} />;
};

