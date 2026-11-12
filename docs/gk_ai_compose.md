## gk ai compose

Plan and create clean, atomic commits from your working tree changes using AI

### Synopsis


Turn working-tree changes into clean, atomic commits — planned by AI or by you (the calling agent).

Compose reads your changes at the hunk level — a single file's edits can be
split across several commits — asks AI to group them into a sequence of atomic
commits, and can then apply that grouping as real commits. Two artifacts
matter: the PLAN (JSON describing the proposed commits) and the UNDO ID
(returned by every mutating operation, and the way back).

WHICH WORKFLOW?

  - You (the agent) wrote or understand the changes: prefer the agent-authored
    flow (collect -> commit). You know the intent, it is deterministic, and it
    spends no AI credits.
  - You want AI to propose the grouping (e.g. a large unfamiliar change set),
    or the source is a branch or range: use plan / apply-plan. The agent flow
    covers working-tree changes onto HEAD only.

WORKFLOW (use this whenever a human is reviewing)

  1. gk ai compose plan --workdir /path/to/repo --plan-file plan.json
     Read-only. Nothing in the repository changes. Do not add --json
     here: plan.json already holds that JSON, and asking for both is
     rejected. A session-wide GK_OUTPUT=json does not conflict — the plan is
     written to the file and printed on stdout.
  2. Read plan.json and summarize it for the user: one line per proposed
     commit with its subject, how many files it touches, and its +added and
     -removed line counts. Do not paste the raw JSON at them.
  3. Not what they wanted? Re-run step 1 with --direction or --instructions.
  4. gk ai compose apply-plan plan.json --workdir /path/to/repo --json
     Applies exactly the plan that was reviewed. Spends no AI tokens.
  5. Record undoId from the output and tell the user how to reverse it:
     gk ai compose undo <undo-id>

Never run "gk ai compose apply" when the user asked to see what compose would
do. apply re-plans and applies in one step, so nothing is ever reviewed.

AGENT-AUTHORED WORKFLOW (no AI model, no AI credits)

  When you, the calling agent, will write the commit plan yourself:

  1. gk ai compose collect --json --workdir /path/to/repo
     Read-only. Returns based_on (a token bound to these exact changes), the
     changed hunks grouped by file with their indices, and authoring
     instructions.
  2. Only for changes you did not write: gk ai compose read --based-on <token>
     --hunks 0,1 (or --file path) --workdir /path/to/repo shows the patch
     bodies.
  3. Show the user the commit plan you drafted, unless they already asked for
     these commits.
  4. gk ai compose commit --based-on <token> --input-json - --workdir /path/to/repo
     (plan on stdin)
     with {"commits":[{"message":"...","hunkIndices":[0,1],"explanation":"..."}]}.
     message is the full commit message (subject, then a blank line and an
     optional body; use \n in JSON). explanation is an optional note about the
     grouping and is NOT written to the commit. Every collected hunk must be in exactly one commit; commits are created in
     the order given. Add --dry-run to validate the plan and see the layout
     without committing. If the files changed since collect, it fails with
     details.reason "stale_collection" and changes nothing: re-run collect.
  5. Record undo_id and tell the user how to reverse it:
     gk ai compose undo <undo-id> --workdir /path/to/repo

  This "commit" applies a plan YOU wrote. It is not "gk ai commit" (one
  AI-generated message for one commit) and not "gk ai compose apply" (AI plans and
  applies). Failures use the usual error envelope: error.code is
  invalid_request and error.details.reason is the specific cause
  (stale_collection, invalid_plan, signing_failed, timed_out).

