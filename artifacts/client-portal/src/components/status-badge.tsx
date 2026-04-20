import { ProjectStatus } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants: Record<ProjectStatus, string> = {
    pending: "bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200",
    in_review: "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200",
    in_progress: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200",
    revision: "bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200",
    completed: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
    cancelled: "bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200",
  };

  return (
    <Badge variant="outline" className={cn("font-medium", variants[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
