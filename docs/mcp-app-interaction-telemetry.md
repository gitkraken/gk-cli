# MCP App Interaction Telemetry

Reference for every interaction event emitted by the MCP embedded UI apps (Git
Status, Git Graph, Git Resolve, Commit Composer, Launchpad), the user flows that
trigger them, and the remaining intentional telemetry limits.

> Source of truth:
> - UI schemas / field whitelisting: [`git_app_telemetry.js`](../internal/mcp/internal/ui/src/git_app_telemetry.js)
> - Server sanitizers / derived events: [`app_telemetry.go`](../internal/mcp/internal/tools/app_telemetry.go)
> - Emit plumbing: [`git_overview_actions.ts`](../internal/mcp/internal/ui/src/git_overview_actions.ts) (`trackAppInteraction`, `executeAppToolBoxAction`)
> - Lifecycle beacons: [`lifecycle_telemetry.ts`](../internal/mcp/internal/ui/src/lifecycle_telemetry.ts)
> - Cross-view / gate emits: [`git_overview.tsx`](../internal/mcp/internal/ui/src/git_overview.tsx)
> - Launchpad view emits: [`launchpad.tsx`](../internal/mcp/internal/ui/src/launchpad.tsx)

---

## 0. Registering a new app

**This app list is expected to keep growing.** Whenever a new tool, UI, or MCP
app is added, it MUST be registered for telemetry — there is no implicit
coverage. Concretely, adding an app means:

1. Add its identifier to `knownAppNames` in
   [`app_telemetry.go`](../internal/mcp/internal/tools/app_telemetry.go) and give
   it a `case` in `sanitizeAppInteractionTelemetryData`. Without both, the
   backend rejects the app's interaction and feedback telemetry at the tool
   boundary.
2. Resolve it in `resolveOverviewApp`
   ([`git_overview_app_metadata.js`](../internal/mcp/internal/ui/src/git_overview_app_metadata.js))
   so the shell can attribute lifecycle and interaction events to it.
3. Add a catalog section and coverage-table row to this document.

Adding the name to `knownAppNames` also auto-enrolls the app in
`TestAppToolBoxHandlerRoundTripsAppFeedbackForEveryKnownApp`, so a missing
feedback sanitizer case fails the build.

---

## 1. How an event is emitted

Explicit UI interactions are sent to the host via the `app_tool_box` server tool
with `action: 'interaction_telemetry'` and the payload:

```jsonc
{
  "app_name":    "git_status | git_graph | git_resolve | git_commit_composer | launchpad",
  "interaction": "<action name>",   // e.g. "compose_prepare_start", "switch_to_graph"
  "data":        "<JSON string>",   // whitelisted fields only (see below)
  "directory":   "<repo path>"      // omitted for lifecycle beacons
}
```

Four emit paths:

| Path | Function | File | Notes |
|------|----------|------|-------|
| Explicit per-view interactions | `trackAppInteraction()` → `trackInteraction()` wrapper in each view | `git_overview_actions.ts` | Requires `hostApp`, `appName`, and `buildData`. If `directory` is not resolved yet, queues up to 20 interactions per app and flushes entries younger than 30 seconds once that app resolves a directory. |
| Lifecycle beacons | `fireAppLoaded()` / `fireRenderError()` → `sendLifecycleBeacon()` | `lifecycle_telemetry.ts` | Intentionally omit `directory` so the beacon lands even before a repo is resolved. `app_loaded` fires once per session (guarded). |
| Server-derived interactions | `maybeFireDerivedAppToolBoxTelemetry()` | `app_telemetry.go:219` | Fires before selected `app_tool_box` handlers when the UI includes the `__gk_mcp_app` source envelope. Covers Status/Graph git actions and Status file-open actions without explicit `trackInteraction()` calls. |
| Server-side feedback submit | `appToolBoxHandleAppFeedback()` | `app_git_overview.go` | `app_feedback` records the submitted feedback and emits `feedback` with sanitized `sentiment`, `has_comment`, and bounded `comment`. |

### Field whitelisting (`data`)

Explicit UI telemetry uses a client-side **schema** — an array of field appenders
in `git_app_telemetry.js`. Anything not in the schema is **dropped before send**,
even if the call site passes it. The server then sanitizes the payload again in
`app_telemetry.go` before writing the `mcp_app_interaction` span. Schemas:

