## gk ai compose plan

Generate a compose plan without applying it

### Synopsis


Generate a commit plan without applying it. Read-only: nothing in the
repository is modified.

By default, plan reads all staged, unstaged and untracked working-tree changes
and plans commits for the current HEAD. Its normal output is a human summary:
one line per proposed commit with its subject, file count and line counts. Use
--output json when a program needs the complete plan on stdout.

Costs AI tokens.

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
  or replayed through apply-plan. Use --output json when you need the complete
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

SAVING AND APPLYING A PLAN

Save the complete plan with --plan-file so a user can review it and you can
apply that exact plan later without paying to re-plan:

  gk ai compose plan --workdir /path/to/repo --plan-file /tmp/plan.json
  gk ai compose apply-plan /tmp/plan.json --workdir /path/to/repo

With --plan-file, stdout still receives the human summary and the full JSON is
written to the file with 0600 permissions. That file holds the same object
that --output json prints: {plan, source, snapshot, composeSource?,
composeTarget?}. Read plan.allOrderedCommits[].message for the proposed commit
messages and map each commit's .hunkIndices into source.hunks[] to report the
files and line counts it covers.

Pick one or the other: --plan-file cannot be combined with an explicitly
requested --output json (or --json), because the file would already contain
it. A session-wide GK_OUTPUT=json is not a conflict — the plan is written to
the file and printed on stdout. --plan-file also cannot be combined with
--include or --exclude.

Repository context is not embedded as an absolute path in the saved plan. Run
plan and apply-plan inside the same repository, or pass the identical
--workdir to both commands. Workdir sources and commit ranges that include
workdir layers require HEAD to match the saved snapshot. Branch sources and
commit ranges without workdir layers instead validate the saved source branch
and diff, so an unrelated checked-out branch may move without invalidating the
plan. Source or content drift is always rejected.

FILTERED PLAN LIMITATION

--include and --exclude work for a read-only preview, but filtered plans cannot
use the saved-plan workflow. To capture the complete filtered result, write
JSON stdout to a file:

  gk ai compose plan --include 'src/**/*.ts' --output json > /tmp/filtered-preview.json

That file is for inspection only; do not pass it to apply-plan. To apply the
same file selection, run apply with the same --include/--exclude flags after
the user approves a mutating command. apply calls AI again, so the resulting
grouping may differ from the preview.


```
gk ai compose plan [flags]
```

### Examples

```

  gk ai compose plan                                      # summarize a read-only plan
  gk ai compose plan --direction area                     # group by subsystem
  gk ai compose plan --direction custom --instructions "keep migrations separate"
  gk ai compose plan --plan-file /tmp/plan.json           # save the full plan
  gk ai compose plan --output json                         # full plan on stdout
  gk ai compose plan --include 'src/**' --output json      # complete filtered preview

```

### Options

```
      --branch-splitting string         With --target auto, branch count bias: conservative (fewer), balanced, aggressive (more)
      --commit-granularity string       Commit size bias: consolidated (fewer/larger), balanced, granular (more/smaller)
      --depth string                    AI analysis depth: quick (lightest), balanced (default), deep (most thorough)
      --direction string                How AI groups work: auto (infer), area (subsystem), type (change type), custom (requires --instructions) (default "auto")
      --exclude strings                 Glob of files to exclude, matched against the full path (repeatable). Same syntax as --include: *, **, ?; no {a,b} or [abc] groups. With plan, use --output json for the complete filtered result.
  -h, --help                            help for plan
      --include strings                 Glob of files to include, matched against the full path (repeatable). Supports * (single path segment), ** (any number of segments, e.g. src/**/*.ts), and ? (single char). Brace {a,b} and bracket [abc] groups are not supported. With plan, use --output json for the complete filtered result.
      --instructions string             Additional AI grouping guidance; appended to area/type, or used without a preset for auto/custom
      --merge-target string             Start of the branch-source commit range (default: main)
      --no-untracked                    With workdir source, exclude untracked files
      --partition-splitting string      With --target auto, stacked sub-branch count bias: conservative (fewer), balanced, aggressive (more)
      --plan-file string                Write the full plan JSON to this path (plan only; cannot be combined with explicitly requested JSON output, --include, or --exclude)
      --preserve-original               Keep the original WIP/source branch when --target branch or auto creates output branches (default true)
      --range-from string               First commit in a range source, inclusive
      --range-include-workdir strings   For range source, include workdir changes: all, staged, unstaged, untracked (repeatable or comma-separated); layers you don't name are excluded and come back as unstaged changes
      --range-to string                 Last commit in a range source, inclusive
      --source string                   Changes to analyze: workdir, branch, range (default: workdir)
      --source-branch string            Branch containing commits for branch/range sources
      --staged-only                     With workdir source, exclude unstaged and untracked changes
      --target string                   Where commits would go: head, branch, auto, rewrite-range (default: head for workdir, auto otherwise)
      --target-branch string            Output branch for --target branch
```

### Options inherited from parent commands

```
      --no-telemetry     Disable telemetry (OTel spans, Sentry) for this invocation
      --output string    Output format: text or json (default "text")
      --session string   (Optional) Isolate auth and cache under a named session
      --workdir string   Path to the git repository to operate on (default: current directory)
```

### SEE ALSO

* [gk ai compose](gk_ai_compose.md)	 - Plan and create clean, atomic commits from your working tree changes using AI

###### Auto generated by spf13/cobra on 31-Aug-2026
