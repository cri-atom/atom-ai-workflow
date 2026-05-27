import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createToolkitContext,
  getProjectState,
  getToolkitRoot,
  initProject,
  listPipelines,
  listSkills,
  loadRegistry,
  readSkillFile,
  runPipeline,
  runSkill,
} from "@atom-ai/toolkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.join(__dirname, "../..");

export function resolveToolkitRoot(): string {
  return getToolkitRoot();
}

export function resolveProjectsRoot(): string {
  const root = path.join(apiRoot, "data/projects");
  if (!existsSync(root)) mkdirSync(root, { recursive: true });
  return root;
}

export function resolveProjectRoot(projectId: string): string {
  const safe = projectId.replace(/[^a-zA-Z0-9-_]/g, "");
  if (safe !== projectId) {
    throw new Error("invalid_project_id");
  }
  const projectRoot = path.join(resolveProjectsRoot(), safe);
  if (!existsSync(projectRoot)) mkdirSync(projectRoot, { recursive: true });
  return projectRoot;
}

export function ensureProject(projectId: string) {
  const projectRoot = resolveProjectRoot(projectId);
  const { state } = getProjectState(projectRoot);
  if (state) return { projectRoot, state };
  const { state: created } = initProject(projectRoot, projectId);
  return { projectRoot, state: created };
}

export {
  createToolkitContext,
  getToolkitRoot,
  initProject,
  listPipelines,
  listSkills,
  loadRegistry,
  readSkillFile,
  runPipeline,
  runSkill,
  getProjectState,
};

export function readProjectOutput(projectRoot: string, skillId: string): string | null {
  const safe = skillId.replace(/[^a-zA-Z0-9-_]/g, "");
  if (safe !== skillId) return null;
  const filePath = path.join(projectRoot, ".atom-ai/outputs", `${safe}.md`);
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath, "utf8");
}

export function getToolkitConfigForApi() {
  const toolkitRoot = resolveToolkitRoot();
  const { config, registry } = createToolkitContext(toolkitRoot);
  return { toolkitRoot, config, registry };
}

export function getStateDirFromConfig(projectConfig: Record<string, unknown>): string {
  const pipeline = projectConfig.pipeline as { state_dir: string };
  return pipeline.state_dir;
}
