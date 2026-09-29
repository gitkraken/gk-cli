# TypeScript split plan

Tracking issue: [#1709](https://github.com/gitkraken/gkcli/issues/1709)

Inventory of every outward-facing gkcli command and capability, with a proposed destination for each: the new TypeScript CLI, a core-tools package, or deletion.

Built from the live Cobra command tree (including hidden commands) and `gk mcp --list-tools` on `main`. Drop candidates are based on code signals (hidden, deprecated, experimental, commented out), not usage data. Items marked **?** should be checked against telemetry before deciding.

## Proposed core-tools packages

Follows the existing core-tools convention: `packages/<domain>` published as `@gitkraken/<domain>-tools`, versioned independently.

| Folder | Package | Holds |
|---|---|---|
| `packages/account` | `@gitkraken/account-tools` | Token exchange, user info, orgs, active org, AI credit balance |
| `packages/integrations` | `@gitkraken/integrations-tools` | Provider connections, PR/issue/repo/project clients for the 11 providers, launchpad prioritization. Built from the existing core-gitlens provider abstraction and provider-apis-package-js, not from scratch (see below) |
| `packages/ai` | `@gitkraken/ai-tools` | Hosted and bring-your-own-key AI providers, model listing, commit/changelog/explain/PR prompts; supplies AI to compose-tools and conflict-tools |
| `packages/agents` | `@gitkraken/agent-tools` | Agent detection, per-client MCP config writers, hook config writers, skill installers, hook session model |

These build on the existing `api-tools` (transport) and `shared-tools` (ports), like `milestones-tools` does. With workspaces and work-item commands dropped, `account-tools` is small, but it stays a separate package: `integrations-tools` publishes the open-source provider abstraction, and `account-tools` (token exchange, credit balance, trial and purchase URLs) stays closed source. `account-tools` may depend on `integrations-tools`, never the reverse. Hold off on an `mcp-tools` package until GitLens or GKD commits to hosting the same tools.

**Sourcing `integrations-tools`:** GitLens already has a provider abstraction in core-gitlens (the `plus` folder), and provider-apis-package-js already holds the per-provider clients. Instead of porting the Go provider layer, move both into core-tools and merge them into one package: the core-gitlens abstraction becomes the exported API, and provider-apis is used under the hood. GitLens, GKD, GKDEV, Kepler and the new CLI would all consume the same package, so provider fixes land once and PRs can be stacked across packages in the monorepo.

Two constraints from that discussion:
- core-gitlens is open source and provider-apis is not. Keep the abstraction layer public (or publish it from core-tools under the same license) and keep the closed clients as a separate package underneath it, so the GitLens community does not lose code it can read today.
- The `plus` folder pulls in lower core-gitlens packages (`git`, `git-core`), and Kepler consumes the `git` folder directly. Map those onto the `shared-tools` git port and ai-tools before moving, so the package does not drag a copy of GitLens internals with it.

Naming note: `@gitkraken/core-tools-cli` already exists as a test harness for the libraries. Name the user-facing CLI after the product (for example `@gitkraken/cli`, binary `gk`) to avoid confusion, or fold the harness in as a hidden `gk dev` command.

**Destinations** (all published as `@gitkraken/<name>`):
- **Existing core-tools packages:** `api-tools`, `shared-tools`, `compose-tools`, `conflict-tools`
- **New core-tools packages:** `account-tools`, `integrations-tools`, `ai-tools`, `agent-tools`
- **CLI:** the new user-facing CLI (for example `@gitkraken/cli`, binary `gk`)
- **DROP** = delete · **?** = decide using usage data (the destination shown is where it goes if you keep it)

## 1. CLI commands

| Command | Library destination | CLI keeps |
|---|---|---|
| `auth login` / `logout` | `account-tools`: token exchange, user info (sent over `api-tools`) | Browser/callback flow, `--token`, `--auth-code`, token storage |
| `whoami` | `account-tools` (user and org) + `integrations-tools` (connected providers) | Output formatting |
| `organization list` / `set` | `account-tools` | Remembering the active org |
| `setup` | — | Everything |
| `version` | — | Everything |
| `completion` | — | **DROP** (Go CLI shell-completion command) |
| `provider add` / `list` / `remove` / `primary` / `set` | `integrations-tools`: connection API, token checks, the 11 provider clients | Commands, prompts |
| `provider orgs` / `projects` / `repos` | `integrations-tools` | Commands |
| `pr list` | `integrations-tools` | `--fields` and output |
| `issue list` / `show` / `assign` | `integrations-tools` | Commands |
| `repo` (`resolve`) | — | **DROP** (Go CLI repository utility) |
| `workspace create` / `list` / `info` / `update` / `delete` |  — | DROP |
| `workspace set` / `unset` | — | DROP |
| `workspace clone` / `refresh` | — | DROP |
| `work start` … `pr merge` (all 10 subcommands) | — | **DROP** (work-item commands and their work-item API) |
| `graph` | — | **DROP** (unnecessary for agentic CLI) |
| `ai commit` | `ai-tools`: commit-message prompt and generation | Staging and committing, `--force` |
| `ai changelog` | `ai-tools` | Command |
| `ai explain branch` / `commit` | `ai-tools` | Command |
| `ai pr create` | `ai-tools` (title/body) + `integrations-tools` (creating the PR) | Command |
| `ai compose` (all 6 subcommands) | `compose-tools` (already there), with AI supplied by `ai-tools` | Flags, plan files, output |
| `ai resolve` (all 4 subcommands) | `conflict-tools` (already there), with AI supplied by `ai-tools` | Flags, plan files, output |
| `ai models` | `ai-tools` | Cache, `--refresh` |
| `ai provider add` / `list` / `remove` / `set` / `show` / `use` | `ai-tools`: provider adapters (Anthropic, OpenAI, Ollama, OpenRouter, GitKraken-hosted) | Storing provider config and keys |
| `ai tokens` **?** | `account-tools` | Command |
| `ai skill install` / `uninstall` / `update` / `check` / `list` | `agent-tools`: per-agent skill paths and installer | The bundled skill content (`gitkraken-cli`, `gitkraken-commit-composer`, `gitkraken-resolve`) |
| `mcp` (server) | See section 2 | Stdio server |
| `mcp install` / `uninstall` / `config` | `agent-tools`: config writers for 15 clients | Pointing each client at the right `gk` executable |
| `agents list` | `agent-tools`: agent detection | Table output |
| `agents register` / `unregister` *(hidden)* | `agent-tools`: session and relay model | Relay endpoint |
| `ai hook install` / `uninstall` *(hidden)* | `agent-tools`: hook config writers for each host | Command |
| `ai hook run` *(hidden)* | `agent-tools`: event parsing for each host | Fast entry point (needs to start quickly) |
| `ai hook` session commands (`list-sessions`, `get-session`, `open-session`, `archive-session`, `unarchive-session`, `remove-session`) | `agent-tools`: session registry model | Session storage |
| `gitlens` / `gl` *(hidden)* | — | **DROP** (unused by gitlens) |
| `merge-mate` *(hidden)* | — | **DROP** (move into merge-mate) |
| `system` (`reset`, `--locks-only`) *(hidden)* | — | **DROP** (Go CLI store and lock recovery command) |
| `compose` *(hidden, deprecated)* | — | **DROP** |
| `kraken` *(hidden)* | — | **DROP** |
| `experimental install-logging-instructions` | — | **DROP** |
| `gk <git command>` passthrough | — | **DROP** |

**Flags and output contract (CLI only):**
- Keep root persistent flags: `--json` (also `GK_OUTPUT`), `--session`, `--no-telemetry`; keep hidden `--env` and `--proxied`.
- Keep per-command `--fields` and `--dry-run` where supported, the JSON error envelope, and exit codes `0`/`1`/`75`. `--input-json` exists only on the `work pr create` command slated for removal, so retain it only if a replacement command needs it.
- **DROP:** the deprecated root flag `--output`.
- Keep CLI/runtime environment handling for `GK_OUTPUT`, `GK_CLI_NO_TELEMETRY`, `GK_CLI_DEBUG_ENABLED`, `NO_COLOR`, `CI`, `OTEL_SDK_DISABLED`, `GK_PROXY_CHILD`, and host path overrides such as `XDG_DATA_HOME`, `XDG_CONFIG_HOME`, `XDG_CACHE_HOME`, and `CLAUDE_CONFIG_DIR`. The GitLens MCP connection uses `GK_GL_PATH`; development tools use `GK_ENV` and `GK_DEBUG_ARGS`. `GK_USER_TOKEN` and `GK_ORG_ID` are passed only to the merge-mate child, while `GK_GL_ADDR` belongs to the `gitlens` command slated for removal. `GK_CLI` is a workspace project-type string, not an environment variable.
- Agent hooks use `GITKRAKEN_AGENT_*` environment values. When moving hook and client-path code to `agent-tools`, pass these values and path overrides through host configuration rather than reading process environment inside the library.

## 2. MCP server

MCP tools stay in the CLI for now; their handlers call into the libraries. The first table lists top-level MCP tools. The second lists the 52 `app_tool_box` actions (registered in [`app.go`](../internal/mcp/internal/tools/app.go)); names shared with top-level tools are separate entry points.

| Tool(s) | Library the handler calls |
|---|---|
| `git_add`, `git_blame`, `git_branch`, `git_checkout`, `git_commit`, `git_fetch`, `git_pull`, `git_push`, `git_stash`, `git_worktree`, `git_log_or_diff` | `shared-tools` git port; the Node implementation stays in the CLI |
| `git_status`, `git_graph` (with UI) | `shared-tools` git port |
| `git_commit_composer` (with UI) | `compose-tools` + `ai-tools` |
| `git_resolve` (with UI) | `conflict-tools` + `ai-tools` |
| `pull_request_assigned_to_me`, `pull_request_create`, `pull_request_create_review`, `pull_request_get_comments`, `pull_request_get_detail` | `integrations-tools` |
| `issues_assigned_to_me`, `issues_create`, `issues_get_detail`, `issues_add_comment`, `repository_get_file_content` | `integrations-tools` |
| `launchpad` (with UI, experimental) | `integrations-tools` for native PR/issue data and prioritization; CLI for the UI |
| `gitlens_launchpad` | CLI (relay to GitLens `/mcp/launchpad/list`) |
| `gitkraken_workspace_list` | **DROP** (workspaces are dropped) |
| `gitlens_start_review`, `gitlens_start_work`, `gitlens_open_graph` | — (CLI-only relay to GitLens) |
| `app_tool_box` transport and UI dispatch | CLI (preserve the MCP tool and UI transport) |
| `app_update_user_preferences` | CLI (settings persistence) |
| Prompt templates (fetched from the GitKraken API) | `api-tools` for fetching; the CLI registers them |
| MCP app UI bundles (status, graph, composer, resolve, launchpad) | CLI (move to a library only if GitLens decides to render them) |
| `gitkraken_conversation_logging` (experimental) | **DROP** |
| Defined but unregistered: `pull_request_add_comment`; commented-out git tools: `git_init`, `git_reset`, `git_clone`, `git_merge`, `git_rebase`, `git_tag`, `git_cherry_pick`, `git_revert`, `git_clean`, `git_rm` | **DROP** |
| Filesystem tools that always return an empty list: `read_content`, `write_file`, `list_workspace_repositories` | **DROP** |

**`app_tool_box` actions:**

| Action(s) | Library the handler calls | Stays in CLI |
|---|---|---|
| `git_status_data`, `git_graph_data`, `git_graph_commit_changes`, `git_graph_targets`, `git_status_line_changes` | `shared-tools` git port | MCP/UI transport and presentation |
| `git_push`, `git_pull`, `git_fetch`, `git_add_or_commit`, `git_stash` | `shared-tools` git port | MCP/UI transport and presentation |
| `git_generate_commit_message` | `ai-tools` | MCP/UI transport and presentation |
| `open_diff`, `open_file`, `open_in_explorer`, `detected_editors` | CLI (host filesystem and editor integration) | MCP/UI transport |
| `compose_history`, `compose_plan`, `compose_plan_start`, `compose_plan_status`, `compose_plan_cancel`, `compose_apply_plan` | `compose-tools` | MCP/UI transport and presentation |
| `compose_open_diff` | CLI (host diff integration) | MCP/UI transport |
| `git_resolve_data`, `git_resolve_prepare_start`, `git_resolve_prepare_status`, `git_resolve_prepare_cancel`, `git_resolve_file_retry`, `git_resolve_file_open_diff`, `git_resolve_apply`, `git_resolve_discard` | `conflict-tools` | MCP/UI transport and presentation |
| `app_feedback`, `interaction_telemetry` | CLI (feedback and telemetry integrations) | MCP/UI transport |
| `gitlens_ping`, `gitlens_open_graph` | CLI (GitLens relay) | MCP/UI transport |
| `user_status`, `save_auth_code`, `purchase_url`, `start_trial`, `resend_email` | `account-tools` | MCP/UI transport |
| `ai_models_list`, `ai_model_set` | `ai-tools` | MCP/UI transport |
| `settings_snapshot`, `settings_account_url`, `settings_organizations`, `settings_set_organization` | `account-tools` (account and org data); CLI owns settings storage | MCP/UI transport |
| `launchpad_pull_requests`, `launchpad_issues` | `integrations-tools`: native provider data and prioritization | MCP/UI transport and presentation |
| `launchpad_open_pr_changes` | CLI (local editor integration) | MCP/UI transport |
| `launchpad_review_changes_url` | `account-tools`: exchange token for the GitKraken.dev review URL | MCP/UI transport |
| `launchpad_start_review`, `launchpad_start_work` | CLI (GitLens workflow relays) | MCP/UI transport |
| `update_user_preferences` | CLI (settings persistence) | MCP/UI transport |

## 3. Behind-the-scenes functionality

| Area | Destination |
|---|---|
| Embedded JS runtime running core-tools (`internal/corejs`, goja plus shims) | **DROP**: the TS CLI imports the packages directly |
| HTTP transport, token-per-request auth | `api-tools` (already there) |
| Storage interface | `shared-tools`; the persistent implementation goes in the CLI |
| SQLite store (credentials and state, including GK and provider tokens, BYOK key, work list, and `ai_sessions`) | CLI: the replacement store is SQLite only; preserve this user data, with no legacy BadgerDB import |
| Machine-scoped `settings.json` | CLI: preserve hook install flags, user preferences, and merge-mate metadata alongside session stores |
| Telemetry interface | `shared-tools`; OTel and Sentry go in the CLI |
| Git access | `shared-tools` interface (already there); the Node implementation goes in the CLI |
| AI credit checks, `credits_exhausted` mapping | `ai-tools` (with the balance lookup in `account-tools`) |
| Redaction | `shared-tools` |
| Installer/updater | **DROP** |
| Channel launchers (`gk`, `gk-insiders`, `gk-alpha`) | CLI |
| Session isolation (`--session`) | CLI |

## Library parity testing

gkcli's product code stays unchanged while the libraries are built; its Go tests are the parity oracle. The only gkcli change is a test-only helper that dumps the fixtures.

- Do not route the new libraries through `internal/corejs` first. Its host bindings must be synchronous (a still-pending Promise is an error), so the network-bound, streaming, and filesystem code would need an event loop, async fetch, and new shims in a runtime slated for removal, and would be tested under a runtime no real host uses.
- Capture language-neutral JSON fixtures from the Go tests instead: the request, the stubbed response, and Go's normalized result; for config writers, the input config and the expected file. A fixture runner in core-tools replays them against the TypeScript packages through injected fakes. Parity is the fixture set passing.
- Code ported from Go (`account-tools`, `ai-tools`, `agent-tools`) uses fixtures as its primary parity check. `integrations-tools` comes from existing TypeScript, so its own tests move with it, and Go fixtures only check that the normalized output gkcli exposes (PR/issue fields, launchpad prioritization) still matches.

## Risks to plan for

- **Command and skill migration:** before removing the listed work-item, workspace, repo, completion, system, graph, git-passthrough, and other hidden commands, update the bundled `gitkraken-cli` skill, already-installed copies of that skill, and other user-facing command guidance to remove or replace those instructions. Communicate the compatibility change so agents and users do not continue invoking commands that no longer exist. Audit the other bundled skills and docs for references as part of that migration.
- **Persistent state migration:** import the current SQLite credentials and authored state into the replacement store, including session and machine-scoped data. Verify upgrades retain authentication, provider and BYOK keys, work items, settings, and AI sessions. Provide a recovery path for the new store before removing the Go CLI's `system reset` command.
- **Executable location:** the TypeScript `gk` installs to the same folder as the Go binary, so existing MCP client configs keep working without rewriting.
- **`gk ai hook run` performance:** it runs on every agent tool call, and Node's cold start is much slower than Go's. Plan a small bundled entry point with lazy imports for that path, or keep a tiny native relay.
- **Library boundary:** libraries must not touch the terminal: no stdout, no prompts, no opening the browser, no reading CLI config paths. Hosts pass those in through ports, the way compose-tools already works.
- **Consumer migration for the merged provider package:** GitLens, GKD and GKDEV each import core-gitlens and provider-apis today. Moving them into core-tools changes how every consumer depends on the library, so stage it: publish the merged package first, switch consumers one at a time, and only then delete the old repos. Agree the open-source split (public abstraction, closed clients) before the first move so it is not decided by accident.
