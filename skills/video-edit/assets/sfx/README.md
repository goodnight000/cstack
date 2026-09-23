# Sound effects

28 short effects (48 kHz stereo 24-bit WAV, 5 ms edge fades) with a
[catalog](catalog.json) listing tags, duration, suggested use, source post, and
rights status. `peak_dbfs` is the sample peak and `rms_dbfs` the whole-clip RMS,
both measured with FFmpeg `astats`; several clips peak at 0 dBFS as sourced.

## Rights

These files are **not** covered by the repository's MIT license. They were
extracted from public Instagram posts by mardan.mp4, mistertwister.me, and
haimovmedia; `source_url` and `source_in`/`source_out` record where each came
from. The creators invited reuse in their captions, but the licenses of the
underlying sounds are unverified (`rights_status`). Before publishing
commercially, confirm the rights or replace the effect. To have a file
removed, open an issue.

## Known limits

Clips were checked by label, waveform and decode, not by listening
(`review_status`). The explosion tail and DJ-stop onset were already truncated
in their sources. Fahhh, Punch, Shocking, Rizz, Vine boom and Bruh touched a
neighboring sound in the source, so audition their edges before mixing. The
"Decaying notification tone" title is provisional.
