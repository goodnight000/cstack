# Story

Story is the order of changes the viewer lives through: what they want to know, what stands in the way, what they learn and when, and what they are left with. Every later choice is judged against it, so it is decided first and changed first. The governing question: what should the viewer feel, know and do at the last frame, and does every beat move them there by cause rather than by sequence?

## Questions to ask

1. What should the viewer feel, know and do at the last frame, one sentence each? More "knows" buys less feeling; a second "know" is usually a second video.
2. What is this about beneath the topic? The topic is "our new feature"; the subject might be "getting your evenings back".
3. Who wants what, what happens if they don't get it, and why now? Is the protagonist a character, a product's user, or the viewer?
4. What question opens in the first seconds, and which frame, not which line, answers it?
5. Which engine carries the middle: suspense, curiosity, surprise, or watching a hard thing get done? Surprise buys one turn at the cost of clarity; use it only when the stakes are already clear.
6. At each key beat, does the viewer know more or less than the character or speaker, and is that deliberate? Withholding the cause pulls people in; confusion about where they are or what is happening loses them.
7. Can every beat join the next with "but" or "therefore"?
8. Where is the one peak, and does the last image answer the first?
9. What is set up that pays off, and what pays off with no setup?
10. What would the viewer lose if this beat were cut? The breath before a payoff seems to do nothing and still earns its place.

## Principles

### 1. Decide what the viewer should feel, know and do before anything else
Without a stated purpose, each choice is judged only by whether it looks good, and the result looks good shot by shot and aimless as a whole (Lumet, *Making Movies*, 1995).
- **Masters:** Lumet's answer for *12 Angry Men*, a room closing in, set its lens plot: longer lenses and a lower camera each third, so the room seems to shrink. Coppola's *Godfather* notebook gives every scene a "Core", its purpose line.
- **Use / hold back:** always. Non-fiction needs all three; a short film may need only "feel". Never state it on screen.
- **In our tools:** PLAN.md `Purpose`; each row's `why` serves one of the three.
- **Check:** a fresh reader given only sheet.png and the transcript writes the "know" in their own words, and it matches the plan.

### 2. State the subject under the topic as one controlling idea
McKee's controlling idea names a value and the cause of its change in one sentence, and every scene must pass it. It turns a topic, which has no direction, into a claim that does (McKee, *Story*, 1997).
- **Masters:** Pixar tied *Up*'s house to a marriage and "unfinished business" (Docter, 2022), making an old man's trip a story about grief.
- **Use / hold back:** every format. In a demo the idea is the change in the user's life, not the feature list.
- **In our tools:** PLAN.md `Controlling idea`.
- **Check:** the idea contains a value and a "because"; a beat that neither argues for it nor against it is flagged.

### 3. Link every beat to the next by "but" or "therefore", never "and then"
Viewers follow film by predicting what comes next from cause and effect, and mark boundaries where prediction fails (Bordwell & Thompson, *Film Art*; Zacks et al., 2007). "And then" gives nothing to predict with.
- **Masters:** Parker and Stone test every *South Park* outline for "therefore" or "but" between beats (NYU, 2011). Adams's Story Spine ("until one day… because of that…") builds the same chain into a form Pixar artists used.
- **Use / hold back:** every format. A tutorial step follows "therefore"; a list item follows "but" (the last fix leaves this problem). The spine tests the outline and never becomes script lines.
- **In our tools:** PLAN.md `link` column.
- **Check:** every link after row 1 is "but" or "therefore" plus a clause. A reader given the beats without links supplies them; pairs joinable only by "and" are flagged.

### 4. Open one question early and answer it with a frame at the end
Curiosity is the gap between what we know and want to know, strongest at middling confidence: a question the viewer can already answer, or has no foothold on, pulls nothing (Loewenstein, 1994; Kang et al., 2009). The answer makes the ending feel like one (Stanton, TED 2012).
- **Masters:** *Titanic* shows the sinking as a simulation first, so the question becomes "what happens to her". *Memento* opens each scene on an outcome; the next answers "how did we get here?"
- **Use / hold back:** one dominant question, with sub-questions nested inside it. Don't open what the video can't answer on screen, or answer it in the second sentence.
- **In our tools:** PLAN.md `Opening question → answer`; `reel.py view` at the answer.
- **Check:** list each question the transcript opens with its time and its answer's time; flag any unanswered. The final frames show the answer, not just the voice.

### 5. Choose the engine that carries the middle
The order of telling makes the feeling. Suspense: the viewer knows the threat or goal and the outcome is uncertain. Curiosity: they see an outcome and want the cause. Surprise: information is withheld, then revealed (Brewer & Lichtenstein, 1982). A demo's engine is watching a known hard task get done: suspense about whether it works.
- **Masters:** Hitchcock: a hidden bomb gives "fifteen seconds of surprise"; show it first for "fifteen minutes of suspense" (Truffaut, 1966). The *Jaws* shark, shown through barrels and point of view, makes the threat certain and the object absent.
- **Use / hold back:** suspense fits launches and stories; curiosity fits short pieces (result first, then how); surprise is expensive, so spend it on one turn. Withholding the object suits fiction; a demo shows the result plainly because the product is the payoff.
- **In our tools:** PLAN.md `Engine`.
- **Check:** one engine is named. If none applies, the piece is a list.