| Schema | Fields kept | Applied to |
|--------|-------------|-----------|
| `withHostAndToolName` | `host`, `tool_name` (enum: `app_tool_box`) | load/refresh/git actions |
| `withHostOnly` | `host` | most navigation/toggle actions |
| `withFeedbackSentiment` | `host`, `sentiment` (`positive`\|`negative`) | `feedback_start` |
| `withFeedbackDismiss` | `host`, `sentiment` (`positive`\|`negative`) | `feedback_dismiss` |
| `withGateVariant` | `host`, `variant` | gate events |
| `withAIModelSelection` | `host`, `feature` (`compose`\|`resolve`\|`commit`), `model_id` | `ai_model_set` |
| `withGitActionOutcome` | `host`, `tool_name`, `outcome`, `duration_ms`, `error_code` | Status/Graph git action result events |
| `withAIOutcome` | `host`, `outcome`, `duration_ms`, `error_code` | Resolve/Composer AI error events |
| `commit` (status only) | `host`, `mode` (`quick_commit`\|`inline_commit`), `staged_count`, `changed_file_count` | `commit` |
| Resolve counters | `host`, `conflict_count`, `result_count`, `applied_count`, `remaining_count`, `attempt`, `duration_ms` as applicable | Resolve prepare/apply/retry events |
| Composer counters | `host`, `selected_file_count`, `result_count`, `applied_count`, `remaining_count`, `duration_ms` as applicable | Composer compose/ready/apply events |

Validation rules (silent drop on failure): `host`/identifiers must match
`^[a-z0-9][a-z0-9._-]{0,63}$`; `model_id` allows `:` and up to 127 chars; counts
and `duration_ms` must be non-negative integers; `outcome` must be `success` or
`error`; `error_code` lands only on error outcomes and is normalized (`-32000` →
`jsonrpc_neg_32000`, `TypeError` → `type_error`); enums must match exactly.

> **`error_code` granularity, current state.** Transport failures keep their
> structured JSON-RPC code, so they surface granular codes (`jsonrpc_neg_32000`,
> `jsonrpc_neg_32001`). Application-level git failures (a rejected push, a merge
> conflict, etc.) do **not**: the server returns them as a `CLIError` whose
> structured code is dropped at the tool boundary (`cliErrorMiddleware` re-wraps
> it as a plain message), so the client has no `.code` to normalize and
> `error_code` collapses to the generic `error`. `executeAppToolBoxAction`
> already preserves an `error_code`/`code` field if the response payload carries
> one, so the day the backend propagates a structured code on these failures the
> granular value flows through automatically — no client change needed.

If an interaction name has **no schema entry**, `buildTelemetryData` returns `{}`
— the explicit client call still attempts to send, but the server may still
reject the interaction as unsupported.

### Automatic events fire only when their view is visible

Every overview launch mounts **all** panes (Status, Graph, Resolve, Composer) so
`activateView` can switch between them without a remount, and it **prefetches**
the hidden panes' data in the background. Because of that, a pane resolving a
directory or rendering a gated CTA does **not** mean the user saw it.

**Rule:** any interaction that fires *automatically* — from a `useEffect`,
lifecycle handler, or data-resolution path rather than a direct user gesture like
a click — must be gated to the **currently active view**. A user gesture is
inherently scoped to the visible pane (a hidden pane has no clickable buttons),
so click-driven events need no guard; automatic events do, because a hidden but
mounted pane's effects still run. Without the guard you get phantom events
attributed to a surface the user never looked at (e.g. opening the Composer
unauthenticated also firing a `gate` for the background Resolve pane).

There are two mechanisms, by how the event is triggered:

- **Imperative (handler-driven), e.g. `load`.** Emit only from the pane's
  `activate` / `handleToolInput` handlers — the paths `activateView` runs for the
  **visible** pane — and never from `prefetch`, which `activateView` runs for the
  hidden panes. Status and Graph are the reference implementations; Resolve and
  Composer follow the same shape. The per-directory dedupe
  (`trackedLoadDirectoriesRef`) ensures at most one `load` per directory, fired
  the first time the view actually becomes visible.

- **Reactive (effect-driven), e.g. `gate` impressions.** The effect can't tell
  which view is active on its own, so the shell passes each pane an `active` prop
  (`activeView === '<view>'`) and the effect guards on it as its first condition,
  with `active` in the dependency array. When the user switches to the pane,
  `active` flips true and the effect re-runs and emits then, so nothing is lost —
  it's just correctly attributed. The shell-level graph gate
  (`shouldShowUnlicensedGate = activeView === 'graph' && …` in `git_overview.tsx`)
  is the reference; the inline Composer and Resolve gates follow the same shape.
  Gate **success** attribution keys off whether that pane recorded an impression,
  so gating the impression on `active` keeps success events consistent too.

When adding a new automatic event, pick the matching mechanism and add the
guard before wiring the emit.

---

## 2. Full action catalog

Legend for **Fires?**: ✅ explicit UI emit · ✅ derived server emit · ✅ server
feedback emit · ⚠️ accepted legacy or caveat.

### 2a. Lifecycle (all apps)

| Interaction | When | `data` fields | Fires? |
|-------------|------|---------------|--------|
| `app_loaded` | Once, on first successful mount | `host` | ✅ |
| `render_error` | React render/mount throws | `host`, `boot_config_present`, `error_name`, `error_message` | ✅ |

### 2b. Git Status (`app_name: git_status`)

