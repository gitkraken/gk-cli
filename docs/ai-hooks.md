# GitKraken AI hooks

GitKraken CLI hooks connect supported AI coding hosts to GitKraken apps. A host calls `gk ai hook run` with an event payload; GK records session state locally and sends updates to discovered GitKraken app instances. Hook names and payloads are host-specific. The table below compares GK's configured event names; it does not promise identical payloads, timing, or behavior across hosts, and it does not claim which hooks a particular host version emits.

## Supported hosts and installation

GK currently registers nine hook hosts: Claude Code, OpenCode, Cursor, Codex, GitHub Copilot CLI, Antigravity, Pi, Augment, and Grok Build. To see which supported hosts GK detects and whether hooks are installed on this machine, run:

```sh
gk ai hook install --list
```

That command reports this machine's detection and installation state, not a capability inventory for every host. The complete accepted event inventory, default exclusions, OpenCode version notes, and Copilot legacy names are in the [hook event manifest](../internal/actions/aihook/events.json).

Install a host's default event set with `gk ai hook install <host>`. A default install registers every event GK accepts for that host except the events listed in that host's `skippedDefaultEvents` manifest entry. Current exclusions are Claude Code (5), OpenCode (3), Cursor (3), and Pi (12); the other five hosts have none. These events remain available for an explicit selection. Host-version filtering and aliases may affect the installed entries; consult the manifest for those rules. An already recorded install is normally a no-op, so pass `--force` to run installation again. A plain install still repairs some drift, such as adding manifest `backfillEvents` missing from an older install (Claude Code `PostModelSwitch`; Codex `SessionEnd`, `Interrupt`). Installation can retain existing registered events; use `gk ai hook uninstall` to remove ones you no longer want. Because the installed event set is stored in each host's local configuration, it can differ by machine and user.

Use repeated `--event` flags for non-blocking events, or `--blocking-event` to request a decision response before returning to the host. The response only affects hosts that consume GK's decision output; OpenCode and Pi are installed as generated JS plugin/extension files that reject `--blocking-event` outright, so installation errors rather than silently ignoring it. Once either selection flag is supplied, the command adds only the selected events rather than the default set; previously registered events may remain. For example:

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
| Cursor | `beforeTabFileRead`, `afterTabFileEdit`, `workspaceOpen` |
| Pi | `resources_discover`, `message_start`, `message_update`, `message_end`, `tool_execution_start`, `tool_execution_update`, `tool_execution_end`, `context`, `before_provider_headers`, `before_provider_request`, `after_provider_response`, `input` |

Claude Code, OpenCode, Cursor, and Pi are the only hosts with default exclusions. See the [manifest](../internal/actions/aihook/events.json) for the current source list.

## Event names by host

Names below are exact spellings from the manifest. A dash means GK has no event it documents in that comparison category for that host. Similar event names can carry different data or have different effects. The complete lists are linked above; the default-skipped count in the final column refers to the manifest's exact exclusion list.

