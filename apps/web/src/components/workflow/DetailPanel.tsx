import * as React from "react";
import type { Node } from "@xyflow/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { WorkflowNodeData } from "./loadWorkflowMap";

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
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[hsl(var(--muted-foreground))]">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-[hsl(var(--foreground))]">{children}</strong>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-brand-muted px-1 py-0.5 font-mono text-[0.8rem] text-[hsl(var(--foreground))]">
      {children}
    </code>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-surface p-3 text-xs text-[hsl(var(--foreground))]">
      {children}
    </pre>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full border-collapse text-left text-xs text-[hsl(var(--foreground))]">{children}</table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="bg-brand-muted/80">{children}</thead>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border border-border px-2 py-1.5 font-semibold">{children}</th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border border-border px-2 py-1.5">{children}</td>
  ),
  tr: ({ children }: { children?: React.ReactNode }) => <tr>{children}</tr>,
  tbody: ({ children }: { children?: React.ReactNode }) => <tbody>{children}</tbody>,
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      className="font-medium text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {children}
    </a>
  ),
};

type DetailPanelProps = {
  node: Node<WorkflowNodeData> | null;
};

export function DetailPanel({ node }: DetailPanelProps) {
  if (!node) {
    return (
      <div className="flex h-full flex-col p-6">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Selecciona un nodo del mapa para ver el detalle, Markdown y recursos enlazados a Confluence.
        </p>
      </div>
    );
  }

  const resources = node.data?.resources ?? [];
  const bodyMd = node.data?.bodyMd ?? node.data?.body;

  return (
    <div className="flex h-full min-h-0 flex-col border-l border-border bg-surface-elevated">
      <div className="shrink-0 space-y-1 border-b border-border px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight text-[hsl(var(--foreground))]">{node.data.label}</h1>
        {node.data.summary ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{node.data.summary}</p>
        ) : null}
      </div>

      <Tabs className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4" defaultValue="topic">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="topic">Tema</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
        </TabsList>

        <TabsContent value="topic" className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden">
          <ScrollArea className="mt-4 h-[min(520px,calc(100vh-220px))] pr-3">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {bodyMd ? (
                <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>
                  {bodyMd}
                </ReactMarkdown>
              ) : (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Sin contenido extendido para este nodo.</p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="resources" className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden">
          <ScrollArea className="mt-4 h-[min(520px,calc(100vh-220px))] pr-3">
            <div className="space-y-3">
              {resources.length === 0 ? (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Sin enlaces adicionales.</p>
              ) : (
                <ul className="space-y-3">
                  {resources.map((r) => (
                    <li key={`${r.label}-${r.href}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        {r.external ? <Badge variant="secondary">Externo</Badge> : <Badge variant="outline">Interno</Badge>}
                        <a
                          className={cn(
                            "text-sm font-medium text-brand underline underline-offset-2 hover:opacity-90",
                          )}
                          href={r.href}
                          {...(r.external ? { rel: "noreferrer", target: "_blank" } : {})}
                        >
                          {r.label}
                        </a>
                      </div>
                      <Separator className="mt-3" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
