import { Router } from "express";
import {
  ensureProject,
  getProjectState,
  getStateDirFromConfig,
  getToolkitConfigForApi,
  initProject,
  listPipelines,
  listSkills,
  readProjectOutput,
  readSkillFile,
  resolveProjectConfig,
  resolveProjectRoot,
  resolveToolkitRoot,
  runPipeline,
  runSkill,
} from "../lib/toolkit.js";
import { loadState } from "@atom-ai/toolkit";

export const toolkitRouter = Router();

toolkitRouter.get("/skills", (_req, res) => {
  res.json({ skills: listSkills(resolveToolkitRoot()) });
});

toolkitRouter.get("/skills/:id", (req, res) => {
  const skill = readSkillFile(resolveToolkitRoot(), req.params.id);
  if (!skill) {
    res.status(404).json({ error: "skill_not_found", id: req.params.id });
    return;
  }
  res.json({
    id: skill.meta.id,
    meta: skill.meta,
    frontmatter: skill.frontmatter,
    markdown: skill.body,
    raw: skill.raw,
  });
});

toolkitRouter.get("/pipelines", (_req, res) => {
  res.json({ pipelines: listPipelines(resolveToolkitRoot()) });
});

toolkitRouter.get("/toolkit/config", (_req, res) => {
  const { config, toolkitRoot } = getToolkitConfigForApi();
  res.json({
    toolkitRoot,
    provider: config.provider,
    model: config.model,
    providers: config.providers ?? null,
    max_tokens: config.max_tokens,
  });
});

toolkitRouter.post("/projects", (req, res) => {
  const projectId = String(req.body?.projectId ?? req.body?.project ?? "").trim();
  if (!projectId) {
    res.status(400).json({ error: "project_id_required" });
    return;
  }
  try {
    const projectRoot = resolveProjectRoot(projectId);
    const { state } = initProject(projectRoot, projectId);
    res.status(201).json({ projectId, state });
  } catch (e) {
    const message = e instanceof Error ? e.message : "init_failed";
    res.status(400).json({ error: message });
  }
});

toolkitRouter.get("/projects/:id/status", (req, res) => {
  try {
    const projectRoot = resolveProjectRoot(req.params.id);
    const { state, config } = getProjectState(projectRoot);
    if (!state) {
      res.status(404).json({ error: "project_not_initialized", projectId: req.params.id });
      return;
    }
    res.json({ projectId: req.params.id, state, config: { provider: config.provider, model: config.model } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "status_failed";
    res.status(400).json({ error: message });
  }
});

toolkitRouter.get("/projects/:id/outputs/:skillId", (req, res) => {
  try {
    const projectRoot = resolveProjectRoot(req.params.id);
    const content = readProjectOutput(projectRoot, req.params.skillId);
    if (content === null) {
      res.status(404).json({ error: "output_not_found", skillId: req.params.skillId });
      return;
    }
    res.type("text/markdown").send(content);
  } catch (e) {
    const message = e instanceof Error ? e.message : "read_output_failed";
    res.status(400).json({ error: message });
  }
});

toolkitRouter.post("/projects/:id/run/:skillId", async (req, res) => {
  const userInput = String(req.body?.userInput ?? "");
  const provider = req.body?.provider as string | undefined;
  const model = req.body?.model as string | undefined;
  const dry = Boolean(req.body?.dry);

  try {
    const projectId = req.params.id;
    const skillId = req.params.skillId;
    const { projectRoot, state: initialState } = ensureProject(projectId);
    const toolkitRoot = resolveToolkitRoot();
    const { config, registry } = getToolkitConfigForApi();
    const projectConfig = resolveProjectConfig(config, projectRoot);
    let state = initialState ?? loadState(getStateDirFromConfig(projectConfig as Record<string, unknown>));
    if (!state) {
      const init = initProject(projectRoot, projectId);
      state = init.state;
    }

    const result = await runSkill({
      toolkitRoot,
      projectRoot,
      skillId,
      userInput,
      config: projectConfig,
      registry,
      state,
      dry,
      provider,
      model,
    });

    if (!result.ok) {
      res.status(500).json({ error: result.error, skillId, state: result.state });
      return;
    }

    res.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "run_failed";
    res.status(500).json({ error: message });
  }
});

toolkitRouter.post("/projects/:id/run-pipeline", async (req, res) => {
  const pipelineName = String(req.body?.pipeline ?? "full");
  const userInput = String(req.body?.userInput ?? "");
  const skipOptional = Boolean(req.body?.skipOptional);
  const provider = req.body?.provider as string | undefined;
  const model = req.body?.model as string | undefined;
  const dry = Boolean(req.body?.dry);

  try {
    const projectId = req.params.id;
    const { projectRoot, state: initialState } = ensureProject(projectId);
    const toolkitRoot = resolveToolkitRoot();
    const { config, registry } = getToolkitConfigForApi();
    const projectConfig = resolveProjectConfig(config, projectRoot);
    let state = initialState ?? loadState(getStateDirFromConfig(projectConfig as Record<string, unknown>));
    if (!state) {
      const init = initProject(projectRoot, projectId);
      state = init.state;
    }

    const result = await runPipeline({
      toolkitRoot,
      projectRoot,
      pipelineName,
      registry,
      config: projectConfig,
      state,
      userInput,
      skipOptional,
      dry,
      provider,
      model,
    });

    if (!result.ok) {
      res.status(500).json({ error: result.error, results: result.results, state: result.state });
      return;
    }

    res.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "pipeline_failed";
    res.status(500).json({ error: message });
  }
});
