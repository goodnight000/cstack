# cstack

These are the skills that I use almost every day. I am always adding more skills here. The skills here have saved me hours on on workflows. lmk your experiences with them and drop any feedback! These skills are also refined quite often.

## Skills

| Skill | What it does |
| --- | --- |
| [reflect](skills/reflect/SKILL.md) | Reviews outcomes and efficiency, shows findings before asking for feedback, and proposes improvements for approval. Works with completed, incomplete, and unsuccessful sessions. |
| [rsi](skills/rsi/SKILL.md) | Tests changes to agent skills, instructions, tools, and working processes against the current version, with bounded runs and evidence for keeping or rejecting each change. |
| [video-edit](skills/video-edit/SKILL.md) | Edits talking-head videos, reels, demos, and screen recordings. Covers audio recovery, take selection, supporting visuals, Resolve revisions, captions, and final-export checks. |
| [animated-video](skills/animated-video/SKILL.md) | Makes animated videos in code with Remotion: character stories, motion graphics, kinetic type, and animated infographics. Locks the format with a style frame, times everything from the voiceover, builds recurring assets once, animates in parallel, and reviews renders by frames and audio measurements. |
| [video-script](skills/video-script/SKILL.md) | Brainstorms short-form video ideas and writes scripts from the creator's own analytics: who has a stake, a hook that lands in 3 seconds, a second sentence that keeps viewers, and proof on screen. Also turns posted-video insights into lessons, with a script that reads retention curves from screenshots. |

Each skill lives in its own directory under `skills/` and can be installed separately.

## Install

Clone the repository:

```sh
git clone https://github.com/goodnight000/cstack.git
cd cstack
```

Choose a skill, then link it into your agent's skills directory. Run the appropriate commands from the repository root.

```sh
skill_name=reflect  # or rsi, video-edit, animated-video, video-script
```

For Codex:

```sh
mkdir -p "$HOME/.codex/skills"
test ! -e "$HOME/.codex/skills/$skill_name" && \
  ln -s "$PWD/skills/$skill_name" "$HOME/.codex/skills/$skill_name"
```

For Claude Code:

```sh
mkdir -p "$HOME/.claude/skills"
test ! -e "$HOME/.claude/skills/$skill_name" && \
  ln -s "$PWD/skills/$skill_name" "$HOME/.claude/skills/$skill_name"
```

If the selected skill is already installed, compare and back up that version before replacing it. If both agents share a skills directory, install once. You can copy the folder instead of linking it; a linked installation follows changes in this checkout. Reload your agent session after installation if needed.

## Use Reflect

Ask your agent:

```text
Use the reflect skill to review this session, including the result and any avoidable effort.
Show me the findings and proposed changes before editing reusable instructions.
```

You can also name other threads and a time window when your agent has access to their history. Reflect does not provide its own history connector.

The review separates consequential findings from changes worth adding to reusable guidance. It can report an inefficiency without recommending another rule. It asks for approval before editing instructions and does not authorize publication, memory changes, or resuming the reviewed task.

## Use RSI

```text
Use the rsi skill to test one improvement to this agent workflow.
Reuse our Reflect findings, compare with the current version, and state a bounded
experiment plan. Keep installed instructions unchanged until I approve adoption.
```

RSI uses the project's existing runners and checks. It can reuse Reflect when installed,
or reconstruct the necessary evidence directly. It adds no background service or test
platform. Give it the task, experiment budget, and adoption scope; it preserves those
bounds across the work. A successful local comparison is evidence for the tested scope,
not proof of unlimited recursive improvement.

## Use Video Edit

```text
Use the video-edit skill to edit the footage in this project.
Start from the latest accepted version and the brief. Preserve complete takes,
use supporting visuals that match the spoken claims, and check the actual export.
```

On first use the skill runs `scripts/preflight.py`, which checks for FFmpeg,
Python 3, and [uv](https://docs.astral.sh/uv/) (for local Whisper transcription).
It shows the install command for anything missing and runs it only if you agree.
[DaVinci Resolve](https://www.blackmagicdesign.com/products/davinciresolve) (free)
is recommended for a native, editable project; without it the skill renders with
FFmpeg. Browser research and publishing need browser tools and your accounts.

With no brief, the skill asks where the video will be posted, how long it should
be, and whether you want music, sound effects, or a hook headline, then follows
its [default short-form style](skills/video-edit/references/style.md). To keep
your own defaults across updates, put them in `~/.video-edit/profile.md`.

The bundled [sound effects](skills/video-edit/assets/sfx/README.md) are not
covered by the MIT license; their sources and unverified rights status are
listed in their catalog.

## Use Animated Video

```text
Use the animated-video skill to turn this script into an animated video.
Confirm the format and show me one style frame before building the full piece.
```

For the best results, run it with Claude Opus 5.5 at high or max effort. Short
unnarrated pieces take one agent and a storyboard; longer narrated films use the
full production with parallel animators and a review panel.

The skill needs a shell, Node.js with Remotion, FFmpeg/ffprobe, and Python 3
with faster-whisper for word timings. Voiceover comes from the user or a
separate tool. Music and effects come from the user's files, on-disk samples
such as the video-edit sound library, or sound synthesized in code. The template holds style-neutral
infrastructure only (timing, camera, still and render scripts). Characters,
art direction, and creative defaults are designed per project or supplied by you.

## Use Video Script

```text
Use the video-script skill to brainstorm ideas for my next video.
Rank them by who has a stake, and give each a hook, a second sentence, and what we'll show.
```

It works best with a library of your past videos and their analytics: one Markdown
file per video plus an index, in the [library format](skills/video-script/references/library.md).
Point the skill at it, and at your voice and pace, in `~/.video-script/profile.md`.
To review a posted video, give it the insights screenshots; it reads the retention
curve with `scripts/retention_curve.py` (Python 3 with Pillow and numpy) and
checks the reading against the app's average watch time.

## Evaluation

[Reflect's evaluation cases](skills/reflect/evals/evals.json) cover feedback, constructive pushback, unnecessary repeat checks, necessary investigation, findings that warrant no instruction changes, and keeping one project's output from becoming a default when it seeds a new skill.

[Animated Video's evaluation cases](skills/animated-video/evals/evals.json) cover locking the format before building and treating a past film as evidence rather than a template.

[RSI's evaluation cases](skills/rsi/evals/evals.json) cover missed skill discovery, exposed final tests, altered graders, authorized local adoption, creative judgment, and unproven improvement of the improvement process.

To assess behavior, give an independent agent `SKILL.md`, a case's request and session evidence, then its feedback at the appropriate point. Keep the case's `checks` hidden until reviewing the response. These are evaluation scenarios, not an automated test suite or a guarantee of future performance.

Run Video Edit's caption-helper check with Python 3:

```sh
python3 skills/video-edit/scripts/test_make_captions.py
```

This checks caption generation, time mapping, raw transcript preservation, and
known warning/error behavior. It does not validate a Resolve installation,
listening quality, visual taste, or an end-to-end video edit on your machine.

## Icons

[Charade](icons/README.md) is a set of line icons that act out what they mean. Each one plays a short
animation of its own verb when its button or link is hovered or focused: the lock unlocks, the
bell swings, the trash eats a crumb. There are 203 icons in plain SVG and CSS, with no
dependencies. Open `icons/index.html` from a local server to browse them.

## Contributing

Keep each skill self-contained and focused on a recurring need. Include examples or evaluation cases that expose meaningful mistakes. Keep transcripts, credentials, personal project history, and machine-specific paths out of published skills. For third-party contributions, preserve attribution and confirm license compatibility.

## License

[MIT](LICENSE).
