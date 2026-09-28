---
name: director
description: >-
  Direct any video, from a reel or product demo to a launch film, explainer, short film or
  feature: its purpose, story and one-page shot plan, and a viewer's review of each cut. Use when
  starting a video, when a video needs a story or a plan, when a cut feels aimless, or to review
  a cut. video-edit and animated-video build from its plan.
---

# Director

A video is a story told in pictures and sound, and every shot, sound and graphic in it has a
reason the viewer can feel. The director owns the purpose, the story, the plan and the review.
The crews build: [video-edit](../video-edit/SKILL.md) for camera footage, screen recordings and
sourced footage; [animated-video](../animated-video/SKILL.md) for animation drawn in code. The
principles hold for every format and length; what changes is the unit (shot, scene, sequence,
act) and what the audience brings.

Work from the craft references. Each principle in them gives the mechanism on the viewer, when
to use it and when to hold back, how to do it with our tools, and how to check it without
watching. Their numbers are sourced ranges, and their film examples show why a technique works;
neither is a template to copy.

| Reference | Covers |
|---|---|
| [story](references/story.md) | purpose, controlling idea, engine, information order, shape, setups and payoffs, structure by format |
| [camera](references/camera.md) | framing, angle, composition, moves and triggers, punch-ins, the virtual camera, staging and coverage |
| [cutting](references/cutting.md) | reasons to cut, cut types, montage, supporting footage, rhythm, sound at the join, what to cut out |
| [sound](references/sound.md) | layers, room tone, effects, bridges, music and spotting, silence, tension, loudness |
| [graphics](references/graphics.md) | jobs of a graphic, focal point, timing, explaining visually, text, design system, colour, effects |
| [viewer](references/viewer.md) | attention, comprehension, load, proof and trust, peaks and endings, myths |

## 1. Scope the piece

Establish the format, length, aspect ratio, where it plays and with sound on or off, who
watches and what they already know, and what material exists: footage, product, script,
narration, references, deadline. Read the brief, the project folder and any profile the crew
skill names. Then ask the user how to work, recommending one: co-write the story together when
it is their own story, product or opinion, or the stakes are high; or have the model work it
out alone and stop once for approval of the plan ([plan](references/plan.md#two-ways-of-working)).
Ask everything still open in the same message, including the crew skill's own intake questions
(format, production route, reference look), each with a recommended answer and a one-line
reason, so "yes" is a complete reply. When the brief's content conflicts with a stored profile
default (a math explainer against a character-led default), recommend what the brief needs and
ask.

Done when the scope fields of the plan header can be filled and the way of working is chosen.

## 2. Find the purpose and the story

Decide what the viewer should feel, know and do at the last frame, the subject under the topic
(one controlling idea), and the engine that carries the middle. Then build the spine: two or
three genuinely different spines, one chosen with a reason. Every beat joins the next with "but"
or "therefore"; one question opens early and a frame answers it; the shape has one peak; the
last image answers the first. Use [story](references/story.md) and its director's questions,
aloud with the user when co-writing.

Done when the chosen spine passes the director's questions and every link is "but" or
"therefore".

## 3. Write the plan

Write `PLAN.md` from the [template](references/plan.md#template): the header, then one row per
shot with what we see, what we hear and why the shot exists. Make each row's craft choices
from the references, as deep as that row needs: a camera move names its trigger, a graphic its
job, an effect its event, a music change its story turn. For long pieces, scale the plan to
sequence and scene pages ([scale](references/plan.md#scale)). Then run every check in
[plan](references/plan.md#checks-before-the-user-sees-it), with a fresh subagent doing the
sound-off retell.

Name the row that could sink the piece (usually the opening, the proof or the ending), so the
crew builds and tests it first.

Done when every check passes or its failure is listed as an open decision.

## 4. Stop for approval

Present the one page: the plan, the assumptions, the runner-up spine in two lines, and the open
decisions with recommendations. Wait for the user's reply before building. The crew may make a
style frame or a test passage in parallel. Silence is not approval.

## 5. Hand the plan to the crew

The crew skill builds from the approved plan. In a `timeline.json`, set `"plan": "PLAN.md"` so
`reel.py check` requires every clip to carry the `id` of its plan row and a `reason`; in
Remotion, each scene's file names its rows. An animation inside an edit is an animated-video
slot placed as one clip. When the build shows the plan was wrong, change the plan first, say
what changed, and ask only if it changes the purpose, the opening question or the ending.

Done when the crew delivers a cut built against the plan.

## 6. Review every cut as a viewer

Follow [review](references/review.md): measure with `reel.py review`, give the frames alone and
the transcript alone to fresh readers who never saw the plan, rebuild the question, setup and
proof ledgers from the cut, and answer the viewer's questions with evidence. Route each issue to
the crew with its time, the principle it breaks and the fix. Ask the user to watch once where
the video will be seen and name the second they'd have left and the moment they remember.

Done when the blind retell matches the plan's purpose, every viewer question has an answer
backed by evidence, and each remaining issue is named with its owner, or the stop rule in
[review](references/review.md#stop) applies.
