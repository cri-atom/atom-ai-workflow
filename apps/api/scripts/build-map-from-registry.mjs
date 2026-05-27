/**
 * Generates apps/api/data/default.json from packages/toolkit/skills/_registry.yml
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.join(__dirname, "..");
const repoRoot = path.join(apiRoot, "../..");
const toolkitRoot = path.join(repoRoot, "packages/toolkit");
const registryPath = path.join(toolkitRoot, "skills/_registry.yml");

const registry = yaml.load(fs.readFileSync(registryPath, "utf8"));
const skills = registry.skills || [];

const COL_X = 280;
const COL_DS_X = 560;
let yMain = 0;
const yStep = 140;

const nodes = [];
const edges = [];

nodes.push({
  id: "discovery",
  type: "concept",
  position: { x: COL_X, y: yMain },
  data: {
    category: "input",
    nodeKind: "input",
    label: "Discovery",
    summary: "Notas, screenshots, datos de producto y contexto del feature.",
    bodyMd:
      "Pega aquí el contexto inicial antes de ejecutar skills. Los outputs de cada skill se acumulan en el proyecto (`.atom-ai/outputs/`).",
  },
});
yMain += yStep;

const mainChain = [
  "ux-analysis-redesign",
  "user-flows-breadboarding",
  "frd-hdu",
  "figma-handoff-structure",
];

let prevMain = "discovery";

for (const skillId of mainChain) {
  const meta = skills.find((s) => s.id === skillId);
  if (!meta) continue;

  const optional = Boolean(meta.optional);
  nodes.push({
    id: skillId,
    type: "concept",
    position: { x: COL_X, y: yMain },
    data: {
      category: "skill",
      nodeKind: "skill",
      skillId: meta.id,
      optional,
      model: meta.model,
      phase: meta.phase,
      label: meta.id.replace(/-/g, " "),
      summary: meta.trigger || meta.phase,
    },
  });

  edges.push({
    id: `e-${prevMain}-${skillId}`,
    source: prevMain,
    target: skillId,
    animated: !optional,
    data: { required: !optional },
    ...(optional ? { style: { strokeDasharray: "6 4" } } : {}),
  });

  prevMain = skillId;
  yMain += yStep;
}

const dsMeta = skills.find((s) => s.id === "ds-component-docs");
if (dsMeta) {
  const dsY = 280;
  nodes.push({
    id: "design-system",
    type: "concept",
    position: { x: COL_DS_X, y: dsY - yStep },
    data: {
      category: "input",
      nodeKind: "input",
      label: "Design system",
      summary: "Documentación de componente DS (rama independiente).",
    },
  });
  nodes.push({
    id: dsMeta.id,
    type: "concept",
    position: { x: COL_DS_X, y: dsY },
    data: {
      category: "skill",
      nodeKind: "skill",
      skillId: dsMeta.id,
      optional: false,
      model: dsMeta.model,
      phase: dsMeta.phase,
      branch: "design-system",
      label: "DS component docs",
      summary: dsMeta.trigger,
    },
  });
  edges.push({
    id: "e-ds-branch",
    source: "design-system",
    target: dsMeta.id,
    animated: false,
    data: { required: false },
    style: { strokeDasharray: "6 4" },
  });
  edges.push({
    id: "e-flows-ds-hint",
    source: "user-flows-breadboarding",
    target: "design-system",
    animated: false,
    data: { required: false, hint: true },
    style: { strokeDasharray: "4 6", opacity: 0.5 },
  });
}

const map = {
  id: "default",
  title: "Atom AI — Feature workflow (toolkit)",
  schemaVersion: 2,
  nodes,
  edges,
};

const outPath = path.join(apiRoot, "data/default.json");
fs.writeFileSync(outPath, `${JSON.stringify(map, null, 2)}\n`, "utf8");
console.log(`Wrote ${outPath} (${nodes.length} nodes, ${edges.length} edges)`);
