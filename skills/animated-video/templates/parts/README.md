# Parts

Recurring objects and sounds built for one film, kept because other films need them too. Unlike
`remotion-film/`, these have a look: copy only what the story needs, into the same paths in your
film, then restyle them to its art bible. A part is a starting point, not the film's design.

From the 2026-10 explainer about a photo crossing the Pacific. Checked by rendering stills from a
fresh copy of the template and by running the sound self-test, not by a second full film.

| Part | Files | What it is |
| --- | --- | --- |
| Globe | `src/kit/globe.tsx`, `globe-web-data.ts`, `globe-web-gen.mts`, `public/earth_day.jpg`, `public/earth_night.jpg` | A three.js planet on its night side (moonlit navy, city lights, limb glow, optional real day side), a star field, and an illustrative web of 608 undersea cables that draws on as a wave. `ll()`, `arc()` and `over()` place points and cameras. The API is in the file's header. |
| Phone | `src/kit/phone.tsx` | A modelled iPhone whose screen is a dark-mode iMessage thread or lock screen, redrawn each frame from a plain state object: messages appearing, a photo flying up from the compose bar, the send arrow pressed, a keyboard, "Delivered", a notification. `phoneLayout()` and `screenPoint()` let a thumb hit the real send arrow. |
| Designed sounds | `audio/designed.py` (needs the template's `audio/dsp.py`) | About 30 synthesised effects in numpy: whoosh, thud, sub drop, riser, blips and chimes, data chatter, counter, scramble and unscramble, radio pulse, telegraph (any text in Morse), sonar, bubbles, swarm, wind, crackle, send and receive tones. Pitched ones default to F minor. `python3 audio/designed.py` renders one of each with its level. |

## Setup

- Globe and phone need `npm i @remotion/three three @react-three/fiber @types/three` and the
  template's `src/kit/three-canvas.tsx`. Load textures and the photo with `useEarth()` or
  `usePhone('your-photo.jpg')` in the scene component, outside the canvas.
- Designed sounds need `numpy` and `scipy`; `dsp.read()` and `dsp.loudness()` also need FFmpeg.
- `globe-web-gen.mts` rebuilds `globe-web-data.ts` (`node src/kit/globe-web-gen.mts`, needs
  FFmpeg). Edit its hub list to change the web; `ORIGIN` sets where the draw-on wave starts.

## Rights and limits

- The Earth textures are NASA Blue Marble (2004, topography and bathymetry) and Black Marble
  (2016), public domain, resized to 4096x2048; NASA asks for credit. The globe shader assumes
  that size.
- The cable web is illustrative: real coastal cities joined by invented links. Do not present it
  as a map of real cables.
- The phone draws Apple's interface from scratch and uses the system font. The send and receive
  sounds are original, not Apple's.
- Nobody has listened to the designed sounds outside that film's mix. Some peak above full scale
  before you set their gain (`crackle` is +1 dB), so set levels in context.
