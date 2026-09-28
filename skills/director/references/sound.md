# Sound, music and silence

Sound decides how the picture is read, and the viewer credits the image. The director gives every sound one job, ranks sounds so the one carrying the story is heard, and plans silence as deliberately as sound. The governing question for each beat: what should the viewer feel or understand here, and is the picture already doing it?

## Questions to ask

1. Does the picture already deliver this beat? Sound adds what it lacks. Otherwise it is redundant.
2. Which layer is the story right now: voice, music or one effect? That layer leads and the rest make room.
3. Intelligibility or immersion? Burying words in noise immerses the viewer, and it costs comprehension. The destination decides: a phone in a noisy place needs every word, while a film in a quiet room can risk immersion where the buried words carry no story.
4. Whose ears are we in: an observer, a character, the narrator, the product's user?
5. Where does the story turn? Music and ambience change there and nowhere else.
6. Where is the silence, and is it a felt quiet (room tone, breath) or a deliberate void?
7. What can be taken away?
8. What loudness and dynamic range can the destination carry?

## Principles

### 1. Give each sound a job the picture cannot do
A sound and a visual event that happen at the same instant weld together, even when the sound has nothing to do with the object. The viewer then believes the meaning was in the image (Chion, *Audio-Vision*, 1994: synchresis and added value). Film sound renders the feeling of an event (weight, speed, danger) rather than its literal acoustics.
- **Masters:** Rydstrom built the *Terminator 2* T-1000 from dog food sliding out of a can and a glass pushed into yogurt. Nothing literal, and every sound says "liquid metal" (designingsound.org).
- **Use / hold back:** give weight, causality or finality the picture can't show. Skip it where the picture already reads. Repeated redundant sound is what feels padded.
- **In our tools:** each added sound's `reason` names what it renders ("weight of price card landing").
- **Check:** a `reason` that only names an object ("click"), or restates what the frame shows, marks a candidate for deletion.

### 2. Rank the layers, with speech first
A mix has four stems: speech, room tone and ambience, effects, music. The ear hunts for the voice first (Chion: cinema is "vococentric"), so if the words fail, nothing else lands. The mind tracks one or two streams of the same kind, but not three. About five layers at once is the limit, and only if they are spread across the frequency range (Murch, "Dense Clarity – Clear Density", 2005).
- **Masters:** In *Interstellar*, Nolan deliberately mixed some dialogue under music and effects, and many viewers complained they couldn't follow it (Hollywood Reporter). That is the price of the trade.
- **Use / hold back:** anything narrated keeps speech on top. A montage or reveal can hand the lead to music.
- **Check:** flag three or more same-kind effects overlapping, more than about five simultaneous layers, and lyrics overlapping speech (lyrics compete for the same decoding).

### 3. Keep a continuous floor; silence is never an accident
A gap that falls to digital zero reads as a dropout, not as quiet.
- **Masters:** *A Quiet Place* goes to true zero once, when Regan removes her implant. It works because the rest of the film is tended near-silence (Slate; No Film School).
- **Use / hold back:** fill cut gaps with room tone from the same take, and put low ambience under screen recordings and animation. Use true zero only as a planned beat.
- **In our tools:** loop no-speech source on an `ambience` track under all speech. With no recording to take it from (animation, a synthetic voice), synthesize a faint noise floor well below the speech (FFmpeg `anoisesrc`, pink) and label it synthetic.
- **Check:** FFmpeg `silencedetect` below the measured floor. Any hit not listed as a planned silence in `hear` is a dropout. If the noise floor steps by more than a few dB across a jump cut, the room tone flickers.

### 4. Know which side of the line each sound lives on
World (diegetic) sound makes a claim about what is true. Score and narration make a claim about how to feel. Moving a sound across that line is one of the strongest signals a film has (Gorbman, *Unheard Melodies*, 1987).
- **Masters:** *Baby Driver* puts nearly all its music in the hero's earbuds, so cutting to the beat has a reason inside the story (Deadline).
- **Use / hold back:** use world sound for presence and proof: the real click, the phone buzzing. Use score for emotion and structure. Cross the line on purpose: a song the user plays in the demo becomes the score. Avoid meme sounds on a sincere piece; they tell the viewer to laugh.
- **Check:** every world sound has a source visible in the frame or already established. Every score cue maps to a `hear` entry that states its purpose.

### 5. Tie every effect to a visible event, on it or just after
Synchresis only proves an action when the sound lands with it, and past two of a kind viewers stop tracking effects individually (Murch). Timing is asymmetric: audio early by about 45 ms is noticed, while audio late by up to about 125 ms is tolerated (ITU-R BT.1359, measured on lip sync; use it as a guide).
- **Masters:** in *No Country for Old Men*, a light bulb's faint squeal before the motel shootout is rare, exact and tied to threat (The Playlist).
- **Use / hold back:** sound the state changes the viewer must notice, with one hero moment per section. In demos, sound only the decisive action and the arriving result. Remove raw mic clicks, treat typing as one low texture, and drop per-action sounds during speed-ups. A launch reveal gets one hit, not a stack.
- **In our tools:** align the audible onset, not the start of the file, with the event frame. Confirm it with `reel.py view`.
- **Check:** the frame at the onset differs visibly from the frame before it, unless the plan records an off-screen sound. The onset falls 0–1 frames after the event, never more than about one frame early. No effect peak falls inside a stressed word.

