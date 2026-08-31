# Consolidated GitKraken CLI skill test use cases

This document reduces the full GitKraken CLI agent skill use-case catalog to a
small execution matrix. The goal is to cover every distinct behavior without
repeating equivalent model work or spending AI tokens on deterministic flag,
validation, routing, and recovery checks.

The detailed inventory remains in
[`gitkraken-cli-skill-use-cases.md`](gitkraken-cli-skill-use-cases.md). Read live
`gk <command> --help` before execution because help is authoritative for flags.

## Test strategy

Use three coverage tiers:

1. **Live AI integration:** one request for each materially different
   model-backed workflow.
2. **Live deterministic integration:** exercise application, undo, fallback,
   JSON, authentication, provider, MCP, hook, work-item, issue, PR, workspace,
   and error behavior without calling AI.
3. **Fixture or mocked-provider coverage:** exercise repetitive flag variants,
   provider failures, operation types, and output shapes without paying for a
   semantically duplicate model answer.

Do not rerun an AI request merely to test formatting, selection flags, output
parsing, a target-routing branch, or an error detected before model invocation.
Use saved plans, fixture assertions, mocked provider responses, or deliberately
unavailable providers for those cases.

## Minimum live AI budget

| Skill | Live AI requests | Why they cannot be consolidated further |
| --- | ---: | --- |
| `gitkraken-commit-composer` | 7 | Saved planning, filtered direct apply, branch composition, range rewrite, and split preview/execution are distinct paths; filtered apply and split execution necessarily re-plan. |
| `gitkraken-resolve` | 3 | Initial plan, single-file refinement, and direct plan-and-apply are distinct paths. |
| `gitkraken-cli` | 4 | Commit message, explanation, changelog, and PR generation are separate AI products. |
| **Total** | **14** | Baseline for all distinct live model-backed behavior. |

All other cases should make zero live AI requests. If the MCP surface requires
a fully model-backed parity run for release qualification, substitute it for an
equivalent CLI case instead of duplicating the case. Use no-change/no-conflict
MCP smoke tests plus shared-engine automated tests for routine coverage.

## Shared fixtures

Create disposable repositories or branches so one prepared state supports
several assertions:

- **CW — mixed composer worktree:** two logical changes in different areas;
  one file with hunks belonging to both; staged and unstaged tracked changes;
  one untracked source file; one test or generated file suitable for exclusion.
- **CB — composer branch history:** at least three commits spanning two areas,
  based on a known `main`, with a clean worktree and a preserved source branch.
- **CR — composer ranges:** one middle inclusive subset of CB with no worktree
  layers, plus one suffix ending at the checked-out source-branch tip with
  staged, unstaged, and untracked layers that can be restored and inspected.
- **RM — merge conflicts:** multiple conflicted files, including one resolution
  that should preserve both sides and one file suitable for targeted refinement.
- **RR — rebase conflict:** a conflict where the semantic difference between
  index stage 2 (`ours`, the onto branch) and stage 3 (`theirs`, the replayed
  commit) is obvious.
- **RO — operation fixtures:** small merge, merge-style pull, cherry-pick,
  revert, and stash application conflicts generated from the same base content.
  Record the initiating command separately from Git's durable operation state.
- **GK — isolated CLI session:** a named `--session`, disposable provider
  connections, test repositories, test work items, and disposable workspaces.

Record the starting branch, HEAD, status, provider, session, and AI-token count.
After every mutating case, verify repository state before reusing a fixture.

## A. `gitkraken-commit-composer`

### C1. Reviewable mixed-worktree composition

**AI requests:** 1
**Mutation:** plan is read-only; `apply-plan` creates commits.

Using CW:

1. Run `gk ai compose plan --workdir <CW> --plan-file <private-temp-file>` with
   default worktree source, `auto` direction, balanced depth, and balanced
   granularity.
2. Inspect `plan.allOrderedCommits`, hunk indices, messages, file counts, and
   addition/deletion totals.
3. Confirm staged, unstaged, and untracked content is represented and the
   mixed file can be split at hunk level.
4. Run
   `gk ai compose apply-plan <private-temp-file> --workdir <CW> --output json`;
   do not call AI again. If commands run outside CW, retaining the identical
   `--workdir` is part of the saved-plan contract.
