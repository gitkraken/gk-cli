# Contributor conventions

## Agent-friendly CLI output

`gk` is driven by AI agents as well as humans. The agent-facing gains erode
unless new commands follow the same rules. Any new **result command** (one that
reports data or the outcome of a mutation) MUST satisfy this checklist. The
published contract for consumers lives in the root `AGENTS.md`.

- **Honor the global `--json`.** Do not add a per-command JSON flag. Read
  `config.JSONOutput()` on `actions.Configuration` (or `config.OutputFormat`).
  `--json` is a persistent root boolean resolved once in `cmd/main.go`;
  `GK_OUTPUT=json|text` sets it session-wide and `--json=false` forces text
  back for a single invocation. `--output` was removed and now errors.
- **One JSON document on stdout.** In JSON mode stdout carries only the data.
  Route every human-facing line (warnings, "no results" notes, progress) to
  `config.Stderr`. Build the payload with `gkio.WriteJSON`; never hand-roll
  `json.Marshal` to stdout.
- **No color outside an interactive terminal.** Color is configured once at
  startup (`tui.ConfigureColor`) and is off whenever stdout is not a TTY,
  `NO_COLOR`/`CI` is set, or output is JSON. Do not emit raw ANSI yourself.
- **Structured errors.** Terminal failures are classified by `errors.Classify`
  and, under JSON, emitted as a single
  `{"error":{code,message,retryable,details?}}` envelope on stderr by
  `cmd/main.go`; stdout stays empty. Subprocess passthroughs are exempt: the
  child owns both streams, so no envelope is emitted — see the exit-codes
  bullet. `details` may carry a rejected preview or
  partial outcome when callers need machine-readable recovery context. Return
  typed CLIErrors (`errors.NewExpectedError` / `NewUnexpectedError`, or the
  network/auth helpers) so the code and retryable flag map correctly. Do not
  print error prose yourself in JSON mode.
- **Semantic exit codes.** `0` success, `1` permanent failure
  (auth/validation/internal), `75` (`EX_TEMPFAIL`) transient/retryable. The
  process exit code equals `errors.Classify(err).ExitCode` and is the same in
  text and JSON mode, so the shell-level retry signal is format-independent.
  On subprocess passthroughs (`gk merge-mate`, a bare `gk <git command>`), when
  the child ran and exited non-zero gk exits with the child's code verbatim and
  emits no message or error envelope of its own, so the code carries the child's
  meaning — including a child code that happens to be `1` or `75`.
  Breaking change: network/timeout failures that previously exited `1` now exit
  `75` in both text and JSON mode. Scripts or wrappers checking `$? == 1` must be
  updated; announce this in the release notes.
  Breaking change: a failing bare `gk <git command>` that previously exited `1`
  now exits with git's own code. Scripts or wrappers checking `$? == 1` must be
  updated; announce this in the release notes.
- **Token discipline on list output.** For commands returning collections,
  support `--fields a,b,c` and project the list with
  `gkio.WriteJSONWithFields(w, payload, "<listKey>", fields)` so agents can trim
  large responses. Parse the flag value with `gkio.ParseFields`, and validate it
  with `gkio.CheckFields(warnOut, fields, jsonOutput, sample)`: it refuses a
  non-empty mask outright when `jsonOutput` is false (text mode never consumes
  the mask, matching each command's own "requires --json" help text),
  and otherwise warns on stderr about names `sample`'s JSON tags don't have —
  or, if every requested name is unknown, refuses with `invalid_request`
  (naming both the rejected and the valid fields) rather than succeeding with
  a list of empty objects. Breaking change: entirely unknown masks that
  previously exited `0` with parseable JSON now exit `1` with empty stdout;
  scripts must use the exact, case-sensitive field names. Announce this in the
  release notes. MCP tools follow the same contract via `checkFields`
  in `internal/mcp/internal/tools/utils.go`, which delegates matching to
  `gkio.UnknownFields` and returns `mcp.NewToolResultError` on the all-unknown
  case instead of a stderr warning (MCP tools have no text/JSON distinction to
  gate on).
- **Non-interactive in JSON mode.** Never prompt under `--json`. If a
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
humans and the machine path under `--json`.

### Further reading

- Justin Poehnelt, "Rewrite your CLI for AI agents": https://justin.poehnelt.com/posts/rewrite-your-cli-for-ai-agents/
- Command Line Interface Guidelines: https://clig.dev/
- "Writing CLI Tools That AI Agents Actually Want to Use": https://dev.to/uenyioha/writing-cli-tools-that-ai-agents-actually-want-to-use-39no
