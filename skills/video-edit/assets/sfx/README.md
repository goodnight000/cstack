# Sound effects

61 effects with a [catalog](catalog.json) listing tags, duration,
suggested use, source, and rights status. `sfx-01`–`sfx-28` are 48 kHz stereo
24-bit WAV with 5 ms edge fades; `sfx-29`–`sfx-61` are FLAC cut from Freesound
previews (`source_in`/`source_out` are seconds in that preview). `peak_dbfs` is
the sample peak and `rms_dbfs` the whole-clip RMS, both measured with FFmpeg
`astats`; several clips peak at 0 dBFS as sourced.

## Rights

`sfx-29`–`sfx-61` are CC0 recordings from Freesound (`license`, `source_url`);
crediting the uploader is courteous, not required.

`sfx-01`–`sfx-28` are **not** covered by the repository's MIT license. They were
extracted from public Instagram posts by mardan.mp4, mistertwister.me, and
haimovmedia; `source_url` and `source_in`/`source_out` record where each came
from. The creators invited reuse in their captions, but the licenses of the
underlying sounds are unverified (`rights_status`). Before publishing
commercially, confirm the rights or replace the effect. To have a file
removed, open an issue.

## Known limits

Clips were checked by label, waveform, measurement and decode, not by listening
(`review_status`). Several Freesound clips are stand-ins for what their title
names (the foghorn is a PVC pipe, the servo a pitched DC motor, the switch clack a
breaker); `impact-deep` and `whoosh-deep` sit mostly below 120 Hz, so layer them
for phone speakers. `sfx-56`–`sfx-61` are 23–31 s ambience beds (tag `loop`)
measured for steadiness (1 s level within 4 dB); their ends are faded, not
looped seamlessly, so crossfade when extending them. The explosion tail and DJ-stop onset were already truncated
in their sources. Fahhh, Punch, Shocking, Rizz, Vine boom and Bruh touched a
neighboring sound in the source, so audition their edges before mixing. The
"Decaying notification tone" title is provisional.