5. Verify commit order and contents, report `undoId`, and retain it for C6.

**Consolidated coverage:** messy worktree, multiple logical changes, atomic
grouping, same-file hunk splitting, automatic direction, message generation,
read-only review, exact replay, target HEAD, source snapshot, plan privacy, JSON
result parsing, and mutation reporting.

### C2. Filtered preview followed by explicitly authorized direct apply

**AI requests:** 2; this duplication is required because filtered previews are
not replayable and `apply` must re-plan.
**Mutation:** preview is read-only; `apply` creates commits.

Using a fresh CW:

1. Run a filtered JSON preview combining `--include`, `--exclude`,
   `--no-untracked`, `--direction type`, quick depth, consolidated granularity,
   and additional instructions.
2. Assert excludes win, paths use full-path glob semantics, untracked files are
   absent, and the redirected JSON is treated only as an inspection artifact.
3. With explicit authorization, run `apply` using the same selection flags.
4. Verify that execution may choose different grouping, then inspect commit
   SHAs and `undoId`. The standard expanded fixture must restore/drop its
   equivalent safety stash cleanly, so `stashConflict` and `stashNotRestored`
   must be absent. Cover those recovery envelopes with synthetic failure tests.

Cover `--staged-only` and invalid glob syntax with source-selection fixtures or
a mocked provider; neither needs another live model answer.

**Consolidated coverage:** filtered selection, tracked-only selection, grouping
by type, instructions appended to a preset, speed/granularity controls, direct
apply, unavoidable re-planning, safety stash outcomes, and preview-versus-replay
boundaries.

### C3. Existing branch to AI-selected branch layout

**AI requests:** 1
**Mutation:** apply creates target branches/commits.

Using CB, compose from `--source branch` since the merge target into
`--target auto`. Use area grouping, deep analysis, granular commits,
conservative branch splitting, balanced partition splitting, and
`--preserve-original`.

Assert source commit discovery, ordered commits, preserved source history,
target layout, and branch/partition control propagation. Compare generated refs
to `plan.branches[].partitioning.partitions[].branchName`; the enclosing
`branchGroup.name` is a logical grouping name and may intentionally differ.

**Consolidated coverage:** branch source, merge target, area direction, deep
analysis, granular commits, automatic target, stacked layout proposal, splitting
controls, and source preservation.

### C4. Range composition and in-place rewrite

**AI requests:** 1
**Mutation:** `apply-plan` rewrites the selected range.

Cover the two legal range shapes separately:

1. In automated or mocked-provider coverage, plan a middle inclusive subrange
   without `--range-include-workdir` and verify only that range is collected.
2. In the live one-request case, use the checked-out source branch and a range
   whose `--range-to` is that branch's current tip. Create and review a saved
   plan with `custom` direction, non-empty instructions, `--target
   rewrite-range`, and explicit `--range-include-workdir` layers. Apply the
   saved plan without another model call and verify the selected suffix was
   replaced while excluded worktree layers were restored as documented.

Worktree layers cannot be attached to a middle subrange: the source branch must
be checked out and `--range-to` must resolve to its tip.

Use the CR fixture: `middle_from`..`middle_to` is its middle inclusive subset
with no worktree layers, and `tip_from`..`tip_to` is its suffix ending at the
checked-out source-branch tip with staged, unstaged, and untracked layers.
Never reuse the middle pair with `--range-include-workdir`; use
`tip_from..tip_to` for that case.

Test `--target branch` routing with the same saved/mock response in automated
or mocked-provider coverage; target routing does not require a new semantic AI
answer.

**Consolidated coverage:** middle and tip-ending inclusive range sources,
custom direction, required instructions, worktree-layer inclusion, range
rewrite, alternate target branch, saved-plan replay, source preservation, and
restoration behavior.

### C5. Branch split preview and execution

**AI requests:** 2; execution necessarily invokes AI again because there is no
replayable split-plan format.
**Mutation:** preview is read-only; split rewrites history.

Using a fresh CB:

1. Run `split plan` with explicit branch and base branch.
2. Verify partitions, commit membership, source data, absence of `undoId`, and
   exclusion of uncommitted work. The command must reach a terminal JSON result
   even if the model omits or mutates commit IDs: returned partitions must use
   the authoritative ordered Git SHAs with no dropped or fabricated commits.
