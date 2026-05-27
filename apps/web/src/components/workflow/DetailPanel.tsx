import * as React from "react";
import type { Node } from "@xyflow/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkflowNodeData } from "./loadWorkflowMap";
import {
  ensureProject,
  fetchProjectStatus,
  fetchSkillMarkdown,
  fetchSkillOutput,
  fetchToolkitConfig,
  getWorkflowApiBaseForDebug,
  runSkillApi,
} from "./workflowApi";

const DEFAULT_PROJECT = "local-dev";

const mdComponents = {
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mt-4 text-base font-semibold text-[hsl(var(--foreground))]">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mt-3 text-sm font-semibold text-[hsl(var(--foreground))]">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[hsl(var(--muted-foreground))]">{children}</ul>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-brand-muted px-1 py-0.5 font-mono text-[0.8rem]">{children}</code>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-surface p-3 text-xs">{children}</pre>
  ),
};

type DetailPanelProps = {
  node: Node<WorkflowNodeData> | null;
  projectId?: string;
};

export function DetailPanel({ node, projectId = DEFAULT_PROJECT }: DetailPanelProps) {
  const queryClient = useQueryClient();
  const skillId = node?.data?.skillId ?? node?.id;
  const isSkillNode = Boolean(node?.data?.skillId || node?.data?.nodeKind === "skill");
  const [userInput, setUserInput] = React.useState("");
  const [provider, setProvider] = React.useState("");
  const [model, setModel] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("skill");

  React.useEffect(() => {
    setActiveTab(isSkillNode ? "skill" : "topic");
  }, [node?.id, isSkillNode]);

  const { data: toolkitConfig } = useQuery({
    queryKey: ["toolkit-config"],
    queryFn: fetchToolkitConfig,
  });

  React.useEffect(() => {
    if (toolkitConfig) {
      setProvider((p) => p || toolkitConfig.provider);
      setModel((m) => m || toolkitConfig.model);
    }
  }, [toolkitConfig]);

  React.useEffect(() => {
    ensureProject(projectId).catch(() => {
      /* ignore — API may be down */
    });
  }, [projectId]);

  const {
    data: skillDoc,
    isPending: skillLoading,
    isError: skillError,
    error: skillFetchError,
    refetch: refetchSkill,
  } = useQuery({
    queryKey: ["skill", skillId],
    queryFn: () => fetchSkillMarkdown(skillId!),
    enabled: Boolean(skillId) && isSkillNode,
    retry: 1,
  });

  const { data: status } = useQuery({
    queryKey: ["project-status", projectId],
    queryFn: () => fetchProjectStatus(projectId),
    refetchInterval: 5000,
  });

  const skillStatus = skillId
    ? (status?.state?.skills?.[skillId] as { status?: string } | undefined)
    : undefined;

  const { data: outputMd, refetch: refetchOutput } = useQuery({
    queryKey: ["skill-output", projectId, skillId],
    queryFn: () => fetchSkillOutput(projectId, skillId!),
    enabled: Boolean(skillId) && skillStatus?.status === "done",
  });

  const runMutation = useMutation({
    mutationFn: () =>
      runSkillApi(projectId, skillId!, {
        userInput,
        provider: provider || undefined,
        model: model || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-status", projectId] });
      refetchOutput();
    },
  });

  if (!node) {
    return (
      <div className="flex h-full flex-col p-6">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Selecciona un nodo del mapa. Los skills viven en el repo (<code className="font-mono text-xs">packages/toolkit/skills</code>
          ).
        </p>
      </div>
    );
  }

  const bodyMd = node.data?.bodyMd;
  const canRun = isSkillNode && Boolean(skillId);

  return (
    <div className="flex h-full min-h-0 flex-col border-l border-border bg-surface-elevated">
      <div className="shrink-0 space-y-2 border-b border-border px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-[hsl(var(--foreground))]">{node.data.label}</h1>
          {node.data.optional ? <Badge variant="outline">Opcional</Badge> : null}
          {node.data.phase ? <Badge variant="secondary">{node.data.phase}</Badge> : null}
        </div>
        {node.data.summary ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{node.data.summary}</p>
        ) : null}
        {skillId ? (
          <p className="font-mono text-xs text-[hsl(var(--muted-foreground))]">{skillId}</p>
        ) : null}
        {skillStatus?.status ? (
          <p className="text-xs font-medium text-brand">Estado: {skillStatus.status}</p>
        ) : null}
      </div>

      <Tabs
        key={node.id}
        className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="w-full flex-wrap justify-start">
          {canRun ? <TabsTrigger value="skill">Skill</TabsTrigger> : null}
          <TabsTrigger value="topic">Contexto</TabsTrigger>
          {canRun ? <TabsTrigger value="run">Ejecutar</TabsTrigger> : null}
          {canRun ? <TabsTrigger value="output">Output</TabsTrigger> : null}
        </TabsList>

        {canRun ? (
          <TabsContent value="skill" className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden">
            <ScrollArea className="mt-4 h-[min(480px,calc(100vh-240px))] pr-3">
              {skillLoading ? (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Cargando SKILL.md…</p>
              ) : skillError ? (
                <div className="space-y-2 text-sm">
                  <p className="text-red-600">
                    {skillFetchError instanceof Error
                      ? skillFetchError.message
                      : "No se pudo cargar el skill desde el API."}
                  </p>
                  <p className="text-[hsl(var(--muted-foreground))]">
                    API: <code className="text-xs">{getWorkflowApiBaseForDebug()}/skills/{skillId}</code>
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={() => refetchSkill()}>
                    Reintentar
                  </Button>
                </div>
              ) : skillDoc?.markdown ? (
                <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>
                  {skillDoc.markdown}
                </ReactMarkdown>
              ) : (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Contenido del skill vacío.</p>
              )}
            </ScrollArea>
          </TabsContent>
        ) : null}

        <TabsContent value="topic" className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden">
          <ScrollArea className="mt-4 h-[min(480px,calc(100vh-240px))] pr-3">
            {bodyMd ? (
              <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>
                {bodyMd}
              </ReactMarkdown>
            ) : (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {canRun
                  ? "Usa la pestaña Skill para ver el prompt completo del toolkit."
                  : "Nodo de contexto o entrada. En Ejecutar, corre un skill downstream."}
              </p>
            )}
          </ScrollArea>
        </TabsContent>

        {canRun ? (
          <TabsContent value="run" className="mt-0 space-y-4 data-[state=inactive]:hidden">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Proyecto: <span className="font-mono">{projectId}</span> — outputs en{" "}
              <span className="font-mono">apps/api/data/projects/{projectId}/.atom-ai/</span>
            </p>
            <label className="block text-sm font-medium">
              Input para el skill
              <textarea
                className="mt-1 w-full min-h-[160px] rounded-md border border-border bg-surface px-3 py-2 text-sm"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Pega notas, FRD, screenshots descritos, etc."
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">
                Provider
                <select
                  className="mt-1 w-full rounded-md border border-border bg-surface px-2 py-2 text-sm"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                >
                  <option value="claude">claude</option>
                  <option value="gemini">gemini</option>
                  <option value="kimi">kimi</option>
                </select>
              </label>
              <label className="block text-sm font-medium">
                Model
                <input
                  className="mt-1 w-full rounded-md border border-border bg-surface px-2 py-2 text-sm font-mono"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </label>
            </div>
            <Button
              type="button"
              disabled={runMutation.isPending || !userInput.trim()}
              onClick={() => runMutation.mutate()}
            >
              {runMutation.isPending ? "Ejecutando…" : "Run skill"}
            </Button>
            {runMutation.isError ? (
              <p className="text-sm text-red-600">
                {runMutation.error instanceof Error ? runMutation.error.message : "Error"}
              </p>
            ) : null}
            {runMutation.isSuccess ? (
              <p className="text-sm text-brand">Completado. Revisa la pestaña Output.</p>
            ) : null}
          </TabsContent>
        ) : null}

        {canRun ? (
          <TabsContent value="output" className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden">
            <div className="mb-2 flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => refetchOutput()}>
                Actualizar
              </Button>
            </div>
            <ScrollArea className="h-[min(480px,calc(100vh-280px))] pr-3">
              {outputMd ? (
                <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>
                  {outputMd}
                </ReactMarkdown>
              ) : (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Aún no hay output. Ejecuta el skill o espera a que termine.
                </p>
              )}
            </ScrollArea>
            <Separator className="my-4" />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
