---
name: animated-video
description: >-
  Make animated videos in code with Remotion (React, SVG, three.js): explainers, character
  stories, motion graphics, kinetic typography, paper collage and animated infographics, in 2D or 3D, from a
  script or voiceover, in any aspect ratio. Use when asked to animate a script, make an
  animated video or Reel, or motion graphics. Not for editing camera footage (video-edit) or
  AI-generated clips (higgsfield-*).
---

# Animated video

Turn a brief into a finished animated video in which every image is drawn in code (collage-like
styles may also use sourced images, treated in code). Treat it as a film production: agree the story, choose the visual style, build an audio spine, approve a
key-frame board, make recurring assets once, animate shots, then review renders through frames
and measurements. A film is finished when each line of the script is shown on screen, the
opening earns attention, every shot meets the finish bar, and the review checks pass.

**Design fresh for each brief.** Choose style, characters, palette, type, structure and pacing
from the brief, the audience and the user's references. Every example in these references is
one film's choice among many possible ones; use it to understand a principle, then design your
own answer for this brief.

**Use Claude Opus 5.5.** At the start, tell the user once that this skill gets its best results
with Claude Opus 5.5 at high or max effort. If the session runs another model, say so and continue.

**Recommend with every question.** Each question you ask the user carries your recommended
answer and a one-line reason, so "yes" or "your call" is a complete reply.

## Scale the production to the piece

- **Short (under about 60s, one or two acts), narrated or not:** one agent through every step,
  building scene by scene and checking stills. Skip the rig freeze, parallel animators and judge
  panel unless a review shows a problem only they fix.
- **Longer, or many acts and sets:** run the full production below.

## 1. Direct the story with the user

A polished animation cannot rescue a weak story, and text is the cheapest place to fix one.
Pick the spine that fits the brief:

- **A story** (fiction, a personal story, a character who wants something):
  [story process](references/story.md).
- **An explainer** (how something works, why something happens, what a number means):
  [explainer process](references/explainer.md).

Either way: intake questions in one message, three different concepts with a recommendation,
the chosen one developed into a timed beat sheet, then stop for the user's approval, for short
pieces too. When the video-script skill is installed, check narration against its script
checklist.

Done when: the user has approved the concept and beat sheet, or supplied a finished script.

## 2. Lock the format and the visual style

"Make an animation" covers different productions (a character story, motion graphics, an
infographic, a 3D explainer, a motion comic, AI clips). One session built five versions of the
wrong format.

- When the request already names the format and style, confirm it in one line instead of asking.
- Otherwise offer two or three visual styles that genuinely differ and fit the brief, and show
  each as a style frame of the same beat, so the user compares like with like.
  [Visual styles](references/styles.md).
- Ask about the production route and its cost. Drawn in code is free and gives exact
  consistency. AI video costs per clip and drifts between shots. Users may rule a route out.
- If a real person appears, ask where reference footage or photos live, and pull frames with
  ffmpeg instead of searching personal folders.
- References: use any the user gives (a frame, a video they like), and look first for ones they
  already chose in recent projects. Without one, look up photos of the real objects, places and
  interfaces the film will show, so the drawing is accurate in its own style. Design from
  references; don't copy another creator's work.
- Read `~/.animated-video/profile.md` if it exists: the user's preferences and past projects.

Done when: the user has picked a style frame; an approved written plan does not approve a look.

## 3. Build the audio spine

Every beat times off the narration, so the audio comes first. Without narration, the music or
sound bed sets the timing: choose or build it first and cue beats to it.

