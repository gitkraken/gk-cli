# Removed commands in the TypeScript-based `gk`

Draft compatibility note for the release of the TypeScript-based `gk`. Release
notes should copy or link this file.

The commands below are not supported and are removed from the TypeScript-based
`gk`. An installed `gk` that predates that release may still accept them with a
deprecation warning. Do not rely on that: stop using them now, whichever `gk`
you have installed.

## Removed commands and replacements

| Removed | Replacement |
| --- | --- |
| Bare `gk <git command>` (for example `gk status`, `gk log`) | `git <command>` |
| `gk compose` and its subcommands (`plan`, `apply`, `apply-plan`, `split`, `split plan`, `undo`) | `gk ai compose <subcommand>` |
| `--output <format>` | `--json` |
| `gk workspace` (alias `ws`) and its subcommands | None. There is no multi-repository workspace replacement. |
| `gk work` and its subcommands | None. There is no multi-repository work-item replacement. |
| `gk graph` | None. Use GitKraken Desktop or GitLens directly. |
| `gk gitlens` (alias `gl`) | None. Use GitKraken Desktop or GitLens directly. |
| `gk repo` (including `gk repo resolve`) | None. |
| `gk completion` | None. |
| `gk system` (including `gk system reset`) | None. |
| `gk kraken` | None. |
| `gk merge-mate` | None. |
| `gk experimental install-logging-instructions` | None. |

Only `git <command>`, `gk ai compose`, and `--json` have a direct replacement.
Do not substitute one of the other commands for a removed one.

Unknown commands no longer fall through to git. A mistyped `gk` subcommand
fails as an unknown command instead of reaching git and printing
`git: '<x>' is not a git command`.

MCP tools such as `git_graph` and `gitkraken_workspace_list` are unaffected.

## Refreshing installed agent skills

Agent skills installed from an earlier `gk` release can still tell agents to use
the removed commands. Refresh them with `gk ai skill update`. Nothing refreshes
them automatically. Run the refresh yourself after upgrading.

Global scope first:

```bash
gk ai skill check --all --json
gk ai skill update --all --dry-run --json
gk ai skill update --all --json
gk ai skill check --all --json
```

Then, from each repository that has committed project skills, repeat the same
commands with `--scope project`. `--all` is accepted with `--scope project`:
both `check` and `update` expand it to the clients that have skills committed in
the current worktree, and fail when there are none (name a client explicitly
in that case). For example:

```bash
gk ai skill check --all --scope project --json
gk ai skill update --all --scope project --dry-run --json
gk ai skill update --all --scope project --json
gk ai skill check --all --scope project --json
```

What to expect for each installed skill:

- Unchanged skills that an earlier `gk` wrote are updated without `--force`
  (state `older_release`).
- Skills that are already current are left as they are.
- Skills that are not installed stay missing. `update` never installs; use
  `gk ai skill install <client>` for that.
- Modified or unowned copies (state `modified`) are refused. Review or back up
  the file first, then replace only that skill with a targeted force:
  `gk ai skill update <client> --skill <name> --force`. Do not use a blanket
  `--force`.
- Linked targets (symlinks) and manifests with an unknown schema are refused,
  even with `--force`. Fix those by hand.

Batch results are reported per client and per skill. Read them, and check the
final `gk ai skill check` output, instead of assuming every skill refreshed.
Restart or reload the agent host afterward so it picks up the new skill text.
