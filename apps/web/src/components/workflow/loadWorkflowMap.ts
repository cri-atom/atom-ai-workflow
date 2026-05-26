export type WorkflowResource = {
  label: string;
  href: string;
  external?: boolean;
};

export type WorkflowNodeData = {
  category?: string;
  label: string;
  summary?: string;
  bodyMd?: string;
  body?: string;
  resources?: WorkflowResource[];
};

export type WorkflowMapPayload = {
  id: string;
  title?: string;
  nodes: import("@xyflow/react").Node<WorkflowNodeData>[];
  edges: import("@xyflow/react").Edge[];
};

function getApiBase(): string {
  if (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_API_URL) {
    return import.meta.env.PUBLIC_API_URL;
  }
  return "http://localhost:4000";
}

const offlineFallback: WorkflowMapPayload = {
  id: "default",
  title: "Atom AI — Feature workflow",
  nodes: [
    {
      id: "offline",
      type: "concept",
      position: { x: 120, y: 120 },
      data: {
        category: "input",
        label: "Sin datos del mapa",
        summary: "No se pudo cargar el API ni el JSON estático.",
        bodyMd:
          "Arranca el API (`npm run dev` en la raíz del monorepo) o ejecuta `npm run sync-docs-map -w @atom-ai/api` para copiar `default.json` a `apps/web/public/workflow-map.json`.",
        resources: [],
      },
    },
  ],
  edges: [],
};

export async function loadWorkflowMap(): Promise<WorkflowMapPayload> {
  const base = getApiBase();
  try {
    const res = await fetch(`${base}/api/v1/maps/default`);
    if (res.ok) {
      return res.json() as Promise<WorkflowMapPayload>;
    }
  } catch {
    // fall through
  }
  if (typeof window !== "undefined") {
    try {
      const r2 = await fetch("/workflow-map.json");
      if (r2.ok) {
        return r2.json() as Promise<WorkflowMapPayload>;
      }
    } catch {
      // ignore
    }
  }
  return offlineFallback;
}
