# Contributor conventions

## Agent-friendly CLI output

`gk` is driven by AI agents as well as humans. The agent-facing gains erode
unless new commands follow the same rules. Any new **result command** (one that
reports data or the outcome of a mutation) MUST satisfy this checklist. The
published contract for consumers lives in the root `AGENTS.md`.

- **Honor the global `--output`.** Do not add a per-command output flag. Read
  the resolved mode from `config.OutputFormat` (or the `config.JSONOutput()`
  helper on `actions.Configuration`). The flag is `--output=text|json`, also set
  via `GK_OUTPUT`, resolved once in `cmd/main.go`.
- **One JSON document on stdout.** In JSON mode stdout carries only the data.
  Route every human-facing line (warnings, "no results" notes, progress) to
  `config.Stderr`. Build the payload with `gkio.WriteJSON`; never hand-roll
  `json.Marshal` to stdout.
- **No color outside an interactive terminal.** Color is configured once at
  startup (`tui.ConfigureColor`) and is off whenever stdout is not a TTY,
  `NO_COLOR`/`CI` is set, or output is JSON. Do not emit raw ANSI yourself.
- **Structured errors.** Terminal failures are classified by `errors.Classify`
  and, under JSON, emitted as a single `{"error":{code,message,retryable}}`
  envelope on stderr by `cmd/main.go`. Return typed CLIErrors
  (`errors.NewExpectedError` / `NewUnexpectedError`, or the network/auth
  helpers) so the code and retryable flag map correctly. Do not print error
  prose yourself in JSON mode.
- **Semantic exit codes.** `0` success, `1` permanent failure
  (auth/validation/internal), `75` (`EX_TEMPFAIL`) transient/retryable. The
  process exit code equals `errors.Classify(err).ExitCode` and is the same in
  text and JSON mode, so the shell-level retry signal is format-independent.
  Breaking change: network/timeout failures that previously exited `1` now exit
  `75` in both text and JSON mode. Scripts or wrappers checking `$? == 1` must be
  updated; announce this in the release notes.
- **Token discipline on list output.** For commands returning collections,
  support `--fields a,b,c` and project the list with
  `gkio.WriteJSONWithFields(w, payload, "<listKey>", fields)` so agents can trim
  large responses. Parse the flag value with `gkio.ParseFields`.
- **Non-interactive in JSON mode.** Never prompt under `--output=json`. If a
  required input is missing, fail with a clear expected error and a hint; do not
  block on stdin.
- **Mutations support `--dry-run`.** A command that changes state should accept
  `--dry-run`: validate inputs, then print the intended action via
  `gkio.WriteDryRun(w, config.JSONOutput(), action, request)` and return without
  mutating.
- **Structured input where bodies are long.** For multi-field mutations
  (multiline descriptions, lists) accept `--input-json` (inline or `-` for
  stdin) via `gkio.ReadJSONInput`, so agents avoid shell-quoting. Keep flags as
  the default; JSON input is the opt-in alternative.
- **Value-taking flags go in `BuildFlagSpec`.** Any non-bool flag must be added
  to `cmd/gk/flag_spec.go` or the pre-Cobra sniffer drifts; the drift test fails
  CI otherwise.

Human DX and agent DX are orthogonal: keep the interactive, colored path for
humans and the machine path under `--output=json`.

### Further reading

- Justin Poehnelt, "Rewrite your CLI for AI agents": https://justin.poehnelt.com/posts/rewrite-your-cli-for-ai-agents/
- Command Line Interface Guidelines: https://clig.dev/
- "Writing CLI Tools That AI Agents Actually Want to Use": https://dev.to/uenyioha/writing-cli-tools-that-ai-agents-actually-want-to-use-39no