| Interaction | When shown / triggered | `data` | Fires? | Call site |
|-------------|------------------------|--------|--------|-----------|
| `load` | View becomes visible & resolves a directory (activate / handleToolInput; never prefetch) | host, tool_name | ✅ | `git_status_view.tsx:557` |
| `refresh` | User clicks Refresh | host, tool_name | ✅ | `:714` |
| `sync` | User clicks Sync (pull+push) | host, tool_name | ✅ | `:999` |
| `sync_result` | Sync sequence completed or failed | host, tool_name, outcome, duration_ms, error_code | ✅ | `submitSync` outcome callback |
| `commit` | Commit submitted | host, mode, staged_count, changed_file_count | ✅ | `:1296` |
| `commit_request_result` | Quick-commit prompt dispatch completed or failed | host, outcome, duration_ms, error_code, staged_count, changed_file_count | ✅ | quick commit prompt dispatch |
| `generate_commit_message` | User triggers AI commit-message generation for the inline editor | host, tool_name | ✅ derived | `generateInlineCommitMessage` → `git_generate_commit_message` |
| `generate_commit_message_result` | AI commit-message generation completed, returned nothing, or failed | host, outcome, duration_ms, error_code | ✅ | `generateInlineCommitMessage` outcome callback |
| `stage_all_and_commit` | "Stage all & commit" prompt action | host, tool_name | ✅ | `:1344` |
| `collapse` / `expand` | Header collapse toggle | host | ✅ | `:1410` |
| `feedback_start` | Thumbs up/down clicked | host, sentiment | ✅ | `:1686`/`:1691` |
| `feedback_dismiss` | Feedback form dismissed without submit | host, sentiment | ✅ | feedback composer cancel |
| `feedback` | Feedback submitted | sentiment, has_comment, comment | ✅ server | `app_feedback` handler |
| `switch_to_graph` | "View graph" (licensed) | host | ✅ | `git_overview.tsx:706` |
| `switch_to_graph_gate` | "Upgrade/Log in to view graph" | host | ✅ | `git_overview.tsx:516` |
| `gate` | Unlicensed gate shown (graph target) | host, variant | ✅ | `git_overview.tsx:559` |
| `gate_login_click` | Gate "Log in" clicked | host, variant | ✅ | `git_overview.tsx:633` |
| `gate_start_trial_click` | Gate "Start trial" clicked | host, variant | ✅ | `git_overview.tsx:644` |
| `gate_upgrade_click` | Gate "Upgrade" clicked | host, variant | ✅ | `git_overview.tsx:658` |
| `gate_login_success` | Account signed in (unauth → auth) after a gate | host, variant | ✅ | `git_overview.tsx:319` (`applyUserStatusResponse`) |
| `gate_start_trial_success` | Authenticated account cleared the gate via `start_trial` | host, variant | ✅ | `git_overview.tsx:319` |
| `gate_upgrade_success` | Authenticated account cleared the gate via purchase (seen on refresh) | host, variant | ✅ | `git_overview.tsx:319` |
| `push` | User clicks Push | host, tool_name | ✅ derived | `submitPush` `:955` → `git_push` |
| `push_result` | Push completed or failed | host, tool_name, outcome, duration_ms, error_code | ✅ | `submitPush` outcome callback |
| `pull` | User clicks Pull | host, tool_name | ✅ derived | `submitPull` `:970` → `git_pull` |
| `pull_result` | Pull completed or failed | host, tool_name, outcome, duration_ms, error_code | ✅ | `submitPull` outcome callback |
| `fetch` | User clicks Fetch | host, tool_name | ✅ derived | `submitFetch` `:1018` → `git_fetch` |
| `fetch_result` | Fetch completed or failed | host, tool_name, outcome, duration_ms, error_code | ✅ | `submitFetch` outcome callback |
| `stage_all` | "Stage all" | host, tool_name | ✅ derived | `submitStageAll` `:1027` → `git_add_or_commit` without `files` |
| `stage_file` | Stage a single file | host, tool_name | ✅ derived | `submitStageFile` `:1042` → `git_add_or_commit` with `files` |
| `unstage_file` | Unstage a single file | host, tool_name | ✅ derived | `submitUnstageFile` `:1058` |
| `stash` | Stash unstaged | host, tool_name | ✅ derived | `submitStash` `:1074` |
| `stash_all` | Stash all (incl. untracked) | host, tool_name | ✅ derived | `:1353` |
| `stash_staged` | Stash staged only | host, tool_name | ✅ derived | `:1367` |
| `open_in_gitlens` | "Open Graph in GitLens" | host, tool_name | ✅ derived | `openInGitLens` `:1126` |
| `open_diff` / `open_file` / `open_in_explorer` | File actions | host, tool_name | ✅ derived | `openGitStatusFileAction` `:1158` |

### 2c. Git Graph (`app_name: git_graph`)

