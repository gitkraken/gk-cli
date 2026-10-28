# GitKraken AI hooks

GitKraken CLI hooks connect supported AI coding hosts to GitKraken apps. A host calls `gk ai hook run` with an event payload; GK records session state locally and sends updates to discovered GitKraken app instances. Hook names and payloads are host-specific. The table below compares GK's configured event names; it does not promise identical payloads, timing, or behavior across hosts, and it does not claim which hooks a particular host version emits.

## Supported hosts and installation

GK currently registers nine hook hosts: Claude Code, OpenCode, Cursor, Codex, GitHub Copilot CLI, Antigravity, Pi, Augment, and Grok Build. To see which supported hosts GK detects and whether hooks are installed on this machine, run:

```sh
gk ai hook install --list
```

That command reports this machine's detection and installation state, not a capability inventory for every host. The complete accepted event inventory, default exclusions, OpenCode version notes, and Copilot legacy names are in the [hook event manifest](../internal/actions/aihook/events.json).

Install a host's default event set with `gk ai hook install <host>`. A default install registers every event GK accepts for that host except the events listed in that host's `skippedDefaultEvents` manifest entry. Current exclusions are Claude Code (5), OpenCode (3), Cursor (4), and Pi (15); the other five hosts have none. These events remain available for an explicit selection. Host-version filtering and aliases may affect the installed entries; consult the manifest for those rules. An already recorded install is normally a no-op, so pass `--force` to run installation again. A plain install still repairs some drift, such as adding manifest `backfillEvents` missing from an older install (Claude Code `PostModelSwitch`; Codex `SessionEnd`, `Interrupt`; Antigravity `SessionStart`), rewriting older Antigravity entries that do not name their event, or, for Cursor, removing a registered `afterAgentThought` and downgrading blocking entries to non-blocking. Installation can retain existing registered events; use `gk ai hook uninstall` to remove ones you no longer want. Because the installed event set is stored in each host's local configuration, it can differ by machine and user.

Use repeated `--event` flags for non-blocking events, or `--blocking-event` to request a decision response before returning to the host. The response only affects hosts that consume GK's decision output; OpenCode and Pi are installed as generated JS plugin/extension files whose relay is one-way (fire-and-forget), and Cursor ignores GK's decision output, so all three reject `--blocking-event` outright and installation errors rather than silently ignoring it. Once either selection flag is supplied, the command adds only the selected events rather than the default set; previously registered events may remain. For example:

```sh
gk ai hook install claude-code --event SessionStart --blocking-event PermissionRequest
gk ai hook install opencode --event tool.execute.before --event tool.execute.after
```

### Events omitted by default

`skippedDefaultEvents` are valid events in GK's manifest, but `gk ai hook install <host>` omits them when no event flags are given. They are not disabled globally: you can request one with `--event`, or with `--blocking-event` where the host supports blocking hooks. An explicit selection does not add the default set, so name any other new events you want. The manifest defines the exclusion list, not a shared reason why each event is excluded.

| Host | Events omitted by a default install |
| --- | --- |
| Claude Code | `Setup`, `MessageDisplay`, `FileChanged`, `WorktreeCreate`, `WorktreeRemove` |
| OpenCode | `message.updated`, `message.part.updated`, `installation.updated` |
| Cursor | `afterAgentThought`, `beforeTabFileRead`, `afterTabFileEdit`, `workspaceOpen` |
| Pi | `resources_discover`, `message_start`, `message_update`, `message_end`, `tool_execution_start`, `tool_execution_update`, `tool_execution_end`, `context`, `before_provider_headers`, `before_provider_request`, `after_provider_response`, `input`, `cache_warming_decision`, `context_with_system`, `provider_stream_event` |

Claude Code, OpenCode, Cursor, and Pi are the only hosts with default exclusions. See the [manifest](../internal/actions/aihook/events.json) for the current source list.

Cursor notes, verified against the cursor-agent CLI 2026.10.01 (the IDE and earlier versions are unverified):

- `afterAgentThought` is excluded by default because any hook on it breaks the agent turn. A plain `gk ai hook install cursor` repairs older installs: it removes GK's `afterAgentThought` entry and rewrites GK's blocking entries as non-blocking ones, leaving every other entry untouched. Targeted installs do not repair, so an explicit `--event afterAgentThought` stays until the next plain install removes it. You can also remove it manually with `gk ai hook uninstall cursor --event afterAgentThought`.
- A single unknown event name in `hooks.json` makes Cursor disable every hook in that file.
- In `-p` print mode, `beforeSubmitPrompt`, `stop`, and `afterAgentResponse` do not fire.
- Blocking hooks are not supported: Cursor ignores GK's `decision` output, so `--blocking-event` is rejected for Cursor (tracked in #1803).

