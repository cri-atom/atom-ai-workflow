function getApiBase(): string {
  if (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_API_URL) {
    return import.meta.env.PUBLIC_API_URL;
  }
  return "http://localhost:4000";
}

const base = () => `${getApiBase()}/api/v1`;

export type ToolkitConfig = {
  provider: string;
  model: string;
  providers: Record<string, unknown> | null;
  max_tokens: number;
};

export async function fetchToolkitConfig(): Promise<ToolkitConfig> {
  const res = await fetch(`${base()}/toolkit/config`);
  if (!res.ok) throw new Error("No se pudo cargar la configuración del toolkit");
  return res.json();
}

export async function ensureProject(projectId: string) {
  const res = await fetch(`${base()}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId }),
  });
  if (res.status === 201 || res.ok) return res.json();
  throw new Error("No se pudo inicializar el proyecto");
}

export async function fetchSkillMarkdown(skillId: string) {
  const res = await fetch(`${base()}/skills/${encodeURIComponent(skillId)}`);
  if (!res.ok) throw new Error(`Skill no encontrado: ${skillId}`);
  return res.json() as Promise<{
    id: string;
    meta: Record<string, unknown>;
    frontmatter: Record<string, unknown>;
    markdown: string;
  }>;
}

export async function fetchProjectStatus(projectId: string) {
  const res = await fetch(`${base()}/projects/${encodeURIComponent(projectId)}/status`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchSkillOutput(projectId: string, skillId: string) {
  const res = await fetch(
    `${base()}/projects/${encodeURIComponent(projectId)}/outputs/${encodeURIComponent(skillId)}`,
  );
  if (!res.ok) return null;
  return res.text();
}

export async function runSkillApi(
  projectId: string,
  skillId: string,
  body: { userInput: string; provider?: string; model?: string },
) {
  const res = await fetch(
    `${base()}/projects/${encodeURIComponent(projectId)}/run/${encodeURIComponent(skillId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al ejecutar el skill");
  return data;
}
