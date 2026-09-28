# Camera and composition

The camera decides what the viewer looks at, how close they stand, and whose side they are on. The governing question per frame: what matters most right now, and how should it feel to be here? A move without a reason is noise competing with the subject.

## Questions to ask

1. What matters most in this beat, and is it the biggest, sharpest or most central thing in frame?
2. Whose point of view is this shot?
3. What changed since the last shot? A new idea earns a new frame; a continuing idea earns a hold or a move.
4. Cut or move? Move when the link between A and B is part of the understanding; cut when they are separate ideas or the travel shows nothing.
5. What triggers this move, and what frame does it land on? If neither can be named, hold still.
6. What am I withholding? Fiction withholds for suspense; a demo shows the result plainly.
7. Where is the one peak of visual intensity, and what quiet surrounds it?
8. Who holds the camera (locked observer, smooth omniscient, handheld witness), and does the piece commit to one?

## Principles

### 1. Make size equal importance
How much of the frame a subject fills tells the viewer how much it matters. Hitchcock: "The size of an object in the frame should be directly related to its importance in the story at that moment" (*Hitchcock/Truffaut*). Close-ups raise viewers' thinking about a character's mind only up to a point (Bálint, Blessing & Rooney 2020). Sizes (Bowen, *Grammar of the Shot*): extreme wide for scale, wide for bodies in space, medium for neutral explanation, close-up for conviction, extreme close-up for the one decisive detail.
- **Masters:** *Notorious* (1946) cranes from a crowded ballroom down to the cellar key in Bergman's hand.
- **Use / hold back:** save the tightest framing for the most important moment. Fiction needs an early wide to map space; a talking-head reel may not.
- **In our tools:** `crop` on footage; `<Camera>` zoom in Remotion.
- **Check:** on each `sheet.png` frame, the row's `see` subject is the largest or most central element. Flag one size dominating the piece, or the tightest size spent in the opening.

### 2. Put the lens at the height of the relationship
Angle shifts judgments of people while viewers barely remember the angle (Kraft 1987). Speakers are judged most trustworthy at eye level (Baranowski & Hecht 2018). Low angles lifted product ratings only for skimming viewers (Meyers-Levy & Peracchio 1992). High angles give vulnerability or a map; top-down suits hands. A Dutch angle weakens with repetition.
- **Masters:** *Memento* stays over Leonard's shoulder at his eyeline, so the viewer explores each room as he does [unverified].
- **Use / hold back:** eye level for direct address. Low angle for a product hero only in skim contexts. At most one canted beat per piece.
- **In our tools:** in Remotion, angle comes from the drawn pose and horizon height, not camera rotation.
- **Check:** on speaker frames, a visible ceiling or chin underside means the lens is low.

### 3. Place the subject where the eye already is
Gaze clusters on motion and faces, driven mostly by the image (Smith & Mital 2013), so the subject should be the thing that moves, or the only thing. The rule of thirds plays "only a minor, if any, role" in acclaimed images (Amirshahi et al. 2014); use it only to put eyes near the upper third. Give look room where a subject faces. Across cuts, put the next subject near where the last one left the eye.
- **Masters:** *Mad Max: Fury Road* kept the point of interest near centre for fast cutting [unverified].
- **Use / hold back:** aspect ratio sets what fits side by side. 2.39:1 holds two people with space between and rewards lateral moves; 1:1 pulls to the centre; 9:16 cannot hold two readable faces side by side, so stack them, keep a wide's subject large, and note tilts travel far while pans barely travel. Vertical platforms cover top and bottom with interface.
- **In our tools:** anchor `crop` on the eyes, not frame centre.
- **Check:** mark subject position across consecutive `sheet.png` frames; a big jump at a cut needs a reveal or jolt in `link`. Eyes, product and key text stay clear of platform interface bands.

### 4. Keep screen direction, the 180° line and eyelines
Viewers map who is left, which way things move and where people look. Keeping the camera on one side of the line of action preserves that map (Bordwell & Thompson, *Film Art*). An off-frame look promises the next shot shows what is seen.
- **Masters:** Ozu cut across the line systematically, treating space as a full circle, so a consistent break became a style (Bordwell, *Ozu and the Poetics of Cinema*).
- **Use / hold back:** a character heading for a goal keeps one direction and reverses only in retreat. One deliberate break can mark a turn; a random one is an error.
- **In our tools:** note direction (L→R, R→L) in `see`.
- **Check:** compare directions of adjacent rows, or subject position across two frames with `reel.py view`; flag unexplained reversals.

