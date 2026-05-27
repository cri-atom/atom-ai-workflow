import { readFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import { loadConfig, resolveProjectConfig } from "./config.js";
import { loadRegistry } from "./registry.js";
import { runSkill, runPipeline } from "./pipeline.js";
import { initState, loadState, saveState } from "./state.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Absolute path to packages/toolkit */
export function getToolkitRoot() {
  return join(__dirname, "..");
}

export { loadConfig, loadRegistry, initState, loadState, saveState, runSkill, runPipeline };

/**
 * @param {string} [toolkitRoot]
 */
export function createToolkitContext(toolkitRoot = getToolkitRoot()) {
  const config = loadConfig(toolkitRoot);
  const registry = loadRegistry(toolkitRoot);
  return { toolkitRoot, config, registry };
}

/**
 * @param {string} projectRoot
 * @param {string} projectName
 */
export function initProject(projectRoot, projectName) {
  const toolkitRoot = getToolkitRoot();
  const config = loadConfig(toolkitRoot);
  const projectConfig = resolveProjectConfig(config, projectRoot);
  const stateDir = projectConfig.pipeline.state_dir;
  if (!existsSync(stateDir)) mkdirSync(stateDir, { recursive: true });
  mkdirSync(projectConfig.pipeline.output_dir, { recursive: true });
  const state = initState(projectName);
  saveState(state, stateDir);
  return { state, projectConfig, toolkitRoot };
}

/**
 * @param {string} projectRoot
 */
export function getProjectState(projectRoot, toolkitRoot = getToolkitRoot()) {
  const config = resolveProjectConfig(loadConfig(toolkitRoot), projectRoot);
  const state = loadState(config.pipeline.state_dir);
  return { state, config, toolkitRoot };
}

function parseFrontmatterSync(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return {};
  try {
    return yaml.load(match[1]) || {};
  } catch {
    return {};
  }
}

export function readSkillFile(toolkitRoot, skillId) {
  const registry = loadRegistry(toolkitRoot);
  const meta = registry.skills.find((s) => s.id === skillId);
  if (!meta) return null;
  const filePath = join(toolkitRoot, meta.path);
  if (!existsSync(filePath)) return null;
  const raw = readFileSync(filePath, "utf8");
  const frontmatter = parseFrontmatterSync(raw);
  const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  return { meta, path: meta.path, raw, frontmatter, body };
}

export function listSkills(toolkitRoot = getToolkitRoot()) {
  const registry = loadRegistry(toolkitRoot);
  return registry.skills.map((s) => ({
    id: s.id,
    phase: s.phase,
    optional: Boolean(s.optional),
    model: s.model,
    next: s.next ?? null,
    trigger: s.trigger,
    branch: s.branch,
    version: s.version,
    path: s.path,
  }));
}

export function listPipelines(toolkitRoot = getToolkitRoot()) {
  const registry = loadRegistry(toolkitRoot);
  return Object.entries(registry.pipelines || {}).map(([name, p]) => ({
    name,
    description: p.description,
    steps: p.steps,
  }));
}
