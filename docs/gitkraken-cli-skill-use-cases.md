# GitKraken CLI agent skill use cases

This catalog describes the intended activation and user-facing use cases for
the three agent skills bundled with the GitKraken CLI. It complements the
procedural contracts in each `SKILL.md`; live command help remains authoritative
for flags and current behavior.

## Routing summary

| User need | Skill |
| --- | --- |
| Organize multiple logical changes or rewrite commit structure | `gitkraken-commit-composer` |
| Repair conflicted files in an active git operation | `gitkraken-resolve` |
| Use ordinary git or another GitKraken CLI feature | `gitkraken-cli` |

## `gitkraken-commit-composer`

Use this skill when the outcome is an intentionally structured commit history,
not merely one message for one cohesive change.

### Working-tree composition

1. Turn a mixed working tree into clean atomic commits.
2. Produce a read-only proposal before creating commits.
3. Organize changes accumulated over a long agent task or several turns.
4. Separate unrelated changes across files or subsystems.
5. Put different logical hunks from the same file into different commits.
6. Compose staged, unstaged, and untracked changes together.
7. Restrict composition to staged changes.
8. Exclude untracked files from analysis.
9. Preview only selected directories or path patterns.
10. Exclude tests, generated files, documentation, or other paths from a preview.
11. Decide whether a change set should remain one commit or become several.
12. Generate subjects and descriptions for every proposed commit.
13. Review and adjust commit order before mutation.
14. Apply exactly a saved, reviewed plan without another model call.
15. Re-plan and apply immediately only when the user explicitly authorizes it.

### Grouping strategies

16. Infer grouping automatically from change intent.
17. Group by subsystem or product area.
18. Group by conventional-commit type such as feature, fix, test, or docs.
19. Follow custom natural-language grouping instructions.
20. Add repository-specific instructions to the area or type presets.
21. Consolidate related work into fewer commits.
22. Produce granular commits for reviewability and selective reverts.
23. Choose quick, balanced, or deep analysis based on cost and complexity.

### Existing history and target layouts

24. Reorganize commits already present on a feature branch.
25. Recompose all branch commits since a merge target.
26. Recompose an explicit inclusive commit range.
27. Fold selected working-tree layers into a range composition.
28. Rewrite a source range in place.
29. Write recomposed commits to another branch.
30. Let AI propose a branch or stack layout.
31. Preserve the original WIP or source branch as a recovery point.
32. Tune commit, branch, and partition granularity.

### Stacked branches

33. Preview how a multi-commit branch could be divided into a PR stack.
34. Split an existing branch into stacked branches.
35. Choose conservative, balanced, or aggressive branch boundaries.
36. Explicitly identify the branch when HEAD is detached.
37. Recognize a one-partition result as "no split needed," not a failure.
38. Explain that split previews are advisory because execution invokes AI again.

### Recovery and safety

39. List earlier compose operations that can be undone.
40. Check whether an undo is safe before mutating history.
41. Undo generated commits or branch splits.
42. Diagnose undo blockers caused by later commits or a dirty working tree.
43. Recover when commits land but a safety stash cannot be restored.
44. Re-plan when the worktree or source history drifts after analysis.
45. Surface every mutation's `undoId` and exact undo command.
46. Distinguish an inspection-only filtered preview from an exactly replayable plan.

For one cohesive staged change that only needs a commit message, use
`gitkraken-cli` with `gk ai commit` instead.

## `gitkraken-resolve`

Use this skill whenever conflicted files exist, regardless of whether conflict
resolution was the original task or the agent encountered the conflict while
performing another operation.

### Conflict sources and planning

1. Resolve conflicts from a merge.
2. Resolve conflicts encountered during a rebase.
3. Resolve conflicts caused by pull.
4. Resolve conflicts from cherry-pick.
5. Resolve conflicts from revert.
6. Resolve conflicts from stash pop or stash application.
7. Produce a read-only resolution plan for every conflicted file.
8. Plan resolutions for selected conflicted files only.
9. Inspect each proposal's state, confidence, reasoning, diff, and resolution.
10. Return a successful no-op without calling AI when no conflicts exist.
11. Operate on a repository outside the current directory.

### Guided resolution

12. Ask AI to preserve compatible behavior from both sides.
13. Provide feature- or repository-specific resolution instructions.
14. Refine one weak or incorrect file proposal.
15. Preserve accepted results while refining another file.
16. Limit model investigation steps for a large conflict set.
17. Let the engine inspect history, blame, diffs, and surrounding code.
18. Use GitKraken-hosted AI or a tool-calling BYOK provider.
19. Run the equivalent workflow through the MCP `git_resolve` tool.

### Applying and verifying

20. Apply exactly the bytes in a reviewed plan without another AI call.
21. Apply newly generated resolutions immediately only when explicitly authorized.
22. Write and stage successfully resolved files.
23. Reject a stale plan before any write when repository state has drifted.
24. Re-plan after HEAD, operation, index-stage, or file-content drift.
25. Verify `allConflictsResolved`, `remainingPaths`, and `warnings` after apply.
26. Report partial success without claiming the git operation is finished.
27. Detect a file that was written but could not be staged.

