# Graphics, animation, text and effects

A graphic helps only when it makes the viewer understand or feel what the picture alone could not, when they need it. The governing question: what job does this element do, and what would the viewer miss without it?

## Questions to ask

1. What must the viewer understand or feel at this second, and is the picture already doing it?
2. Where is the eye now, and where must it go next (Smith 2012)?
3. What changes in meaning here? If nothing, nothing needs to move (Tversky et al. 2002).
4. Is it true? A chart, label, equation or mockup is a claim, held to the narration's standard.
5. Clarity or spectacle? Spectacle earns attention once; clarity keeps it. Spend spectacle on the planned peak.
6. Density or dwell? When the viewer cannot pause, split an idea across beats rather than packing one frame.
7. Consistency or surprise? A system makes one deliberate break land; break it only at a story turn. Likewise realism or stylization: choose either on purpose.

## Principles

### 1. Name the graphic's job before its look
Extraneous pictures, text and motion use working memory the essential material needed; "seductive details" cut recall and transfer (Harp & Mayer 1998), most when the viewer cannot pause (Mayer & Fiorella 2014). Give each graphic one job: **orient** (where, who, which thread), **explain** (structure or process footage cannot show), **emphasize** (point at something on screen), **evidence** (the real thing named), **feel** (tone, rhythm).
- **Masters:** Bass's *Psycho* titles use a few bars that read as knives before the shower scene.
- **Use / hold back:** Hold back when the face is the content (a confession, a joke's delivery) or the reason is "the frame felt empty".
- **In our tools:** Each overlay clip carries its plan-row `id` and a `reason` naming its job.
- **Check:** One sentence per graphic naming what the viewer would miss without it; "nothing" means cut. Every overlay maps to a plan row and a transcript span.

### 2. Stage one new motion onset per moment
Motion onset pulls gaze hard, so two things starting at once split the audience (Smith 2012); the audience "can only see one thing at a time" (Lasseter 1987, after Thomas & Johnston).
- **Masters:** Disney's staging: poses that read in one look.
- **Use / hold back:** Bring elements in one at a time and hold earlier ones still; move a group as one unit when it is one idea. A "too many" moment wants simultaneity.
- **In our tools:** Offset Remotion entrances so no two primary ones start within a few frames.
- **Check:** Frame-difference contact sheet (FFmpeg `tblend=all_mode=difference`): more than one bright region per beat is split attention. Shrink and blur key frames; the brightest blob should be the focal point.

### 3. Animate only what changes
Animation helps only when the idea itself is change over time (congruence) and the viewer can perceive it: slow and simple enough, one change at a time (apprehension) (Tversky et al. 2002).
- **Masters:** Rosling's *200 Countries, 200 Years, 4 Minutes* moves one thing, time, and holds the rest.
- **Use / hold back:** Static relations (a hierarchy, a finished equation) sit still once built. A matrix meant as a transformation should move space; a matrix of data stays a table.
- **In our tools:** In Remotion, hold constant anything not tied to the story.
- **Check:** Name the change in meaning each moving element shows; flag looping particles and drifting gradients.

### 4. Give motion timing and spacing
Viewers read physics into motion: light things move fast, heavy things slowly (Lasseter 1987). Timing is how many frames; spacing is how they are distributed (Williams); linear spacing reads as mechanical. Entrances decelerate, exits accelerate; a payoff gets more frames than a transition; anticipation only on the key reveal; follow-through (a card lands, its label settles a few frames later); arcs over straight diagonals.
- **Masters:** *Spider-Verse* animated on twos to escape realism, making frame rate a style.
- **Use / hold back:** Springy overshoot means "light and eager": right for a notification, wrong for a serious statistic.
- **In our tools:** Remotion `interpolate` with named easings or `spring` with damping per meaning; hold on twos with `Math.floor(frame / 2) * 2`.
- **Check:** Print the property per frame: an entrance's velocity peaks mid-move and falls to zero, and each move ends before the next event.

### 5. Choose the kind of animation from the job
**Kinetic type:** tone, rhythm, a payoff line; not a full argument. **Building diagram:** structure, cause, process; not emotion. **Data in motion:** one comparison with a narrator; not analysis. **Character animation:** empathy and want; not precision. **Interface animation:** a flow cleaner than a recording; loses trust if it drifts from the product. **Cutout/collage:** handmade warmth, archive, satire. **Callouts on footage:** a detail, price or name; nothing needing a sentence.
- **Masters:** Bass's *North by Northwest* type grid becomes a building façade.
- **Use / hold back:** Plain footage is always a candidate and often wins.
- **In our tools:** Remotion for drawn work; `reel.py place` for callouts over footage.
- **Check:** Each graphic's plan row names its kind and why it beats plain footage; mocked screens match real screenshots.

### 6. Explain one clause at a time, along the path of cause
Understanding improves when words are narrated rather than printed over animation, when picture and word arrive together (temporal contiguity, d = 1.22), when cues mark the organization, and when the lesson is segmented (Mayer & Fiorella 2014). Cues work best sparingly; colour spreading along a causal path helped strongly (progressive path d = 1.42) while arrows did not (d = −0.03) (Boucheix & Lowe 2010, via Mayer & Fiorella).
- **Build:** add one element per spoken clause, so the diagram's growth is the argument. An equation arrives term by term as each is named; a system diagram gains one component per sentence. Never show the finished diagram, then talk through it.
- **Pre-train:** name and show the parts (variables, axes, components) before the process runs.
- **Keep objects constant:** a term, vector or node keeps its colour, shape and identity as it moves or combines (Heer & Robertson 2007). When an equation is rearranged, terms travel to their new places.
- **Signal the path:** light the route a signal, request or quantity takes, instead of an arrow at each noun.
- **Congruent metaphors:** only when the real thing is invisible, with matching structure (a pipeline for staged processing, not a rocket for "growth"), kept to the end.
- **Caveat on animated data:** animated trends were most enjoyed but caused many reading errors; small multiples beat them for detail (Robertson et al. 2008). Animate data only when narration says where to look; otherwise land on a static end state.
- **Masters:** Kurzgesagt settles visual metaphors and transitions at the storyboard, before animating.
- **In our tools:** Remotion keys each element to its word's start in the transcript, so a new voice take re-times the build.
- **Check:** Each element's first frame is within a few frames of its word. One still per clause reads as a comic strip of the argument. If the final frame alone is unreadable, segment.

### 7. Write text for its kind and its reading time
Printed text repeating narration beside a graphic reduces learning (redundancy, d = 0.86), but 1–3-word labels next to their target help (Mayer & Johnson 2008; spatial contiguity d = 1.10). **Captions** carry speech exactly, break at sense units, hold one position. **Titles** orient in a few large words and never duplicate the caption. **Labels** are 1–3 words on their target, appearing when the voice names it.
- **Sourced limits:** Netflix English subtitle spec: 17 characters/s, 42 characters/line, 5/6 s to 7 s per event. BBC: 160–180 words/minute (secondary). Reels 9:16 (2026 secondary ad guides): keep text out of the top ~14%, bottom ~35%, ~6% each side; TikTok and Shorts differ, so re-check. Contrast: WCAG 4.5:1, borrowed from the web.
- **Masters:** *Sherlock* floats texts in the scene beside the character instead of cutting to a phone.
- **Use / hold back:** One emphasis channel at a time (weight, colour or scale) on claims, contrasts, numbers, payoffs.
- **In our tools:** Captions from the word-aligned transcript; titles and labels as Remotion overlays placed with `reel.py place`.
- **Check:** Characters per second per event; non-caption strings over ~6 words that repeat speech; boxes against the safe zone; worst-frame contrast; names and numbers against a checked list.

### 8. Rank every element, and transfer contrast when focus moves
The eye goes to what differs most; more contrast means more intensity (Block, *The Visual Story*). In video, roughly strongest first: motion onset, brightness, size, saturation, sharpness, isolation. Only rank 1 moves or carries the accent. When focus changes, dim the old, then lift the new.
- **Masters:** A live-action rack focus does the same transfer.
- **Use / hold back:** Save maximum contrast for the climax; intensity must build (Block).
- **In our tools:** A rank prop on Remotion components for opacity, saturation, blur; Resolve power windows over footage.
- **Check:** Grayscale the key frame; the focal point must still win. The accent covers a small share of pixels, on the rank-1 element.

### 9. Write a design system before any component
Consistency lowers reading cost: once yellow means "the problem", later beats decode for free. Define a palette with one meaning per accent (one primary, at most one secondary); one display and one text face; a type scale (caption, label, title, hero); a spacing ramp and fixed anchors inside the safe zone; two or three named easing curves (arrive, move, leave); a few named durations (fast, standard, hero); an entrance vocabulary.
- **Masters:** *Traffic* gives each storyline its own look, so viewers always know the thread.
- **Use / hold back:** Design fresh for each subject.
- **In our tools:** One token file imported by every Remotion scene and read for overlays on camera edits.
- **Check:** Grep scene code for colour, size, duration and easing literals outside the tokens; count distinct text styles in sheet.png against the scale.

### 10. Script colour across the whole video
Shifts in temperature, saturation and value mark acts and turns below conscious attention; contrast saved for the climax intensifies it (Block). Draw 6–12 swatches first, one per act or turn, noting where the accent appears.
- **Masters:** Ralph Eggleston's colour script for *Toy Story* mapped how each scene should feel before production.
- **Use / hold back:** Cool, desaturated problem to warm, saturated solution; or a neutral base where one accent grows as the idea sharpens. Over camera footage the script governs graphics and B-roll grade; leave the user's footage natural unless asked.
- **In our tools:** Per-act palettes in the tokens; FFmpeg `colorbalance`/`lut3d` or Resolve to match B-roll.
- **Check:** A movie barcode (each frame scaled to one column, tiled) against the planned script; flag acts that should differ but don't, and a climax that isn't the most intense.

### 11. Grow transitions from the content
A transition works when the eye's next target is where it already is; carrying a shape, colour, position or motion across the change says the images are connected. In order of meaning: one object becomes the next; a morph between related forms; a graphic match; a match on motion; a plain cut, which beats a meaningless flourish.
- **Masters:** Kubrick's bone-to-satellite cut in *2001* compresses millions of years into one match.
- **Use / hold back:** A morph asserts sameness; reserve it for related things.
- **In our tools:** Remotion shared elements in a layer above both scenes, interpolating across the boundary.
- **Check:** With `reel.py view` at each join, compare the focal point's position in the last and first frames; a large uncued jump is rough. More than two or three generic transition types in a short piece is decoration.

### 12. Match graphics to footage, or keep them honestly flat
The eye judges belonging by light direction, levels, temperature, grain, softness, perspective and camera motion; one mismatch reads as pasted on. **Flat** (a card or inset in its own plane, the default) needs clean edges and a consistent shadow. **Grounded** (attached to an object) needs a track plus matched levels and grain. **In the world** (in the scene's perspective and light) is for hero shots.
- **Masters:** For *Interstellar*, Franklin's team projected light onto the set so actors received real light.
- **Use / hold back:** Graphic blacks no deeper than the footage's, whites no brighter than its highlights, matching grain, slight softness so vector edges are no sharper than the lens.
- **In our tools:** FFmpeg `noise` and `colorlevels` on overlays; tracking via Resolve's Fusion tracker (confirm on the installed version) or OpenCV positions fed to Remotion.
- **Check:** Compare 1st/99th luminance percentiles and high-pass noise inside the graphic versus nearby footage; tracked anchors stay on the object every 0.25 s.

### 13. Use effects as punctuation, not texture
Each effect has one job; overuse erases it: a mask controls when information arrives; a highlight signals into a busy image; blur lowers the background's rank; glow marks an active state; grain integrates or dates; a speed ramp stretches a decisive instant; a freeze stops time to comment; split screen shows simultaneity or comparison; picture-in-picture lets a speaker comment on evidence without covering it.
- **Masters:** Truffaut ends *The 400 Blows* on a freeze that leaves the question open.
- **Use / hold back:** One signature effect at the two or three moments that need it, each tied to a script word; never two on one event.
- **In our tools:** Constant `speed` per clip (a ramp is stepped clips); a freeze is an extracted still; split screen and PiP via `reel.py place`.
- **Check:** Inventory effects (type, start, cue word, job); flag missing cues, overspent budgets, two effects starting together.

### 14. Make the style say something, then subtract
Viewers read a graphic's manner as information: handmade signals a person, precise vector a system, a glossy template an ad. Finish the sentence "This style says ___ about the subject" before choosing a look. The last professional pass removes elements.
- **Masters:** The *Se7en* titles are hand-scratched because they come "from the mind of the killer".
- **Use / hold back:** A developer tool wants precise and quiet; a personal story can be rough and hand-marked.
- **In our tools / Check:** Render key frames with and without each non-essential element and compare each pair against the row's `why`; where the intent reads as well without it, delete. Ask the user on matters of taste.

## Across formats

| Format | What shifts |
|---|---|
| Reel | Face or subject dominates; graphics flat, clear of it, inside the safe zone. Captions are the only continuous text. |
| Product demo | The interface is the content: crop to the active region, dim the rest, label the control. Mockups match screenshots. |
| Launch | Needs the design system and colour script most. Spend contrast at the reveal; hold proof numbers long enough to read. |
| Explainer | Building diagrams carry the argument, with pre-training and constant objects. Animate data only with narration pointing. |
| Short film | Graphics belong to the world or a character's voice (diegetic text). Effects only where perception changes. |
| Feature | Titles set tone; effects follow one realism or stylization rule and are rationed; the colour script spans acts and storylines. |

## Weak work looks like

- Every element enters with the same scale-bounce and duration, often at once.
- A headline restating the voice word for word above the captions.
- An icon for every noun: money bag, lightbulb, rocket.
- Particles or gradients drifting behind content throughout.
- Glow, neon, glassmorphism or purple-to-blue gradients unrelated to the subject.
- The accent colour everywhere; multicolour captions with no rule.
- A finished infographic or full equation shown at once, then talked through.
- Arrows bouncing at each item instead of the causal path lighting up.
- Linear keyframes: motion that starts and stops dead.
- A variable or node that changes colour between scenes.
- Mockups that don't match the product; invented chart numbers.
- Graphics over the face or in platform UI zones.

## Sources

- Mayer & Fiorella (2014), *Cambridge Handbook of Multimedia Learning*, ch. 12 (incl. Boucheix & Lowe 2010)
- Mayer & Johnson (2008); Harp & Mayer (1998)
- Tversky, Morrison & Bétrancourt (2002)
- Heer & Robertson (2007); Robertson et al. (2008)
- Smith (2012)
- Lasseter (1987); Thomas & Johnston (1981); Williams (2001)
- Block, *The Visual Story*; Tufte, *The Visual Display of Quantitative Information*
- Netflix Timed Text Style Guide; BBC reading rate (secondary); Reels safe zones, AdNabu and Solid (2026, secondary)
- Art of the Title; Art of VFX (Franklin); VFX Voice (*Spider-Verse*); MoMA (Pixar colour scripts); Tony Zhou (2014); Kurzgesagt process notes