| Interaction | When | `data` | Fires? | Call site |
|-------------|------|--------|--------|-----------|
| `load` | View becomes visible (activate / handleToolInput; never prefetch) | host, tool_name | ✅ | `git_graph_view.tsx:510` |
| `refresh` | Refresh clicked | host, tool_name | ✅ | `:1092` |
| `select_target_branch` | Target branch chosen | host, tool_name | ✅ | `:953` |
| `collapse` / `expand` | Header toggle | host | ✅ | `:1102` |
| `expand_range` / `collapse_range` | Commit range toggled | host | ✅ | `:921` |
| `commit_expand` / `commit_collapse` | Individual commit details toggled | host | ✅ | commit rows |
| `feedback_start` | Thumbs up/down | host, sentiment | ✅ | `:1295`/`:1300` |
| `feedback_dismiss` | Feedback form dismissed without submit | host, sentiment | ✅ | feedback composer cancel |
| `feedback` | Feedback submitted | sentiment, has_comment, comment | ✅ server | `app_feedback` handler |
| `switch_to_status` | "Back to status" | host | ✅ | `git_overview.tsx:739` |
| `gate` / `gate_*_click` / `gate_*_success` | Gate shown / CTA clicked / conversion (when Graph is launch app) | host, variant | ✅ | `git_overview.tsx` (attributed to launched app) |
| `push` | Push clicked | host, tool_name | ✅ derived | `submitPush` `:981` → `git_push` |
| `push_result` | Push completed or failed | host, tool_name, outcome, duration_ms, error_code | ✅ | `submitPush` outcome callback |
| `pull` | Pull clicked | host, tool_name | ✅ derived | `submitPull` `:999` → `git_pull` |
| `pull_result` | Pull completed or failed | host, tool_name, outcome, duration_ms, error_code | ✅ | `submitPull` outcome callback |
| `open_in_gitlens` | "Open in GitLens" | host, tool_name | ✅ derived | `openInGitLens` `:1017` |
| `open_diff` / `open_file` / `open_in_explorer` | Commit file actions | host, tool_name | ✅ derived | expanded commit file rows |

### 2d. Git Resolve (`app_name: git_resolve`)

| Interaction | When | `data` | Fires? | Call site |
|-------------|------|--------|--------|-----------|
| `load` | View becomes visible (activate / handleToolInput; never prefetch) | host, tool_name | ✅ | `git_resolve_view.tsx:374` |
| `refresh` | User clicks Refresh | host, tool_name | ✅ | header refresh handler |
| `switch_to_resolve` | Entered from Status | host | ✅ | `git_overview.tsx:720` |
| `resolve_prepare_start` | "Resolve conflicts" (AI prep begins) | host, conflict_count | ✅ | `runPrepare` |
| `resolve_prepare_ready` | AI resolution ready | host, result_count, duration_ms | ✅ | `runPrepare` |
| `resolve_prepare_error` | AI resolution prep failed | host, outcome, duration_ms, error_code | ✅ | `runPrepare` catch |
| `resolve_prepare_cancel` | User cancels prep | host | ✅ | `:633` |
| `resolve_file_retry` | Retry a single file | host, attempt | ✅ | `:647` |
| `resolve_apply` | Apply resolutions | host, result_count | ✅ | `applySession` |
| `resolve_apply_result` | Apply completed or failed | host, outcome, duration_ms, error_code, result_count, applied_count, remaining_count | ✅ | `applySession` |
| `resolve_discard` | Discard resolutions | host | ✅ | `:742` |
| `resolve_file_open_diff` | Open AI-vs-conflict diff | host | ✅ | `:493` |
| `open_file` | Open conflicted file in editor | host, tool_name | ✅ derived | shared file-action controller |
| `open_in_explorer` | Reveal in file explorer | host, tool_name | ✅ derived | shared file-action controller |
| `ai_model_set` | AI model changed | host, feature=`resolve`, model_id | ✅ | `:1017`/`:1038` |
| `feedback_start` | Thumbs up/down | host, sentiment | ✅ | `:1067`/`:1072` |
| `feedback_dismiss` | Feedback form dismissed without submit | host, sentiment | ✅ | feedback composer cancel |
| `feedback` | Feedback submitted | sentiment, has_comment, comment | ✅ server | `app_feedback` handler |
| `gate` | Resolve gate shown | host, variant | ✅ | inline gate |
| `gate_login_click` / `gate_start_trial_click` / `gate_upgrade_click` | Resolve gate CTAs | host, variant | ✅ | inline gate |
| `gate_login_success` / `gate_start_trial_success` / `gate_upgrade_success` | Resolve gate conversions (sign-in / trial / purchase) | host, variant | ✅ | `git_overview_auth_gate.ts:91` (`applyUserStatusResponse`) |

### 2e. Commit Composer (`app_name: git_commit_composer`)