| Host | Session start | Session end | Prompt submission | Tool activity | Permission or wait | Subagent activity | Main caveat | Default-skipped events |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Claude Code | `SessionStart` | `SessionEnd` | `UserPromptSubmit` | `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PostToolBatch` | `PermissionRequest`, `PermissionDenied`, `Elicitation`, `ElicitationResult`, `Notification`* | `SubagentStart`, `SubagentStop` | `Notification` turn state depends on its type. | 5 |
| OpenCode | `session.created` | `session.deleted` | — | `tool.execute.before`, `tool.execute.after` | `permission.asked`, `permission.updated`, `permission.replied` | — | No blocking hooks; v1-only names and v2 aliases are listed in the manifest. | 3 |
| Cursor | `sessionStart` | `sessionEnd` | `beforeSubmitPrompt` | `preToolUse`, `postToolUse`, `postToolUseFailure`, `beforeShellExecution`, `afterShellExecution`, `beforeMCPExecution`, `afterMCPExecution`, `beforeReadFile`, `afterFileEdit` | — | `subagentStart`, `subagentStop` | Uses lower-camel event names. | 3 |
| Codex | `SessionStart` | `SessionEnd` | `UserPromptSubmit` | `PreToolUse`, `PostToolUse` | `PermissionRequest` | `SubagentStart`, `SubagentStop` | Older installs can be repaired with `SessionEnd` and `Interrupt` backfills. | 0 |
| GitHub Copilot CLI | `SessionStart` | `SessionEnd` | `UserPromptSubmit` | `PreToolUse`, `PostToolUse`, `PostToolUseFailure` | `PermissionRequest`, `Notification`* | `SubagentStop` | Older camel-case names are retained as legacy cleanup names. | 0 |
| Antigravity | — | `Stop` | — | `PreToolUse`, `PostToolUse` | — | — | No configured session-start event; `Stop` is the configured end event. | 0 |
| Pi | `session_start` | `session_shutdown` | — | `tool_call`, `tool_result`, `tool_execution_start`, `tool_execution_update`, `tool_execution_end` | — | — | No blocking decision API. | 12 |
| Augment | `SessionStart` | `SessionEnd` | `PromptSubmit` | `PreToolUse`, `PostToolUse` | `Notification`* | — | Uses `conversation_id` and `workspace_roots` input fields. | 0 |
| Grok Build | `SessionStart` | `SessionEnd` | `UserPromptSubmit` | `PreToolUse`, `PostToolUse`, `PostToolUseFailure` | `PermissionDenied`, `Notification`* | `SubagentStart`, `SubagentStop` | Camel-case payload fields are normalized by GK. | 0 |

\* For any host that sends `Notification` (Claude Code, Copilot, Augment, Grok Build), it only changes derived turn state for recognized notification types. For example, a permission prompt can mark a turn as waiting; other notification types may leave the turn unchanged. See [`turn.go`](../internal/actions/aihook/turn.go) for the current mapping.

Claude Code's `SessionStart`, OpenCode's `session.created`, and Pi's `session_start` are GK's configured session-start names for those hosts. Antigravity has no configured session-start event; its `Stop` event is configured as the session-end event. GK also uses each host's own spellings rather than translating names between hosts.

OpenCode's manifest marks `session.updated` and `session.error` as v1-only names. For v2, the manifest maps `session.status` to the prior `session.updated` selection, and `session.execution.failed` to `session.error`; the aliases preserve an existing selection without asserting that the old name fires on v2. GitHub Copilot CLI also has a `legacyEvents` list of older camel-case names that GK removes during installation. Those names are not current accepted events. Consult the manifest for the precise lists and aliases.

### Code glossary for the table

The table headings group related host events. These are the manifest fields and code paths that give each group meaning in GK:

| Table heading | Code to look for | What it controls |
| --- | --- | --- |
| Host | [`clientRegistry`](../internal/actions/aihook/registry.go), [`events.json`](../internal/actions/aihook/events.json) | Registered hosts and their accepted event names. |
| Session start | `sessionStartEvent` in [`events.json`](../internal/actions/aihook/events.json), [`isSessionStartEvent`](../internal/actions/aihook/runner.go) | Identifies a host's session-start event, including when an ended session can be revived. |
| Session end | `sessionEndEvent` in [`events.json`](../internal/actions/aihook/events.json), [`isSessionEndEvent`](../internal/actions/aihook/runner.go) | Identifies the event that ends a session; `Stop` has this meaning for Antigravity only. |
| Prompt submission | `promptSubmitEvent` in [`events.json`](../internal/actions/aihook/events.json), [`defaultPromptSubmitEvent` and `promptSubmitEventFor`](../internal/actions/aihook/registry.go), [`buildAndPersistSessionState`](../internal/actions/aihook/runner.go) | `UserPromptSubmit` is the fallback name; Augment sets `PromptSubmit`. GK updates saved `prompt` and `firstPrompt` only when the selected event carries a non-empty prompt. Cursor's `beforeSubmitPrompt` is shown as a related event, but it does not update those saved fields. |
| Tool activity | Host `events` in [`events.json`](../internal/actions/aihook/events.json), [`buildAndPersistSessionState` and `extractFilePath`](../internal/actions/aihook/runner.go) | Accepted tool events; file activity is accumulated only from recognized write tools on `PostToolUse`. |
| Permission or wait | Host `events` in [`events.json`](../internal/actions/aihook/events.json), [`turnTables` and `notificationTurns`](../internal/actions/aihook/turn.go) | Related permission events; only mapped events or notification types change the derived `turn` to `blocked`. |
| Subagent activity | Host `events` in [`events.json`](../internal/actions/aihook/events.json), [`buildAndPersistSessionState`](../internal/actions/aihook/runner.go) | Accepted subagent events; the saved roster is currently updated by the PascalCase `SubagentStart` and `SubagentStop` cases. |
| Default-skipped events | `skippedDefaultEvents` in [`events.json`](../internal/actions/aihook/events.json), [`defaultInstallEvents`](../internal/actions/aihook/hook.go) | Events omitted when installing without an explicit event selection. |

