---
name: user-flows-breadboarding
phase: definition
version: "3.0"
author: cri.atom
async_ok: false
model: claude-sonnet-4-20250514

input:
  required:
    - one or more of: meeting notes, feature description, FRD draft, screenshots, Slack thread, redesign plan
  optional:
    - output from ux-analysis-redesign
    - existing user flows or flows from a previous run

output:
  - type: ux-flows
    format: markdown
    feeds_into: [frd-hdu, figma-handoff-structure]

next: frd-hdu

constraints:
  - Focus exclusively on navigation architecture: Places, Elements, Connections
  - No visual design, colors, or layout decisions
  - No UI component names (button, modal, etc.) in the flow logic — only element roles
  - If input is ambiguous or incomplete, ask clarifying questions before generating

tags: [ux, breadboarding, flows, shape-up, navigation, figma-handoff]
---

# User Flows Breadboarding Generator

Translate any unstructured input into structured UX flows using the Breadboarding technique (Shape Up, Basecamp). Output is UI-agnostic and directly consumable by Figma Make, prototype generators, or `frd-hdu`.

---

## INPUT

Paste any combination of the following. Order and format do not matter — the skill handles synthesis:

```
- Meeting notes / session transcript
- Feature description or product brief
- Screenshots or wireframes (described in text if no vision model)
- Slack thread or async discussion
- Output from ux-analysis-redesign (paste full output)
- Rough idea or bullet list
```

If input is ambiguous or incomplete, ask clarifying questions before generating flows.

---

## PROCESO

### Breadboarding technique

Three components define every step of a flow:

1. **Places** — Views, modals, or contexts where the user is located.
2. **Elements** — Buttons, inputs, toggles, or key text the user interacts with.
3. **Connections** — The action that moves the user from one place to another.

### Analysis steps

1. Parse input and identify all distinct user intents.
2. For each intent, map the sequence of places the user passes through.
3. Identify all elements at each place.
4. Identify all connections (actions and their consequences).
5. Detect edge cases: cancellation, errors, empty states, permission failures.
6. Flag any gaps or ambiguities as `[TBD]`.

---

## OUTPUT

Produce one `# User Flow` block per distinct user intent. Use exactly this format per step:

```markdown
# User Flows — [Feature name]

## [N]. [Action verb] | Vista: [View / Modal / Context name]
* **Contexto:** [User situation or system state at this point.]
* **UI:** [Key interface elements, comma-separated. Use brackets for interactive elements: `[ Acción: Guardar ]`, `[ Input: Email ]`.]
* **Edge Case:** [What happens on cancel, error, or abandonment. Omit if none.]
* **Acción:** [What the user does] ➔ *[System consequence and which step/view they go to next.]*

---
```

Produce all flows for the feature before stopping. Do not truncate.

---

**Next skill:** `frd-hdu`