3. With explicit history-rewrite authorization, run `split`.
4. Verify the executed partitions independently of the preview, record the
   returned `undoId`, and report that publishing would require separate push or
   force-push authorization.

Cover the one-partition no-op and detached-HEAD missing-branch error using a
mocked provider and preflight validation rather than more live AI calls.

**Consolidated coverage:** advisory split planning, branch stacking, execution
re-planning, detached HEAD, minimum commit count, no-op partitioning, undo data,
and publication boundary.

### C6. Undo and recovery

**AI requests:** 0

Use undo IDs from C1, C2, or C5:

1. Verify `undo --list` includes the operation.
2. Run `undo --check` in clean state and inspect `safe`, blockers, and warnings.
3. Add a later commit and verify the new-commit blocker.
4. Dirty the worktree and verify the dirty-worktree blocker.
5. Undo safely and confirm history/worktree restoration.
6. Exercise `--force` and `--force-dirty-workdir` only in disposable fixtures,
   proving that neither flag implies the other.

**Consolidated coverage:** undo discovery, safety checks, blocker handling,
forced recovery distinctions, and restoration.

### C7. Deterministic composer errors

**AI requests:** 0

Use preflight, saved-plan, unit, or mocked-provider tests for:

- no changes, staged-only selection, and no-untracked selection;
- invalid or unsupported globs;
- `--plan-file` combined with explicit JSON output or path filters;
- saved-plan HEAD drift in the CLI preflight: reject applying a workdir or
  range-with-workdir plan after any HEAD movement, and accept a branch or
  pure-range plan after unrelated checkout movement;
- source-ref and source-diff drift for branch and pure-range plans, rejected by
  the bundled engine's snapshot verification rather than the CLI preflight;
  assert it through a saved-plan `apply-plan` run, not through
  `validateApplyPlanRepository`;
- range selection that cannot omit the staged layer;
- sparse original hunk indices after filtering;
- failed safety-stash restoration and retained stash location;
- invalid source/target combinations and target-branch routing.

## B. `gitkraken-resolve`

### R1. Reviewable multi-file conflict plan

**AI requests:** 1
**Mutation:** none.

Using RM and `--workdir`, run `resolve plan` for all conflicts with a private
plan file, instructions to preserve compatible behavior, and an explicit
`--max-steps` bound. Inspect every result's path, code, state, strategy,
confidence, reasoning, attempt, diff, and resolution.

**Consolidated coverage:** conflict discovery, multi-file planning, alternate
workdir, custom guidance, bounded tool calling, repository investigation,
schema and snapshot fields, per-file success/failure independence, private
atomic plan persistence, and human summary behavior.

### R2. Refine one proposal and apply the reviewed plan

**AI requests:** 1
**Mutation:** refinement is read-only; `apply-plan` writes and stages.

Refine one RM file from R1 with exactly one `--file` and non-empty instructions,
writing a second private plan. Assert only that file changes and other reviewed
results remain intact. Apply the refined plan without another AI call.

Verify `appliedPaths`, `remainingPaths`, `allConflictsResolved`, `warnings`,
staged files, and remaining unmerged files. Confirm the command does not
continue, abort, commit, or push the surrounding git operation. Delete temporary
plans afterward.

**Consolidated coverage:** targeted refinement, result merging, exact reviewed
application, partial-success interpretation, staging, warnings, operation
boundaries, and temporary-source cleanup.

### R3. Explicitly authorized direct apply to selected files

**AI requests:** 1
**Mutation:** writes and stages selected resolutions.

Using a fresh RM, run `resolve apply` for one or more exact repository-relative
paths with instructions. Verify only selected files are written/staged and that
per-file/provider/staging failures appear in warnings rather than being hidden
by a successful command envelope.

**Consolidated coverage:** selected-file planning, direct plan-and-apply,
instructions, spaces/Unicode paths, warning-only failures, and written-but-
unstaged recovery.

### R4. Fallback semantics without AI

**AI requests:** 0

Without initializing or calling a provider:

1. On RR, run a read-only plan with `--fallback ours --fallback-only`; verify
   stage 2 is the onto branch and report that meaning explicitly.