1. VO: prefer the user's own recording. To build before it exists, use stand-in word timings
   from the script ([pipeline](references/remotion-pipeline.md#before-the-vo-exists)). If you
   use TTS, you can't audition it, so choose by metadata and say it's a stand-in.
2. Run `templates/remotion-film/align.py` to get word timestamps and a per-frame loudness
   envelope. Fix transcription mis-splits and keep those fixes as a script.
3. Derive every cue from words with `cue("phrase")`. A new VO then re-times the whole film.
4. Write caption chunks by hand as sense units, checked against the transcript.
5. Plan music and sound effects now; they ship with the first cut. Source them in this order:
   the user's files; samples on disk (such as the video-edit skill's `assets/sfx` library);
   sound synthesized in code, labelled as synthetic because you can't audition it. Given a
   reference video, measure its music (key, tempo, drop-outs) and match its role.

Done when: the transcript (or stand-in) matches the script and every cue resolves, or, without
narration, the sound bed is chosen and the beats are cued to it.

## 4. Walking skeleton and key-frame board

Turn the approved beat sheet into `STORYBOARD.md`: the logline, the recurring motif, and a
scene table of timing, picture, on-screen text and the transition into the next scene. For each
line, name the thing on screen and what changes in it. List uncertain facts in `NOTES.md` and
leave them out of the film.

Copy the style-neutral infrastructure in `templates/remotion-film/` (timing lib, camera, 3D
canvas, finish, the still, render, contact-sheet and align scripts). Wire up acts, placeholder
scenes, captions and audio, and render stills across the whole timeline.
[Pipeline reference and gotchas](references/remotion-pipeline.md).

Then render the **key-frame board**: one still per beat in the approved style, showing each
beat's composition, hero object, light and text. Detail may stay rough; the look may not. Show it
as one contact sheet with each frame's line beside it, and wait for the user's notes. This is
the cheapest point to change shots; a full render is the most expensive.

Done when: every act renders end to end with captions and audio, and the user has approved the
key-frame board.

## 5. Recurring assets: design, review, freeze

Build what appears in more than one shot first: characters, props, sets, real interfaces,
camera language, the finish, and a scale constant for anything recurring. Build each to the
finish bar (step 6) at every scale the story needs: a design that holds in a wide shot can fall
apart at 4x.

- Characters: one parametric rig each, with a model sheet checked against the references
  ([rig lessons](references/character-rig.md)). Graphics: a type scale, a palette with one
  meaning per accent, a small component kit ([graphics lessons](references/motion-graphics.md)).
- Real objects and interfaces: model how the thing really looks, in the film's style.

Done when: a showcase composition shows every recurring asset at the size it is used, and
animators can use them from an API summary without reading the source.

## 6. Animate the shots

Write the art bible before animators start: look, colour script, cast, staging, safe zones,
the chosen style's bar from its reference, and this **finish bar**, which holds in every style:

- **Full frame.** Compose for the aspect ratio; no shot leaves more than about a quarter of the
  frame as flat colour. The picture continues behind captions and app UI, calm enough to read.
- **Depth.** Foreground, subject and background, with parallax from a camera that rarely
  stops. Flat styles get depth from overlap, scale and value.
- **Light.** One brightest thing per shot, and light sources affect their surroundings: a glow
  lights the floor, a screen lights the hand.
- **Real things.** Hero objects and interfaces are recognisably the real thing, drawn in the
  style's language, never a box or a coloured rectangle standing in. When a line describes a
  human action (a tap, a press, a hand holding), show the hand doing it.
- **Life.** Secondary motion that belongs to the scene; anticipation, overshoot and settle.
- **Transitions through content.** A morph, a push through an object, particles that reform.
  Carry colour and momentum across the cut; skip crossfades and flat-colour flashes.
- **Detail in the picture.** Sophistication comes from objects, light and motion. Leave out
  decorative scaffolding: HUD kickers, tick marks, corner brackets, fake readouts.

Then write per-act briefs (line, picture, action), each pointing at the key-frame board.

- In the full production, run one animator per act in parallel, each owning its own files; the
  shared kit, lib and film shell stay read-only. Throttle rendering on a shared machine.
- Each act exports its sound events (every visible hit, landing, move and place change, from
  the same constants that draw it). The director owns one cue sheet built from those events;
  per-act sound quotas multiply into clutter.
  [Sound events](references/remotion-pipeline.md#sound-events).
- Every shot changes meaningfully every 1.5–3s and lands its action on its word within a few
  frames.
- Draw every frame from the frame number and seeded randomness, so stills and renders match.
- Watch for recurring breakages: limbs lost when a shot is cropped, ghosting from opacity fades,
  recurring entities changing scale, an empty first frame after a canvas mounts, and a blurred
  or unstable final frame.

Done when: each act's contact sheet tells its beat with the sound off and meets the finish bar
beside its key frame, the events file exists, and the typecheck is clean.

## 7. Review by frames and measurements

Agents can't watch or hear video. Review by extracting frames (contact sheets, plus dense
frames around cuts) and by measuring audio with ffmpeg. Use independent judges with different
lenses, route issues to their owners by time range, fix in parallel, re-render, and repeat.
[Review loop](references/review-loop.md).

- After each render, spot-check every flagged moment yourself. Fixers introduce regressions.
- Put each act's frames beside its anchor: the reference video's frame for the same beat when
  there is one, otherwise the approved key frame. Check finish against the bar, not only
  breakage. A shot sparser than its anchor is not ready.
- Stop when a round gains less than about half a point, or when the top issue needs the user.
  Keep open issues in `ISSUES.md` (time range, owner, severity, status).
- On long runs, send progress (latest contact sheet, ETA) at each stage boundary.

## 8. Deliver

Render the final (the template normalizes loudness for social). Check the first frame (it's
the cover), the last second, and the loudness. Report the path, the open issues, any sourced
images, and anything synthetic or invented (voice, names, messages, stand-in images). Commit each version in the
project's local git repo (`git init` at setup). For changes to a finished film (speed, trim, a caption), take the
cheapest route that preserves quality, such as an ffmpeg pass on the delivered file, and offer
a re-render only if that route visibly falls short.

When the user asks for a reflection, follow [the reflection protocol](references/reflection.md).