| Interaction | When | `data` | Fires? | Call site |
|-------------|------|--------|--------|-----------|
| `load` | View becomes visible (activate / handleToolInput; never prefetch) | host, tool_name | ✅ | `git_commit_composer_view.tsx:1027` |
| `refresh` | User clicks Refresh | host, tool_name | ✅ | header refresh handler |
| `switch_to_compose` | Entered from Status | host | ✅ | `git_overview.tsx:712` |
| `switch_to_status` | "Back to status" | host | ✅ | `:1593` |
| `view_graph` | "View graph" from composer | host | ✅ | `:1585`/`:1653` |
| `compose_prepare_start` | AI compose started | host, selected_file_count | ✅ | `composeWithAI` |
| `compose_prepare_ready` | AI compose returned a plan | host, outcome, duration_ms, result_count | ✅ | `composeWithAI` |
| `compose_prepare_error` | AI compose failed or returned no commits | host, outcome, duration_ms, error_code | ✅ | `composeWithAI` |
| `recompose` | Historical reset/cancel event name accepted by sanitizers | host | ⚠️ accepted, no longer emitted for new reset/cancel actions | legacy |
| `compose_prepare_cancel` | In-flight compose job cancelled | host | ✅ | `returnToSelection` while composing |
| `compose_reset_plan` | Existing plan reset to selection | host | ✅ | `returnToSelection` after plan |
| `compose_apply` | Commit all planned commits | host | ✅ | `:1528` |
| `compose_apply_result` | Apply-plan commit sequence completed or failed | host, tool_name, outcome, duration_ms, error_code, result_count, applied_count, remaining_count | ✅ | `applyComposedPlan` |
| `range_select` / `range_clear` | History range selected or cleared | host | ✅ | history panel |
| `range_expand` / `range_collapse` | History commit node toggled | host | ✅ | history panel |
| `compose_range_apply_confirm` | User confirmed branch rewrite for a range plan | host | ✅ | range apply confirmation |
| `open_in_gitlens` | Open in GitLens | host | ✅ | `:1206` |
| `open_diff` / `open_file` / `open_in_explorer` | File actions | host, tool_name | ✅ derived | shared file-action controller |
| `collapse` / `expand` | Header toggle | host | ✅ | `:1610` |
| `ai_model_set` | AI model changed | host, feature=`compose`, model_id | ✅ | `:1689` |
| `feedback_start` | Thumbs up/down | host, sentiment | ✅ | `:1723`/`:1728` |
| `feedback_dismiss` | Feedback form dismissed without submit | host, sentiment | ✅ | feedback composer cancel |
| `feedback` | Feedback submitted | sentiment, has_comment, comment | ✅ server | `app_feedback` handler |
| `gate` | Compose gate shown | host, variant | ✅ | `:1086` |
| `gate_login_click` / `gate_start_trial_click` / `gate_upgrade_click` | Gate CTAs | host, variant | ✅ | inline gate (`git_overview_auth_gate.ts`) |
| `gate_login_success` / `gate_start_trial_success` / `gate_upgrade_success` | Compose gate conversions (sign-in / trial / purchase) | host, variant | ✅ | `git_overview_auth_gate.ts:91` (`applyUserStatusResponse`) |

### 2f. Launchpad (`app_name: launchpad`)

Launchpad renders as a pane inside the `git_overview` shell (experimental). Its
view intents and result interactions are **client-emitted** through
`trackAppInteraction` in
[`launchpad.tsx`](../internal/mcp/internal/ui/src/launchpad.tsx); it has no
server-derived toolbox intents (unlike Status/Graph git actions) and no
unlicensed-gate funnel (availability is backend-advertised, see §4). Submitted
feedback is handled server-side, while lifecycle `app_loaded` / `render_error`
events are fired by the shell when Launchpad is the launched view, like every
other pane.

| Interaction | When | `data` | Fires? | Call site |
|-------------|------|--------|--------|-----------|
| `load` | View becomes visible & resolves a directory | host, tool_name, outcome, duration_ms, error_code, pull_request_count, issue_count | ✅ | `launchpad.tsx` |
| `refresh` | User clicks Refresh | host, tool_name, outcome, duration_ms, error_code, pull_request_count, issue_count | ✅ | `launchpad.tsx` |
| `tab_select` | User switches the PRs/Issues tab | host, tab | ✅ | `launchpad.tsx` |
| `group_toggle` | Category group expanded/collapsed | host, group, expanded | ✅ | `launchpad.tsx` |
| `filter_change` | Filter applied to the current tab | host, filter, tab, count | ✅ | `launchpad.tsx` |
| `open_item` | Open a PR/issue (provider page, PR changes, or Review Changes) | host, category, provider | ✅ | `launchpad.tsx` |
| `open_item_result` | Open-changes / Review-Changes action completed or failed | host, category, provider, outcome, duration_ms, error_code, open_verified | ✅ | `openChanges` / `reviewChanges` |
| `start_review` | "Start Review" on a PR | host, category, provider | ✅ | `launchpad.tsx` |
| `start_review_result` | Start-review completed or failed | host, category, provider, outcome, duration_ms, error_code | ✅ | `startReview` outcome callback |
| `start_work` | "Start Work" on an issue | host, category, provider | ✅ | `launchpad.tsx` |
| `start_work_result` | Start-work completed or failed | host, category, provider, outcome, duration_ms, error_code | ✅ | `startWork` outcome callback |
| `switch_to_launchpad` | Entered Launchpad from another pane | host | ✅ | `git_overview.tsx` |
| `switch_to_status` / `back` | Leave Launchpad | host | ✅ | `launchpad.tsx` / shell |
| `collapse` / `expand` | Header collapse toggle | host | ✅ | `launchpad.tsx` |
| `feedback_start` | Thumbs up/down clicked | host, sentiment | ✅ | `launchpad.tsx` |
| `feedback_dismiss` | Feedback form dismissed without submit | host, sentiment | ✅ | `launchpad.tsx` |
| `feedback` | Feedback submitted | sentiment, has_comment, comment | ✅ server | `app_feedback` handler |
| `app_loaded` / `render_error` | Lifecycle (when Launchpad is the launched view) | host (+ error fields) | ✅ | shell (`git_overview.tsx`) |