## Event names by host

Names below are exact spellings from the manifest. A dash means GK has no event it documents in that comparison category for that host. Similar event names can carry different data or have different effects. The complete lists are linked above; the default-skipped count in the final column refers to the manifest's exact exclusion list.

| Host | Session start | Session end | Prompt submission | Tool activity | Permission or wait | Subagent activity | Main caveat | Default-skipped events |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Claude Code | `SessionStart` | `SessionEnd` | `UserPromptSubmit` | `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PostToolBatch` | `PermissionRequest`, `PermissionDenied`, `Elicitation`, `ElicitationResult`, `Notification`* | `SubagentStart`, `SubagentStop` | `Notification` turn state depends on its type. | 5 |
| OpenCode | `session.created` | `session.deleted` | — | `tool.execute.before`, `tool.execute.after` | `permission.asked`, `permission.updated` (v1-only), `permission.replied` | — | OpenCode itself exposes permission decisions (v1 `permission.ask`, v2 `permission.hook` `evaluate`), but GK's generated plugin is fire-and-forget, so there are no blocking hooks yet. v1-only names and v2 aliases are listed in the manifest. | 3 |
| Cursor | `sessionStart` | `sessionEnd` | `beforeSubmitPrompt` | `preToolUse`, `postToolUse`, `postToolUseFailure`, `beforeShellExecution`, `afterShellExecution`, `beforeMCPExecution`, `afterMCPExecution`, `beforeReadFile`, `afterFileEdit` | — | `subagentStart`, `subagentStop` | Uses lower-camel event names; falls back to `conversation_id` and `workspace_roots` when `session_id` or `cwd` is absent. No blocking hooks. | 4 |
| Codex | `SessionStart` | `SessionEnd` | `UserPromptSubmit` | `PreToolUse`, `PostToolUse` | `PermissionRequest` | `SubagentStart`, `SubagentStop` | Older installs can be repaired with `SessionEnd` and `Interrupt` backfills. | 0 |
| GitHub Copilot CLI | `SessionStart` | `SessionEnd` | `UserPromptSubmit` | `PreToolUse`, `PostToolUse`, `PostToolUseFailure` | `PermissionRequest`, `Notification`* | `SubagentStop` | Older camel-case names are retained as legacy cleanup names. | 0 |
| Antigravity | `SessionStart` | — | — | `PreToolUse`, `PostToolUse` | — | — | The payload names no event, so each entry passes `--event`; `Stop` ends a turn, not the session (busy if `fullyIdle` is false). | 0 |
| Pi | `session_start` | `session_shutdown` | — | `tool_call`, `tool_result`, `tool_execution_start`, `tool_execution_update`, `tool_execution_end` | — | — | Pi's in-process handlers can return decisions (for example `tool_call` returns `{block, reason}`), but GK does not wire them yet. | 15 |
| Augment | `SessionStart` | `SessionEnd` | `PromptSubmit` | `PreToolUse`, `PostToolUse` | `Notification`* | — | Uses `conversation_id` and `workspace_roots` input fields. `Notification` never changes turn state, so Augment has no `blocked` turn. User-level install only. | 0 |
| Grok Build | `SessionStart` | `SessionEnd` | `UserPromptSubmit` | `PreToolUse`, `PostToolUse`, `PostToolUseFailure` | `PermissionDenied`, `Notification`* | `SubagentStart`, `SubagentStop` | Camel-case payload fields are normalized by GK. Grok's `allow_managed_hooks_only` policy skips hooks in `~/.grok/hooks`, including GK-installed hooks ([Grok Build guide](https://github.com/xai-org/grok-build/blob/main/crates/codegen/xai-grok-pager/docs/user-guide/10-hooks.md#allow-only-managed-hooks)). | 0 |

\* For any host that sends `Notification` (Claude Code, Copilot, Augment, Grok Build), it only changes derived turn state for recognized notification types. For example, a permission prompt can mark a turn as waiting; other notification types may leave the turn unchanged. See [`turn.go`](../internal/actions/aihook/turn.go) for the current mapping. Augment's notification types (`info` in 0.36-0.37; `info`/`warning`/`error`/`vfs_sync_error` in 1.x prereleases) are relayed but none changes turn state.

