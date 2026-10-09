# Luminous 3D

A dark world where information and energy are the light sources: real 3D space with fog and
depth, a few emissive accents, modelled real objects, a camera that travels from macro to micro.
It suits systems, infrastructure, science and scale. Colours, subjects and density are chosen per
brief; a luminous film can be warm or cold, sparse or dense, stylised or near-photoreal.

## Its bar (in addition to the finish bar)
- **Light is physical.** Emissive things light their surroundings with real lights; materials
  respond (`MeshStandardMaterial` / `MeshPhysicalMaterial`, rim light on hero objects,
  reflections from an environment map built with `PMREMGenerator` over a small procedural
  scene). Additive sprites are for the bright core only.
- **Value discipline.** Keep large surfaces under about 55% brightness so only true light
  sources bloom; one brightest thing per shot.
- **Accent meaning.** A dark base plus a few accents, each meaning one thing in the story (for
  example, one colour for the data being followed, one for infrastructure, one for failure).
- **Depth.** Fog fading toward the base colour, out-of-focus particles near the lens, far things
  smaller, dimmer and cooler, and a camera that drifts, pushes or orbits rather than holding.
- **Modelled objects.** Look up the real object and model its parts (bevels, panel lines,
  ports, cables, housings), plus procedural roughness or normal detail from canvas textures.
- **Ambient life.** Particles, blinking indicators, pulses running along idle links, haze.

## Typical failure
A first pass tends to come out as glowing shapes on a flat dark field: subjects in one part of
the frame and the rest empty, one plane, glows that light nothing, and primitives standing in
for objects. Check the first stills for exactly this before building further.

## Mechanics
- Stack: `@remotion/three`, `three`, `@react-three/fiber`. Use the template's
  `src/kit/three-canvas.tsx` instead of the stock `ThreeCanvas`: it holds each frame until the
  scene inside has drawn, so the first frame after a mount is never captured empty.
- Keep one canvas mounted at a time. Build geometry and textures once in `useMemo`; per frame,
  update instance matrices and uniforms only.
- Hold the frame with `delayRender` until textures and images have loaded and been drawn, not
  just requested; a late texture otherwise shows as a missing object in random frames.
- Finish: the template's `src/kit/finish.tsx` adds bloom on bright pixels, a vignette and fine
  grain. Grain also stops dark gradients banding after the platform recompresses the video.
- Budget: measure the heaviest frame with `npx remotion still` and keep it to a few seconds at
  full size; keep instance counts in the low hundreds of thousands.

## One example, among many possible
A 2026-10 vertical explainer about a photo crossing the Pacific used a navy base with amber for
the photo's data, cyan for infrastructure and red for loss, a globe with a dense cable web, a
seabed, a modelled phone running a messaging app, and rack routers. Its first cut was rejected
as flat and sparse; the rebuild that met the bar above was accepted. Those colours and objects
were that topic's; a film about, say, the immune system or a power grid would choose its own.