SUB-COMMANDS

  plan               Generate a commit plan.                Mutates repo: no
  apply              Plan and apply in one step.            Mutates repo: YES
  apply-plan <file>  Apply a previously-saved plan.         Mutates repo: YES
  collect            Index changed hunks, get a token.      Mutates repo: no
  read               Show patch bodies of collected hunks.  Mutates repo: no
  commit             Apply a plan you authored (no AI).     Mutates repo: YES
  split plan         Preview a branch split.                Mutates repo: no
  split              Split a branch into stacked branches.  Mutates repo: YES
  undo <undo-id>     Reverse a previous apply, commit or split.  Mutates repo: YES
  undo --list        List undo ids in this repository.      Mutates repo: no
  undo --check <id>  Report whether undo can run safely.    Mutates repo: no

SAFETY

  - apply and apply-plan rewrite your working tree into commits; split
    rewrites branch history and may require a force-push afterwards. split
    plan is read-only, but its result is advisory: a later split re-runs AI.
  - A plan is bound to the exact changes it was built from. If the working
    tree moves between plan and apply, apply-plan refuses rather than commit
    the wrong content; the error says "changed since the AI analysis".
  - Run "gk ai compose undo --check <undo-id>" before undo when the repo is dirty.
  - "undo --force-dirty-workdir" can discard uncommitted changes. Ask first.

READING A PLAN

  plan.allOrderedCommits[]  Proposed commits in order. .message is the commit
                            message; .hunkIndices indexes into source.hunks.
  source.hunks[]            .fileName, .additions, .deletions for each hunk.
  plan.branches[]           Present when the plan spans multiple branches.

  To describe commit N: take its hunkIndices, look those hunks up in
  source.hunks, then report the distinct fileName count and the summed
  additions/deletions.

GROUPING DIRECTION

  --direction controls AI grouping. It does not select which changes are read
  or where the result goes; use --source, --target, --include and --exclude
  for that.

  --direction auto    Let the AI infer the most natural grouping. This adds no
                      preset instruction. If --instructions is supplied, that
                      text is the only extra grouping guidance. (default)
  --direction area    Sends "Group commits by area / subsystem of the codebase."
  --direction type    Sends "Group commits by conventional commit type (feat,
                      fix, refactor, test, docs, etc.)."
  --direction custom  Use --instructions as the grouping guidance and require
                      it to be non-empty.

  With area or type, --instructions is appended to the preset, so it can add
  constraints without replacing the selected direction. "auto with
  --instructions" and "custom with --instructions" send the same free-form
  guidance; custom is useful when an empty instruction should be an error.

CHANGE SELECTION

  The default workdir source includes staged, unstaged and untracked changes.
  Use --staged-only to exclude unstaged and untracked changes, or
  --no-untracked to include tracked changes only.

  --include / --exclude  Globs matched against the full path, repeatable.
                         Excludes win when a path matches both lists.
                         Supports * (one path segment), ** (any number of
                         segments, e.g. src/**/*.ts), and ? (one character).
                         Brace {a,b} and bracket [abc] groups are NOT supported.

  On plan, filters are preview-only: they cannot be combined with --plan-file
  or replayed through apply-plan. Use --json when you need the complete
  filtered plan. To apply the same selection, run apply with the same filters;
  apply performs fresh AI analysis, so its grouping may differ.

SOURCES AND TARGETS

  Source selects the changes to analyze:

  --source workdir  Staged, unstaged and untracked changes. This is the
                    default and needs no other source flags.
  --source branch   Commits on --source-branch since --merge-target. The
                    merge target defaults to main.
  --source range    The inclusive --range-from..--range-to commits on
                    --source-branch. --range-include-workdir folds in
                    working-tree changes: all, staged, unstaged or
                    untracked. A layer you do not name is left out of the
                    compose and restored afterwards as unstaged changes.
                    Worktree layers require the source branch to be checked
                    out and --range-to to resolve to that branch's tip.

  Target selects where the proposed commits would be written and affects the
  shape of the plan:

  --target head           Use the current HEAD. Only valid with workdir and
                          the default for that source.
  --target branch         Use --target-branch as the output branch.
  --target auto           Let the AI choose a branch/stack layout. This is the
                          default for branch and range sources.
  --target rewrite-range  Replace the selected source commits in place when
                          applied. Only valid with branch or range sources.
  --preserve-original     With branch/auto targets, keep the original WIP or
                          source branch. Defaults to true.

