
"use client"

import type { ReactNode } from "react"

import {
  FileText,
  MessageSquare,
  Share2,
  ThumbsUp,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

export interface FacebookPostKpis {
  posts: number
  reactions: number
  comments: number
  shares: number
}

interface FacebookPostsKpiProps {
  kpis: FacebookPostKpis
}

interface KpiItemProps {
  icon: ReactNode
  label: string
  value: number
}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

/*
|--------------------------------------------------------------------------
| KPI ITEM
|--------------------------------------------------------------------------
*/

function KpiItem({
  icon,
  label,
  value,
}: KpiItemProps) {
  return (
    <Card className="shadow-none">
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted"
          aria-hidden="true"
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {label}
          </p>

          <p className="mt-0.5 text-lg font-semibold tabular-nums">
            {formatCompactNumber(value)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/*
|--------------------------------------------------------------------------
| FACEBOOK POSTS KPI
|--------------------------------------------------------------------------
*/

export function FacebookPostsKpi({
  kpis,
}: FacebookPostsKpiProps) {
  return (
    <section
      aria-label="Facebook post statistics"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
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
    </section>
  )
}
