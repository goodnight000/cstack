# Visual styles

The visual style is the language every frame speaks: how space, light, objects, text and motion
are drawn. Choose it for the brief, not from habit or from the last film. The library below
gives starting points with lessons attached; it is not a complete list, and a brief may call
for one that isn't here.

## Library

Every 2D style here is drawn as SVG in Remotion, so "SVG" is the medium, not a style. A style is
what the drawing looks like and how it moves.

| Style | Suits | Signature | Typical failure | Lessons |
|---|---|---|---|---|
| Luminous 3D: dark space, light-emitting data, real depth | systems, infrastructure, science, scale | emissive accents, fog, a camera travelling macro to micro | glowing shapes on a flat dark field | [style-luminous-3d.md](style-luminous-3d.md) |
| Handmade 2D: paper, ink, held drawings | personal stories, warmth, charm | grain, irregular edges, line boil on twos | a texture filter over clean vectors | [style-handmade-2d.md](style-handmade-2d.md) |
| Editorial collage: newspaper clippings, cut paper, halftone (Vox, Johnny Harris) | investigations, history, money, politics, "the story behind X" | cutouts with white edges and drop shadows on a paper board, red-marker circles and arrows, typewriter labels, 12 fps | a slideshow of clip-art pasted on beige | [style-editorial-collage.md](style-editorial-collage.md) |
| Line-art draw-on: strokes that draw themselves (whiteboard) | step-by-step teaching, processes, an idea sketched as it's explained | `pathLength` stroke reveals in narration order, the board fills as the argument builds, a pull-back to the whole sketch at the end | the stock whiteboard look: clip-art icons, a pasted hand, everything drawn at one speed | derive from references |
| Stick-figure doodle (CGP Grey, xkcd) | opinion, finance, humour, fast series production | minimal figures that act, flat colour, jokes in the drawing | figures stand still while the narration does all the work | [character-rig.md](character-rig.md) |
| Character cartoon: a rigged cast acting | stories with a protagonist | a parametric rig, model sheets, acting beats | limbs lost in crops, a cast that changes scale | [character-rig.md](character-rig.md) |
| Flat editorial or infographic (Kurzgesagt-like vector) | data, comparisons, processes, science | geometric vector shapes, a strict palette, charts that build | icons in coloured circles, symbols instead of real things | [motion-graphics.md](motion-graphics.md) |
| Map documentary (RealLifeLore, Wendover) | geography, logistics, trade, "why is X where it is" | an accurate map, route lines drawing on, labelled pins, a camera flying between places | a map that is wrong, or a static map with arrows | derive from references |
| Product UI film: a launch or feature reveal (Apple, Linear) | software launches, feature demos | the real interface on a dark stage, headline lines in sequence, smooth ease-in-out with no bounce, outgoing text leaves before incoming arrives | invented UI, or a generic glowing card standing in for the product | [motion-graphics.md](motion-graphics.md) |
| Kinetic typography: the words are the picture | quotes, manifestos, short punchy lines, sound-off feeds | type that moves with meaning, synced to the voice | motion that makes the words harder to read | [motion-graphics.md](motion-graphics.md) |
| Retro analog: VHS, CRT, early web, film | nostalgia, internet history, "back in 2012" | scanlines, chroma bleed, period type and UI, tape glitches on cuts | an overlay over modern design; the period has to be in the type and the objects | derive from references |
| Others: isometric, pixel art, painterly, clay look | when the brief or a reference points there | | | derive from references |

## Choosing for the brief
- **Start from the subject's real material.** A story about reporting suits clippings; a story
  about a product suits its real UI; a story about a place suits its map. When the subject has
  no native material, choose by register: warmth (handmade, collage), authority (flat
  editorial, map), wonder or scale (luminous 3D), humour or speed (stick figure, kinetic type).
- **One lead style per film.** Borrow another style for a single beat when it shows something
  the lead can't (a map beat inside a collage film), and draw it with the lead's palette and
  finish.
- **Distinct beats generic.** As of 2026-10, feeds are full of smooth, glossy AI-made motion.
  Styles with a visible hand, a real artifact (a clipping, a real UI, a real map) or a strong
  period look stand out; use 3D where depth carries meaning rather than for gloss. Re-check
  this note as trends rotate.

## Choosing with the user
- Offer two or three styles that genuinely differ and each fit the brief, with one line on
  what the film would feel like in each and the one you recommend.
- Render a style frame of the **same beat** in each, at the delivery aspect ratio and finish,
  so the user compares like with like. A frame is worth more than adjectives.
- Make each frame that style's honest best, with its own lighting, materials and caption
  treatment. Frames may share geometry, but two that differ only in lighting or palette are one
  style shown twice.
- Recommend from the brief. A style the user liked on an earlier film is evidence about their
  taste, not a default for this one.
- A quick throwaway scene is enough for style frames; the real build starts in step 4.
- The user's feedback may land between options ("the first, but more realistic"). Treat each
  round as a revision of the chosen frame, and keep the parts already approved.
- Once chosen, write the style down for the art bible: palette with one meaning per accent, type
  scale, materials or textures, lighting, camera language, transition vocabulary, and finish.

## The bar for a style
The finish bar in SKILL.md step 6 holds in every style. Each style adds its own: what "real
objects", "depth" and "light" mean in its language, and its typical failure. When a style has no
lessons file here, write its bar into the art bible from the references you looked up, and add
a file here afterwards if the lessons generalize.
