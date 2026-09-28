# The Viewer

Every craft choice ends as an event in a viewer's head. The governing question: at this moment, where is the viewer looking, what are they holding in mind, and what do they get for their attention? Ordering information into suspense, curiosity and surprise, and paying off promises, belong to story (see story.md).

## Questions to ask

1. Who is watching, and what do they already know?
2. At each moment, what is the one thing to look at, and what puts the eye there?
3. What parts, places or rules must the viewer know before the fast or complex passage?
4. How many things must they hold at once here?
5. Captions or a clean screen? Over a face, keep them. Over a chart or interface, reading competes with looking, so the voice carries the words.
6. Dense cutting or held shots? Dense suits simple, related material; hold when shots add new information or must be read.
7. Which claims need proof, and what footage proves each rather than illustrates it?
8. Where does the feeling come from: whose face, which moment, what music?
9. What is the one peak, and what is the last thing seen and heard?
10. What exists only to "keep attention"?

## Principles

### 1. Give every moment one focal point
In well-made film, viewers look at the same place at the same moment (attentional synchrony, Smith & Henderson), and brain responses align more the more the film controls them (Hasson et al., 2008). Replicated; single studies link synchrony to later memory and audience preference (Hasson, *Neuron* 2008; Dmochowski et al., 2014). Steering the eye is not delivering understanding (Loschky et al., 2015).
- **Directors:** Paul Thomas Anderson's barely cut six-minute scene in *There Will Be Blood* still moves viewers' gazes together through staging and light.
- **Use / hold back:** Every format. More elements is not more direction.
- **In our tools:** The plan's `see` subject is the focal point.
- **Check:** On sheet.png, flag frames where moving B-roll, a new text card and a face compete with none dominant by size, contrast or motion.

### 2. Put the new focal point where the eye already is
Faces draw gaze early whatever the task (Cerf et al.; replicated); on moving faces gaze goes to the eyes when the person looks into the lens and to the mouth when they speak (Võ et al., 2012). Motion onset captures attention (Abrams & Christ, 2003; Mital et al., 2011; replicated). Text draws gaze about as strongly as faces, even irrelevant text (Cerf, Frady & Koch, 2009; single study). After a cut the eye goes to centre (Tseng et al., 2009; replicated).
- **Directors:** George Miller had *Mad Max: Fury Road* centre-framed so viewers never searched a new shot, which let it cut very fast and stay legible (John Seale interview).
- **Use / hold back:** Every overlay, zoom or pop captures attention, deserved or not, and onset works only while rare. All visible text gets read, chrome included.
- **In our tools:** `crop` moves a subject toward centre; Remotion elements enter where the eye is, or one motion leads it.
- **Check:** `reel.py view` on frames 2–4 after each cut: is the focal point near centre or the previous one? Flag half-second windows with two competing onsets, and frames with two text blocks to read.

### 3. Carry attention across the cut
Viewers miss many cuts, especially mid-movement, because attention follows the motion across (edit blindness, Smith & Henderson, 2008; replicated). Continuity works because the editor controls attention on both sides of the cut (Smith, 2012; well-supported theory).
- **Directors:** Walter Murch ranks emotion above story, rhythm and eye-trace, and cuts where a viewer would blink, as a thought completes (*In the Blink of an Eye*; practitioner belief).
- **Use / hold back:** A jump cut that moves a face across the frame forces a new search each time. A click or matched movement carries attention across.
- **In our tools:** Keep eye height stable across `crop` punch-ins.
- **Check:** Flag large face-position shifts across jump cuts, and B-roll cuts not on a transcript word boundary.

