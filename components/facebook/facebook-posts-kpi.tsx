"use client"

import {
  FileText,
  MessageSquare,
  Share2,
  ThumbsUp,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

import type { FacebookPostKpis } from  "@/types/facebook-post"

interface FacebookPostsKpiProps {
  kpis: FacebookPostKpis
}

function formatCompactNumber(
  value: number,
): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function KpiItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {label}
          </p>

          <p className="mt-0.5 text-lg font-semibold">
            {formatCompactNumber(value)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function FacebookPostsKpi({
  kpis,
}: FacebookPostsKpiProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiItem
        icon={<FileText className="h-4 w-4" />}
        label="Posts Reviewed"
        value={kpis.posts}
      />

      <KpiItem
        icon={<ThumbsUp className="h-4 w-4" />}
        label="Reactions"
        value={kpis.reactions}
      />

      <KpiItem
        icon={<MessageSquare className="h-4 w-4" />}
        label="Comments"
        value={kpis.comments}
      />

      <KpiItem
        icon={<Share2 className="h-4 w-4" />}
        label="Shares"
        value={kpis.shares}
      />
    </div>
  )
}