### 6. Carry cuts with sound
Sound crossing a cut gives the viewer a thread. A J-cut (pre-lap) starts the next scene's audio early: the ear leads and anticipation builds. An L-cut lets the current audio carry over and the moment settle.
- **Masters:** in *The 39 Steps* (1935), a landlady's scream becomes a train whistle, and one sound does a whole scene transition (Criterion).
- **Use / hold back:** pre-lap the next line or ambience instead of a whoosh on a section change. Use L-cuts after a result so the reaction breathes. Never pre-lap one speaker over another face still talking.
- **In our tools:** give the audio clip an earlier `start`, or a later end, than its picture, with `fade_in`/`fade_out`.
- **Check:** if every picture cut changes the sound on the same frame, the piece needs bridges.

### 7. Choose music for the story's emotional shape; change it only at turns
Music tells viewers what the story is. With the same ambiguous clips, different music changed viewers' reading of motives, their predictions, and what they remembered a week later (Boltz 2001). Spotting means deciding where each cue starts, changes and stops. Music that changes at turns shows the viewer where the turns are.
- **Masters:** Hitchcock first wanted *Psycho*'s shower scene without music. He heard Herrmann's cue and changed his mind: test both versions.
- **Use / hold back:** choose a track for its arc, not its genre. A track that stays the same for 60 seconds can't mark a turn at 0:35. Edit it on phrase boundaries: sparse under the hook, a change at the turn, fullest at the payoff, a clean ending on the last line.
- **In our tools:** write the music state (in, change, drop, out) in each row's `hear` column before placing anything. This is the spotting pass.
- **Check:** the loudness curve on shape.png moves at the plan rows marked as turns and holds elsewhere. A flat curve is wallpaper. The music ends on a phrase ending.

### 8. Keep music under speech by phrase, and let it answer in the gaps
Listeners preferred at least 10 LU between commentary and music, and at least 15 LU between commentary and ambience. Non-experts wanted about 4 LU more than experts, and preferences varied widely (Torcoli et al., JAES 2019). Background level raises listening effort even while speech stays intelligible (Resti, Torcoli et al. 2023). Music also clashes with speech when it enters the voice's register, roughly 1–4 kHz [band limits approximate], or the speech channel itself (lyrics).
- **Masters:** Murch's encoded/embodied spectrum explains why pads and low pulses sit under a voice while a busy melody fights it.
- **Use / hold back:** use instrumental beds with a quiet mid-range. Duck per phrase, not per word (per-word ducking pumps), and release in real pauses so the music answers. For non-experts on phones, aim high in the range.
- **In our tools:** bake a phrase-level envelope into the music clip, or automate volume in Resolve. Mark tracks `speech` and `music`.
- **Check:** review.json speech-minus-music is at least 10 LU in every speech window. Music rises in pauses. More than one dip and recovery per phrase means pumping.

### 9. Cut to the beat only where rhythm is the concept
Viewers lock onto a pulse, so a cut on the beat confirms an expectation. Tension grows with uncertainty before an expected event (Huron, *Sweet Anticipation*, 2006), so a withheld hit can land harder than a delivered one. Music that copies every action ("mickey-mousing") reads as comic.
- **Masters:** Leone staged *Once Upon a Time in the West* to Morricone's pre-written score.
- **Use / hold back:** edit to the music first for a montage, a teaser or a title sequence. Cut picture first for anything led by performance or argument, where cuts follow sentences. Hit only structural beats: turn, reveal, logo, last line.
- **Check:** list the cuts within one frame of a beat. In a speech piece, the structural cuts land on beats and most others don't.

### 10. Drop the music before what matters most
After a bed of music, its absence is the loudest thing on the track. "The audience will crowd that silence with sounds and feelings of their own making" (Murch). 
- **Masters:** *Oppenheimer* plays the Trinity blast in near-silence. "The strong impression of the sound came from the long period of quiet before" (Richard King, IndieWire). On *No Country for Old Men*, Carter Burwell found even subtle music "destroyed the tension that came from the quiet".
- **Use / hold back:** cut the music just before the key line, result, price or ask. Keep room tone and breath; bring music back at the next section. One drop per short piece; repeated drops become a tic.
- **Check:** at each planned drop, the music falls before the stressed word starts in the transcript, and speech or room tone stays above the silence threshold.

### 11. Put the ear inside someone
Sounds grip to the degree a character is listening to them (Randy Thom, "Designing a Movie for Sound"). Subjective sound (muffled, internal) puts the viewer inside a head, often before the picture does.
- **Masters:** *Saving Private Ryan* collapses Omaha Beach into muffled ringing when Miller is shell-shocked (A Sound Effect). *Gravity* lets sound travel only through contact (Hollywood Reporter).
- **Use / hold back:** in fiction, this is a main tool. In a talking piece, muffle the world for a confession. In a demo, the point of view is the user's, so the only UI sounds are the ones the user causes. A filter shift with no established point of view reads as a mistake.
- **Check:** the ambience spectrogram loses its high band at the planned frame and gets it back at the exit, while speech holds.

