// Checks the set and writes what is generated from it: svg/<name>.svg (each icon at rest, for
// design tools and <img>) and the catalog table in README.md. `--check` only checks.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { icons, motion, sets } from "../icons.js";

const dir = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, dir), "utf8");
const css = readdirSync(new URL("sets/", dir))
  .filter((f) => f.endsWith(".css"))
  .map((f) => [f, read(`sets/${f}`)]);
const problems = [];

// Keyframes are global, so two sets must never define the same name.
const defined = new Map();
for (const [file, text] of css)
  for (const [, name] of text.matchAll(/@keyframes\s+([\w-]+)/g)) {
    if (defined.has(name)) problems.push(`@keyframes ${name} is in ${defined.get(name)} and ${file}`);
    defined.set(name, file);
  }
const all = css.map(([, t]) => t).join("\n");
for (const [, list] of all.matchAll(/animation(?:-name)?:\s*([^;]+);/g))
  for (const word of list.split(/[\s,]+/))
    if (word.startsWith("ic-") && !defined.has(word)) problems.push(`animation ${word} is never defined`);

for (const name of Object.keys(icons)) {
  if (!new RegExp(`\\.ic-${name}[\\s.,:{]`).test(all)) problems.push(`${name} has no motion in any set css`);
  if (!motion[name]) problems.push(`${name} has no motion note`);
  if (/[^a-z0-9-]/.test(name)) problems.push(`${name} is not a kebab-case name`);
}

/** The icon at rest: parts classed fx or ink only exist while it plays, so they are dropped. */
export function still(body) {
  let out = "";
  let skip = 0;
  for (const [tag] of body.matchAll(/<[^>]+>|[^<]+/g)) {
    const open = /^<[a-z]/i.test(tag);
    const close = tag.startsWith("</");
    const self = tag.endsWith("/>");
    if (skip) {
      if (open && !self) skip++;
      if (close) skip--;
      continue;
    }
    if (open && /class="[^"]*\bi-(fx|ink)\b/.test(tag)) {
      if (!self) skip = 1;
      continue;
    }
    out += tag;
  }
  return out.replace(/\s*\n\s*/g, "").replace(/ class="[^"]*"/g, "").replace(/ pathLength="1"/g, "");
}
if (still(`<g class="i-fx"><g><path/></g></g><path class="i-a"/><rect class="i-x i-ink"/>`) !== `<path/>`)
  problems.push("still() is broken");

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
const count = Object.keys(icons).length;
if (process.argv.includes("--check")) {
  console.log(`ok: ${count} icons`);
  process.exit(0);
}

rmSync(new URL("svg/", dir), { recursive: true, force: true });
mkdirSync(new URL("svg/", dir));
for (const [name, body] of Object.entries(icons))
  writeFileSync(
    new URL(`svg/${name}.svg`, dir),
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${still(body)}</svg>\n`,
  );

const catalog = sets
  .filter((s) => s.names.length)
  .map(
    (s) =>
      `### ${s.title}\n\n| Icon | When it plays |\n| --- | --- |\n` +
      s.names.map((n) => `| [\`${n}\`](svg/${n}.svg) | ${motion[n]} |`).join("\n"),
  )
  .join("\n\n");
const readme = read("README.md");
writeFileSync(
  new URL("README.md", dir),
  readme.replace(/(<!-- catalog -->)[\s\S]*(<!-- \/catalog -->)/, `$1\n\n${catalog}\n\n$2`),
);
console.log(`wrote ${count} svgs and the catalog`);
