## gk ai resolve

Plan, review, and stage AI conflict resolutions

### Synopsis

Resolve conflicted files with the same conflict-tools engine used by the
GitKraken MCP Resolve app. This command is designed for agents: first create a
read-only plan, review every result, refine weak proposals, then apply that exact
saved plan.

SAFE WORKFLOW

refine-plan and apply-plan both take a saved plan path, so step 1 must write
one. --plan-file cannot be combined with an explicit --output json on the same
command: pick the file here and read it back, or redirect stdout yourself. An
ambient GK_OUTPUT=json is fine — the plan is written to the file and still
printed on stdout.

  1. Save a plan:
       gk ai resolve plan --plan-file /tmp/resolve-plan.json
     (Equivalent: gk ai resolve plan --output json > /tmp/resolve-plan.json)
  2. Read /tmp/resolve-plan.json and inspect every results[] entry: state,
     confidence, reasoning, diff, and resolution.
  3. Refine one inadequate proposal:
       gk ai resolve refine-plan /tmp/resolve-plan.json \
         --file src/example.ts --instructions "preserve both validation paths" \
         --plan-file /tmp/resolve-plan-v2.json
  4. Apply only the reviewed bytes:
       gk ai resolve apply-plan /tmp/resolve-plan-v2.json --output json
  5. Inspect allConflictsResolved and remainingPaths, then run git status.

COMMANDS AND MUTATIONS

  plan                     AI: YES  Mutates repository: NO
  refine-plan <plan>       AI: YES  Mutates repository: NO
  apply                    AI: YES  Mutates repository: YES (writes + stages)
  apply-plan <plan>        AI: NO   Mutates repository: YES (writes + stages)

The bare command never applies resolutions: it prints this help and exits
non-zero, so an old bare "gk ai resolve" invocation fails loudly instead of looking
like a completed resolve. Resolve never continues or aborts a
merge/rebase/cherry-pick/revert, never commits, and never pushes. It only
writes selected resolutions and stages those paths.

PLAN CONTRACT

JSON plans are schemaVersion 1 objects with snapshot, conflicts, results, and
summary. The snapshot binds the proposal to repositoryRoot, headSha, the
incoming operation ref/SHA, stage-1/2/3 index OIDs, file existence, and a
working-tree SHA-256 digest. apply-plan validates every resolved file before
the first write. Drift rejects the whole apply and tells you to re-plan.
Operation type describes Git's durable state, not necessarily the initiating
command: a merge-style pull is merge/MERGE_HEAD and a rebase-style pull is
rebase/REBASE_HEAD. Git leaves no separate durable pull marker.

Each result has path, code, state (resolved|skipped|error), strategy
(ai|take-ours|take-theirs|deleted|skipped), confidence, reasoning, attempt,
diff, and the exact resolution payload. Per-file AI failures do not discard
successful proposals for other files. A no-conflict plan is a successful no-op
and does not call AI. Interrupting planning stops the process immediately: no
plan is written, not even a partial one, so re-run plan from the start.

APPLY CONTRACT

JSON apply output has appliedPaths, remainingPaths, allConflictsResolved, and
warnings. Partial application is structurally successful: always inspect
allConflictsResolved. Skipped/error results and unselected conflicts remain
untouched, and each one is reported in warnings with the reason it was not
applied — under apply, that is the only place a per-file AI or provider
capability failure appears, because no plan is saved. A staging failure is
also reported in warnings and may leave a written, unstaged file that git
status will expose. If apply itself fails after planning — drift, for instance —
it exits non-zero and prints the plan (not an apply result) on stdout so the AI
work is not lost: save that document and re-run apply-plan once the cause is
fixed.

ERRORS

Failures exit non-zero and, under --output json, write a single
{"error":{code,message,retryable}} object to stderr. code is invalid_request
for anything the caller can fix: a bad --fallback, --workdir together with
--path, --plan-file with an explicit --output json, a --plan-file directory that
does not exist, a missing, malformed, or wrong-schemaVersion plan file, and
engine failures such as plan drift, a --file that is not currently conflicted, a
missing repository, or an unavailable provider. code internal means a CLI bug.
Read message either way, and re-run plan whenever it reports drift.

SELECTION AND FALLBACK

--file is repeatable and accepts an exact repository-relative path, including
spaces and Unicode. --fallback ours|theirs normally runs after AI resolution
fails. For plan and apply, if no AI provider can be initialized, fallback
instead resolves every selected file directly from the Git stages without
calling a model; each such result has strategy take-ours or take-theirs.
Pass --fallback-only with --fallback on plan or apply to skip provider
initialization deliberately and take the selected Git stage deterministically.
refine-plan still requires a provider to initialize, and never falls back over
a reviewed answer: if the model call fails mid-flight, the previous resolution
is kept with the failure in its reasoning rather than replaced by a stage take
that ignored --instructions. "ours" is Git index stage 2 / HEAD and "theirs" is
stage 3 / the incoming side. During rebase, Git's ours/theirs labels are
counterintuitive: ours is the branch being rebased onto and theirs is the commit
currently being replayed. Review fallback diffs carefully.

OUTPUT, SECURITY, PROVIDERS, AND TOKENS

Use global --output json for a single machine-readable document on stdout;
progress and guidance stay on stderr. --plan-file writes the same complete plan
atomically, 0600 on POSIX; on Windows the file inherits the directory's ACLs,
so choose a directory only you can read. It cannot be combined with an explicit
--output json. Saved plans can contain proprietary source and conflict context;
protect and delete them when no longer needed.

Planning/refinement uses the provider selected by gk ai provider. With no BYOK
provider, GitKraken AI is used and consumes the account's AI token budget.
Resolve models must support tool calling because conflict-tools may inspect Git
context with grep, show, blame, diff, or log before answering. AI resolution
failures can use --fallback; provider initialization failures can do so only in
plan and apply. --max-steps bounds the model tool-calling loop per file (default
15); lower it to cap work on a large merge. apply-plan makes no AI request and
consumes no tokens.

The hidden -p/--path flag is a deprecated alias for --workdir for one release.
Do not pass both. Unknown flags are errors.

```
gk ai resolve [flags]
```

### Options

```
  -h, --help             help for resolve
      --workdir string   Path to the git repository to operate on (default: current directory)
```

### Options inherited from parent commands

```
      --no-telemetry     Disable telemetry (OTel spans, Sentry) for this invocation
      --output string    Output format: text or json (default "text")
      --session string   (Optional) Isolate auth and cache under a named session
```

### SEE ALSO

* [gk ai](gk_ai.md)	 - Use AI in the CLI
* [gk ai resolve apply](gk_ai_resolve_apply.md)	 - Generate, write, and stage fresh resolutions
* [gk ai resolve apply-plan](gk_ai_resolve_apply-plan.md)	 - Apply exact reviewed resolutions without AI
* [gk ai resolve plan](gk_ai_resolve_plan.md)	 - Generate a reviewable resolution plan
* [gk ai resolve refine-plan](gk_ai_resolve_refine-plan.md)	 - Re-resolve one planned file with new guidance

###### Auto generated by spf13/cobra on 31-Aug-2026