### 5. Move only on a trigger, and pick the move for its feeling
Deakins: "If the camera moves it's got to be for a reason." Triggers: the subject moves, a look or sound pulls the frame, a reveal changes meaning, a pan asserts a connection a cut would sever, or a realisation makes the viewer lean in. A dolly moves the camera, so near and far shift differently and the viewer feels present; a zoom only magnifies, so it reads as attention. Nolan: "I don't use zoom lenses... we always move the camera physically closer" (DGA 2012). Pans and tilts connect; crane up reads as release, down as arrival; handheld is a witness; whip pans and shakes punctuate one event.
- **Masters:** the dolly zoom in *Vertigo* makes the world stretch under Scottie; Spielberg used it once on Brody in *Jaws*.
- **Use / hold back:** emphasis gets a cut tighter or a push that ends on the word; a joke holds through the setup and punctuates after. Every digital punch-in and still move is a zoom; only a layered virtual camera gets parallax.
- **In our tools:** `see` names move and trigger ("push in, lands on 'free'"); Remotion keys start at the trigger's word time.
- **Check:** every move has a verb (follow, reveal, connect, lean in) and a trigger; `reel.py view` at the trigger shows it starting there and landing on the planned subject.

### 6. Give the camera mass: ease, limit speed, land and hold
Real cameras accelerate, travel and settle ("slow in and slow out", Thomas & Johnston, *The Illusion of Life*). A move that stops creates contrast, and the stop carries the meaning (Block, *The Visual Story*). RED's starting point at 24 fps, 180° shutter: pan no faster than one frame width per seven seconds, or judder shows; higher frame rates and blur allow more. Code-rendered frames have no motion blur, so fast virtual pans strobe worse than film.
- **Masters:** Deakins in *Sicario* holds a static shot of soldiers descending into the sunset, building tension "just by holding a shot."
- **Use / hold back:** ease in-out between compositions, ease out when reacting to a trigger, linear only for a drift through a whole shot. No research sets a minimum hold; hold until the destination reads.
- **In our tools:** Remotion `camAt` eases keys; add blur or render 60 fps for fast moves.
- **Check:** tile a move's frames; displacement should rise, plateau, fall, then hold near-identical.

### 7. Shape visual intensity as one curve that tracks the story
Greater contrast in size, movement or angle means greater intensity; affinity calms (Block, *The Visual Story*). Zooming everywhere reads flat.
- **Masters:** *Notorious* spends its one great crane on the key; *Sicario*'s held shot makes stillness the tension.
- **Use / hold back:** decide per beat where the frame is calm and where it peaks.
- **In our tools:** the plan header's `Shape` names the peak.
- **Check:** in `shape.png`, the peak row shows the biggest size jump or first move after stillness; flag high camera intensity on most rows.

### 8. Commit to one point of view and one camera persona
Nolan: "I can't shoot the scene in a neutral way" (DGA 2012). Every sequence is shot from somewhere. Commitment makes a departure mean something.
- **Masters:** Nolan shot *Inception* handheld "to portray the reality of dreams" (DGA 2012).
- **Use / hold back:** a demo sits in the user's seat; a reel's inserts are the speaker's evidence; a launch knows whether each shot is maker's or customer's view. Name a small move vocabulary ("locked; push-ins on the three turns; one crane at the end").
- **In our tools:** persona and vocabulary go in the plan header's `Style` line.
- **Check:** audit rendered moves against the stated vocabulary.

### 9. Punch into camera footage only for a cut or a beat
A punch-in fakes a second camera size. It hides a jump cut, since a cut between two views of one subject needs a clear size or angle change (30° rule, Thompson & Bowen, *Grammar of the Edit*), or it marks emphasis by size. Too small a step reads as a glitch; a punch per sentence becomes a pulse. No research sets the step; practitioners cite about 1.25× or more [unverified]. Effective scale = zoom × (output height ÷ source height). Vertical 4K to 1080×1920 allows 2×; landscape 4K cropped vertical allows 1.125×; 1080 vertical allows none.
- **Use / hold back:** cut on a head turn, gesture or blink, which hides the cut (Smith & Henderson 2008). Fiction shoots real sizes instead.
- **In our tools:** timeline `crop`; `reel.py check` warns on upscale.
- **Check:** each punch has a trigger word and reason; flag evenly spaced punches and crops that upscale or push eyes into interface bands.

### 10. Treat a still as a master shot and the move as its coverage
A move on a still or screenshot travels from context to the detail the narration names, arriving as it is named, or pulls back from a detail to reveal context.
- **Masters:** the NFB's *City of Gold* (1957) explored Klondike photographs by pan and zoom; Ken Burns, who credits it, finds the face or object that connects with the narration.
- **Use / hold back:** vary direction and target by content. A still with nothing to find is held or cut, not drifted.
- **In our tools:** `crop` for a static reframe; a keyed Remotion `<Camera>` or Resolve for a move.
- **Check:** `reel.py view` at the naming word shows the move ending there, detail centred and readable; flag three consecutive stills with the same move.

### 11. In screen recordings, zoom to the change, hold, cut between unrelated regions
Cues that guide attention to relevant elements improve learning (van Gog, signaling principle), so a zoom or highlight is a cue placed where attention must go. A full 16:9 desktop in a 1080-wide vertical frame is downsampled about 3.5× from 3840 px, so vertical demos need a zoomed region.
- **Masters:** side-scrolling game cameras hold still while the target moves inside a central window, then follow with lag (Keren, "Scroll Back", 2015) [unverified].
- **Use / hold back:** move when "this setting changes that chart" is the point; cut between unrelated regions. Never zoom during a wait or a UI transition. Hold while the cursor works in a region; record slow, straight cursor moves.
- **In our tools:** record at 2× density with a larger UI scale; Remotion keys `<Camera>` to UI coordinates.
- **Check:** OCR the frame at each informational row, scaled to phone width; the value named in `hear` must read. Hold frames differ only where the UI changes.

