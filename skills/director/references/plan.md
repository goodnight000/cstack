# The plan

`PLAN.md` in the project folder is the one page the user approves and the authority from then
on. It replaces separate beat sheets, storyboards and shot lists. A later change edits the plan
first, then the build. Build clips carry the plan row they serve (`id`) and why they exist
(`reason`), so the finished cut can be checked against it.

## Scale

The craft is the same at every length; the unit grows from shot to scene to sequence to act.

- **Up to about 3 minutes:** one page, one row per shot.
- **Longer (long explainers, short films past ten minutes):** a top page with the header and one
  row per sequence (its purpose, its turn, its peak), then one page per sequence in `plans/`
  with the shot table. Row ids are `sequence.shot` (`4.2`).
- **Feature length:** add a treatment (one to three pages of prose: the story told straight,
  present tense) before the sequence pages, and a scene row level between sequence and shot
  (`12.3` is scene 12, shot 3). Plan shots in detail one sequence ahead of the build, not all
  at once.
- **Anything filmed:** each row that needs capture carries its coverage and a line on what
  the person on camera is doing and why ([camera](camera.md)); the capture list becomes the
  shoot schedule.

## Template

```markdown
# <Title>

**Format:** <reel | demo | launch | explainer | short film | feature | other> · <length> · <aspect> · plays <where>, sound <on | off | either>
**Audience:** <who; what they already know; what they want>
**Purpose:** Feel: <…> · Know: <…> · Do: <…>
**Controlling idea:** <one sentence: the value at stake and what causes it to change>
**Engine:** <suspense | curiosity | surprise | watching it work> — <how, in one line>
**Opening question → answer:** <question> → <the frame that answers it, row id>
**Information plan:** <what the viewer knows compared with the character or speaker; each reveal, marked surprise or suspense>
**Shape:** <intensity 1–5 per beat, e.g. 2 3 2 4 3 5 2> · peak: <row id>
**Bookend:** <opening image> → <closing image, and what has changed>
**Style:** <look, palette with a meaning per accent, type, motion language, sound world; two or three lines>

| id | start | beat | link | see | hear | why | asset |
|---|---|---|---|---|---|---|---|
| 1 | 0:00 | <what changes> | — | <subject, size in frame, source; any camera move and its trigger> | <line; music state; effect or silence> | <one idea, 8 words or fewer; opens, sharpens or answers the question; serves feel, know or do> | have |
| 2 | 0:04.5 | … | therefore … | … | … | … | build |

**Spines considered:** <the chosen spine and the runner-up, one line each, and why this one>
**Setups → payoffs:** S1 <setup row> → <payoff row>; …
**Claims → proof:** <claim> → <row whose picture proves it, or "reworded as opinion">
**Pitfalls:** <the two or three ways this piece could fail>
**Open decisions:** <decision> — <recommended answer> — <one-line reason>
**Capture and build list:** <what to film, record, draw or source; facts to verify>
**Checks run:** <each check's result, and what the sound-off reader found>
```

Keep the table's first two columns exactly `id` and `start` (`m:ss`, `m:ss.s` or seconds):
`reel.py check` and `reel.py review` read them. `link` is "but" or "therefore" plus a clause.
`asset` is have, capture, build or source.

Fill `see` and `hear` from the craft references, only as deep as the row needs: framing and
moves from [camera](camera.md), joins and supporting footage from [cutting](cutting.md),
music, effects and silence from [sound](sound.md), graphics, text and diagrams from
[graphics](graphics.md). Story fields come from [story](story.md); the audience line and the
proof table from [viewer](viewer.md).

## Checks before the user sees it

Run every check and fix what fails; list anything left failing under Open decisions.

1. **Purpose:** one feel, one know, one do, and every row's `why` serves at least one.
2. **Chain:** every link is "but" or "therefore". A row that joins only with "and then" gets a
   cause, merges into its neighbour, or goes. A montage that compresses time counts as one beat.
3. **Answer:** the opening question is answered by a frame, not only a line, before the end.
4. **Stakes:** who wants what, what stands in the way, and why now are concrete. In fiction the
   decisive action belongs to the protagonist; in non-fiction the viewer's stake is named.
5. **Ledger:** every setup has a payoff and every payoff a setup.
6. **One idea per shot:** each `why` fits in 8 words with no "and"; a second idea is a second row.
7. **Sight and sound complement:** no row where `hear` narrates what `see` already shows. A
   demo says each step while showing it; that pairing is the exception.
8. **Sound-off retell:** give a fresh subagent only the `see` column and ask it to (a) retell
   the story, (b) state the one thing a viewer should know at the end, (c) name the opening
   question and the shot that answers it, (d) list shots that make no sense without sound, and
   (e) list places where one shot only follows the last ("and then"). For anything with speech,
   give a second fresh subagent only the spoken text and ask the same, plus what would lose a
   listener: symbols never defined aloud, a named word that sounds like grammar, a spoken
   formula whose grouping is ambiguous, two facts that blur into one. A mismatch with the plan
   is a planning failure, not the reader's.
9. **Shape:** one peak, a contrast before it, a release after it.
10. **Time:** row times add up to the length, and each row's spoken words fit its duration at
    the speaker's measured pace (from their recording when it exists). With a synthetic voice,
    voice the draft narration during planning, take each row's `start` from its alignment, and
    cut the script until it fits; estimates run long. After any re-voice, refresh every `start`
    from the new alignment so the plan and the review stay in step.
11. **Proof and assets:** every claim has a proof row or is reworded as opinion; every number
    shown names its source (a data file, a paper, or illustrative and labelled so on screen);
    every row has an asset source; facts to verify are listed.
12. **Remove-this-row:** state what each row's removal would lose; a row that loses nothing goes.

## Two ways of working

Ask which one at the start, with a recommendation: co-write when the story is the user's own
(their life, their product, their opinion) or the stakes are high; work alone when the brief is
complete and the user said to make it.

**Co-writing.** The model is director and editor; the user is the source of truth.
1. Ask the open intake questions in one message, each with a recommended answer.
2. Mine before inventing: ask for the real moment ("what happened the first time it worked?").
   Use the user's words for their experience; never invent their feelings or quotes.
3. Offer two or three genuinely different spines, each with its controlling idea, opening
   question and ending image, and say which you recommend and why.
4. Run the director's questions from [story](story.md) aloud on the chosen spine; raise at most
   three problems, each with a proposed fix.
5. Write the plan, run the checks, present it, and wait for approval.

**Working alone.** One stop.
1. Derive purpose, audience and length from the brief and profile; write each assumption down.
2. Draft three spines, pick one with a written reason, and keep the runner-up.
3. Write the plan and run the checks, with a fresh subagent for the sound-off retell.
4. Present the plan, the assumptions, the runner-up in two lines, and the open decisions with
   recommendations. Nothing is built before the reply, except a style frame or test passage
   the crew skill runs in parallel.
5. After approval, build without further story stops. If the build shows the plan was wrong
   (the footage can't carry a beat, a claim fails verification), update the plan, name the
   change, and ask only if it changes the purpose, the question or the ending.

Silence is not approval in either mode. Skip the stop only when the user supplied a finished
plan or explicitly said to go ahead without reviewing it; then still run the checks and name any
weakness in one line.
