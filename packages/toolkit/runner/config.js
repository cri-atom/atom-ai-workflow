import { readFileSync, existsSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";

const DEFAULTS = {
  provider: "claude",
  model: "claude-sonnet-4-20250514",
  max_tokens: 8000,
  pipeline: {
    state_dir: ".atom-ai",
    output_dir: ".atom-ai/outputs",
    context_mode: "cumulative",
    on_ambiguity: "ask",
    on_async: "pause",
  },
};

/**
 * @param {string} toolkitRoot
 */
export function loadConfig(toolkitRoot) {
  const configPath = join(toolkitRoot, "pipeline.config.yml");
  if (!existsSync(configPath)) {
    return {
      ...DEFAULTS,
      provider: process.env.ATOM_PROVIDER || DEFAULTS.provider,
      model: process.env.ATOM_MODEL || DEFAULTS.model,
    };
  }
  const parsed = yaml.load(readFileSync(configPath, "utf8")) || {};
  return {
    ...DEFAULTS,
    ...parsed,
    provider: process.env.ATOM_PROVIDER || parsed.provider || DEFAULTS.provider,
    model: process.env.ATOM_MODEL || parsed.model || DEFAULTS.model,
    pipeline: { ...DEFAULTS.pipeline, ...(parsed.pipeline || {}) },
  };
}

/**
 * Resolve state/output dirs relative to projectRoot (not toolkit root).
 * @param {object} config
 * @param {string} projectRoot
 */
export function resolveProjectConfig(config, projectRoot) {
  const stateRel = config.pipeline?.state_dir || ".atom-ai";
  const outputRel = config.pipeline?.output_dir || ".atom-ai/outputs";
  return {
    ...config,
    pipeline: {
      ...config.pipeline,
      state_dir: join(projectRoot, stateRel),
      output_dir: join(projectRoot, outputRel),
    },
  };
}
