
"use client"

import {
  Archive,
  CheckCircle2,
  FileEdit,
  PowerOff,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { AiModelStatus } from "@/types/ai-model"

interface ModelStatusBadgeProps {
  status: AiModelStatus
}

const STATUS_CONFIG: Record<
  AiModelStatus,
  {
    label: string
    icon: typeof CheckCircle2
    className: string
  }
> = {
  DRAFT: {
    label: "Draft",
    icon: FileEdit,
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300",
  },

  ACTIVE: {
    label: "Active",
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
  },

  INACTIVE: {
    label: "Inactive",
    icon: PowerOff,
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300",
  },

  ARCHIVED: {
    label: "Archived",
    icon: Archive,
    className:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-300",
  },
}

export default function ModelStatusBadge({
  status,
}: ModelStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={`gap-1.5 whitespace-nowrap ${config.className}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {config.label}
    </Badge>
  )
}
