---
name: animated-video
description: >-
  Make animated videos in code with Remotion (React/SVG): character animation, cartoon
  stories, motion graphics, kinetic typography, animated infographics and explainers, from a
  script or voiceover, in any aspect ratio. Use when asked to animate a script, make an
  animated video or Reel, or motion graphics. Not for editing camera footage (video-edit) or
  AI-generated clips (higgsfield-*).
---

# Animated video

Turn a brief into a finished animated video in which every image is drawn in code. Treat it as
a film production: lock the format, build an audio spine, stand up a walking skeleton, make
recurring assets once, animate shots in parallel, then review renders through frames and
measurements. A film is finished when each line of the script is shown on screen, the opening
earns attention, and the review checks pass. A render that merely plays is not finished.

**Design fresh for each brief.** Choose the style, characters, palette, typography, structure
and pacing from the current brief, the audience and the user's references. The references
below record process lessons: what broke, what caught it, what saved time. Where they mention
specific creative choices (colours, fonts, gags, proportions), those are one project's
decisions, given as illustrations, not defaults.

**Use Claude Opus 5.5.** At the start, tell the user once that this skill gets its best results
with Claude Opus 5.5 at high or max effort. If the session runs another model, say so and continue.

## Scale the production to the piece

- **Short and unnarrated (under about 60s):** one agent. Write the storyboard, build scene by
  scene checking stills, render, then polish once by stepping through the render second by
  second. Skip the rig freeze, parallel animators and judge panel unless a review shows a
  problem only they fix. Widely shared 30-second Opus 5.5 pieces took a five-line brief, one
  reference image and 15–20 minutes.
- **Longer or narrated:** run the full production below.

## 1. Lock the format before building anything

"Make an animation" covers different productions: a character-driven story, motion graphics or
kinetic type, an animated infographic, a motion comic, AI-generated clips. Guessing wrong costs
whole versions. One session built five polished versions of the wrong format before hearing
what the user meant.

- When the request already names the format and style ("a hand-drawn stop-motion about X",
  "motion graphics for our launch"), confirm it in one line instead of asking.
- Otherwise name the candidate formats in one question, with a line on what each would look
  like for this brief.
- Ask about the production route and its cost. Drawn in code is free and gives exact
  consistency. AI video costs per clip and drifts between shots. Users may rule a route out.
- If a real person appears, ask where reference footage or photos live, and pull frames with
  ffmpeg instead of searching personal folders.
- Ask for a reference image: a screenshot of the character, or a frame from an animation they
  like. It specifies style better than adjectives. Design from it; don't copy another creator's
  work.
- Show one style frame (a single rendered still) plus a treatment of 3–5 lines before any full
  build. This is the cheapest point to hear "not what I wanted". For a short piece, show the
  first scene's still and keep building unless the user stops you.
- Read `~/.animated-video/profile.md` if it exists: the user's preferences and past projects.

Done when: the user has confirmed the format, the route, and a style frame (for a short piece,
the format is confirmed and the first still has been shown).

## 2. Build the audio spine

Every beat times off the narration, so the audio comes first. Without narration, the music or
sound bed sets the timing: choose or build it first and cue beats to it.

1. VO: prefer the user's own recording. If you use TTS, you can't audition it, so choose by
   metadata (age, gender, pace) and say it's a stand-in.
2. Run `templates/remotion-film/align.py` to get word timestamps and a per-frame loudness
   envelope. Fix transcription mis-splits and keep those fixes as a script, because a re-align
   must re-apply them.
3. Derive every cue from words with `cue("phrase")`. A new VO then re-times the whole film.
4. Write caption chunks by hand as sense units, checked against the transcript.
5. Source music and effects in this order: the user's files; samples on disk (such as the
   video-edit skill's `assets/sfx` library when it is installed); sound synthesized in code
   (Web Audio or Python). Samples usually sound better than synthesis. Label synthesized sound
   as synthetic, because you can't audition it.

Done when: the transcript matches the script word for word and each line's opening words resolve,
or, without narration, the sound bed is chosen and the beats are cued to it.

## 3. Walking skeleton

Write `STORYBOARD.md` first: a logline, the recurring motif, and a scene table giving each
scene's timing, what is on screen, any on-screen text, and the transition into the next scene.
List facts you are unsure of in `NOTES.md` and leave them out of the film.

Copy the style-neutral infrastructure in `templates/remotion-film/` (timing lib, camera, the
still, render, contact-sheet and align scripts). Wire up acts, placeholder scenes, captions and
audio, and render stills across the whole timeline before any real art exists.
[Pipeline reference and gotchas](references/remotion-pipeline.md).

Done when: every act renders a placeholder with the right caption and audio, end to end.

## 4. Recurring assets: design, review, freeze

Build what appears in more than one shot first: characters, props, sets, camera language, FX,
and a scale constant for anything recurring. Design them for this brief's style.

- Characters: one parametric rig per character, documented conventions, and a model sheet
  checked against the references before any shot uses it.
  [Rig lessons](references/character-rig.md).
- Graphics: an explicit type scale, a palette with meaning assigned to each accent, and a small
  component kit. [Graphics lessons](references/motion-graphics.md).
- Plan every scale the story needs (wide, medium, close-up). A design that holds up in a wide
  shot can fall apart at 4x.

Done when: a showcase composition shows every recurring asset, and animators can use them from
an API summary without reading the source.

## 5. Animate the shots

- Write the art bible (look, colour script, cast, staging, safe zones) and per-act briefs (line,
  picture, action) before animators start.
- In the full production, run one animator per act in parallel, each owning its own files. The shared rig, kit, lib and
  film shell stay read-only to them. Throttle rendering on a shared machine.
- Every shot changes meaningfully every 1.5–3s and lands its action on its word within a few
  frames.
- Grow each transition out of the content: a morph, one object becoming the next, a camera
  push through an element, particles that reform. Carry colour and momentum across the cut.
  Generic crossfades turn a film into a slideshow.
- Draw every frame as a function of the frame number, with seeded randomness, so stills and
  renders match. [Craft techniques](references/motion-graphics.md#craft-techniques) covers the
  handmade look, motion and on-screen text.
- Watch for the recurring breakages: limbs lost when a shot is cropped, ghosting from opacity
  fades on characters, recurring entities changing scale, and a blurred or unstable final frame.

Done when: each act's contact sheet tells its beat with the sound off, and the typecheck is clean.

## 6. Review by frames and measurements

Agents can't watch or hear video. Review by extracting frames (contact sheets, plus dense
frames around cuts) and by measuring audio with ffmpeg. Use independent judges with different
lenses, route issues to their owners by time range, fix in parallel, re-render, and repeat.
[Review loop](references/review-loop.md).

- After each render, spot-check every flagged moment yourself. Fixers introduce regressions.
- Stop when a round gains less than about half a point, or when the top issue needs the user
  (their likeness, their voice, a format decision). Say so and ask.
- On long runs, send progress at each stage boundary with the latest contact sheet and an ETA.

## 7. Deliver

Render the final (the template normalizes loudness for social). Check the first frame (it's
the cover), the last second (clean, and it loops if intended), and the loudness. Report the
path, the open issues, and anything synthetic or invented (voice, names, messages). Commit each
version in the project's local git repo.

When the user asks for a reflection, follow [the reflection protocol](references/reflection.md).
