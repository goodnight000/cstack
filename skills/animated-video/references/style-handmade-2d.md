# Handmade 2D

Drawn, cut or painted material with visible process: paper grain, ink, uneven tone, held
drawings. It suits personal stories, warmth and charm. Medium, palette and roughness are chosen
per brief.

## Its bar (in addition to the finish bar)
- **Texture:** procedural paper grain and slightly uneven tone, torn or deckled edges,
  cut-paper layers with soft shadows, shapes and outlines that are a little irregular. Render
  the grain once and reuse it; recomputing a full-frame texture every frame is slow.
- **Depth:** layers that overlap and cast soft shadows, with parallax between them.
- **Light:** a consistent light direction across layers; shadows and highlights painted in.
- **Line boil for a stop-motion feel:** re-jitter outlines with seeded noise and hold each
  drawing for 2–3 frames.

## Typical failure
Texture added as a filter over clean vector art reads as a preset. The irregularity has to be
in the shapes and edges themselves.

## Examples
The widely shared code-drawn Opus 5.5 animations on X (September 2026) were handmade in this
sense. Treat them as one direction within the family, not its definition.