Item content (titles, URLs, repository names, issue bodies) is never forwarded —
only the whitelisted `category`/`provider` identifiers and outcome fields
survive sanitization (`sanitizeLaunchpadInteractionTelemetryData`).

---

## 3. User flows & funnels

Each flow lists events **in emit order** and calls out any important semantic
limits.

### Git Status

**Flow A — Commit (quick commit)**
```
load → stage_all|stage_file → commit → commit_request_result → refresh
```
The staging steps are server-derived from the `git_add_or_commit` toolbox calls.
`commit.mode=quick_commit` and `commit.staged_count` / `changed_file_count`
provide additional size context.
`commit_request_result` means the quick-commit prompt/request was dispatched,
not that a git commit completed.

**Flow A′ — AI-generated inline commit message**
```
load → generate_commit_message → generate_commit_message_result → commit
```
Follows the AI-operation shape used by Resolve/Composer: `generate_commit_message`
is the server-derived intent (the `git_generate_commit_message` toolbox call),
and `generate_commit_message_result` is the UI-observed outcome carrying
`outcome`, `duration_ms`, and a normalized `error_code` (`withAIOutcome`). It
records `error` both on a thrown failure and when the AI returns an empty
message (`error_code=empty_message`). The subsequent `commit` is UI-emitted
with `mode=inline_commit` after the toolbox commit succeeds; it is not derived
from `git_add_or_commit`.

**Flow B — Sync / push / pull**
```
load → sync → sync_result      ✅ UI-composed sequence outcome
load → push → push_result      ✅ server-derived intent + UI-observed outcome
load → pull → pull_result      ✅ server-derived intent + UI-observed outcome
load → fetch → fetch_result    ✅ server-derived intent + UI-observed outcome
```
Standalone push/pull/fetch intents are observable through server-derived
telemetry; their result events represent UI-observed completion.

**Flow C — Stash**
```
load → stash | stash_all | stash_staged   ✅ server-derived
```

**Flow D — Navigate out**
```
load → switch_to_graph            (licensed → Graph)
load → switch_to_graph_gate → gate → gate_{login,start_trial,upgrade}_click → gate_{login,start_trial,upgrade}_success   (unlicensed → converts)
load → switch_to_compose          (→ Composer)
load → switch_to_resolve          (→ Resolve)
```
This is the **cleanest funnel today**: entry → intent → gate impression → CTA →
conversion. Success events let you measure drop-off at each step. Note the CTA
and success actions need not pair 1:1 — login/trial are in-app, but `upgrade`
opens an external purchase page, so `gate_upgrade_success` lands later, on the
`user_status` refresh where the account first reads as paid (attributed to
upgrade because it cleared the gate while already authenticated and not via a
trial start). See `resolveOverviewGateSuccessEvents` for the exact attribution.

**Flow E — Inspect a file**
```
load → open_diff | open_file | open_in_explorer   ✅ server-derived
```

### Git Graph

**Flow A — Explore**
```
load → refresh → expand_range/collapse_range → commit_expand/commit_collapse → select_target_branch → collapse/expand
```
Fully observable.

**Flow B — Sync from graph**
```
load → push → push_result   ✅ server-derived intent + UI-observed outcome
load → pull → pull_result   ✅ server-derived intent + UI-observed outcome
```

**Flow C — Leave / open externally**
```
load → switch_to_status                     ✅
load → open_in_gitlens                      ✅ server-derived
```

**Flow D — Inspect a commit file**
```
load → commit_expand → open_diff | open_file | open_in_explorer   ✅ server-derived
```
`open_diff` compares the selected commit with its first parent; root commits
compare against an empty file. File paths and commit IDs are not retained in
interaction telemetry.

### Git Resolve

