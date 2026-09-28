# Review loop: judge panel, routing, stop rule

## Panel
Use the three judges from the director's [review](../../director/references/review.md#5-judges-for-larger-pieces)
(story and viewer; picture; cut and sound), judging against `PLAN.md`, the brief and the platform.
Past films aren't the benchmark. Tell each one to extract frames itself, relate them to
`words.json`, read the source for precise fixes, and write only under `out/judge/`. The picture
judge also checks the animation itself: on-model consistency against the reference, acting,
anticipation and overshoot, continuity across cuts, and broken frames (missing limbs, z-order,
pops, ghosting, empty frames).

## Routing fixes
- Route each issue to the owner of its time range (the act files). Issues spanning 20s or more
  go to a global owner (`Film.tsx`: captions, mix, transitions). Run fixers in parallel on
  disjoint files. Pass the judges' `keep` lists so fixes don't break what works.
- The workflow shape used: kit (1 agent), then acts (8 in parallel), then render, then judges
  (3), then routed rework (up to 8), then render, and repeat for at most 2 rework rounds.

## One project's numbers (a 74s vertical short): evidence, not targets
| Track | Scores by round | Wall time | Agents / tokens |
|---|---|---|---|
| Motion graphics v1→v3 | 5/5/5 → 6/6/6.5 → 6/7/6.5 | about 45 min | 11 / 1.55M |
| v4 rework (resumed) | 6/6/6 | about 18 min | 4 live / 0.6M |
| v5 polish (single agent) | not judged | about 19 min | 1 / 0.23M |
| Cartoon kit+acts+2 reworks | 6/6/6.1 → 6.5/7/6.5 → 7/7/6.4 | about 2.5 h | 36 / 6.1M |

## Lessons
- Scores plateau fast. After round 2, the top issue in both tracks was something only the user
  could supply or decide (their face, the format). Stop and ask instead of adding rounds.
- Scores aren't comparable across rounds, because judges recalibrate (v3→v4 design went from 7
  to 6 while the film improved). Track the open issues, not the number.
- Your own spot-check after each render still catches things: a per-word duck that pumps, a
  see-through character, floating legs, a blurred last frame. Pull frames at every flagged
  time before reporting "done".
- A long run needs visible progress. Send the latest contact sheet and an ETA at each stage
  boundary.
