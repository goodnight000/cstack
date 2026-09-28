# Reviewing a cut

Review every cut (rough, fine, final) the way a viewer meets it, then check it against the plan.
The author of a cut can't see its gaps, so the key checks go to readers who never saw the plan.
Reviewing a video that didn't come from a plan works the same way; write the plan's header
fields from the video first, then review against them.

## 1. Measure

With the render, `PLAN.md`, the edit's `timeline.json` when there is one, and a word-timed
transcript of the final audio:

```sh
uv run <video-edit>/scripts/reel.py review cut.mp4 --plan PLAN.md --timeline timeline.json --words words.json --dir review/v3
```

For a render with no timeline (an animation), leave out `--timeline`; picture changes are then
detected, and continuous motion shows few of them, so judge its rhythm by plan rows and speech
pacing. It writes:
- `sheet.png`: one frame per plan row, labelled only with the row id.
- `shape.png`: time between picture changes, the loudness curve, and the plan rows on one axis.
- `review.json`: picture-change statistics (`variation`, `longest_even_run`), the loudest
  moment and its row; with `--words`, pauses (count, median, `pause_variation`,
  `longest_even_pause_run`) and each plan row's speaking rate and longest pause; and, when the
  timeline marks speech and music tracks, speech minus music per moment with the windows under
  10 LU.

For a delivery, also run `reel.py qa [timeline.json] cut.mp4` (size, frames, decode, loudness,
peaks, audio length against picture, and each camera join when there is a timeline).

## 2. Blind readers

Give each reader only its input, in a fresh subagent that has not seen the plan or the brief.

- **Sound-off retell:** `sheet.png` alone. Ask: tell the story shot by shot; what is this about;
  what should a viewer know at the end; which frames confused you; where is the high point.
- **Radio test** (pieces with speech or narration): the transcript text alone. Ask the same
  questions. It shows whether the words carry the argument without the pictures, which matters
  for anyone listening with the screen away.

Compare their answers with the plan's Know, the opening question and the peak row. Where a
reader misses or misreads something, the fix is in the cut, not in the reader.

## 3. Ledgers from the render

Rebuild these from the cut itself, with timestamps, not from the plan:
- **Questions:** each question the cut opens, where it is answered, and what answers it (a
  frame or only a line).
- **Setups and payoffs:** each setup and where it pays off; any payoff without a setup.
- **Claims and proof:** each factual claim, graded proven on screen, only illustrated, or
  unsupported ([viewer](viewer.md)).
- **Bookend:** the first and last frames side by side.

## 4. The viewer's questions

Answer each with evidence: a frame, a measurement, a ledger line, a timeline entry.

1. **First frame and first second:** from the picture alone, what is this and why care?
2. **Focus:** one focal point at a time; after each cut, the new subject sits where the eye
   already was (look at frames 2–4 after each change).
3. **Load:** no moment with two new elements starting together or two blocks of text at once;
   text readable in its time; captions kept off dense charts and interfaces. Text and key
   content stay inside the safe margins and clear of platform interface, including mid-move and
   at the most zoomed-in frame of every camera push, where edges get cut.
4. **Purpose:** every visual and every sound has a `reason` that matches its plan row; nothing
   decorative is left.
5. **Rhythm:** picture-change lengths and pauses vary with the plan's shape (`variation`,
   `longest_even_run`, `pause_variation`, per-row speaking rate, `shape.png`); density rises into
   the peak, the peak and key lines get room, and no row is too fast to follow.
6. **Sound:** speech clear of music (`under_10_lu` windows); the music changes at story turns;
   each effect sits on a visible event; planned silences present, and no accidental dead air.
7. **Peak and end:** the peak frame is the strongest and least cluttered; the last frame means
   something and answers the first.
8. **Weak work:** go through "Weak work looks like" in each craft reference ([story](story.md),
   [camera](camera.md), [cutting](cutting.md), [sound](sound.md), [graphics](graphics.md),
   [viewer](viewer.md)) and name every match with its time.

## 5. Judges, for larger pieces

For anything past a couple of minutes, or a film with several builders, run three independent
judges in parallel instead of reviewing alone. Each gets the render, the measurements and its
lens references, extracts its own frames, and returns
`{issues: [{start, end, severity, problem, fix, principle}], keep: []}`:
- **Story and viewer:** [story](story.md), [viewer](viewer.md), plus the blind readers' answers.
  This judge also recomputes every number and formula on screen from its source and checks
  each label says where a number came from.
- **Picture:** [camera](camera.md), [graphics](graphics.md).
- **Cut and sound:** [cutting](cutting.md), [sound](sound.md), plus `review.json`.

Route each issue to whoever owns that time range, pass along every judge's `keep` list so a
fix doesn't break what works, and spot-check each fixed moment yourself after the re-render.
Track open issues, not scores; judges recalibrate between rounds.

## 6. The user's eyes

Ask the user to watch once, at the size and place it will be seen, and tell you the second
they'd have stopped watching and the one moment they remember. That is the only real
measurement of watching; request it on every important cut and record the answers in the
project notes.

## Stop

Stop revising when the remaining issues are minor, when the top issue needs the user (their
face, their voice, a format decision), or when a round fixed little. Say which, and ask.

Done when every viewer question has an answer backed by evidence, the blind retell matches the
plan's purpose, and each remaining issue is named with its time and owner.
