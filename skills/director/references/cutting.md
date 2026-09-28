# Cutting

Cutting decides what the viewer sees next, for how long, and what two images mean side by side: it removes what doesn't serve, orders what remains, and times each moment to land. The governing question at every join: what does the viewer know or feel after this cut that they didn't before?

## Questions to ask

1. What does this shot add, and what breaks without it? If nothing breaks, cut it.
2. Has the outgoing thought finished? Cutting on the release of attention feels natural. Cutting mid-thought is right only when interruption is the point.
3. Hide the cut or show it? Fiction and demos hide it to keep the viewer inside the event. Essays and compressed testimony can show it, if they do so consistently.
4. What third idea comes from A next to B, and has the video set up what the viewer needs to decode it?
5. What is this line's claim, and what picture would convince a sceptic: evidence, explanation or metaphor?
6. Do shot lengths shorten into the peak and lengthen after it?
7. Is there a change of time or place the viewer must feel? If not, cut.
8. For a speaker: which pauses belong to their rhythm, and where is the face itself the proof?

## Principles

### 1. Give every cut a positive reason
Viewers segment experience into events where their predictions fail. Cuts that break action register as new event boundaries, while cuts that continue action are absorbed. A cut with no reason makes the viewer do that work for nothing (Dmytryk 1984; Zacks et al. 2007; Magliano & Zacks 2011).
- **Masters:** Cameron drops any scene that doesn't propel the story, set something up or resolve a character. Murch aims for "a chain of self-evident surprises".
- **Use / hold back:** Every format. The failure is cutting to a clock, or because footage exists.
- **In our tools:** A clip's `reason` names what the cut buys (reveal, reaction, evidence, time jump, accent). Its `id` ties it to a plan row.
- **Check:** Read `reason` values in order against the transcript. Flag empty reasons and neighbours with the same reason and subject. For each, ask whether removing it loses anything.

### 2. Cut where the emotion is true; give up the rest from the bottom
Murch ranks what a cut must respect: emotion 51%, story 23%, rhythm 10%, eye-trace 7%, 2D screen plane 5%, 3D space 4%. When you can't keep all six, give them up from the bottom of the list. Good cuts fall where a viewer would blink, at the end of a thought. Viewers' spontaneous blinks synchronise at implicit story breakpoints (Murch 2001; Nakano et al. 2009).
- **Masters:** Murch stops playback where "the rightness quotient builds to maximum", then checks he can hit the same frame twice.
- **Use / hold back:** Everywhere; a smash cut breaks it on purpose.
- **In our tools:** `reel.py view` shows frames, waveform and words at a join.
- **Check:** Flag picture cuts that land inside a word or clause unless `reason` says interrupt or smash. Flag face frames beside a cut that catch the eyes mid-blink or mid-turn.

### 3. Hide the cut to keep the viewer inside the event; show it when the telling matters
Continuity editing (match on action, eyeline match, the 180° and 30° rules) times cuts to moments when attention is already moving. Viewers missed 32.4% of match-action cuts but 9.4% of between-scene cuts (Bordwell & Thompson; Smith 2012; Smith & Henderson 2008). Eye-trace: where the eye rests at the end of shot A is where the subject should be at the start of shot B (Murch).
- **Masters:** Godard's jump cuts in *Breathless* made the edit part of the style. Morris left his interview edits visible in *The Fog of War* to show McNamara "from all of these different vantage points".
- **Use / hold back:** Demos (one cursor to track) and fiction need it; essays may break it consistently.
- **In our tools:** Use `crop` to place a B-roll subject where the eye already is.
- **Check:** Compare the last frame of A with the first of B; flag large subject jumps on short shots and cursors that vanish or move across a zoom.

### 4. Choose the cut for what it tells the viewer
The table is drawn from Bordwell & Thompson, Reisz & Millar, and Chandler.

