---
name: figma-handoff-structure
phase: handoff
version: "2.1"
author: cri.atom
async_ok: false
model: claude-sonnet-4-20250514

input:
  required:
    - output from frd-hdu (HUs + Acceptance Criteria)
  optional:
    - output from user-flows-breadboarding
    - output from ux-analysis-redesign
    - prototype descriptions or HTML/React code
    - wireframe descriptions

output:
  - type: figma-canvas-guide
    format: markdown
    destination: [Figma — manual assembly by designer, future: Claude Code + Figma MCP]
    feeds_into: [figma-design-assembly]

next: null

future_automation:
  - tool: claude-code + figma-mcp
    status: TBD
    description: Output of this skill is already structured for direct agent consumption via Figma MCP

constraints:
  - FRD is the mandatory primary input — do not generate without it
  - One row per HU in the canvas
  - Interleaved X-axis pattern — criteria card immediately before its screens, not grouped at end
  - Do not prescribe visual design — only structure and order

tags: [ux, figma, handoff, design-system, frd, hdu, canvas]
---

# Figma Handoff Structure Generator

Translate an FRD (HUs + Acceptance Criteria) into a structured Figma canvas guide. The designer uses this guide to assemble the static handoff in Figma. The output is also structured for future consumption by a Claude Code + Figma MCP agent.

---

## INPUT

**Required:**
```
- Full output from frd-hdu (paste complete FRD with all HUs and criteria)
```

**Supplementary (paste what you have):**
```
- UX flows from user-flows-breadboarding
- Redesign plan from ux-analysis-redesign
- Prototype or wireframe descriptions
- Any additional design context from the conversation
```

If the FRD is absent or incomplete (missing HUs or Acceptance Criteria), ask for it before generating.

---

## PROCESO

### Canvas convention

The canvas is organized in **horizontal rows**, one per HU:

- Screens flow **left to right**.
- HUs **stack vertically** — one row per story.
- Each row follows an **interleaved pattern**: each criteria card is immediately followed by the screens that resolve it, before moving to the next criteria card.

**X-axis pattern per row:**
```
[HU card] → [Criteria A card] → [Screens A] → [Criteria B card] → [Screens B] → [⚠ TBD]
```

This allows the developer to read a criterion and immediately see the screens that resolve it, without jumping between blocks.

### Grouping criteria into blocks

- One criterion resolved in a single screen → its own block.
- Multiple criteria demonstrated in the same flow or end-to-end → group in one block.
- One criterion with validations, states, or edge cases requiring separate visual reading → separate block.

---

## OUTPUT

Produce one section per HU. Use exactly this format:

```markdown
# Figma Handoff — [Feature name]

---

### Fila [N] — [HU name]

**Tarjeta Verde Claro (`0N_`):**
"Como [role], quiero [action], para [value]."

---

**Bloque `0N.1_` → sus Screens:**

`0N.1_` — [Criteria group title]
Criteria covered in this block:
- [Criterion A]
- [Criterion B — if grouped with A]

Screens for `0N.1_`:
`Screen 1: [description]` → *[trigger/action]* → `Screen 2: [description]`

---

**Bloque `0N.2_` → sus Screens:**
[Repeat pattern for each additional criteria group]

---

**Post-it Casos Borde / TBD:**
[List any undefined states, pending technical decisions, or edge cases without a resolved screen. Place at end of row's X-axis.]

---
```

After all rows, produce a **canvas summary** in plain text:

```
[ 01_ HU-1 ] → [ 01.1_ Criterios A ] → [ S1 ]→[ S2 ] → [ 01.2_ Criterios B ] → [ S3 ]→[ S4 ] → [ ⚠ TBD ]
[ 02_ HU-2 ] → [ 02.1_ Criterios A ] → [ S1 ]→[ S2 ]→[ S3 ]
[ 03_ HU-3 ] → [ 03.1_ Criterios A ] → [ S1 ] → [ 03.2_ Criterios B ] → [ S2 ]→[ S3 ] → [ ⚠ TBD ]
```

Produce all rows before stopping. Do not truncate.

---

**Next skill:** `null` — this is the terminal skill of the feature pipeline. Output goes to the designer for Figma assembly.

**Future:** Output of this skill is structured for direct consumption by `claude-code + figma-mcp` agent. [TBD]