2. On a fresh RR, run direct apply with `--fallback theirs --fallback-only`;
   verify stage 3 is the replayed commit and that it is staged.
3. Confirm `refine-plan` still requires a live provider.

Run these local-only cases in the default session. Do not invent a named
`--session`: non-default sessions must first be created by `gk auth login`, and
fallback-only does not need session isolation because it reads no provider.

**Consolidated coverage:** both fallback choices, provider initialization
failure, plan and apply fallback paths, rebase semantics, and provider
requirements without a model request.

### R5. Conflict-operation matrix without repeated AI

**AI requests:** 0

For RO, use `--fallback-only` plans or shared-engine fixtures to verify conflict
detection for merge, merge-style pull, cherry-pick, revert, and stash
application. Rebase is covered by R4; a rebase-style pull may be included as a
smoke test without another AI request.

Assert durable Git operation identity rather than the initiating command:

- merge and `git pull --no-rebase` -> `merge` / `MERGE_HEAD`;
- rebase and `git pull --rebase` -> `rebase` / `REBASE_HEAD`;
- cherry-pick -> `cherry-pick` / `CHERRY_PICK_HEAD`;
- revert -> `revert` / `REVERT_HEAD`;
- conflicted `stash apply` -> `unknown` because Git leaves no operation marker.

For every marker-backed case, assert the incoming ref/SHA enters the snapshot.
Also assert that resolve never continues or aborts the surrounding operation.
Do not require `operation.type == "pull"`: after integration starts, Git leaves
merge or rebase state and no durable pull marker.

### R6. No-op, drift, interruption, and error contracts

**AI requests:** 0

Use deterministic integration or unit tests for:

- no-conflict success with no provider call;
- HEAD, operation, stage-OID, file-existence, or worktree-content drift rejected
  before the first write;
- interrupting CLI planning writing no plan at all, not even a partial one, so
  the run must start over; a partial plan is saved only when an embedder cancels
  its own context and `--plan-file` is set;
- one file failing without discarding other proposals;
- staging failure leaving written content plus a warning;
- malformed/missing plans, invalid fallback, and conflicting path flags;
- caller-correctable engine failures returning code `invalid_request` with a
  decisive message: plan drift, selecting a non-conflicted file, a missing
  repository, and an unavailable provider;
- `internal` reserved for CLI defects, asserted with an injected failure rather
  than with any caller-correctable input or state;
- plan-file mode `0600`, including overwrite of a pre-existing broader mode.

Run no-conflict MCP `git_resolve` as the routine surface smoke test. Rely on the
shared-engine tests for model-backed CLI/MCP parity rather than duplicating R1.

## C. `gitkraken-cli`

### G1. Installation, setup, authentication, sessions, and JSON

**AI requests:** 0

In GK:

1. Verify installation/version and run `gk setup --json`.
2. Test token login, `whoami`, active organization, and logout in a named
   session.
3. Confirm the named session does not alter the primary session.
4. Verify parseable stdout, human diagnostics on stderr, no ANSI in JSON mode,
   field selection, permanent exit code 1, transient exit code 75, and the
   structured error object's `retryable` field.
5. Verify `GK_OUTPUT`, `GK_CLI_NO_TELEMETRY`, and per-command `--no-telemetry`
   behavior.

Leave browser-based login and persistent Claude permission changes as a manual
interactive check; do not force them through a non-interactive test.

### G2. Git passthrough and graph

**AI requests:** 0

In a disposable repository, cover representative read and write passthrough
commands (`status`, `log`, `diff`, `add`, `commit`, branch, merge, and rebase), a
mistyped command reaching git, terminal graph output, and the Desktop/GitLens
launch commands where GUI automation is available.

One representative command per passthrough category is sufficient; ordinary
git behavior itself does not need exhaustive re-testing.

### G3. Git and issue provider lifecycle

**AI requests:** 0

Using disposable/test credentials, cover provider list, add, set, primary,
remove, organizations, projects, repositories, and `repo resolve`. Use one git
provider and one issue-only provider live; cover the remaining provider names
through command-validation or mocked API tests.

Assert multiple-account selection and remote-to-canonical-repository mapping.
Never print or persist tokens in test output.

### G4. AI provider lifecycle

**AI requests:** 0

