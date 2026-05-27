---
name: ds-component-docs
phase: design
version: "2.0"
author: cri.atom
async_ok: false
model: claude-sonnet-4-20250514

input:
  required:
    - component description: anatomy, variants/props, states
  optional:
    - Figma component link or screenshot
    - existing documentation to extend
    - design token reference

output:
  - type: component-documentation
    format: markdown
    destination: [Figma — manual assembly by designer, future: Claude Code + Figma MCP]
    feeds_into: [figma-ds-assembly]

next: null

future_automation:
  - tool: claude-code + figma-mcp
    status: TBD
    description: Output structured for direct Figma frame assembly via MCP agent

constraints:
  - Section titles in English
  - Copy in English, technical and concise — 1–2 sentences max per section
  - Image guidance notes in Spanish (for designer clarity)
  - Component/variant names must match Figma exactly
  - No invented variants or props not present in the actual component

branch: design-system
tags: [ux, figma, design-system, documentation, components]
---

# Design System Component Documentation

Generate structured, Figma-ready documentation for UI design system components. Output is copy + layout guidance the designer pastes directly into Figma frames.

---

## INPUT

Describe the component. The skill will ask for what's missing:

```
1. Anatomy      — What sub-elements does it have? (trigger, container, label, icon, helper text, etc.)
2. Sizes        — Does it have size variants? How many and what are they called?
3. States       — What interaction states exist? (default, hover, focused, pressed, disabled, error, loading...)
4. Variants     — What props/variants does it have in Figma?
                  Is there a hierarchy (primary/secondary) or independent features (with icon / without icon)?
5. Special      — Any unique behaviors? (relative positioning, delay, max-width, overflow rules)
```

---

## PROCESO

### Step 1 — Choose pattern

Determine which structural pattern fits the component:

**Pattern A — Flat sections** (Text Field model)
Use when variants are independent features, not a hierarchy.
Each variant gets its own flat section at the same level.

**Pattern B — Grouped hierarchy** (Button model)
Use when variants belong to a named category (hierarchy, type, role) and each sub-variant needs its own states image.
- Trigger: component has a "type" or "hierarchy" prop (primary/secondary/tertiary, filled/outlined/ghost)
- Each sub-type has its own interactive states worth documenting separately
- There's a "destructive" or "danger" group replicating the same hierarchy

**Pattern C — Section with subsections** (inline subtitles)
Use when a section (inner element) has multiple characteristics — each becomes a named subsection inside the same Figma frame.
- Semantic rule: Section = inner element. Subsection = characteristic of that element.
- Not every section needs subsections — only when an element has 2+ distinct characteristics.
- First subsection is NOT always "Variants" — name it after what it actually shows.

Patterns can be mixed within the same component documentation.

### Step 2 — Generate sections

For each section:
- Title: short, matches Figma exactly
- Copy: 1–2 sentences max. Start with what the component/variant **does**, not what the section **contains**.
- `{imagen: ...}` guidance: specify what state/variant to show, how many examples, layout (horizontal row vs grid), background (dark/light/both)

### Step 3 — Extras check

Evaluate if the component needs additional sections:

| Section | When to add |
|---|---|
| Placement / Positioning | Components positioned relative to a trigger (tooltip, popover, dropdown) |
| Trigger types | Can be triggered multiple ways (hover, click, focus) |
| Max width / overflow | Content is variable and may truncate or wrap |
| Icon Configurations | Supports icon left, right, icon-only as layout variants |
| Do / Don't | Easily confused usage patterns |
| Accessibility notes | Critical a11y considerations (e.g. tooltips must not be the only source of info) |
| Dark / Light mode | Component has theme variants worth documenting together |

---

## OUTPUT

```markdown
## [Component Name] Documentation
[One-sentence description.]

---

### 1. Component Anatomy
[1 sentence.]
{imagen: [guidance in Spanish]}

### 2. Sizes
[1 sentence — list sizes directly: "Five sizes: XS, S, M, L, XL."]
{imagen: [guidance]}

### 3. States
[1 sentence — list states directly.]
{imagen: [guidance]}

### 4. [Flat section — Pattern A]
[1–2 sentences: what it does + when to use.]
{imagen: [guidance]}

### 5. [Grouped section — Pattern B]
[1–2 sentences explaining grouping logic.]
#### 5.1 [Sub-variant]
[When to use.]
Interactive States:
{imagen: [all states for this sub-variant]}
#### 5.2 [Sub-variant]
...

### 6. [Section with inline subtitles — Pattern C]
[1 sentence: what this element is.]
**[Subtitle 1 — characteristic]**
[1 sentence.]
{imagen: [guidance]}
**[Subtitle 2 — characteristic]**
[1 sentence.]
{imagen: [guidance]}

### [Extra sections as needed]
...
```

End every output with:

```markdown
---
**Secciones a crear en Figma:**
1. Component Anatomy
2. Sizes
3. States
4. [Section name]
   - 4.1 [Sub-section if Pattern B/C]
   - 4.2 [Sub-section if Pattern B/C]
5. [Next section]
...
```

---

**Next skill:** `null` — this skill operates on the design system branch, independent of the feature pipeline.

**Future:** Output structured for direct consumption by `claude-code + figma-mcp` agent. [TBD]