## What GK records

GK processes events it accepts only when the payload includes a working directory. Malformed, oversized, incomplete, or unrecognized input can be skipped. Host-specific normalizers adapt some Copilot, Augment, and Grok fields into GK's common input shape; see [`runner.go`](../internal/actions/aihook/runner.go) and the host normalizers [Copilot](../internal/actions/aihook/hook_copilot.go), [Augment](../internal/actions/aihook/hook_augment.go), and [Grok Build](../internal/actions/aihook/hook_grok.go).

The saved session record combines these kinds of data:

- **Latest event and input:** the accepted event name, session and working-directory identifiers, host/provider and available tool, agent, source, model, permission, effort, reason, and notification values. `hookInput` retains the latest raw host payload for non-terminal events, including fields GK does not otherwise interpret. Terminal session records clear `hookInput`.
- **Derived or accumulated state:** turn state (`busy`, `idle`, or `blocked`) is updated only for events in GK's per-host tables, plus recognized `Notification` types and a subagent-stop rule that keeps an already-busy parent busy; other events leave it unchanged. A Claude Code `SessionStart` whose `source` is `compact` also leaves it unchanged, since a context compaction happens mid-turn and is not a new session. Prompt fields update only for a host's configured prompt-submit event and when a non-empty prompt is present. File activity is derived from recognized write-type tool events; the subagent roster is updated from recognized start/stop events. Working-directory visits and worktree paths are accumulated from observed directory changes. These fields depend on what the host sends and which events are installed.
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

## Finding more hook capabilities

When looking for a new signal or piece of session data, check these sources in order:

1. **Events already installed by default:** compare the host's `events` and `skippedDefaultEvents` lists in the [manifest](../internal/actions/aihook/events.json). A default event may already provide the signal.
2. **Events omitted by default:** review the [lists above](#events-omitted-by-default). GK accepts these events, but you must select them explicitly to install them on a fresh setup. Evaluate their payloads and frequency before adding them to the default set.
3. **Fields on accepted events:** inspect [`HookInput` and the saved `hookInput`](../internal/actions/aihook/runner.go), plus the host normalizers and relay templates linked below. GK may receive a field without projecting it into a named session field; using it for a new derived capability requires code changes.

For events absent from the manifest, check the host's current official hook documentation and payload examples for the relevant version. The manifest describes what GK currently accepts, not every hook the host may offer.

## Maintaining this page

The [event manifest](../internal/actions/aihook/events.json) is the canonical list of accepted event names, default exclusions, legacy names, version aliases, and selected installation metadata. [`registry.go`](../internal/actions/aihook/registry.go) defines the supported hosts. Host normalizers and relay templates such as [Copilot](../internal/actions/aihook/hook_copilot.go), [Augment](../internal/actions/aihook/hook_augment.go), [Grok Build](../internal/actions/aihook/hook_grok.go), [Pi](../internal/actions/aihook/hook_pi.js.tmpl), and [OpenCode](../internal/actions/aihook/hook_opencode.js.tmpl) define how incoming payloads are adapted or dispatched. [`runner.go`](../internal/actions/aihook/runner.go) defines persisted session fields and session processing; [`store.go`](../internal/actions/aihook/store.go) defines session persistence, including the store/file-mirror relationship; [`turn.go`](../internal/actions/aihook/turn.go) defines derived turn states. Update this page from those sources when the implementation changes. Manifest entries document GK's accepted/configured set, not a guarantee about what a host release emits.
