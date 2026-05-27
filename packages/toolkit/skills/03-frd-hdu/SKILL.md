---
name: frd-hdu
phase: definition
version: "2.0"
author: cri.atom
async_ok: false
model: claude-sonnet-4-20250514

input:
  required:
    - one or more of: meeting notes, feature brief, user flows from user-flows-breadboarding, redesign plan
  optional:
    - output from ux-analysis-redesign
    - output from user-flows-breadboarding
    - Figma design handoff (described or linked)
    - existing FRD to extend or refine

output:
  - type: frd
    format: markdown
    destination: [Confluence, Jira]
    feeds_into: [figma-handoff-structure]

next: figma-handoff-structure

constraints:
  - 100% UI-agnostic — no modal, button, dropdown, tab, screen, toast, accordion
  - Focus on business rules, state mutations, data flows, and value delivered
  - Every HU must cover Happy Path, Restrictions/RBAC, Poka-yokes, and Edge Cases
  - Do not estimate story points — use t-shirt sizes (S / M / L / XL) only
  - If project, feature, or roles are not provided, ask before generating

tags: [product, requirements, user-stories, frd, agile, jira, confluence]
---

# FRD / HDU Generator

Generate a Functional Requirements Document (FRD) composed of User Stories (HU) and Acceptance Criteria. UI-agnostic by design. Output is ready to paste into Confluence or load into Jira.

---

## INPUT

Provide the following fields. If any are missing, the skill will ask before generating:

```
- Proyecto: [Product or system name]
- Feature / Iniciativa: [Feature name. E.g. "Voice Analytics", "Genesys OAuth Integration"]
- Roles implicados: [E.g. SuperAdmin, Agent, End User]
- Notas, feedback o reglas de negocio: [Meeting summary, known constraints, expected behavior, technical limitations]
```

Also accepted as supplementary input:
- Full output from `user-flows-breadboarding`
- Full output from `ux-analysis-redesign`
- Figma handoff description or link

---

## PROCESO

1. Parse all inputs and extract discrete user intents — each becomes one HU.
2. For each HU, identify: happy path, role restrictions, error prevention (poka-yokes), and edge cases.
3. Write criteria in behavior-first language: "The system must / must not allow X when Y."
4. Assign priority and t-shirt size based on complexity signals in the input.
5. Group related HUs under the same FRD if they share a feature context.
6. Flag any undefined behavior as `[TBD: description]`.

### Prohibited vocabulary (UI terms — never use these)

`modal`, `dropdown`, `tab`, `accordion`, `button`, `toast`, `screen`, `page`, `sidebar`, `drawer`, `popup`, `tooltip`, `toggle`

Use instead: `action`, `state`, `trigger`, `transition`, `permission`, `flow`, `context`, `selection`, `confirmation`

### Suggested criteria categories

`Happy Path` · `Restricción de Rol` · `Poka-yoke` · `Manejo de Errores` · `Persistencia` · `Idempotencia` · `Concurrencia` · `Auditoría` · `Performance` · `Seguridad`

---

## OUTPUT

Produce the FRD using exactly this structure per HU:

```markdown
# FRD | [Project / Feature name]

**Contexto del Proyecto:** [One paragraph: the problem being solved and the objective of this feature.]

---

### HU-[N] | [Action or main topic]

**Prioridad:** [Crítica / Alta / Media / Baja] | **Pre-estimación:** [S / M / L / XL]

**Descripción:** Como [user role], quiero [expected behavior or state mutation], para [business objective or value delivered].

**Criterios de Aceptación:**
* **[Categoría] — Happy Path:** [The system must allow X when condition Y is met.]
* **[Categoría] — Restricción de Rol:** [The system must not allow X for role Z.]
* **[Categoría] — Poka-yoke:** [The system must prevent X before Y happens.]
* **[Categoría] — Manejo de Errores:** [The system must respond with X when Y fails.]
* **[Categoría] — Edge Case:** [The system must handle X when Y is in state Z.]

---
```

Produce all HUs before stopping. Do not truncate.

---

**Next skill:** `figma-handoff-structure`