### 6. Control what the viewer knows, and when
The viewer's information compared with the characters' is the master variable. Ahead of the character gives suspense; level puts the viewer inside their head; behind gives mystery (Truffaut 1966; Nolan on *Memento*).
- **Masters:** *Memento* withholds from the audience what is withheld from Leonard, and stays followable because its rules (colour backward, black-and-white forward) never change.
- **Use / hold back:** decide it for every key reveal. In a 30-second piece, a viewer who doesn't know the stakes won't stay for a surprise.
- **In our tools:** PLAN.md `Information plan`, each reveal marked surprise or suspense.
- **Check:** for suspense, the frame planting the bomb precedes the payoff. For surprise, a reader shown the setup frames can't predict the reveal but can find the clue afterwards.

### 7. Give someone a want, an obstacle and stakes that matter now
A goal plus an obstacle makes the viewer predict. Mamet asks of every scene who wants what, what happens if they don't get it, and why now (memo to *The Unit* writers, 2005). Truby adds the need beneath the want, met in a self-revelation at the end (*The Anatomy of Story*, 2007).
- **Masters:** in *Up*'s "Married Life", Carl and Ellie want Paradise Falls; a flat tyre, a broken leg and a miscarriage intervene. Carl's need, seeing their life was the adventure, waits for the end.
- **Use / hold back:** full want and need in narrative. In non-fiction the protagonist is often the viewer or the user ("you want X; Y stops you; here's a way"), and "why now" is news, a deadline or a change. In a 20-second tip it collapses to the viewer's stake, which is enough.
- **In our tools:** PLAN.md `Controlling idea`; `beat` rows name who acts.
- **Check:** the stake fits in words a non-expert knows. At the climax the protagonist acts rather than being rescued.

### 8. Build in nested units: beat, scene, sequence, act
A beat is a unit of change: something differs at its end. Scenes group beats in one time and place; sequences group scenes around a sub-question; acts are the major turns in the main question. Viewers segment film at several grains at once with shared boundaries (Cutting & Armstrong, 2019), so planning in these layers matches how the result is parsed. The principles hold at every length; only the unit carrying each changes. In 20 seconds a beat is a shot or two and the piece is one scene with a turn. Popular features divide into four acts, setup, complication, development and climax (Cutting, 2016), built from sequences.
- **Masters:** Pixar cuts storyboards with scratch voices into "reels" and critiques them long before animation (Catmull, 2014).
- **Use / hold back:** plan top-down, leaving room for a better found moment to replace a planned one.
- **In our tools:** PLAN.md `beat` groups rows; clip `id` ties each clip to its row.
- **Check:** every beat states what changes; scenery alone is not a beat. In long pieces each act names the turn that ends it.

### 9. Shape intensity with contrast, escalation and one peak
Intensity is relative: more contrast between parts means more intensity (Block, *The Visual Story*, 2008). In popular film, shots shorten and motion rises toward act ends and climaxes (Cutting, Brunick & DeLong, 2011). Viewers judge an experience mostly by its peak and its end, barely by its length (Fredrickson & Kahneman, 1993).
- **Masters:** *Dunkirk* braids a week, a day and an hour so one line is always climbing (Nolan, NPR 2017). Hitchcock called the bomb killing the boy in *Sabotage* a "terrible mistake": tension with no release left the audience resentful.
- **Use / hold back:** draw the curve for anything over a minute; short pieces still need one turn and one rise. Put the best material at the peak. If you build the need for relief, give it.
- **In our tools:** PLAN.md `Shape`; shape.png plots cuts and loudness against plan rows.
- **Check:** the plan names one peak. review.json's loudest moment and shape.png's shortest shots fall at or near it, and the climax differs from the setup on at least one axis.

### 10. Plant every setup and pay every promise
A payoff lands because the viewer connects it to something planted earlier. Chekhov: never show a loaded rifle that won't go off; "it's wrong to make promises you don't mean to keep" (letter, 1889). A hook is a debt paid in the body, not in a sequel or a follow request.
- **Masters:** *Aliens* shows Ripley working the power loader early, so fighting the Queen in it is believable. *Up*'s adventure book pays off when Carl finds Ellie filled it with their marriage.
- **Use / hold back:** a demo's setup is the pain in beat 1, paid off by the same screen fixed. A setup so loud the viewer finishes the joke first spoils the payoff; a payoff with no setup feels like a trick.
- **In our tools:** PLAN.md `Setups → payoffs`.
- **Check:** every ledger row has a setup at least one beat before its payoff; no payoff rests only on a call to action.