| Cut | Tells the viewer | Done badly |
|---|---|---|
| Hard cut | "Next." The default | — |
| Match on action | "Same event, continuing" (click → result) | Speeds differ, so it stutters |
| Match on shape | "These are alike" | A shape with no meaning |
| Match on sound | "These belong together" or "time passed" | A stinger on every cut |
| Match on idea | "Compare these" | The viewer lacks the context |
| Jump cut | "Time was removed" or "restless mind" | Every sentence, disguised by zooms |
| Smash cut | "Sudden contrast" | No set-up of the opposite state |
| Cutaway | "Look at this while it continues" | Unrelated scenery |
| Insert | "This detail matters" | Details that never pay off |
| Cross-cut | "Simultaneous and connected" | Strands that never converge |
| J-cut (audio leads) | "Something is coming" | Confuses who is speaking |
| L-cut (audio trails) | "Let this land" | Drift by accident |

- **Masters:** Kubrick's bone-to-satellite cut in *2001* matches on shape and idea at once, covering four million years in one join.
- **Use / hold back:** Default to the hard cut. Every other type needs a reason the viewer can feel.
- **Check:** Every cut that isn't a hard cut names its type in `reason` and matches the plan row's `link`.

### 5. Let order make the meaning
Viewers assume adjacent shots belong together and infer cause, comparison, simultaneity or metaphor (Grimes 1991). In Kuleshov's demonstration, a neutral face read differently depending on the next shot. The footage is lost and replications are mixed (Prince & Hensley 1992 failed; Barratt et al. 2016 found a modest real shift, strongest with an ambiguous face and strong context). Eisenstein built meaning from collision, Pudovkin from linkage (contrast, parallelism, simultaneity).
- **Masters:** In Hitchcock's *Telescope* demonstration (1964), his smile after a baby reads as a kind old man and after a bikini as a dirty old man. On *Dunkirk*, Lee Smith moved the crossing points between three timelines at weekly screenings so audiences weren't "completely perplexed".
- **Use / hold back:** Reorder before adding: evidence before a held reaction makes the pause read as judgment. Order can't overturn a performance; an idea cut needs its reference set up.
- **Check:** Write the inferred idea in one sentence. Give a reader or the user the two frames without sound and ask what relation they see. In a tension cross-cut, alternations should shorten as the strands converge.

### 6. Compress time with state changes, not activity
Viewers treat each montage shot as a sample of a longer period, so an ellipsis costs nothing if each shot shows a change of state. A recurring motif, repeated with a difference, lets the viewer measure progress.
- **Masters:** *Up*'s "Married Life" was whittled from 30–40 minutes of material to about four. Test audiences needed the restored infertility scene before they connected. The savings jar recurs, changed each time.
- **Use / hold back:** Builds and journeys; skip it when the change needs real time.
- **Check:** On `sheet.png`, a reader should be able to name what changed between each pair of neighbouring frames. Flag two "no change" frames in a row, and a motif that recurs fewer than three times.

### 7. Make supporting footage advance the claim
Recall improves when pictures match the narration. Mild mismatch splits attention into two messages, and interesting but irrelevant details hurt comprehension (Drew & Grimes 1987; Grimes 1991; Harp & Mayer 1998). So B-roll should match the claim, not a noun. Over "onboarding fell from nine minutes to forty seconds", a stopwatch matches a word; two timed screen recordings prove it. Strongest to weakest: **evidence** (the thing itself), **explanation** (showing how), **metaphor** (a shared analogy).
- **Masters:** Morris covers his interview edits with archive documents and tapes that are also evidence.
- **Use / hold back:** Default to evidence. Use metaphor rarely, and only when the viewer can decode it on first view.
- **In our tools:** State the claim a clip serves in its `reason`. The plan's `see` and `asset` name its level.
- **Check:** Flag reasons that only repeat a noun from the line, and frequent metaphor. `sheet.png` in order should retell the argument sound-off.