With placeholder or disposable configurations, cover provider list/show, add,
set, use, remove, custom URL, hosted model listing, token balance, and switching
back to GitKraken. Exercise one hosted/BYOK provider and one local Ollama-style
provider; validate the remaining provider types with mocked requests.

Verify secret redaction and the tool-calling capability check used by resolve.

### G5. Lightweight AI products

**AI requests:** 4

Use one small repository state for four distinct products:

1. `gk ai commit` on one cohesive staged change, including description output.
2. One `gk ai explain` target, choosing commit or branch.
3. `gk ai changelog` across a small known range.
4. `gk ai pr` for the same feature branch.

Cover the second `explain` target through argument-routing and mocked-provider
tests because commit and branch explanation share the same AI product family.
Do not invoke composer for this cohesive single-commit fixture.

### G6. MCP server and equivalent tools

**AI requests:** 0

Cover server startup, read-only mode, tool listing and parameters, configuration
printing, supported-client listing, selected-client install, CLI-only install,
all-client planning, and uninstall. Avoid launching GUI clients in unattended
tests.

Verify read-only gating and run zero-AI `git_status`, `git_graph`, no-change
`git_commit_composer`, and no-conflict `git_resolve` smoke tests. Shared-engine
tests provide model-backed parity without repeating composer/resolve requests.

### G7. Agent skills, hooks, and session management

**AI requests:** 0

Cover agent detection; `ai skill list` and `ai skill install` for one
disposable supported client; and hook install/uninstall plus captured-session
list/get/archive/remove. Listing and installing are separate commands, so assert
selected list fields against `ai skill list` and installation behavior against
`ai skill install`.

For skills, assert `--output=json` and `GK_OUTPUT=json`, matching-file no-op
behavior, modified-file protection, and `--force` replacement. Dry-run needs two
cases, because it validates rather than only previewing: over a clean or matching
target it reports exact targets/actions, creates no directories or files, and
exits 0; over a modified target it still reports the plan but exits non-zero with
`invalid_request`, the same refusal the install itself would return. A dry-run
asserted only for exit 0 would pass against a build that cannot install at all.

Validate other client names through install-plan/config tests. Treat `hook run`
as host-driven and exercise it with a fixture event rather than invoking it as a
user workflow.

### G8. Work items, PRs, issues, and workspaces

**AI requests:** 0

Using disposable remote records and repositories:

1. Start, select, inspect, list, expand, commit, push, and create PRs for one
   multi-repository work item.
2. List assigned PRs and issues with selected JSON fields; show and assign one
   issue.
3. List, create, inspect, clone, update, refresh, set, and unset one workspace.
4. Confirm before `work end` and workspace deletion, then verify cleanup.

Reuse the same work item, repositories, issue, and workspace across assertions
to minimize external API calls. Use dry-run or mocked mutation tests where the
provider supports them and delete only disposable test resources.

## Coverage and execution checklist

Before the run:

- [ ] Confirm disposable branches, repositories, accounts, work items, and
      workspaces are clearly identified.
- [ ] Record current branch, HEAD, worktree state, session, provider, and token
      balance.
- [ ] Confirm which 14 commands are expected to call AI.
- [ ] Ensure every other case uses saved output, fallback, mocks, or preflight
      validation and fails the test if an unexpected provider call occurs.

During the run:

- [ ] Parse JSON rather than human output wherever results drive assertions.
- [ ] Capture stderr independently for warnings, progress, and structured errors.
- [ ] Require approval at every documented mutation boundary.
- [ ] After compose mutations, capture commit SHAs, stash recovery fields, and
      `undoId`.
- [ ] After resolve mutations, inspect applied paths, remaining paths, complete
      status, warnings, index state, and `git status`.
- [ ] Do not continue a conflict operation, push rewritten history, end work, or
      delete a workspace as an implicit part of another case.

After the run:

- [ ] Verify the final AI request count is at most 14, excluding an explicitly
      approved release-only MCP parity run.
- [ ] Undo or delete only disposable artifacts created by the suite.
- [ ] Restore provider and session selection.
- [ ] Verify no secrets or private plan contents entered logs.
- [ ] Report live coverage, mocked/fixture coverage, skipped interactive checks,
      warnings, recovery artifacts, and any remaining validation gap separately.