**Flow A — AI-assisted resolution (happy path)**
```
switch_to_resolve → load → resolve_prepare_start → resolve_prepare_ready
→ [resolve_file_open_diff] → resolve_apply → resolve_apply_result
```
Observable with conflict/result counts and prepare/apply duration.
`result_count` is the planned set size (it matches `resolve_apply`), while
`applied_count` is how many landed and `remaining_count` is what stayed
conflicted. On partial apply, `resolve_apply_result` uses `outcome=error`,
`error_code=partial_apply`, `applied_count` < `result_count`, and a non-zero
`remaining_count`. Apply result events represent what the UI can observe from
the apply request.

**Flow B — Retry / cancel / discard**
```
... resolve_prepare_ready → resolve_file_retry (×N) → resolve_apply
... resolve_prepare_start → resolve_prepare_cancel
... resolve_prepare_ready → resolve_discard
```
`resolve_file_retry` retains its `attempt` count for retry-depth histograms.

**Flow C — Model tuning & feedback**
```
load → ai_model_set → resolve_prepare_start ...
... → feedback_start(positive|negative) → feedback
```

**Gate:** `gate` → `gate_{login,start_trial,upgrade}_click` →
`gate_{login,start_trial,upgrade}_success` all land with `variant` for Resolve
(inline gate). Same conversion semantics as the Status funnel above.

### Commit Composer

**Flow A — Compose → commit (happy path)**
```
switch_to_compose → load → compose_prepare_start → compose_prepare_ready
→ [compose_reset_plan ×N] → compose_apply → compose_apply_result → (returns to Status)
```
Observable with selected-file count, planned commit count, AI compose duration,
and apply-plan outcome. `result_count` is the planned commit count, while
`applied_count` is how many landed and `remaining_count` is what stayed in the
working tree. On partial apply, `compose_apply_result` uses `outcome=error`,
`error_code=partial_apply`, `applied_count` < `result_count`, and a non-zero
`remaining_count`. `recompose` remains accepted for historical
dashboards, but new UI emits split `compose_prepare_cancel` / `compose_reset_plan`
events.

**Flow B — Review before committing**
```
load → compose_prepare_start → open_diff|open_file|open_in_explorer → open_in_gitlens → compose_apply
```
Fully observable; generic file-action intents are derived from toolbox calls.

**Flow C — Gate**
```
load → gate → gate_{login,start_trial,upgrade}_click → gate_{login,start_trial,upgrade}_success
```
Fully observable, with `variant`. Same conversion semantics as the Status funnel
(external `upgrade` success lands on the later `user_status` refresh).

**Flow D — Navigate**
```
load → view_graph        (→ Graph)
load → switch_to_status  (→ Status)
```

### Launchpad

**Flow A — Triage → open**
```
switch_to_launchpad → load → tab_select | filter_change | group_toggle
→ open_item → open_item_result
```
`load`/`refresh` carry `pull_request_count` and `issue_count` for volume, plus
`outcome`/`duration_ms`/`error_code`. `open_item_result` reports the outcome of
the open-changes / Review-Changes toolbox action. Its `open_verified` field is
false when Review Changes has to use the browser fallback, whose non-throwing
result cannot distinguish a successful `noopener` open from a popup block. A
plain "open on provider" link fires only `open_item`: a definite failure is
shown in the UI, but the browser path has no reliable success signal.

**Flow B — Act on an item**
```
… → start_review → start_review_result      (pull request)
… → start_work   → start_work_result        (issue)
```
Result events carry `outcome`, `duration_ms`, a normalized `error_code` on
failure, and the `category`/`provider` of the item acted on.

**Flow C — Leave / feedback**
```
load → back | switch_to_status
load → feedback_start(positive|negative) → feedback | feedback_dismiss
```

---

## 4. Recently closed gaps and remaining limits

### Closed — outcome and latency events
The UI now emits outcome events where it can observe completion:
`push_result`, `pull_result`, `fetch_result`, `sync_result`,
`commit_request_result`, `generate_commit_message_result`,
`resolve_prepare_error`, `resolve_apply_result`,
`compose_prepare_ready`, `compose_prepare_error`, and `compose_apply_result`. These events include
`outcome`, `duration_ms`, and normalized `error_code` for error outcomes.

### Closed — gate conversion (success) events
Every gate surface now emits `gate_login_success`, `gate_start_trial_success`,
and `gate_upgrade_success` (with `variant`) so the unlicensed-gate funnel closes
on conversion, not just intent. Login success = the account went from signed-out
to signed-in; trial/upgrade success = an already-authenticated account cleared
the gate entirely, told apart by whether the triggering action was `start_trial`.
Because `upgrade` is an external purchase, `gate_upgrade_success` is observed on
the next `user_status` refresh that first reads as paid, not inline. Success
events only fire when the app actually showed a `gate` impression (each pane
passes its impression state into `resolveOverviewGateSuccessEvents`), so a
sign-in that never surfaced a gate — e.g. a background refresh flipping
authenticated on a pane the user never gated — does not inflate the login leg.
Attribution lives in one place — `resolveOverviewGateSuccessEvents` in
`git_overview_shared.ts` — shared by the graph gate (`git_overview.tsx`) and the
inline resolve/compose gate (`git_overview_auth_gate.ts`).

