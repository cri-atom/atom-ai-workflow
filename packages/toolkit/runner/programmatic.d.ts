export function getToolkitRoot(): string;
export function loadConfig(toolkitRoot: string): Record<string, unknown>;
export function loadRegistry(toolkitRoot: string): {
  skills: Array<Record<string, unknown>>;
  pipelines?: Record<string, { description?: string; steps: string[] }>;
};
export function initState(project: string): Record<string, unknown>;
export function loadState(stateDir: string): Record<string, unknown> | null;
export function saveState(state: Record<string, unknown>, stateDir: string): void;
export function createToolkitContext(toolkitRoot?: string): {
  toolkitRoot: string;
  config: Record<string, unknown>;
  registry: ReturnType<typeof loadRegistry>;
};
export function initProject(
  projectRoot: string,
  projectName: string,
): { state: Record<string, unknown>; projectConfig: Record<string, unknown>; toolkitRoot: string };
export function getProjectState(
  projectRoot: string,
  toolkitRoot?: string,
): { state: Record<string, unknown> | null; config: Record<string, unknown>; toolkitRoot: string };
export function readSkillFile(
  toolkitRoot: string,
  skillId: string,
): {
  meta: Record<string, unknown>;
  path: string;
  raw: string;
  frontmatter: Record<string, unknown>;
  body: string;
} | null;
export function listSkills(toolkitRoot?: string): Array<Record<string, unknown>>;
export function listPipelines(toolkitRoot?: string): Array<{
  name: string;
  description?: string;
  steps: string[];
}>;
export function resolveProjectConfig(
  config: Record<string, unknown>,
  projectRoot: string,
): Record<string, unknown>;
export function runSkill(params: Record<string, unknown>): Promise<Record<string, unknown>>;
export function runPipeline(params: Record<string, unknown>): Promise<Record<string, unknown>>;