### 12. In animation, move one world with one camera
A camera films one world: when it moves, everything moves together, far things slowly and near things fast. The template failure is each element sliding on its own schedule, a slideshow of stickers.
- **Masters:** Disney's multiplane camera moved painted planes at speeds set by depth; *The Old Mill* (1937) won an Academy Award with it.
- **Use / hold back:** things move on their own only when acting; the view changing is always the camera. Depth stays fixed unless an object travels. Captions and interface sit in screen space; a sign in the world parallaxes.
- **In our tools:** Remotion `<Camera>` with depth layers; captions outside it.
- **Check:** in shot code, flag unmarked frame-driven transforms and captions inside `<Camera>`. On a move's end frames, displacement is ordered by depth with no bare canvas.

### 13. In live action, stage for the camera and cover for the cut
Block the action so the frame does the telling. Mamet: the director tells the story "through the juxtaposition of uninflected images," decided in the shot list before shooting (*On Directing Film*). Coverage lets the edit choose: a master holding the whole action, singles and over-the-shoulders on each person, inserts on objects that matter; Katz lays out dialogue setups as a triangle on one side of the line (*Shot by Shot*).
- **Masters:** Mamet's plainest images (a hand, a key, a face) carry meaning only when cut together.
- **Use / hold back:** plan each subject's position so successive shots hand off the eye. A single-take scene commits to staging instead of coverage. Reels cover with cutaways to what the speaker names.
- **In our tools:** `see` names size and position for the handoff.
- **Check:** rows the edit may trim have cover; ask the user what was shot.

### 14. Give the person on camera eye level, a listener and a reason to speak
Eye level earns trust (Baranowski & Hecht 2018). Direct address needs eyes on the lens; reading beside it breaks contact. People talk well to someone, not to glass.
- **Masters:** Errol Morris's Interrotron puts the interviewer's face over the lens, so "the conversation is between the camera/interviewer and the subject."
- **Use / hold back:** give a question, a listener beside the lens or a physical task, not "be natural." Interview documentaries may keep an off-lens eyeline, which reads as overheard.
- **In our tools:** prefer camera-facing takes.
- **Check:** on speaking frames, eyes on the lens at lens height; ask the user how the speaker was prompted when takes sound recited.

## Across formats

| Format | What shifts |
|---|---|
| Reel | Eye-level direct address; inserts are the speaker's evidence; punch-ins cover cuts and a few turns; vertical stacks replace two-shots. |
| Product demo | User's-seat POV; zoom to the change and hold; readable text at phone size; show the result plainly. |
| Launch | One restrained persona building to a single reveal with the biggest move. |
| Explainer | Virtual camera; moves connect ideas spatially. |
| Short film | Full plan of size, angle, POV, move and trigger; an early wide; consistent screen direction; dialogue coverage. |
| Feature | Persona and POV sustained for hours; signature devices used once; staging and coverage per scene. |

## Weak work looks like

- Every still and shot slowly zooms or drifts, so no move means anything.
- Punch-ins on a timer or every caption keyword, often glitch-sized.
- Moves start and stop at clip edges and land on nothing.
- The largest element is decoration while the named product or number is small.
- Elements slide independently; captions drift with the world.
- Linear or bouncy easing on a heavy camera; fast virtual pans strobing.
- Motion and cursor direction flip shot to shot.
- A full desktop shrunk into a vertical frame; text soft from upscaling.
- Dutch angles, shakes and whip pans used as "energy."
- Eyes under the top interface band, mouths under captions.
- Locked, then handheld, then gimbal float, with no story reason.
- Fiction with no wide, so the viewer never learns where anyone is.

## Sources

- Truffaut, F. *Hitchcock/Truffaut* (1966).
- Katz, S. D. *Film Directing Shot by Shot* (1991).
- Mamet, D. *On Directing Film* (1991).
- Block, B. *The Visual Story* (2008).
- Bowen, C. J. *Grammar of the Shot*; Thompson, R. & Bowen, C. J. *Grammar of the Edit*.
- Bordwell, D. & Thompson, K. *Film Art*; Bordwell, D. *Ozu and the Poetics of Cinema* (1988).
- Thomas, F. & Johnston, O. *The Illusion of Life* (1981).
- Research: Bálint, Blessing & Rooney (2020); Kraft (1987); Baranowski & Hecht (2018); Meyers-Levy & Peracchio (1992); Smith & Mital (2013); Smith & Henderson (2008); Amirshahi et al. (2014); van Gog, signaling principle.
- Keren, I. "Scroll Back" (Gamasutra, 2015) [unverified].
- Nolan, DGA Quarterly (2012); Deakins, Hazlitt interview; RED, "Panning Speed Best Practices"; Morris, Interrotron (Wikipedia).