PLANNING CONTROLS

  --depth quick|balanced|deep
      Trades speed and token use for analysis depth. quick is the lightest,
      balanced is the default, and deep uses the most thorough pipeline.
  --commit-granularity consolidated|balanced|granular
      Biases toward fewer/larger, balanced, or more/smaller atomic commits.
  --branch-splitting conservative|balanced|aggressive
      With --target auto, biases toward fewer or more independent branches.
  --partition-splitting conservative|balanced|aggressive
      With --target auto, biases toward fewer or more stacked sub-branches
      inside each planned branch.

MODEL SELECTION

  --model <id> selects a model for this invocation only; it does not change
  saved provider settings. Without it, Compose uses the active provider's
  configured model, or the GitKraken backend default when no override is set.

  Run "gk ai provider show" to inspect the active provider and configured
  model. For GitKraken-hosted AI, "gk ai models" lists available ids and marks
  the backend default with *. With the GitKraken provider, --model "" bypasses
  a saved global override once and uses the backend default.

  plan, apply, split plan and split accept --model because they call AI.
  apply-plan and undo make no AI request and do not accept it. A later split
  re-runs AI, so repeat the same --model used for split plan when consistency
  matters.

COST AND PROVIDER

  Compose uses GitKraken AI by default and consumes your GitKraken AI tokens.
  If you have selected a BYOK provider with gk ai provider use, compose uses
  that provider's configured API key and model instead. "gk ai tokens" shows
  the remaining GitKraken AI balance.

  plan, apply, split plan and split call the model. apply-plan and undo spend
  no tokens — prefer re-applying a saved commit plan over re-planning.

JSON OUTPUT

  Add --json to any sub-command. The top-level keys you will use —
  results also carry diagnostic fields (token usage, per-phase timings) not
  listed here:

    plan               {plan, source, snapshot, composeSource?, composeTarget?}
    apply, apply-plan  {commitShas, undoId, partitions?,
                        partitionGroups?, stashConflict?, stashNotRestored?}
    split plan         {plan, partitions, source}
    split              {partitions, undoId?}
    collect            {based_on, files[{path, hunks[{index, header, additions,
                        deletions}], binary, renamed_from?}], instructions,
                        diff_stats, hunks_filtered_count, next}
    read               {hunks[{index, file, header, content, binary}],
                        truncated, omitted_indices}
    commit             {commits[{id, sha, subject}], undo_id, signed, undo_hint,
                        warnings?}
    commit --dry-run   {dry_run, commits[{id, message, hunkIndices, files}]}
    undo --check       {safe, blockers, warnings}
    undo --list        ["<undo-id>", ...]

  collect, read and commit mostly use snake_case keys, unlike the AI commands
  above; hunkIndices keeps the casing of the --input-json plan. Copy key names
  exactly as listed.
  split omits undoId when the analysis produced a single partition: there was
  nothing to split and the branch was left alone. apply reports stashConflict
  or stashNotRestored when the commits landed but the pre-apply safety stash
  could not be put back; the stash entry is kept so that work is recoverable.
  apply and apply-plan report partitions only on the --target auto paths.
  --target head (the default for a working-tree source), --target branch and
  --target rewrite-range return {commitShas, mutations, stashConflict?,
  stashNotRestored?} with no partitions key — that is an ordinary result, not
  a malformed one, and there is no branch layout to read from it.

  When partitions is present, compare the generated branch refs with
  partitions[].branchName. Under plan.branches[], partitioning.partitions[]
  names the refs only when the group holds more than one partition; a group
  with a single partition is created under branchGroup.name. branchGroup.name
  is a logical AI grouping label and may differ from the generated branch ref.

  partitionGroups groups partitions[] by stack, root first. apply and
  apply-plan report it only when the plan spanned more than one branch group;
  without it, partitions[] came from a single group and is one stack. plan
  reports no top-level partitions at all — read its layout from
  plan.branches[].partitioning.partitions[]. split always produces one stack.

  "plan --plan-file <path>" writes that same object to <path> with 0600
  permissions. apply-plan accepts either that shape or an {"applyPlan": {...}}
  wrapper.

