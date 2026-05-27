import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { WorkflowNodeData } from "./loadWorkflowMap";

const categoryClass: Record<string, string> = {
  input:
    "border-[#5f5e5a] bg-[#f1efe8] text-[#444441] dark:border-zinc-500 dark:bg-zinc-900/80 dark:text-zinc-100",
  skill:
    "border-[#854f0b] bg-[#faeeda] text-[#854f0b] dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100",
  tool: "border-[#534ab7] bg-[#eeedfe] text-[#3c3489] dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-100",
  artifact:
    "border-[#0f6e56] bg-[#e1f5ee] text-[#0f6e56] dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100",
  code: "border-[#0079ca] bg-[#f0f9ff] text-[#0079ca] dark:border-sky-600 dark:bg-sky-950/40 dark:text-sky-100",
};

export function ConceptNode({ data }: NodeProps<Node<WorkflowNodeData>>) {
  const cat =
    data.category && categoryClass[data.category] ? data.category : "input";
  const ring = categoryClass[cat];
  const isSkill = data.nodeKind === "skill" || Boolean(data.skillId);

  return (
    <div
      className={cn(
        "min-w-[150px] max-w-[220px] rounded-lg border border-solid px-3 py-2 text-center text-xs font-semibold shadow-sm",
        ring,
      )}
    >
      <Handle className="!h-2 !w-2 !border !border-white !bg-zinc-600" position={Position.Top} type="target" />
      <span className="block leading-snug">{data.label}</span>
      {isSkill ? (
        <div className="mt-1.5 flex flex-wrap justify-center gap-1">
          {data.optional ? (
            <Badge variant="outline" className="text-[0.65rem] font-normal">
              Opcional
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[0.65rem] font-normal">
              Requerido
            </Badge>
          )}
          {data.phase ? (
            <Badge variant="outline" className="text-[0.65rem] font-normal">
              {data.phase}
            </Badge>
          ) : null}
        </div>
      ) : null}
      <Handle className="!h-2 !w-2 !border !border-white !bg-zinc-600" position={Position.Bottom} type="source" />
    </div>
  );
}

export const conceptNodeTypes = { concept: ConceptNode };