### 8. Hold each shot as long as its job takes
How long to hold a shot depends on its content, not a clock (Reisz & Millar; Dmytryk: "fresh" over "stale"). Hollywood average shot length fell from about 10 s (1930s–40s) to under 4 s after 2000, with shorter shots carrying quick-reading motion (Cutting et al. 2011). Shots have one of three jobs. To **read**, the viewer needs time to find the text and read it; adult silent reading runs about 4 words per second (Brysbaert 2019). To **recognise**, a shot can be brief if it moves, sits where the eye is, and was seen before. To **feel**, it needs longer than its information suggests.
- **Use / hold back:** Highlight the five words that matter rather than asking the viewer to read fifty. A cutaway covering a jump cut starts before the audio join and ends after it.
- **In our tools:** Set each clip's length in `frames`, and `crop` a document to the lines that matter.
- **Check:** For reading shots, compare words on screen with hold time (4 words/s plus find time is a derived heuristic). Flag dense frames flashed and obvious stills held long. Covered joins sit inside the cutaway with margin.

### 9. Shape rhythm; don't keep meter
Meter is a regular pulse. Rhythm shapes time and energy into tension and release through timing, pacing and the flow of movement across shots (Pearlman, *Cutting Rhythms*). Film shot lengths have come to cluster like fluctuations in human attention, in runs of short shots and runs of long ones (Cutting, DeLong & Nothelfer 2010). The orienting response to a cut fades with repetition, so a constant high rate stops registering (Lang 2000). No universal cut rate exists.
- **Masters:** Eisenstein cut the Odessa Steps to the movement inside the frame, and raised tension by shortening pieces while keeping their proportions.
- **Use / hold back:** Shorten into the peak; hold longer after it or before the key line. Against music's meter, play picture rhythm.
- **In our tools:** `shape.png` puts shot-length bars against loudness and plan-row boundaries.
- **Check:** Flag low shot-length variation and unplanned runs of near-equal lengths in `review.json`. Bars should shorten into the plan's one peak and lengthen after it.

### 10. Let sound lead picture at the join
A sound heard before its picture raises a question that the cut then answers, so the cut feels motivated. Sound that trails a picture keeps the previous emotion while the eye takes in the new image.
- **Masters:** *Apocalypse Now* opens with helicopter sound over Willard's dream, and his ceiling fan becomes the rotor. Murch found this in post-production.
- **Use / hold back:** Enter B-roll and new scenes on a J-cut at a clause start, and end payoffs on an L-cut. Keep J-cuts short when it could be unclear who is speaking.
- **In our tools:** Offset an audio clip's `start` from its picture. Use `fade_in` and `fade_out` on bridges.
- **Check:** List picture and audio-change times at each scene change and B-roll entry; all-zero offsets mean every change bumps. Bridges run unbroken across the cut in the waveform.

### 11. Cut by default, dissolve for time or place, and design a transition only when it grows from the content
A dissolve signals that time passed or the place changed, and a fade to black ends a unit (Bordwell & Thompson). The best transitions already sit in the pictures: a shape match, a continuing movement, an object that fills the frame, a sound bridge.
- **Masters:** In *Lawrence of Arabia*, Lean planned a dissolve from the blown-out match to the sunrise. Anne V. Coates proposed a hard cut, which lets the viewer discover the link.
- **Use / hold back:** Never dissolve inside continuous speech; no presets or whoosh on every cut.
- **Check:** Each transition that isn't a cut has a `reason` of time, place, becomes or end of unit. For designed transitions, the frames on either side of the join should share the carrying element.

### 12. Fix structure before timing, and remove whole beats
Structure and timing are problems at different scales, and polishing early builds attachment to material that should go. Log first impressions while material is fresh; paper edit from the transcript; long assembly; rough cut to find the story by removing and reordering; fine cut for frames and offsets; lock (Murch; Chandler).
- **Masters:** On *Ghost*, Murch removed a key scene to see what it really did. Docter's restored *Up* scene shows the same test can prove a scene is needed.
- **Use / hold back:** Keep a beat only if it propels, sets up or resolves, in its freshest version. Meet length targets by dropping beats, not trimming evenly.
- **In our tools:** The plan's rows are the paper edit.
- **Check:** Every clip maps to a plan row by `id`. Fine-cut versions should change trims and offsets, not the order. After removals, search the transcript for dangling references ("as I said").