WHEN IT FAILS

  "no changes found"
      Nothing to compose. Check --staged-only, --include and --exclude.
  "changed since the AI analysis"
      The working tree moved after planning. Re-plan; do not retry the same
      plan file.
  "saved plan was created at HEAD ... but the selected repository is at HEAD ..."
      apply-plan is pointed at a different repository or history moved. Repeat
      the planning command's --workdir, or re-plan on the new HEAD.
  a dirty working tree blocking undo
      Commit or stash first, or run undo --check to see the blockers.
  a detached HEAD
      split needs an explicit --branch.
  --plan-file rejected
      It cannot be combined with an explicit --json, --include or
      --exclude. Drop the flag you don't need, or pass --json=false.
  "--plan-file directory is not usable" / "is an existing directory" /
  "name ... is not valid on Windows"
      The destination is checked before any planning starts, so this costs
      no model calls. Point --plan-file at a file inside a directory that
      already exists and use a filename valid on the current platform;
      neither compose nor the writer creates parents.
  a range compose refusing to exclude the staged layer
      "--range-include-workdir unstaged" leaves staged changes out, but
      unstaged changes are diffed against the index and presuppose them.
      Add staged to the list, or commit/stash it first.


```
gk ai compose [flags]
```

### Examples

```

  gk ai compose plan --plan-file plan.json              # review first (read-only)
  gk ai compose apply-plan plan.json                    # apply the reviewed plan
  gk ai compose undo --list                             # find a previous run
  gk ai compose undo <undo-id>                          # reverse it
  gk ai compose plan --json                      # plan straight to stdout
  gk ai compose plan --direction area                   # group by subsystem
  gk ai compose plan --model <model-id>                 # one-call model override
  gk ai compose plan --direction custom --instructions "keep the API rename separate"
  gk ai compose plan --include 'src/**/*.ts' --exclude '**/*.test.ts' --json
  gk ai compose apply                                   # plan and apply, no review
  gk ai compose split plan --branch feature/auth --base-branch main
  gk ai compose split --branch feature/auth --base-branch main

```

### Options

```
  -h, --help             help for compose
      --workdir string   Path to the git repository to operate on (default: current directory)
```

### Options inherited from parent commands

```
      --json             Emit machine-readable JSON on stdout (GK_OUTPUT=json sets it session-wide)
      --no-telemetry     Disable telemetry (OTel spans, Sentry) for this invocation
      --session string   (Optional) Isolate auth and cache under a named session
```

### SEE ALSO

* [gk ai](gk_ai.md)	 - Use AI in the CLI
* [gk ai compose apply](gk_ai_compose_apply.md)	 - Plan and apply commits
* [gk ai compose apply-plan](gk_ai_compose_apply-plan.md)	 - Apply a previously-saved plan JSON
* [gk ai compose collect](gk_ai_compose_collect.md)	 - Index changed hunks for an agent-authored commit plan (no AI)
* [gk ai compose commit](gk_ai_compose_commit.md)	 - Create commits from a plan you authored over collected hunks (no AI)
* [gk ai compose plan](gk_ai_compose_plan.md)	 - Generate a compose plan without applying it
* [gk ai compose read](gk_ai_compose_read.md)	 - Show the patch bodies of collected hunks (no AI)
* [gk ai compose split](gk_ai_compose_split.md)	 - Split a multi-commit branch into stacked branches
* [gk ai compose undo](gk_ai_compose_undo.md)	 - Undo a previous compose operation

###### Auto generated by spf13/cobra on 12-Nov-2026
