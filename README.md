# cstack

Reusable agent skills by Charles Zheng, built and refined through real work.

## Skills

| Skill | What it does |
| --- | --- |
| [reflect](skills/reflect/SKILL.md) | Reviews outcomes and efficiency, shows findings before asking for feedback, and proposes improvements for approval. Works with completed, incomplete, and unsuccessful sessions. |

Reflect is the first release. Each skill lives in its own directory under `skills/`.

## Install

Clone the repository:

```sh
git clone https://github.com/goodnight000/cstack.git
cd cstack
```

Link the skill into your agent's skills directory. Run the appropriate command from the repository root.

For Codex:

```sh
mkdir -p "$HOME/.codex/skills"
test ! -e "$HOME/.codex/skills/reflect" && \
  ln -s "$PWD/skills/reflect" "$HOME/.codex/skills/reflect"
```

For Claude Code:

```sh
mkdir -p "$HOME/.claude/skills"
test ! -e "$HOME/.claude/skills/reflect" && \
  ln -s "$PWD/skills/reflect" "$HOME/.claude/skills/reflect"
```

If `reflect` is already installed, compare and back up that version before replacing it. If both agents share a skills directory, install once. You can copy the folder instead of linking it; a linked installation follows changes in this checkout. Reload your agent session after installation if needed.

## Use Reflect

Ask your agent:

```text
Use the reflect skill to review this session, including the result and any avoidable effort.
Show me the findings and proposed changes before editing reusable instructions.
```

You can also name other threads and a time window when your agent has access to their history. Reflect does not provide its own history connector.

The review separates consequential findings from changes worth adding to reusable guidance. It can report an inefficiency without recommending another rule. It asks for approval before editing instructions and does not authorize publication, memory changes, or resuming the reviewed task.

## Evaluation

[Reflect's evaluation cases](skills/reflect/evals/evals.json) cover feedback, constructive pushback, unnecessary repeat checks, necessary investigation, and findings that warrant no instruction changes.

To assess behavior, give an independent agent `SKILL.md`, a case's request and session evidence, then its feedback at the appropriate point. Keep the case's `checks` hidden until reviewing the response. These are evaluation scenarios, not an automated test suite or a guarantee of future performance.

## Contributing

Keep each skill self-contained and focused on a recurring need. Include examples or evaluation cases that expose meaningful mistakes. Keep transcripts, credentials, personal project history, and machine-specific paths out of published skills. For third-party contributions, preserve attribution and confirm license compatibility.

## License

[MIT](LICENSE).
