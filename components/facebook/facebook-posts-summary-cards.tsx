
"use client"

import {
  FileText,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react"

import {
  Card,
  CardContent,
} from "@/components/ui/card"

export type FacebookPostsSummary = {
  total_posts: number
  total_likes: number
  total_comments: number
  total_shares: number
}

type FacebookPostsSummaryCardsProps = {
  summary?: FacebookPostsSummary
  isLoading?: boolean
}

const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const summaryItems = [
  {
    key: "total_posts",
    label: "Total Posts",
    icon: FileText,
  },
  {
    key: "total_likes",
    label: "Total Likes",
    icon: Heart,
  },
  {
    key: "total_comments",
    label: "Total Comments",
    icon: MessageCircle,
  },
  {
    key: "total_shares",
    label: "Total Shares",
    icon: Share2,
  },
] as const

export function FacebookPostsSummaryCards({
  summary,
  isLoading = false,
}: FacebookPostsSummaryCardsProps) {
  return (
    <section
      aria-label="Facebook posts summary"
      aria-busy={isLoading}
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {summaryItems.map(({ key, label, icon: Icon }) => {
        const value = summary?.[key]

        return (
          <Card key={key} className="min-w-0">
            <CardContent className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">
                  {label}
                </p>

                <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
                  {isLoading
                    ? "—"
                    : numberFormatter.format(value ?? 0)}
                </p>
              </div>

              <div className="shrink-0 rounded-lg border bg-muted/40 p-2">
                <Icon
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
