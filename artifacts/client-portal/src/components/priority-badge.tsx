import { ProjectPriority } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowRight, ArrowUp, AlertCircle } from "lucide-react";

interface PriorityBadgeProps {
  priority: ProjectPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const variants: Record<ProjectPriority, { color: string; icon: any }> = {
    low: { color: "text-slate-500", icon: ArrowDown },
    normal: { color: "text-blue-500", icon: ArrowRight },
    high: { color: "text-orange-500", icon: ArrowUp },
    urgent: { color: "text-rose-500", icon: AlertCircle },
  };

  const { color, icon: Icon } = variants[priority];

  return (
    <div className={cn("flex items-center gap-1.5 text-xs font-medium", color, className)}>
      <Icon className="h-3.5 w-3.5" />
      {PRIORITY_LABELS[priority]}
    </div>
  );
}
