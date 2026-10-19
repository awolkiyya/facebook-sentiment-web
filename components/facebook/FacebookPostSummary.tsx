
"use client"

import type { ReactNode } from "react"

import {
  Clock3,
  Heart,
  MessageCircle,
  Repeat2,
  FileText,
  Sparkles,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { formatEthiopianDateWithTime } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface FacebookPostSummaryProps {
  postDate: string | null
  postMessage: string

  postLikes: number
  totalComments: number
  postShares: number

  formatDate: (value: string) => string
  formatNumber: (value: number) => string

  className?: string
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function FacebookPostSummary({
  postDate,
  postMessage,
  postLikes,
  totalComments,
  postShares,
  formatDate,
  formatNumber,
  className,
}: FacebookPostSummaryProps) {
  const message = postMessage.trim()

  const formattedDate = postDate
    ? formatEthiopianDateWithTime(postDate)
    : "Date unavailable"

  const metrics = [
    {
      label: "Reactions",
      value: postLikes,
      icon: Heart,
      iconClassName: "text-rose-500",
      iconBackground: "bg-rose-500/10",
    },
    {
      label: "Comments",
      value: totalComments,
      icon: MessageCircle,
      iconClassName: "text-blue-600 dark:text-blue-400",
      iconBackground: "bg-blue-500/10",
    },
    {
      label: "Shares",
      value: postShares,
      icon: Repeat2,
      iconClassName: "text-emerald-600 dark:text-emerald-400",
      iconBackground: "bg-emerald-500/10",
    },
  ] as const

  return (
    <Card
      className={[
        "group overflow-hidden rounded-none border-none bg-card shadow-none transition-shadow duration-200",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <CardContent className="p-0">
        {/* Post identity */}
        <div className="flex items-start justify-between gap-3 border-b border-border/60 px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-10 shrink-0 rounded-xl border border-blue-500/15">
              <AvatarFallback className="rounded-xl bg-blue-600 text-white">
                <span
                  className="text-xl font-bold leading-none"
                  aria-hidden="true"
                >
                  f
                </span>
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 space-y-1">
              <p className="truncate text-sm font-semibold tracking-tight">
                Facebook post
              </p>

              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3
                    className="size-3.5 shrink-0"
                    aria-hidden="true"
                  />

                  <time>
                    {formattedDate}
                  </time>
                </span>

                <span
                  className="text-border"
                  aria-hidden="true"
                >
                  ·
                </span>

                <span className="truncate">
                  Post overview
                </span>
              </div>
            </div>
          </div>

          <Badge
            variant="secondary"
            className="shrink-0 gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium"
          >
            <Sparkles
              className="size-3"
              aria-hidden="true"
            />

            Insights
          </Badge>
        </div>

        {/* Post content */}
        <div className="px-4 py-5 sm:px-5 sm:py-6">
          {message ? (
            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground/90">
              {message}
            </p>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-4">
              <FileText
                className="size-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />

              <div className="min-w-0">
                <p className="text-sm font-medium">
                  No text content
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  This post may contain an image, video, or other media.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Engagement summary */}
        <div className="border-t border-border/60 bg-muted/20 px-4 py-4 sm:px-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Engagement
            </p>

            <span className="text-[11px] text-muted-foreground">
              Post metrics
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {metrics.map((metric) => (
              <EngagementMetric
                key={metric.label}
                icon={
                  <metric.icon
                    className={[
                      "size-4",
                      metric.iconClassName,
                    ].join(" ")}
                    aria-hidden="true"
                  />
                }
                iconBackground={metric.iconBackground}
                value={formatNumber(metric.value)}
                label={metric.label}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/* Engagement Metric                                                          */
/* -------------------------------------------------------------------------- */

interface EngagementMetricProps {
  icon: ReactNode
  iconBackground: string
  value: string
  label: string
}

function EngagementMetric({
  icon,
  iconBackground,
  value,
  label,
}: EngagementMetricProps) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-lg border border-border/60 bg-card px-2.5 py-3 sm:px-3">
      <span
        className={[
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          iconBackground,
        ].join(" ")}
      >
        {icon}
      </span>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tabular-nums tracking-tight text-foreground sm:text-base">
          {value}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">
          {label}
        </p>
      </div>
    </div>
  )
}
