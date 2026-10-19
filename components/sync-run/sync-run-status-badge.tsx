import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SyncRunStatus =
  | "PENDING"
  | "QUEUED"
  | "RUNNING"
  | "PROCESSING"
  | "COMPLETED"
  | "SUCCESS"
  | "FAILED"
  | "PARTIALLY_COMPLETED"
  | "CANCELLED"
  | "RETRYING"
  | string;

interface SyncRunStatusBadgeProps {
  status: SyncRunStatus;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "border-slate-200 bg-slate-100 text-slate-700",
  QUEUED: "border-slate-200 bg-slate-100 text-slate-700",
  RUNNING: "border-blue-200 bg-blue-50 text-blue-700",
  PROCESSING: "border-blue-200 bg-blue-50 text-blue-700",
  RETRYING: "border-amber-200 bg-amber-50 text-amber-700",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  SUCCESS: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PARTIALLY_COMPLETED:
    "border-amber-200 bg-amber-50 text-amber-700",
  FAILED: "border-red-200 bg-red-50 text-red-700",
  CANCELLED: "border-slate-200 bg-slate-100 text-slate-600",
};

function formatStatus(status: string): string {
  return status
    .trim()
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function SyncRunStatusBadge({
  status,
  className,
}: SyncRunStatusBadgeProps) {
  const normalizedStatus = status.trim().toUpperCase();

  return (
    <Badge
      variant="outline"
      className={cn(
        "whitespace-nowrap font-medium",
        STATUS_STYLES[normalizedStatus] ??
          "border-slate-200 bg-slate-50 text-slate-700",
        className,
      )}
    >
      {formatStatus(normalizedStatus || "UNKNOWN")}
    </Badge>
  );
}