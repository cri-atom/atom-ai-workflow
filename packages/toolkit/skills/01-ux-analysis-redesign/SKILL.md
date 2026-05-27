---
name: ux-analysis-redesign
phase: analysis
version: "3.0"
author: cri.atom
async_ok: false
model: claude-sonnet-4-20250514

input:
  required:
    - screenshots or screen recordings of the current UI
  optional:
    - meeting notes
    - Slack threads
    - feature description
    - existing FRD or specs

output:
  - type: redesign-plan
    format: markdown
    feeds_into: [user-flows-breadboarding, frd-hdu]

next: user-flows-breadboarding

constraints:
  - Only reorder layout, rewrite copy, and adjust hierarchy
  - Do not invent new components
  - Do not modify design tokens
  - Operates exclusively on existing UI — not for blank-canvas features

tags: [ux, analysis, redesign, heuristics, existing-ui]
---

# UX Analysis and Redesign Plan

Diagnose an existing UI and produce a structured redesign plan. Operates within the current design system — no new components, no token changes.

---

## INPUT

Provide one or more of the following. The more context, the sharper the diagnosis:

```
- Screenshots / recordings of the current view
- Notes from user feedback, QA, or team review
- Brief description of what the view is supposed to do
- Any known pain points or complaints
```

**Minimum viable input:** at least one screenshot of the current UI.

---

## PROCESO

### 1. Diagnóstico del problema actual

Audit the current interface using usability heuristics. Focus on:

- Friction points, excessive cognitive load, or visual fatigue.
- Redundant or inefficient copy — verbose labels, repeated information, unclear microcopy.
- Disconnect between context, decision elements, and actions.
- Visual hierarchy and scanning problems (F/Z pattern violations, poor emphasis).

### 2. Plan de Rediseño — el nuevo guion (Layout Order)

Propose a new layout order applying **Progressive Disclosure** and natural reading flow:

> Contexto → Acción → Consideraciones → Secundarios

For each step in the new layout, document:

- **UI Element:** what component type (title, card, alert, toggle, table, etc.)
- **Propuesta de Copy (NUEVO):** exact new wording if copy changes are recommended
- **Por qué:** one-line UX rationale for this position and decision

### 3. Visualización del Nuevo Layout (Wireframe mental)

Produce a simple ASCII/text-art schema showing the new component order and layout disposition.

```
┌─────────────────────────────┐
│ [Page title]                │
│ [Subtitle / context]        │
├─────────────────────────────┤
│ [Primary action]            │
├─────────────────────────────┤
│ [Card: consideration A]     │
│ [Card: consideration B]     │
├─────────────────────────────┤
│ [Secondary / tertiary info] │
└─────────────────────────────┘
```

### 4. Resumen de impacto UX

3–4 bullet points summarizing the direct benefits of this redesign:
- Cognitive load reduction
- F/Z scan improvement
- Constraint compliance
- Copy efficiency gains

---

## OUTPUT

Produce the following structure exactly. Do not add sections outside this schema.

```markdown
### UX Analysis — [View name]

#### 1. Diagnóstico
[Findings per heuristic category]

#### 2. Plan de Rediseño
| Step | UI Element | Copy (NUEVO) | Por qué |
|------|-----------|--------------|---------|
| 1    | ...       | ...          | ...     |

#### 3. Wireframe mental
[ASCII layout]

#### 4. Impacto UX
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

[TBD: any ambiguous areas that need clarification before designing]
```

---

**Next skill:** `user-flows-breadboarding`
