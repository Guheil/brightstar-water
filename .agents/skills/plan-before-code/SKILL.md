---
name: plan-before-code
description: Use for any coding or software engineering task — writing new code, fixing a bug, adding a feature, refactoring, or editing existing code — no matter how small the change looks. Before touching code, research how the problem is actually solved in practice, write a concrete plan instead of guessing, assess security/breaking risks in that plan and give each a contingency, critically re-review the plan from a skeptical outside perspective, and get explicit user approval before implementing. After implementing, write test cases and stress tests to confirm production-readiness. Never run `npm run build`. Trigger this even for "quick" one-line fixes or small tweaks — the depth of each step scales down for small tasks, but no step is skipped.
---

# Plan Before Code

Guessing at an implementation is how bugs, security holes, and rework happen. A short, honest planning pass — grounded in how the problem is actually solved in the real world, not just what seems plausible — is cheaper than debugging in production. This skill is a fixed six-step workflow. Every step happens for every coding task; what changes with task size is how much time each step gets, never whether it happens.

## The workflow

### 1. Research
Don't propose an approach from memory or intuition alone. Before drafting the plan:
- Look at how this exact kind of problem is solved in practice — official docs, the library's own recommended pattern, how the existing codebase already does similar things nearby. Search the web when it would meaningfully sharpen or correct the approach; for a trivial, unambiguous fix a quick look at the surrounding code may be all "research" means.
- Validate what you find rather than taking the first plausible answer — check it actually fits this codebase's stack and existing conventions, not just that it's theoretically correct.

### 2. Plan
Write the plan out concretely, in your own head or scratch space, before writing any code: what files change, what functions/endpoints/schemas are touched or added, the data flow, and the edge cases and assumptions you're making. A plan for a one-line fix can be a sentence. A plan for a new feature or an architecture change needs the real detail — don't compress a big change into a fake-small plan just to move faster.

### 3. Risk assessment
Read back over the plan looking specifically for what it could break or expose:
- Security: injection, auth/permission bypass, exposed secrets or PII, unsafe deserialization, SSRF, unvalidated input reaching something sensitive — whatever's relevant to this change.
- Breakage: existing behavior or callers the change could affect, race conditions, migration/rollback concerns.
- For every real risk found, write a concrete contingency — not "be careful," but the actual mitigation ("parameterize this query," "add a feature flag so it can be disabled without a redeploy," "wrap the two writes in a transaction"). If a category genuinely doesn't apply (a CSS color tweak has no auth risk), say so plainly rather than padding the list — but don't skip the pass itself, since that's how the real risk gets missed on the task that looked small but wasn't.

### 4. Adversarial self-review
Re-read the whole plan as a skeptical senior engineer reviewing someone else's PR description would — not as its author. Actively look for where it's wrong, incomplete, or where a risk mitigation from step 3 is weaker than it looks. This is not a formality: if you find a real problem, change the plan before showing it to the user. Don't present a plan you privately have doubts about and hope it goes unnoticed. Agreeing with yourself by default defeats the point of this step.

### 5. Approval gate
Present the plan to the user before writing or editing any code — the shape below. Wait for an explicit go-ahead ("yes," "go ahead," "looks good," a requested change followed by confirmation). Do not start implementing on an ambiguous or absent response, and do not skip this step because the change looks small; that judgment call is exactly what this step exists to check.

Present it as:

**Plan** — what will change and why
**Risks & contingencies** — risk → mitigation, one line each (or "no meaningful risk" for trivial changes, stated explicitly rather than omitted)
**Self-review notes** — anything step 4 changed or caught, if anything
Then ask directly: something like "Want me to go ahead with this?"

### 6. Implement
Build exactly what was approved, or the adjusted version if the user asked for changes during approval. Tests are expected and encouraged. **Never run `npm run build`** — this holds regardless of task size or how confident the change seems.

### 7. Test & stress test
Once implemented, write test cases covering the normal path, the edge cases named in the plan, and the specific risks identified in step 3 — a security mitigation isn't done until there's a test proving the bad input is actually rejected. Where it's relevant to the change (not every one-line fix needs this), stress test: large inputs, concurrent/repeated calls, malformed or boundary data. Report results honestly — a failing test gets fixed before the task is called done, not mentioned and left.

## Frontend component and page structure

When creating or modifying frontend components or pages:

- Every color, typography value, and spacing value must come from the project's theme folder. Reuse existing theme tokens instead of hardcoding values inside components. If a required reusable value does not exist, add it to the theme first.
- Every component or page must use at least these three files:
  - `interface.ts` for interfaces, props, types, and other component-specific TypeScript contracts.
  - `elements.tsx` for MUI styled components and theme-aware presentational elements.
  - A main `.tsx` file named after the component or page, such as `PatientRecords.tsx` or `AppointmentTable.tsx`, for rendering, composition, state, and event-handling logic.
- These are the minimum required files. Additional files such as `hooks.ts`, `utils.ts`, `constants.ts`, or test files may be added when needed, but they do not replace the required three files.
- Before implementation, include the affected three-file structure and the theme tokens being reused or added in the plan.
- During self-review and testing, verify that styled components remain in `elements.tsx`, interfaces and types remain in `interface.ts`, the main file is correctly named, and no unnecessary hardcoded design values were introduced.

## Scaling by task size

The steps never change; the effort inside each one does.

- **Trivial** (typo, one-line fix, copy change): research = glance at surrounding code; plan = one sentence; risks = explicit "no meaningful risk" if true; self-review = quick gut-check; approval = still asked, still waited for; tests = one or two quick cases if the file already has a test pattern to follow.
- **Substantial** (new feature, refactor touching several files, anything touching auth/money/user data/public APIs): every step gets real time and real depth, especially risk assessment and stress testing.

Matching effort to the task is expected — skipping a step because the task "obviously" doesn't need it is not.