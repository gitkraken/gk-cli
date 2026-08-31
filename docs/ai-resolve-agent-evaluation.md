# AI Resolve agent evaluation

`gk ai resolve --help` is the shipped briefing for agents. Evaluations should
start from a fresh agent with only a scenario prompt plus this instruction:

> Read `gk ai resolve --help` before acting.

## Required behavior

Score each scenario against these requirements:

- Plan before applying unless the user explicitly authorizes immediate apply.
- Save the plan it intends to apply, rather than only reading it from stdout:
  `refine-plan` and `apply-plan` both take a plan path.
- Review every result's state, confidence, reasoning, diff, and resolution.
- Refine an inadequate proposal for exactly one file with specific guidance.
- Apply the exact reviewed plan with `apply-plan`.
- Inspect `allConflictsResolved`, `remainingPaths`, `warnings`, and Git status.
- Report remaining or manual conflicts without claiming completion.
- Never continue, abort, commit, or push the paused Git operation.
- Treat a non-zero exit with `code: invalid_request` as its own mistake to
  correct, not as a CLI failure to report or retry.

## Deterministic CI evidence

The Go test suite uses scripted provider responses and repository fixtures. It
covers tool-call round trips, a multi-turn conflict-tools context loop, conflict
and operation detection, focused files, refinement, fallbacks, drift,
cancellation, partial application, staging failures, and no-conflict no-ops.
These tests run without provider credentials or AI credits.

Run the focused suite with:

```sh
go test ./internal/ai/... ./internal/compose ./internal/corejs \
  ./internal/resolve ./cmd/gk/resolve ./internal/mcp/internal/tools
```

## Help-only evaluation record

On 2026-08-11, two fresh agents read only the built command's help and were
given separate scenarios. Both chose the reviewable plan workflow, inspected
the documented plan and apply fields, used single-file refinement when needed,
applied the saved plan exactly, checked Git status, and explicitly declined to
continue, abort, commit, or push. The focused-file scenario also preserved
unselected conflicts, handled spaces and Unicode in a path, treated partial
apply as incomplete, and explained the rebase caveat for ours/theirs.

Both runs had to supply their own stdout redirection because the briefing's
step 1 used `--output json`, which saves nothing, while steps 3 and 4 consumed
a plan path. The workflow now names `--plan-file` in step 1, so re-run this
evaluation against the corrected briefing before release and record whether
agents still reach for a redirect.

## Real-provider manual run

Run a smaller version of the same scenarios against each supported configured
provider before release. Record the provider, model, command version, scenario,
tool calls observed, token usage, rubric result, and any capability error. This
suite is intentionally manual because it requires authentication, network
access, and AI credits; it must not be made a credentialed CI dependency.
