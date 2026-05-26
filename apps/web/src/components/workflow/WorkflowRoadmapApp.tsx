import "@xyflow/react/dist/style.css";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { conceptNodeTypes } from "./ConceptNode";
import { DetailPanel } from "./DetailPanel";
import { loadWorkflowMap, type WorkflowNodeData } from "./loadWorkflowMap";

const MINIMAP_COLORS: Record<string, string> = {
  input: "#a89f94",
  skill: "#c4a574",
  tool: "#8b82c9",
  artifact: "#3d9b7f",
  code: "#4aa8e0",
};

type WorkflowRoadmapAppProps = {
  docsUrl: string;
};

function WorkflowSidebar({ docsUrl }: { docsUrl: string }) {
  return (
    <aside className="flex flex-col border-r border-border bg-surface-elevated">
      <div className="border-b border-border px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Atom</p>
        <p className="mt-1 text-sm font-semibold text-[hsl(var(--foreground))]">AI Workflow</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3 text-sm">
        <a className="rounded-md px-3 py-2 font-medium text-[hsl(var(--foreground))] hover:bg-brand-muted" href="/">
          Inicio
        </a>
        <a
          className="rounded-md px-3 py-2 font-medium text-[hsl(var(--muted-foreground))] hover:bg-brand-muted hover:text-[hsl(var(--foreground))]"
          href={docsUrl}
        >
          Documentación
        </a>
        <span className="mt-auto rounded-md bg-brand-muted/60 px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">
          Mapa interactivo — mismo JSON que el API <code className="font-mono">/api/v1/maps/default</code>
        </span>
      </nav>
    </aside>
  );
}

function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
}: {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node<WorkflowNodeData>>;
  onEdgesChange: OnEdgesChange;
  onNodeClick: (event: React.MouseEvent, node: Node<WorkflowNodeData>) => void;
}) {
  const miniMapColor = useCallback((n: Node<WorkflowNodeData>) => {
    const c = n.data?.category;
    return (c && MINIMAP_COLORS[c]) || "#94a3b8";
  }, []);

  return (
    <div className="absolute inset-0 min-h-0 min-w-0">
      <ReactFlow
        defaultEdgeOptions={{ style: { strokeWidth: 2 } }}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodes={nodes}
        nodeTypes={conceptNodeTypes}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodesChange={onNodesChange}
      >
        <Background />
        <Controls />
        <MiniMap nodeColor={miniMapColor} pannable zoomable />
      </ReactFlow>
    </div>
  );
}

function Inner({ docsUrl }: WorkflowRoadmapAppProps) {
  const [selected, setSelected] = useState<Node<WorkflowNodeData> | null>(null);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["workflow-map", "default"],
    queryFn: loadWorkflowMap,
    staleTime: 60_000,
    retry: 1,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<WorkflowNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!data) return;
    setNodes(data.nodes ?? []);
    setEdges(data.edges ?? []);
  }, [data, setEdges, setNodes]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<WorkflowNodeData>) => {
      setSelected(node);
    },
    [],
  );

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface text-sm text-[hsl(var(--muted-foreground))]">
        Cargando mapa…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {error instanceof Error ? error.message : "Error al cargar el mapa"}
        </p>
        <button
          type="button"
          className="rounded-md border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-brand-muted"
          onClick={() => refetch()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="grid h-screen min-h-0 w-full grid-cols-[220px_minmax(0,1fr)_min(100%,420px)] grid-rows-1 bg-surface text-[hsl(var(--foreground))]">
      <WorkflowSidebar docsUrl={docsUrl} />
      <main className="relative min-h-0 min-w-0 border-x border-border bg-surface-elevated">
        <WorkflowCanvas
          edges={edges}
          nodes={nodes}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodesChange={onNodesChange}
        />
      </main>
      <section className="min-h-0 min-w-0 overflow-hidden">
        <DetailPanel node={selected} />
      </section>
    </div>
  );
}

export default function WorkflowRoadmapApp({ docsUrl }: WorkflowRoadmapAppProps) {
  const client = useMemo(() => new QueryClient(), []);
  return (
    <QueryClientProvider client={client}>
      <ReactFlowProvider>
        <Inner docsUrl={docsUrl} />
      </ReactFlowProvider>
    </QueryClientProvider>
  );
}