### 4. Make a new idea look new; keep one idea in one visual world
Viewers hold a model of "what is happening now" and update it when place, time, goal, character or action changes (Event Segmentation Theory, Zacks et al., 2007; replicated). Discontinuous cuts drive boundaries (Magliano & Zacks, 2011). Details just before a boundary are harder to recall after it (doorway effect, Radvansky; mostly replicated, some failures).
- **Use / hold back:** A topic change needs a visible change; inside one idea, an unrelated cut forces a new model mid-thought. Keep the key number clear of a scene change.
- **In our tools:** Plan rows mark idea boundaries; shape.png shows them against detected cuts.
- **Check:** Flag visual-world changes mid-sentence and topic changes in the transcript with no visual change.

### 5. Cut decoration; every visual does one job
Working memory holds about four chunks (Cowan, 2001). Interesting but irrelevant material ("seductive details") does small-to-medium harm to learning (Mayer's coherence principle; meta-analyses by Rey, 2012, and Sundararajan & Adesope, 2020). Replicated for instruction, so it applies directly to demos and explainers; for entertainment it is an inference.
- **Use / hold back:** A person typing, a spinning globe or particles feel like energy and take processing from the point. Each visual is proof, example, orientation or emotion serving the point. In fiction, texture that builds the world counts as orientation.
- **In our tools:** A clip's `reason` names its job; "energy" is not a job.
- **Check:** Tag each clip proof, example, orientation, emotion or decoration; cut or justify any decoration. Flag moments asking the viewer to hold more than about four chunks.

### 6. Match on-screen text to what else is on screen
Narration plus identical text plus a graphic can hurt learning because reading and looking compete; the effect is small and conditional, worst with complex graphics and fast pacing (Adesope & Nesbit, 2012; replicated). Signaling (one arrow, highlight or zoom on the essential material) is supported by meta-analysis (Schneider et al., 2018).
- **Use / hold back:** Over a face, phrase-chunked captions cost little and serve sound-off viewers. Over a chart or interface, shorten or drop them. Signal with one device at a time, exactly where the voice points. Subtitle guidelines cap reading rate around 15–20 characters/s [unverified].
- **In our tools:** `reel.py place` keeps captions off mouth and eyes.
- **Check:** Flag text above about 17 characters/s; flag full-sentence caption duplicates over a chart or UI; at each "this", "here" or "look" in the transcript, confirm the frame's signal points at the referent.

### 7. Teach the parts and the geography before the fast part
People learn a complex process better when they already know its parts' names and roles (Mayer's pretraining principle; replicated in instruction). Spectacle reads only when layout, goal and stakes are known beforehand.
- **Directors:** Hitchcock's bomb under the table: tell the audience it is there and an ordinary conversation becomes watchable (*Hitchcock/Truffaut*). Cameron's *Aliens* teaches the briefing and motion tracker before the sieges that depend on them. Nolan's *Memento* withholds causes but never its rules: colour runs backward, black-and-white forward.
- **Use / hold back:** Confuse the viewer about why, never about where or what. A demo shows the whole screen and names two or three parts before zooming; fiction sets the space before action.
- **In our tools:** A Remotion `<Camera>` establishing move, or a full frame before any `crop` punch-in.
- **Check:** For each fast passage, flag any panel, character, place or metric that first appears inside it.

