import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { callProvider } from "./providers/index.js";
import { saveState } from "./state.js";

/**
 * @param {object} params
 * @param {string} params.toolkitRoot
 * @param {string} params.projectRoot
 * @param {string} params.skillId
 * @param {string} params.userInput
 * @param {object} params.config Resolved project config
 * @param {object} params.registry
 * @param {object} params.state
 * @param {boolean} [params.dry]
 * @param {string} [params.provider]
 * @param {string} [params.model]
 */
export async function runSkill({
  toolkitRoot,
  projectRoot,
  skillId,
  userInput,
  config,
  registry,
  state,
  dry = false,
  provider,
  model,
}) {
  const skillMeta = registry.skills?.find((s) => s.id === skillId);
  if (!skillMeta) {
    return { ok: false, error: `Skill not found: ${skillId}` };
  }

  const skillPath = join(toolkitRoot, skillMeta.path);
  if (!existsSync(skillPath)) {
    return { ok: false, error: `Skill file not found: ${skillPath}` };
  }
  const skillPrompt = readFileSync(skillPath, "utf8");

  const osPath = join(toolkitRoot, "core/OS.md");
  const osLocalPath = join(toolkitRoot, "core/OS.local.md");
  if (!existsSync(osPath)) {
    return { ok: false, error: `OS.md not found at ${osPath}` };
  }
  let systemPrompt = readFileSync(osPath, "utf8");
  if (existsSync(osLocalPath)) {
    systemPrompt += `\n\n---\n\n${readFileSync(osLocalPath, "utf8")}`;
  }

  const outputDir = config.pipeline.output_dir;
  const stateDir = config.pipeline.state_dir;
  let contextBlock = "";
  if (state.context_stack?.length) {
    contextBlock = "\n\n---\n\n## Context from previous skills\n\n";
    for (const outputPath of state.context_stack) {
      if (existsSync(outputPath)) {
        const label = outputPath.split("/").pop();
        contextBlock += `### ${label}\n\n${readFileSync(outputPath, "utf8")}\n\n---\n\n`;
      }
    }
  }

  const userMessage = `${skillPrompt}\n\n---\n\n## Your input for this run\n\n${userInput || "(no input provided)"}${contextBlock}`;

  const providerName = provider || config.provider;
  const modelName = model || skillMeta.model || config.model;

  if (dry) {
    return {
      ok: true,
      dry: true,
      skillId,
      model: modelName,
      provider: providerName,
      messageLengths: { system: systemPrompt.length, user: userMessage.length },
    };
  }

  state.skills[skillId] = {
    status: "running",
    started_at: new Date().toISOString(),
    model_used: modelName,
  };
  saveState(state, stateDir);

  let output;
  try {
    output = await callProvider({
      provider: providerName,
      model: modelName,
      system: systemPrompt,
      message: userMessage,
      max_tokens: config.max_tokens,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    state.skills[skillId] = {
      ...state.skills[skillId],
      status: "failed",
      error: message,
      completed_at: new Date().toISOString(),
    };
    saveState(state, stateDir);
    return { ok: false, error: message, skillId, state };
  }

  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
  const outputFile = join(outputDir, `${skillId}.md`);
  writeFileSync(outputFile, output, "utf8");

  state.skills[skillId] = {
    status: "done",
    started_at: state.skills[skillId].started_at,
    completed_at: new Date().toISOString(),
    output_path: outputFile,
    model_used: modelName,
  };
  state.context_stack = [...(state.context_stack || []), outputFile];
  state.phase = skillMeta.phase;
  state.updated_at = new Date().toISOString();
  saveState(state, stateDir);

  return {
    ok: true,
    skillId,
    output,
    outputPath: outputFile,
    state,
    next: skillMeta.next ?? null,
  };
}

/**
 * @param {object} params
 * @param {string} params.pipelineName
 * @param {boolean} [params.skipOptional]
 */
export async function runPipeline({
  toolkitRoot,
  projectRoot,
  pipelineName,
  registry,
  config,
  state,
  userInput,
  skipOptional = false,
  dry = false,
  provider,
  model,
}) {
  const pipeline = registry.pipelines?.[pipelineName];
  if (!pipeline) {
    return { ok: false, error: `Unknown pipeline: ${pipelineName}` };
  }

  const results = [];
  for (const skillId of pipeline.steps) {
    const meta = registry.skills.find((s) => s.id === skillId);
    if (skipOptional && meta?.optional) {
      state.skills[skillId] = { status: "skipped", skipped_at: new Date().toISOString() };
      saveState(state, config.pipeline.state_dir);
      results.push({ skillId, skipped: true });
      continue;
    }
    const result = await runSkill({
      toolkitRoot,
      projectRoot,
      skillId,
      userInput,
      config,
      registry,
      state,
      dry,
      provider,
      model,
    });
    results.push(result);
    if (!result.ok) {
      return { ok: false, error: result.error, results, state };
    }
  }

  return { ok: true, pipeline: pipelineName, results, state };
}
