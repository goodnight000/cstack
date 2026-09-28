#!/bin/bash
# Render stills of the film at the given seconds and a contact sheet.
# usage: ./snap.sh <outdir> <sec|fN> [...]   -> <outdir>/t<arg>.png + <outdir>/sheet.png  (f1768 = frame 1768)
# Renders two stills at a time so several agents can share the machine.
set -e; cd "$(dirname "$0")"; out=$1; shift; mkdir -p "$out"
fps=$(sed -n 's/^export const FPS = \([0-9]*\).*/\1/p' src/lib.ts)
npx tsc -p .
b=$(mktemp -d)/bundle; npx remotion bundle src/index.ts --out-dir "$b" --log=error >/dev/null
printf '%s\n' "$@" | xargs -P 2 -I{} sh -c 'npx remotion still "$0" Film "$1/t{}.png" --frame=$(python3 -c "a=\"{}\"; print(int(a[1:]) if a[0]==\"f\" else round(float(a)*$2))") --log=error >/dev/null' "$b" "$out" "$fps"
python3 sheet.py "$out/sheet.png" $(for s in "$@"; do echo "$out/t$s.png"; done)
rm -rf "$(dirname "$b")"
echo "$out/sheet.png"