Claude Code's `SessionStart`, OpenCode's `session.created`, and Pi's `session_start` are GK's configured session-start names for those hosts. Antigravity has no session-end event: its `Stop` fires at the end of every turn, so GK ends an Antigravity session when its cleanup finds the `agy` process gone. A conversation left behind in a process that keeps running (the Antigravity IDE, or `/resume` in `agy`) stays active, with an idle turn, until that process exits. GK also uses each host's own spellings rather than translating names between hosts. Per [Antigravity's hooks documentation](https://antigravity.google/docs/hooks), `PreInvocation` and `PostInvocation` bracket each model call, while `PreToolUse` and `PostToolUse` bracket each tool execution.

OpenCode ships as two package lines: v1 (`opencode-ai`) and v2 (`@opencode/cli`). The manifest's `v1OnlyEvents` are names observed on v1 that v2 never emitted in a live capture (#1813), so the generated plugin drops them if they ever appear on the v2 bus: `session.updated`, `session.error`, `session.idle`, `session.diff`, `file.edited`, and `permission.updated`. v2 reports a renamed session as `session.renamed` and has no equivalent of `session.updated`, so a selection naming only `session.updated` receives nothing on v2; `session.status` is a different event and does not stand in for it. v2 also did not emit `session.status` in that capture, so it fires only on v1. The one v2 alias is `session.execution.failed`, which preserves an existing `session.error` selection. `permission.asked` is emitted by both lines, and v2 reports compaction as `session.compaction.started` and `session.compaction.ended`; `session.compacted` is still forwarded if v2 emits it. `--blocking-event` stays rejected for OpenCode because the plugin does not relay a decision back to the host. GitHub Copilot CLI also has a `legacyEvents` list of older camel-case names that GK removes during installation. Copilot still fires those names, but most of their payloads name no event (see `TestRun_CopilotLegacyCamelCaseKeyStaysDead`), so the relay cannot resolve them; GK installs the PascalCase keys and removes its own camel-case entries to avoid unresolvable entries and double firing. Copilot's `subagentStart` payload (CLI 1.0.97) is likewise anonymous (`agentName`, `sessionId`, `transcriptPath`, no event name), and the relay passes no per-event argument, so GK does not install it and does not track Copilot subagent starts. `userPromptTransformed` is not installed either: it can only rewrite the prompt, which GK does not do. `PermissionRequest` still names its event in `hookName` rather than `hook_event_name`, so GK keeps a `hookName` fallback for it. Copilot's `PostToolUse` carries `tool_result` (`resultType`, `textResultForLlm`), `SessionStart` carries `initial_prompt`, and the latest raw payload is kept for non-terminal events, so these fields are visible to consumers without new session fields. Consult the manifest for the precise lists and aliases.

### Antigravity notes

- Headless `agy -p`: an `allow` decision delegates to the default policy and does not grant permission, so the tool is auto-denied and no further hook events (including `Stop`) fire for that turn; `auto_approve` is the decision that grants it.
- `Stop` with `fullyIdle: false` keeps the turn busy, since a background task is still running.
- Verified with the agy CLI on macOS; the Antigravity IDE and Windows are not yet verified.

### Code glossary for the table

The table headings group related host events. These are the manifest fields and code paths that give each group meaning in GK:

| Table heading | Code to look for | What it controls |
| --- | --- | --- |
| Host | [`clientRegistry`](../internal/actions/aihook/registry.go), [`events.json`](../internal/actions/aihook/events.json) | Registered hosts and their accepted event names. |
| Session start | `sessionStartEvent` in [`events.json`](../internal/actions/aihook/events.json), [`isSessionStartEvent`](../internal/actions/aihook/runner.go) | Identifies a host's session-start event, including when an ended session can be revived. |
| Session end | `sessionEndEvent` in [`events.json`](../internal/actions/aihook/events.json), [`isSessionEndEvent`](../internal/actions/aihook/runner.go) | Identifies the event that ends a session. Antigravity declares none, so its sessions end through the liveness cleanup; `Stop` ends a turn only. |
| Prompt submission | `promptSubmitEvent` in [`events.json`](../internal/actions/aihook/events.json), [`defaultPromptSubmitEvent` and `promptSubmitEventFor`](../internal/actions/aihook/registry.go), [`buildAndPersistSessionState`](../internal/actions/aihook/runner.go) | `UserPromptSubmit` is the fallback name; Augment sets `PromptSubmit` and Cursor sets `beforeSubmitPrompt`. GK updates saved `prompt` and `firstPrompt` only when the selected event carries a non-empty prompt. |
| Tool activity | Host `events` in [`events.json`](../internal/actions/aihook/events.json), [`buildAndPersistSessionState` and `extractFilePath`](../internal/actions/aihook/runner.go) | Accepted tool events; file activity is accumulated only from recognized write tools on `PostToolUse`. |
| Permission or wait | Host `events` in [`events.json`](../internal/actions/aihook/events.json), [`turnTables` and `notificationTurns`](../internal/actions/aihook/turn.go) | Related permission events; only mapped events or notification types change the derived `turn` to `blocked`. |
| Subagent activity | Host `events` in [`events.json`](../internal/actions/aihook/events.json), [`buildAndPersistSessionState`](../internal/actions/aihook/runner.go) | Accepted subagent events; the saved roster is currently updated by the PascalCase `SubagentStart` and `SubagentStop` cases. |
| Default-skipped events | `skippedDefaultEvents` in [`events.json`](../internal/actions/aihook/events.json), [`defaultInstallEvents`](../internal/actions/aihook/hook.go) | Events omitted when installing without an explicit event selection. |

## What GK records

GK processes events it accepts only when the payload includes a working directory. Malformed, oversized, incomplete, or unrecognized input can be skipped. Host-specific normalizers adapt some Copilot, Augment, Grok, and Antigravity fields into GK's common input shape; see [`runner.go`](../internal/actions/aihook/runner.go) and the host normalizers [Copilot](../internal/actions/aihook/hook_copilot.go), [Augment](../internal/actions/aihook/hook_augment.go), [Grok Build](../internal/actions/aihook/hook_grok.go), and [Antigravity](../internal/actions/aihook/hook_antigravity.go). Antigravity's payload does not say which event fired, so each entry GK installs passes it as `gk ai hook run --host antigravity --event <name>`; a payload's own `hook_event_name` wins when present.

The saved session record combines these kinds of data:

- **Latest event and input:** the accepted event name, session and working-directory identifiers, host/provider and available tool, agent, source, model, permission, effort, reason, and notification values. `transcriptPath` keeps the last transcript path the host sent (Claude Code's `transcript_path`, Antigravity's `transcriptPath`). `hookInput` retains the latest raw host payload for non-terminal events, including fields GK does not otherwise interpret. Terminal session records clear `hookInput`.
- **Derived or accumulated state:** turn state (`busy`, `idle`, or `blocked`) is updated only for events in GK's per-host tables, plus recognized `Notification` types and a subagent-stop rule that keeps an already-busy parent busy; other events leave it unchanged. A Claude Code `SessionStart` whose `source` is `compact` also leaves it unchanged, since a context compaction happens mid-turn and is not a new session. Prompt fields update only for a host's configured prompt-submit event and when a non-empty prompt is present. File activity is derived from recognized write-type tool events; the subagent roster is updated from recognized start/stop events. Working-directory visits and worktree paths are accumulated from observed directory changes. These fields depend on what the host sends and which events are installed.
- **Event order for OpenCode and Pi:** their generated plugin starts a separate gk run for each event without waiting, so runs can finish out of order. The plugin stamps each event with `relay_instance` (one per plugin load) and `relay_seq` (counting from 1). GK drops an event older than the last one it recorded from the same instance, so the event is neither saved nor broadcast. The record keeps the stamp of the last applied event as `relayInstance` and `relaySeq`. An event from a different instance, such as after a reload, is always applied.
- **Delivery to GitKraken apps:** after persistence, GK broadcasts session revisions to GitKraken app instances it discovers for the event's working directory. A supported or installed hook does not guarantee an app is currently discovered or that every optional field will be present.

Prompt, model, tool, and other host-specific fields may be absent. Since `hookInput` stores the latest raw payload, it may contain sensitive prompt text, tool arguments, file paths, or other host data. Treat session records and command output as sensitive. Event selection limits what GK can observe, and GK does not promise field-by-field redaction of raw host input.

To inspect records, list active sessions or include ended/archived records, then fetch one by its session ID:

```sh
gk ai hook list-sessions
gk ai hook list-sessions --all
gk ai hook get-session <session-id>
```

GK's local cache database is the authoritative session store. JSON files under the OS user cache directory followed by `GitKrakenCLI/sessions` (falling back to the OS temporary directory if GK cannot determine a user cache directory) are a compatibility mirror for older gk binaries, and the fallback read/write path when the store is unavailable, so they can lag the store. Ended records are placed under `sessions/ended` and are normally purged after 30 days; archived records are exempt from that retention cleanup. These paths are implementation details and vary by operating system. Use the commands above as the stable inspection interface.

Illustrative excerpt (field presence varies by host and observed events):

```json
{
  "sessionId": "example-session",
  "providerId": "claude-code",
  "event": "PostToolUse",
  "cwd": "/work/project",
  "model": "example-model",
  "turn": { "state": "busy", "since": "2026-01-01T12:00:00Z" },
  "fileActivity": { "/work/project/main.go": { "count": 1 } },
  "hookInput": {
    "hook_event_name": "PostToolUse",
    "tool_name": "Write",
    "tool_input": { "file_path": "/work/project/main.go" }
  }
}
```

The excerpt illustrates field names and is not a guarantee that every host supplies those exact payload fields. GK normalizes selected inputs; it does not rewrite the raw `hookInput` map into the example's spelling.

## Codex notes

Verified against Codex CLI 0.146.0 ([hooks docs](https://developers.openai.com/codex/hooks), `rust-v0.146.0` hook schemas).

- **Trust.** Codex skips every hook until it is trusted, and trusts each hook by its own hash, so every gk hook needs review after an install and again after the entry changes (for example when its `timeout` is added). Open `/hooks` in Codex and press `t` to trust all. Trust is stored per hook in `~/.codex/config.toml` under `[hooks.state]`; gk never writes it. Untrusted hooks do not run at all, including under `codex exec`, with no warning. Automation that already vets its hook sources can pass `--dangerously-bypass-hook-trust`.
- **Forked threads.** Codex's `SessionStart.source` is `startup`, `resume`, `clear` or `compact`; there is no `fork`. A forked thread reports `startup` and gets its own session id in the same Codex process, while the parent session stays active until the process exits. gk does not treat `fork` as a rotation source.
- **SessionEnd timeout.** Codex gives `SessionEnd` a 1 second budget by default (3 seconds at most) and kills the hook after it. gk writes `"timeout": 3` on its non-blocking `SessionEnd` entry so a slow peer broadcast, which can wait up to 1 second, still finishes. A plain `gk ai hook install codex` rewrites an older entry; the changed hook then needs trusting again. Blocking entries keep their own 24 hour `timeout`.
- **Blocking decisions.** For `PermissionRequest`, gk prints the GitKraken client's response body verbatim. Codex expects `{"hookSpecificOutput":{"hookEventName":"PermissionRequest","decision":{"behavior":"allow"}}}` (or `"deny"` with a `message`), so the client must answer in that shape; gk does not translate. With no answer, gk prints nothing and Codex shows its normal approval prompt.
- **Not used.** `commandWindows` (a Windows-only command override) and `additionalContextLimit` (the size at which Codex previews injected `additionalContext`) give gk no benefit today.

## Finding more hook capabilities

When looking for a new signal or piece of session data, check these sources in order:

1. **Events already installed by default:** compare the host's `events` and `skippedDefaultEvents` lists in the [manifest](../internal/actions/aihook/events.json). A default event may already provide the signal.
2. **Events omitted by default:** review the [lists above](#events-omitted-by-default). GK accepts these events, but you must select them explicitly to install them on a fresh setup. Evaluate their payloads and frequency before adding them to the default set.
3. **Fields on accepted events:** inspect [`HookInput` and the saved `hookInput`](../internal/actions/aihook/runner.go), plus the host normalizers and relay templates linked below. GK may receive a field without projecting it into a named session field; using it for a new derived capability requires code changes.

For events absent from the manifest, check the host's current official hook documentation and payload examples for the relevant version. The manifest describes what GK currently accepts, not every hook the host may offer.

## Maintaining this page

The [event manifest](../internal/actions/aihook/events.json) is the canonical list of accepted event names, default exclusions, legacy names, version aliases, and selected installation metadata. [`registry.go`](../internal/actions/aihook/registry.go) defines the supported hosts. Host normalizers and relay templates such as [Copilot](../internal/actions/aihook/hook_copilot.go), [Augment](../internal/actions/aihook/hook_augment.go), [Grok Build](../internal/actions/aihook/hook_grok.go), [Pi](../internal/actions/aihook/hook_pi.js.tmpl), and [OpenCode](../internal/actions/aihook/hook_opencode.js.tmpl) define how incoming payloads are adapted or dispatched. [`runner.go`](../internal/actions/aihook/runner.go) defines persisted session fields and session processing; [`store.go`](../internal/actions/aihook/store.go) defines session persistence, including the store/file-mirror relationship; [`turn.go`](../internal/actions/aihook/turn.go) defines derived turn states. Update this page from those sources when the implementation changes. Manifest entries document GK's accepted/configured set, not a guarantee about what a host release emits. The canonical Pi event source is the `@earendil-works/pi-coding-agent` package (see Pi's `docs/extensions.md`, which replaced `docs/hooks.md`); `make check-pi-events` compares `events.json` against a published release.