### Closed — Resolve gate and retained counters
Resolve now accepts `gate` and gate CTA interactions with `variant`. Resolve also
keeps `conflict_count`, `result_count`, `applied_count`, `remaining_count`, and
`attempt` where applicable; Composer keeps `selected_file_count`, planned commit
`result_count`, and apply result counts.

### Closed — refresh, reset/cancel, feedback dismiss, and early directory queue
Resolve and Composer refresh clicks emit `refresh`. Composer reset and in-flight
cancel are split into `compose_reset_plan` and `compose_prepare_cancel` while `recompose`
remains accepted for historical compatibility. Feedback form cancellation emits
`feedback_dismiss`. Non-lifecycle interactions queued before directory resolution
are bounded to 20 entries per app and expire after 30 seconds.

### Intentional limits
- Status/Graph git intents and generic file actions in every overview pane are
  server-derived from toolbox calls; clients do not emit duplicate intents.
- Status `commit_request_result` is only prompt/request dispatch telemetry; it
  is not an actual git commit outcome.
- File paths remain excluded from all interaction telemetry payloads.
- Submitted feedback remains server-side `feedback`; there is no separate
  client-side `feedback_submit` event.
- `load` is a **view-impression** signal: it fires only when a pane becomes
  visible (`activate` / `handleToolInput`), never during background `prefetch`,
  so a launch does not emit `load` for panes the user never saw.
- `gate_upgrade_success` is best-effort: the purchase completes off-app, so it is
  inferred from the first `user_status` refresh that reads as paid. A user who
  buys but never returns to the app (or whose license lands via some other path)
  will not produce it.
- **Launchpad intents are client-emitted, not server-derived.** Unlike the
  Status/Graph git actions, Launchpad's `open_item` / `start_review` /
  `start_work` are emitted from `launchpad.tsx`, not derived from the toolbox
  call in `deriveAppToolBoxInteraction`. The paired `*_result` events carry the
  observed outcome.
- **Launchpad has no unlicensed-gate funnel.** Availability is backend-advertised
  (`launchpadAvailable`, gated on the experimental flag and successful Launchpad
  UI resource registration); when unavailable the pane and its "View Launchpad"
  entry points are simply not rendered, so there are no `gate_*` events. If the
  experimental flag is on but the Launchpad HTML shell is absent from the build,
  registration emits `not_registered` with reason `launchpad_ui_missing` so the
  skip is observable rather than silent.

---

### Quick reference — instrumentation coverage

| View | Emitted | Remaining limits | Notable outcome semantics |
|------|---------|------------------|----------------------|
| Status | load, refresh, sync/sync_result, commit/commit_request_result, generate_commit_message/generate_commit_message_result, ai_model_set, stage_all_and_commit, collapse/expand, feedback_start/feedback/feedback_dismiss, switch/gate/gate_*_click/gate_*_success, push/pull/fetch result events plus server-derived stage/stash/open actions | — | quick commit result is request dispatch only; commit generation result is UI-observed |
| Graph | load, refresh, select_target_branch, (collapse/expand)(_range), feedback_start/feedback/feedback_dismiss, switch_to_status, gate/gate_*_click/gate_*_success, push/pull result events plus server-derived open_in_gitlens and file actions | — | result events are UI-observed completion only |
| Resolve | load, refresh, switch_to_resolve, resolve_prepare_start/ready/error/cancel, resolve_file_retry, resolve_apply/result, resolve_discard, resolve_file_open_diff, open_file, open_in_explorer, ai_model_set, feedback_start/feedback/feedback_dismiss, gate/gate_*_click/gate_*_success | — | result events are UI-observed completion only |
| Composer | load, refresh, switch_to_compose/status, view_graph, compose_prepare_start/ready/error/cancel, compose_reset_plan, recompose accepted legacy, compose_apply/result, range_select/clear/expand/collapse, compose_range_apply_confirm, open_in_gitlens, open_diff/file/explorer, collapse/expand, ai_model_set, feedback_start/feedback/feedback_dismiss, gate/gate_*_click/gate_*_success | — | result events are UI-observed completion only |
| Launchpad | load, refresh (both with pull_request_count/issue_count + outcome), tab_select, group_toggle, filter_change, open_item/open_item_result, start_review/result, start_work/result, switch_to_launchpad/switch_to_status/back, collapse/expand, feedback_start/feedback/feedback_dismiss, lifecycle app_loaded/render_error | no gate funnel (availability is backend-advertised); intents client-emitted, not server-derived | result events are UI-observed completion only; item content never forwarded |