### 12. Build tension with a known lever, and pay every tension off
- Rising level signals approach. Listeners overestimate rising tones, but not rising noise (Neuhoff 1998, *Nature*), so a tonal riser is more urgent than a noise sweep.
- Harsh, nonlinear sound triggers alarm, like distress calls (Blumstein et al. 2010).
- Uncertainty builds tension, and the outcome releases it (Huron).
- A Shepard tone rises endlessly (Shepard 1964). *Dunkirk*'s score is built on it (Deadline).
- Low rumble reads as dread, but evidence that infrasound itself unsettles people is weak [unverified]. Phones reproduce little bass [unverified], so low elements need upper harmonics.
- **Use / hold back:** hold tension under a demo's problem and release it on the answer. Never a riser into nothing, constant tension, or horror dissonance on a friendly brand.
- **Check:** each tension clip's `reason` names its payoff row, and the loudness curve at that frame is a local peak or a deliberate drop.

### 13. Master for the destination
Platforms normalize playback, so a louder master just gets turned down, its dynamics lost for nothing.
- **Sourced targets:**
  - YouTube turns down content louder than about -14 LUFS and doesn't turn quiet content up (Production Advice).
  - TikTok and Instagram publish no number. Practitioners use -14 to -16 LUFS, -1 dBTP [unverified].
  - Streaming (AES TD1008): speech -18 LUFS, music -16, mixed about -17. At equal loudness, speech sounds 2–3 dB louder than music.
  - EBU R128: -23 LUFS, true peak at most -1 dBTP. The short-form supplement (R128 s1) caps short-term loudness at programme + 5 LU.
  - Netflix: -27 LKFS ±2 dialogue-gated, true peak at most -2 dBTP, loudness range 4–18 LU.
- **Use / hold back:** this is where intelligibility and immersion trade off. Phones in noise need a narrow range. A dynamic, dialogue-anchored mix suits cinema. On YouTube it plays quieter than its neighbours, a cost you accept knowingly.
- **Check:** FFmpeg `ebur128` integrated loudness, loudness range and true peak, and the loudest moment in review.json, against the destination.

### 14. Measure the mix against the plan, then ask for one specific listen
Measurements flag failures; they don't prove the mix feels right.
- **In our tools:** `reel.py review` with the plan and the timeline.
- **Check:** speech-minus-music windows in review.json are at least 10 LU. The shape.png loudness curve moves at the plan's turns (a lift at the payoff, a drop before the key line, no dead zones). The effects count matches the visible events. Then ask for a phone-speaker listen with pointed questions: "Can you hear every word at 0:12–0:18? Does the drop at 0:31 feel intentional?"

## Across formats

| Format | What shifts |
|---|---|
| Reel | The voice leads, and the picture must work muted. One ducked bed edited to the arc, one drop before the key line, bridges instead of whooshes, a narrow range. |
| Product demo | World sound only for the decisive action and the result. Raw clicks removed, a low bed under pauses. At the result: drop, one hit, music back. |
| Launch | Music can lead, and cutting to it first is legitimate. A tonal riser into the reveal, one hit on the product, full energy on the payoff. |
| Explainer | Narration leads; music changes only at section turns. |
| Short film | Every principle applies. Choose whose ears we're in, record room tone, spot music with the cut, and keep more dynamic range, knowing the web cost. |
| Feature | Dialogue-gated delivery, wide dynamics, point-of-view and metaphorical sound. Burying words is a possible deliberate trade. |

## Weak work looks like

- A whoosh on every cut, a riser into every section, a pop on every caption.
- One stock track at one level throughout, fading out mid-phrase.
- Music as loud as the voice, or lyrics under speech.
- Digital zero between jump cuts, or hiss that flickers at each cut.
- Meme sounds on a sincere moment.
- Risers and braams that resolve into nothing.
- Effects landing before the visual event.
- A master limited to about -9 LUFS that the platform turns down anyway.
- Library sounds chosen by name rather than by what they render.
- A music drop that comes after the key word instead of before it.

## Sources

- Chion, *Audio-Vision* (1994); Gorbman, *Unheard Melodies* (1987); Huron, *Sweet Anticipation* (2006).
- Murch, "Dense Clarity – Clear Density", Transom (2005); Thom, "Designing a Movie for Sound".
- Boltz, *Music Perception* 18(4) (2001); Torcoli et al., JAES (2019); Resti, Torcoli et al. (2023); Neuhoff, *Nature* 395 (1998); Blumstein et al., *Biology Letters* (2010); Shepard (1964).
- ITU-R BT.1359; EBU R128 and R128 s1; AES TD1008 (2021); Netflix Sound Mix Specifications; Production Advice (YouTube). TikTok/Instagram targets [unverified].
- Makers' accounts: designingsound.org, Hollywood Reporter, IndieWire, The Playlist, Slate, No Film School, A Sound Effect, Deadline, Criterion.
