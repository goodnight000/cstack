# Every cue("...") / cueEnd("...") phrase in src/ must resolve in src/words.json. usage: python3 check_cues.py
# If scenes wrap cue in a helper, add its name to HELPERS so it is checked too.
import glob, json, re
HELPERS = ["cue", "cueEnd"]
norm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower())
W = [norm(x["w"]) for x in json.load(open("src/words.json"))]
bad = 0
for p in sorted(glob.glob("src/**/*.ts*", recursive=True)):
    code = re.sub(r"^\s*//.*$", "", open(p).read(), flags=re.M)  # skip commented examples
    for m in re.finditer(r'\b(?:%s)\(\s*"([^"]+)"(?:\s*,\s*(\d+))?' % "|".join(HELPERS), code):
        ph = [norm(x) for x in m.group(1).split()]
        found = sum(W[i:i + len(ph)] == ph for i in range(len(W) - len(ph) + 1))
        if found < int(m.group(2) or 0) + 1:
            bad += 1
            print(f"{p}: '{m.group(1)}' nth={m.group(2) or 0} found {found}")
print("unresolved:", bad)