### 13. In speech-led footage, keep the speaker's music and hold the face where it is the proof
Morris protects the "internal music to monologue". Breaths help listeners follow speech (Whalen et al. 1995). Pauses change how listeners process what follows (MacGregor et al. 2010). Jokes show no systematic pause before the punchline, so comic timing lives in the whole delivery (Attardo & Pickering 2011). No peer-reviewed source gives a correct jump-cut rate, and "cut every 2–3 s" is folklore.
- **Masters:** Morris edits interviews heavily but chooses which edits to show.
- **Use / hold back:** Cut false starts, repeats and dead gaps between thoughts; keep emphasis pauses and the breath before a new idea. Hold the face unbroken on the thesis, turn and punchline; cover connecting lines with evidence. Tie each punch-in to a change in the argument, big enough to read as a new shot (no sourced figure).
- **Check:** From word timings, check that pauses between phrases survive and that breaths remain before new ideas. Cut density should drop on the thesis, turn and punchline rows. Flag `crop` punch-ins that alternate strictly between wide and tight.

## Across formats

| Format | What shifts |
|---|---|
| Reel | Short spine (hook, claim, evidence, turn, payoff). Hold the face on the thesis. Enter evidence on J-cuts. End on a held beat. Keep subjects clear of captions. |
| Product demo | Continuity rules: cut on action, keep the cursor region steady, insert the changed element, hold results long enough to read. Show the result plainly. |
| Launch | Montage-led: old way against new, a journey told in state changes, acceleration into the reveal and a long hold after. |
| Explainer | Explanation-level B-roll. Cut on concept boundaries. Give diagrams reading time; clarity sets the pace. |
| Short film | The full classical grammar: continuity, Kuleshov for performance, cross-cutting for suspense, L-cuts for emotion, dissolves for time. Plan eye-trace in the storyboard. |
| Feature | Structure is found in the rough cut through removing scenes and screening. Rhythm is shaped across acts, and cross-cut strands converge. |

## Weak work looks like

- B-roll matches nouns: "money" over cash, and no argument with the sound off.
- Shots of near-identical length throughout, cut to a timer or to every beat.
- Every pause and breath removed, so there is no emphasis.
- Punch-ins alternate wide and tight on every cut.
- A pop, zoom or whoosh every second, so nothing lands.
- Crossfades inside speech; preset spins and glitches.
- Activity montage with no before and after and no motif.
- Subject jumps corner to corner across fast cuts.
- B-roll over the thesis, the confession or the punchline.
- A dense document flashed for a second while an obvious still holds for six.
- A length target met by shaving every clip, with no beat removed.
- Sound and picture always change together.
- Undecodable metaphor: a chess piece for "strategy", a rocket for "growth".

## Sources

- Murch, *In the Blink of an Eye*, 2nd ed., 2001; Hullfish, *Art of the Cut* interviews.
- Dmytryk, *On Film Editing*, 1984. Reisz & Millar, *The Technique of Film Editing*, 1968.
- Bordwell & Thompson, *Film Art*. Chandler, *Cut by Cut*. Pearlman, *Cutting Rhythms*, 3rd ed.
- Eisenstein, *Film Form*, 1949. Pudovkin, *Film Technique*, 1929.
- Smith & Henderson 2008; Smith 2012; Zacks et al. 2007; Magliano & Zacks 2011; Nakano et al. 2009.
- Cutting, DeLong & Nothelfer 2010; Cutting et al. 2011.
- Prince & Hensley 1992; Barratt et al. 2016.
- Drew & Grimes 1987; Grimes 1991; Harp & Mayer 1998; Lang 2000.
- Whalen et al. 1995; MacGregor et al. 2010; Attardo & Pickering 2011; Brysbaert 2019 (figure not re-checked).
- Interviews: Morris (2004), Hitchcock (*Telescope*, 1964), Coates (Princeton "Edited By"), Lee Smith (2017), Cameron (2025), Docter (2022).