### 8. Pace to the viewer's capacity
Cuts and sound onsets trigger an involuntary orienting response (Lang's limited capacity model). Faster edits within one scene raised arousal and memory without overload (Lang et al., 2000); fast pacing with arousing content reduced recall (Lang et al., 1999). Replicated within that lab's paradigm. Hollywood shots shorten toward climaxes (Cutting et al., 2011; descriptive).
- **Directors:** *Fury Road* paid for extreme pace up front with centre framing.
- **Use / hold back:** Dense cutting helps a proof montage for one claim; it hurts when each cut adds new information or text to read. Slow down for what must be understood; constant rhythm reads as mechanical.
- **In our tools:** review.json reports shot-length statistics and runs of near-equal shots.
- **Check:** Shots shorten into the peak and lengthen on key information. Flag near-equal runs, shots shorter than their text takes to read, a sound effect on nearly every cut, and fast passages dense with new information.

### 9. Let faces carry the feeling
People automatically mimic and catch others' facial and vocal emotion (Hatfield et al., 1993; Dimberg et al., 2000; replicated). Context tilts how a face reads, but modestly: Prince & Hensley (1992) largely failed to reproduce Kuleshov, and Barratt et al. (2016) found a real but modest effect.
- **Use / hold back:** Viewers take emotion from a reacting face more than from the event, so cut to the reaction. Keep overlays and B-roll off the face during the emotional beat.
- **In our tools:** The plan's `why` names the feeling on emotional rows.
- **Check:** At emotional peaks in the transcript, confirm the frame shows a face large enough to read and uncovered.

### 10. Build arousal, then release it
Arousal lingers and amplifies the response to what closely follows (Zillmann's excitation transfer; replicated in basic form), so a tense build enlarges the release. Background lyrics disrupt verbal processing (irrelevant speech effect; replicated).
- **Directors:** Hitchcock called *Sabotage*'s bomb killing the boy a "terrible mistake": the audience needed relief and resented its denial.
- **Use / hold back:** A dip or silence before the payoff, a lift on it, resolution at the end. No vocals under speech. A theatre feature may bury dialogue for effect; on a phone speaker, speech comes first.
- **In our tools:** Audio `role` tags feed review.json's speech-minus-music windows; `gain_db` and fades shape the curve.
- **Check:** On shape.png, find a dip before and a peak at the payoff; flag a flat curve. Ask the user whether a track has vocals if metadata does not say.

### 11. Show rather than claim; be specific
Easy-to-process information feels truer (Reber & Schwarz, 1999; replicated); concrete statements seem truer than abstract ones (Hansen & Wänke, 2010; single study). A photo irrelevant to a claim's truth still made people judge it truer (Newman et al., 2012; replicated). That is how manipulative B-roll works.
- **Directors:** Documentary and live demo use the unbroken take as proof; a cut there is where a trick would hide.
- **Use / hold back:** Pair each factual claim with probative footage: the real result, a readable number, before and after in one frame. Label speed-ups. Use numbers, names and durations, not adjectives.
- **In our tools:** A `speed` clip inside a proof moment needs an on-screen label.
- **Check:** Grade the visual under each transcript claim probative, illustrative or none; flag unproved core claims, cuts inside the proof take, and intensifiers outnumbering specifics.

### 12. Stay out of the ad register
Once viewers recognise a persuasion attempt they switch from processing to resisting (persuasion knowledge model, Friestad & Wright, 1994; widely cited, experimental support). Stock actors, glossy grades, superlatives and a hard sell before value trigger it. Social proof is context-dependent (Bohner & Schlüter, 2014, failed towel replication).
- **Use / hold back:** A real face, voice and screen are trust assets that polish destroys. Use social proof only when real and specific. Admitting one limitation lowers resistance (practitioner belief).
- **In our tools:** The clip `reason` should say why a logo or testimonial is there.
- **Check:** Flag stock people who are not the subject, superlatives, calls to action before value, and logos without a stated relationship; confirm each testimonial or number has a source the user can name.

### 13. Place one peak and end on meaning
Judgement of an experience tracks its most intense moment and its end, while duration barely counts (Fredrickson & Kahneman, 1993; replicated). A distinctive item in a uniform series is remembered better (von Restorff; replicated).
- **Directors:** *Titanic*'s frame story returns to old Rose and the necklace, and *Memento* ends where it began, so each last image carries a meaning the opening set up.
- **Use / hold back:** Put the best material at the peak. End on or just after a high point, not a fade or logo; a call to action follows the peak, never replaces it. One distinctive thing per piece.
- **In our tools:** The plan header names the peak and the ending image against the opening.
- **Check:** Pull the peak frame and the last three seconds: is the peak the strongest and least cluttered, and does the final frame mean something?

### 14. Earn attention rather than buy it
Every mechanism here has a cheap version: an onset with nothing behind it, a photo implying proof, a riser with no reveal. Orienting is automatic, so cheap devices work briefly, then habituate and spend trust (principles 5, 8, 10, 12).
- **Use / hold back:** "It keeps them watching" is the cheap answer; name what the viewer gets.
- **In our tools:** Every clip's `id` ties it to a plan row with a `why`.
- **Check:** Trace every zoom, sound pop and overlay to a `why`; cut orphans. Ask the user to watch once on a phone and name the second they would have left and the moment they remember.

## Across formats

- **Reel:** a face usually anchors attention and emotion; captions near it, off the mouth. Sound on is the platform default, so captions back up missed words.
- **Product demo:** instructional research applies directly: name parts first, one signal at the referent, one task per segment, crop chrome, no long captions over UI. The cursor guides the eye; proof is one continuous take.
- **Launch:** minimal ad-register cues; named users over logo walls; one peak at the reveal, with proof.
- **Explainer:** coherence and redundancy dominate; voice carries words over diagrams.
- **Short film:** held reactions carry feeling; space established before action; music shaped around the turn.
- **Feature:** arousal and shot length rise and fall across acts; withholding can run long if the rules stay clear.

## Myths and weak evidence

- **"Attention span is 8 seconds."** From a 2015 Microsoft Canada marketing report citing an untraceable statistic. Attention depends on task and content.
- **"A pattern interrupt every 2–3 seconds."** No evidence; fast pace with new or intense content lowers memory, and shot lengths vary with structure.
- **"85% watch with sound off."** A 2016 Facebook publisher-video figure; Meta says Reels default to sound on.
- **"Kuleshov proves editing makes any face mean anything."** Original data lost, some replications failed, better ones find a modest effect.
- **"Open loops boost memory" (Zeigarnik).** Replicates poorly; the urge to resume holds up better.
- **"Faster cutting raises retention."** No public causal data; confounded by topic and format.
- **"People look at the eyes."** Still images only; in video, gaze moves to a speaking mouth.

## Weak work looks like

- Stock B-roll illustrating a word literally (a person typing for "work"), proving nothing.
- Everything moves: constant zooms, a push on every still, drifting particles.
- Word-by-word bouncing captions stressing random words.
- A sound effect on every cut.
- A face jumping across the frame at every jump cut.
- A zoomed interface or fast action whose parts were never shown whole.
- Full-sentence captions repeating narration over a chart or UI.
- A cut or unlabelled speed-up inside the proof moment.
- Intensifiers where numbers, names and durations should be.
- Logo walls, stock actors and a glossy grade on a sincere story.
- Constant music level and cut rate: no tension, release or peak.
- Equal weight on every beat: a list of assets.
- An ending that trails into a fade or logo card.

## Sources

- Adesope & Nesbit, 2012; Barratt et al., 2016
- Cerf, Frady & Koch, faces and text attract gaze, 2009
- Cutting, Brunick & DeLong, act structure and shot lengths, 2011
- Fredrickson & Kahneman, duration neglect, 1993
- Friestad & Wright, persuasion knowledge model, 1994
- Hasson et al., "Neurocinematics" and *Neuron*, 2008; Dmochowski et al., 2014
- Hitchcock & Truffaut, *Hitchcock/Truffaut*, 1966
- Lang, limited capacity model, 2000; Lang et al., pacing studies, 1999, 2000
- Magliano & Zacks, continuity editing and event segmentation, 2011; Zacks et al., 2007
- Mayer, multimedia learning principles, 2017
- Murch, *In the Blink of an Eye*, 2001
- Newman et al., nonprobative photographs, 2012
- Rey, 2012; Sundararajan & Adesope, 2020 (seductive details)
- Smith, attentional theory of cinematic continuity, 2012; Smith & Henderson, edit blindness, 2008
- Võ et al., "Do the eyes really have it?", 2012