### 11. Use a motif that changes, and end on an image that answers the opening
A motif is a significant repeated element; the change between appearances carries the development (Bordwell & Thompson). An ending that rhymes with the opening, altered, gives the last frame a meaning the start set up.
- **Masters:** *Up* repeats the montage's camera moves at the book's payoff to return the audience to the marriage (Lin, 2022). Jobs's 2007 iPhone launch repeated "an iPod, a phone, and an internet communicator" until the audience added them into one device before he said it.
- **Use / hold back:** every format with an ending; a short loop can hand the last line back to the first. A logo or CTA can follow the ending image, never replace it.
- **In our tools:** PLAN.md `Bookend`; reuse one asset with one thing changed.
- **Check:** with first and last frames side by side, a reader names what recurs and what changed. Nothing changed means a loop, not an arc.

### 12. Cut good material that serves nothing
People learn more when extraneous material is left out (Mayer's coherence principle). Murch ranks emotion first among what a cut must serve, above story and rhythm (*In the Blink of an Eye*, 2001).
- **Masters:** Pixar dropped the dialogue from the *Up* montage: "the less we had the more emotional it felt" (Docter).
- **Use / hold back:** at plan review and after the rough cut. Keep the pause or reaction that lets a moment land; it serves emotion.
- **In our tools:** clip `reason`; PLAN.md `why`.
- **Check:** remove each row in thought and state the loss: a fact, a feeling, a setup, a question. "Nothing" or "it looked nice" means cut it.

## Across formats

| Format | Typical structure | What shifts |
|---|---|---|
| Reel | Stake or question at once; next line narrows it; a few proof beats; one turn; payoff on screen; one CTA | Curiosity usually drives it; the whole is one scene |
| Product demo | Result first (Cohan, "last thing first"), then the pain, the fewest steps each "therefore", the same screen fixed | Engine is watching it work; nothing withheld; a real task with a real result makes a scene (Jobs calling a Starbucks on stage, 2007) |
| Launch | A change in the world, winners and losers, the promised land, the product as the means, evidence (Raskin, 2016); "what is" against "what could be" (Duarte, 2010) | Suspense: stakes before the reveal; one turn |
| Explainer | A question the viewer has a foothold on; one idea at a time, each the "therefore" of the last; the last idea answers the opening | Name each part before relying on it; the peak is when the pieces add up |
| Short film | 30–60 s: one protagonist, want, obstacle, turn, choice, ending image. 2–5 min: adds a midpoint complication and real escalation | Feel leads; "do" is absent; withholding fully available |
| Feature | Four acts (Cutting 2016); sub-questions nest in the main one; want against need resolves in self-revelation (Truby) | Parallel lines converge on one climax; each act can carry its own visual rule |

## Weak work looks like

- Beats in sequence with no cause: feature tours, listicles with no through-line, montages of pretty clips.
- About a topic ("AI agents"), not a question someone holds.
- The hook promises a number or reveal the video never shows, or only the voice states it over unrelated footage.
- The second beat steps away from the opening question into background.
- A passive protagonist rescued by luck; in non-fiction, a viewer never given a stake.
- The product appears as the answer with no pain set up before it.
- A promise paid only by a sequel, a follow request or a CTA.
- Every beat at equal weight, so there is no peak to remember.
- Tension built and never released.
- The ending trails into a fade or logo card that answers nothing.
- Scenery or transitions standing in for beats: nothing differs after them.

## Sources

- Craft books: Block, *The Visual Story* (2008); Bordwell & Thompson, *Film Art*; Catmull, *Creativity, Inc.* (2014); Coppola, *The Godfather Notebook* (2016); Duarte, *Resonate* (2010); Lumet, *Making Movies* (1995); McKee, *Story* (1997); Murch, *In the Blink of an Eye* (2001); Truby, *The Anatomy of Story* (2007); Truffaut, *Hitchcock/Truffaut* (1966); Adams, *The Art of Spontaneous Theater* (Story Spine); Cohan, *Great Demo!*
- Practitioners: Chekhov, letter to Lazarev (1889); Mamet, memo to *The Unit* writers (2005); Parker & Stone, NYU class (2011); Stanton, TED "The clues to a great story" (2012); Raskin, "The Greatest Sales Deck I've Ever Seen" (2016); Jobs, iPhone keynote (2007); Docter & Lin on *Up*, The Ringer (2022); Nolan on *Memento* (Filmmaker Magazine) and *Dunkirk* (NPR, 2017); Spielberg on *Jaws* (interviews, reported).
- Research: Brewer & Lichtenstein (1982); Cutting (2016); Cutting & Armstrong (2019); Cutting, Brunick & DeLong (2011); Fredrickson & Kahneman (1993); Kang et al. (2009); Loewenstein (1994); Mayer & Fiorella, *Cambridge Handbook of Multimedia Learning* ch. 12; Zacks et al. (2007).
