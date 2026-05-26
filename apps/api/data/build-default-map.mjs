import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const CONFLUENCE =
  "https://atomchat.atlassian.net/wiki/spaces/PD/pages/4210524161/AI+Workflow+Guide+-+Atomchat";

const resourceConfluence = {
  label: "AI Workflow Guide (Confluence)",
  href: CONFLUENCE,
  external: true,
};

const map = {
  id: "default",
  title: "Atom AI — Feature workflow (Figma + Confluence)",
  nodes: [
    {
      id: "discovery",
      type: "concept",
      position: { x: 280, y: 0 },
      data: {
        category: "input",
        label: "Discovery",
        summary:
          "Inputs de contexto y síntesis con Gemini; alimenta todo el pipeline.",
        bodyMd: `## Inputs (marco Figma)

- Reunión / notas, **Slack thread**, FRD/specs, **screenshots**, ideas/bocetos
- **Artefactos / datos:** Mixpanel · Product Fruits, research/entrevistas (TBD proceso)

## Herramienta IA (morado en diagrama)

- **Google AI Studio — Gemini 2.5 / 3.1:** síntesis · \`context.md\` · styleguide · visión
- **Tool:** input = *todo lo anterior*

## Guía Confluence (extracto)

**Objetivo:** flujo Discovery → Design → Code continuo, trazable y mejorable con IA.

**Principios:** cada herramienta con rol claro; outputs del paso N son inputs del N+1; artefactos de texto sirven para comunicar al equipo y como prompt para la siguiente herramienta.`,
        resources: [resourceConfluence],
      },
    },
    {
      id: "define",
      type: "concept",
      position: { x: 280, y: 170 },
      data: {
        category: "skill",
        label: "Define",
        summary:
          "Skills de análisis UX y breadboarding; ordenan el caos antes de prototipar.",
        bodyMd: `## Skills (rama Feature)

### \`ux-analysis-and-redesign-plan\`
- **Cuándo:** hay UI existente que mejorar (no pantalla en blanco).
- **Inputs:** screenshots, notas, conversación, contexto del feature.
- **Output:** plan de rediseño (diagnóstico heurístico, copy nuevo, wireframe ASCII, impacto UX).
- **Restricciones:** solo layout/copy/jerarquía; **no** inventa componentes ni modifica tokens.

### \`user-flows-breadboarding-generator\`
- **Cuándo:** antes de diseñar o prototipar; input desordenado.
- **Output:** flows en **Breadboarding** (Places → Elements → Connections → Edge Cases) en Markdown.
- **Uso posterior:** input para Figma Make, prototipo HTML o \`figma-handoff-structure-generator\`.

### Cadena canónica (resumen)
\`\`\`
inputs → ux-analysis (si hay UI) → breadboarding → frd-hdu → figma-handoff-structure → Figma handoff → dev
\`\`\``,
        resources: [resourceConfluence],
      },
    },
    {
      id: "explore",
      type: "concept",
      position: { x: 280, y: 340 },
      data: {
        category: "tool",
        label: "Explore",
        summary:
          "Prototipado rápido (Inverse Handoff): Figma Make, guidelines y exploración v0/Gemini Build.",
        bodyMd: `## Inverse Handoff (diagrama)

Elegir **guideline** según entregable (app shell en prod, mockup shell, blur layout A/B, etc.).

### Rutas típicas
- **Figma Make (Sonnet/Opus):** prototipo React interactivo (guidelines → UX flows → diseño).
- **Gemini Build / v0.dev:** exploración rápida HTML/React cuando conviene más fotos o prompt corto.

### Guidelines (Confluence §4)

Archivos de sistema en Figma Make para no repetir tokens en cada prompt. Decisión en árbol:

- Feature en producción → guideline app shell completo
- Iteración en main content → mockup shell
- Rediseño double sidebar / icon rail → layouts blur A o B

### Figma Design (intermedio)

Screens estáticas y UX flows visuales (**handoff real** hacia documentación y handoff estático).`,
        resources: [resourceConfluence],
      },
    },
    {
      id: "handoff",
      type: "concept",
      position: { x: 280, y: 510 },
      data: {
        category: "artifact",
        label: "Handoff",
        summary:
          "FRD+HU, guía de canvas Figma y entrega estática; loop 3C con desarrollo.",
        bodyMd: `## Documentación

### \`prd-hdu-generator\`
- **Output:** FRD con historias de usuario y **criterios de aceptación** (UI-agnóstico: negocio, estado, flujo de datos).
- **Destino:** Confluence / Jira.

### \`figma-handoff-structure-generator\`
- **Input obligatorio:** FRD.
- **Opcionales:** flows, análisis, prototipos, código.
- **Output:** guía de armado del canvas con patrón intercalado por HU.

## Figma Design — handoff estático

Diseñador arma canvas siguiendo la guía; screens por HU; entrega a dev.

- **Push Check:** notificar al equipo al cerrar entrega.
- **TBD:** Claude Code + Figma MCP para automatizar armado.

## Loop con dev — **3C**

**Card + Conversation + Confirmation:** refinamiento de PRD, refinamiento de handoff, estimación en sprint.`,
        resources: [resourceConfluence],
      },
    },
    {
      id: "code",
      type: "concept",
      position: { x: 280, y: 680 },
      data: {
        category: "code",
        label: "Code",
        summary:
          "Stack de coding: Claude Code, Kimi, v0, Gemini CLI según scope; iteración hasta merge.",
        bodyMd: `## Desde la guía — base de código

| Alcance | Herramientas sugeridas |
|--------|-------------------------|
| Scaffold / MVP / mini refactors | **Claude Code (Sonnet)** o **Kimi 2.5** (free tier) |
| Componentes rápidos UI | **v0.dev** o **Google AI Studio Build** |
| Plan + doc de codebase | **Gemini CLI** (2.5) |
| Frontend/componentes en terminal | **Gemini CLI** (3.1) |
| Wide refactors / arquitectura | **Claude Code (Opus)** |

## Iteración

Sprint → revisión → merge → entrega. Puentes **Figma → Claude Code** hoy manuales; **Figma MCP** en exploración.`,
        resources: [resourceConfluence],
      },
    },
    {
      id: "design-system",
      type: "concept",
      position: { x: 560, y: 340 },
      data: {
        category: "skill",
        label: "Design system",
        summary:
          "Rama paralela: documentar componentes del DS con skill y handoff a dev.",
        bodyMd: `## Pipeline Design System (Confluence §6)

\`\`\`
Descripción del componente (anatomía, tamaños, estados, variantes)
    → Skill: ds-component-docs
    → Patrón A / B / C + copy de layout
    → Diseñador documenta en Figma
    → (futuro) Claude Code + Figma MCP
\`\`\`

### \`ds-component-docs\`
- **Output:** copy + guía de layout para frames del DS (patrón **A** flat, **B** grouped, **C** subsections).`,
        resources: [resourceConfluence],
      },
    },
    {
      id: "meta-governance",
      type: "concept",
      position: { x: 560, y: 510 },
      data: {
        category: "input",
        label: "Operación",
        summary:
          "Task management, Push Check, governance del workflow y changelog.",
        bodyMd: `## Task management (Confluence §8)

Subtasks **En ejecución** vs **En revisión** en Jira para leer el tablero sin ambigüedad.

## Push Check

Acción de notificación al completar entrega (Slack, comentario Jira, etc.) — *checklist personal* de “ya avisé”.

## Governance (§9)

Skills como contratos: versionar, probar con 2–3 inputs antes de publicar cambios, registrar en **changelog (§10)**.

## Post mortem (§11)

Registrar qué funcionó / qué no / qué cambiar después de cada ciclo.`,
        resources: [resourceConfluence],
      },
    },
  ],
  edges: [
    { id: "e1", source: "discovery", target: "define", animated: true },
    { id: "e2", source: "define", target: "explore", animated: true },
    { id: "e3", source: "explore", target: "handoff", animated: true },
    { id: "e4", source: "handoff", target: "code", animated: true },
    {
      id: "e5",
      source: "explore",
      target: "design-system",
      animated: false,
      style: { strokeDasharray: "6 4" },
    },
    {
      id: "e6",
      source: "handoff",
      target: "meta-governance",
      animated: false,
      style: { strokeDasharray: "6 4" },
    },
  ],
};

const out = join(__dirname, "default.json");
writeFileSync(out, JSON.stringify(map, null, 2), "utf8");
console.log("Wrote", out);
