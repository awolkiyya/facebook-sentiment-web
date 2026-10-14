"use client"

import {
  BadgeCheck,
  Clock3,
  Heart,
  MessageCircle,
  RefreshCw,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"

import {
  Badge,
} from "@/components/ui/badge"

import {
  Card,
  CardContent,
} from "@/components/ui/card"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface FacebookPostSummaryProps {
  postDate: string
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
  return (
    <Card
      className={[
        "border-border/70 shadow-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <CardContent className="p-0">
        {/* ------------------------------------------------------------------ */}
        {/* Source                                                             */}
        {/* ------------------------------------------------------------------ */}

        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-blue-600 text-[10px] font-semibold text-white">
                FB
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-sm font-semibold">
                  Official Facebook Page
                </span>

                <BadgeCheck
                  className="h-3.5 w-3.5 shrink-0 fill-blue-600 text-white"
                  aria-label="Verified page"
                />
              </div>

              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock3 className="h-3 w-3" />
                  {formatDate(postDate)}
                </span>

                <span className="text-border">
                  •
                </span>

                <span className="truncate">
                  Post response analysis
                </span>
              </div>
            </div>
          </div>

          <Badge
            variant="secondary"
            className="hidden shrink-0 rounded-full px-2 py-1 text-[10px] font-medium sm:inline-flex"
          >
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Analysis available
          </Badge>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Post message                                                       */}
        {/* ------------------------------------------------------------------ */}

        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
            {postMessage}
          </p>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Engagement                                                         */}
        {/* ------------------------------------------------------------------ */}

        <div className="border-t bg-muted/20 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-5 sm:gap-7">
            <EngagementMetric
              icon={<Heart className="h-3.5 w-3.5" />}
              value={formatNumber(postLikes)}
              label="reactions"
            />

            <EngagementMetric
              icon={<MessageCircle className="h-3.5 w-3.5" />}
              value={formatNumber(totalComments)}
              label="comments"
              emphasized
            />

            <EngagementMetric
              icon={<RefreshCw className="h-3.5 w-3.5" />}
              value={formatNumber(postShares)}
              label="shares"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/* Engagement metric                                                          */
/* -------------------------------------------------------------------------- */

interface EngagementMetricProps {
  icon: React.ReactNode
  value: string
  label: string
  emphasized?: boolean
}

function EngagementMetric({
  icon,
  value,
  label,
  emphasized = false,
}: EngagementMetricProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className={[
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
          emphasized
            ? "bg-primary/10 text-primary"
            : "bg-background text-muted-foreground",
        ].join(" ")}
      >
        {icon}
      </span>

      <div className="flex items-baseline gap-1.5">
        <span className="text-xs font-semibold tabular-nums text-foreground">
          {value}
        </span>

        <span className="hidden text-[11px] text-muted-foreground sm:inline">
          {label}
        </span>
      </div>
    </div>
  )
}