### Fallback and degraded operation

28. Take `ours` when AI fails and that fallback was requested.
29. Take `theirs` when AI fails and that fallback was requested.
30. Resolve from git stages when no AI provider can initialize.
31. Explain the reversed intuition of `ours` and `theirs` during rebase.
32. Keep successful proposals when another file fails.
33. Re-run planning from the start after an interruption, because the CLI
    writes no plan at all, not even a partial one.

### Workflow boundaries and privacy

34. Stop after writing and staging resolutions.
35. Require separate authorization to continue or abort merge, rebase,
    cherry-pick, or revert.
36. Require separate authorization to commit or push.
37. Keep saved plans private because they can contain proprietary source.
38. Remove temporary plan files after the workflow finishes.
39. Diagnose failures from the error message when the error code is broad.

## `gitkraken-cli`

Use this skill for ordinary git and all GitKraken CLI platform workflows that
do not require the dedicated composer or resolve contracts.

### Everyday git and diagnostics

1. Use `gk` as a drop-in replacement for status, log, diff, add, commit,
   branch, merge, rebase, and other git commands.
2. Diagnose a mistyped `gk` command that falls through to git.
3. View the commit graph in the terminal.
4. Open the graph in GitKraken Desktop or GitLens.
5. Install the GitKraken CLI through npm.
6. Inspect system configuration with `gk setup`.
7. Diagnose installation, shell, authentication, or provider problems.
8. Read live help before selecting flags.
9. Configure Claude permission rules for repeated `gk` invocations.

### Authentication and sessions

10. Log in through the browser or non-interactively with a token.
11. Log out.
12. Identify the current user, organization, and connected providers.
13. Isolate auth and cache in a named test session.
14. Test configuration without disturbing the primary login.

### Git and issue providers

15. List, add, update, remove, or choose provider connections.
16. Connect GitHub, GitHub Enterprise, GitLab, Bitbucket, Azure, Jira,
    Linear, or Trello.
17. Select default and primary providers when several accounts exist.
18. Discover organizations, projects, and repositories visible to a token.
19. Resolve a remote URL to its canonical provider repository.
20. Diagnose why a checkout is using the wrong connection.

### AI providers and lightweight AI tasks

21. Inspect the active AI provider and available configurations.
22. Configure OpenAI, Anthropic, OpenRouter, or Ollama.
23. Use a custom provider base URL or local model.
24. Change models, switch providers, or remove provider configuration.
25. Switch back to GitKraken-hosted AI.
26. Inspect hosted-model options and token balance.
27. Diagnose resolve incompatibility with a model lacking tool calling.
28. Generate a message or description for one cohesive staged commit.
29. Explain a commit or branch.
30. Generate a changelog between commits or branches.
31. Generate a pull-request title and description.

### MCP and agent integrations

32. Start the MCP server normally or in read-only mode.
33. List MCP tools and their parameters.
34. Print MCP configuration for manual client setup.
35. Discover, install, or uninstall supported MCP client integrations.
36. Install integrations for selected, all, or CLI-only clients.
37. Diagnose availability of status, graph, PR, issue, composer, or resolve tools.
38. Detect supported coding agents and hook installation status.
39. List which agents have the bundled GitKraken skills installed, and install
    them for a supported agent.
40. Preview exact skill install paths and actions without writing. The preview
    reports the same refusal as the install when a skill exists with different
    contents, so it fails until `--force` is explicitly requested.
41. Install or uninstall GitKraken hooks for supported agents.
42. List, inspect, archive, or remove captured agent sessions.

### Work, PRs, issues, and workspaces

43. Answer "what am I working on?"
44. Start, select, inspect, expand, or end a work item.
45. Associate branches across several repositories with one task.
46. Commit, push, or create PRs across an active multi-repository work item.
47. List PRs or issues assigned to the current user.
48. Show an issue and assign it to a user.
49. List, inspect, create, clone, update, refresh, select, or unset a workspace.
50. Delete a workspace only after explicit confirmation.

### Automation and scripting

51. Request stable JSON rather than parsing human text.
52. Use session-wide JSON output through `GK_OUTPUT`.
53. Keep machine-readable stdout separate from warnings and progress on stderr.
54. Handle permanent and retryable failures from the JSON error contract.
55. Select list fields to reduce output and token usage.
56. Disable telemetry for an invocation or environment.

## Cross-skill boundaries

- Route one cohesive staged change to `gitkraken-cli` and `gk ai commit`.
- Route multiple logical changes, commit-history reorganization, and stacked
  branch splitting to `gitkraken-commit-composer`.
- Route any repository with conflicted files to `gitkraken-resolve`, even when the
  conflict arose during another task.
- Treat planning as read-only. Require explicit authorization for commit
  creation, history rewrites, resolution application, continuation of a git
  operation, destructive cleanup, and pushes as required by the relevant skill.
