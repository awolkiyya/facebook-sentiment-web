
"use client"

import {
  ArrowDown,
  ArrowUp,
  Minus,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import {
  Pie,
  PieChart,
} from "recharts"

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

export interface ExecutiveSummaryData {
  positivePosts: number
  neutralPosts: number
  negativePosts: number

  // Optional API-provided percentages.
  // When omitted, percentages are derived from counts.
  positivePercentage?: number
  neutralPercentage?: number
  negativePercentage?: number
}

interface ExecutiveSummaryProps {
  data: ExecutiveSummaryData
  responseTopic?: string
}

/*
|--------------------------------------------------------------------------
| CHART CONFIG
|--------------------------------------------------------------------------
*/

const chartConfig = {
  positive: {
    label: "Positive",
    color: "var(--chart-2)",
  },
  neutral: {
    label: "Neutral",
    color: "var(--chart-3)",
  },
  negative: {
    label: "Negative",
    color: "var(--chart-1)",
  },
}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function calculatePercentage(
  count: number,
  total: number,
): number {
  if (total <= 0) {
    return 0
  }

  return (count / total) * 100
}

function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}

function normalizeCount(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, value)
}

/*
|--------------------------------------------------------------------------
| EXECUTIVE SUMMARY
|--------------------------------------------------------------------------
*/

export function ExecutiveSummary({
  data,
  responseTopic = "Water service",
}: ExecutiveSummaryProps) {
  /*
  |--------------------------------------------------------------------------
  | COUNTS
  |--------------------------------------------------------------------------
  */

  const positivePosts = normalizeCount(data.positivePosts)
  const neutralPosts = normalizeCount(data.neutralPosts)
  const negativePosts = normalizeCount(data.negativePosts)

  const total =
    positivePosts +
    neutralPosts +
    negativePosts

  /*
  |--------------------------------------------------------------------------
  | PERCENTAGES
  |--------------------------------------------------------------------------
  */

  const positivePercentage = calculatePercentage(
    positivePosts,
    total,
  )

  const neutralPercentage = calculatePercentage(
    neutralPosts,
    total,
  )

  const negativePercentage = calculatePercentage(
    negativePosts,
    total,
  )

  /*
  |--------------------------------------------------------------------------
  | CHART DATA
  |--------------------------------------------------------------------------
  */

  const chartData = [
    {
      sentiment: "positive",
      value: positivePosts,
      percentage: positivePercentage,
      fill: "var(--color-positive)",
    },
    {
      sentiment: "neutral",
      value: neutralPosts,
      percentage: neutralPercentage,
      fill: "var(--color-neutral)",
    },
    {
      sentiment: "negative",
      value: negativePosts,
      percentage: negativePercentage,
      fill: "var(--color-negative)",
    },
  ]

  /*
  |--------------------------------------------------------------------------
  | COMPONENT
  |--------------------------------------------------------------------------
  */

  return (
    <Card className="shadow-none">
      {/* HEADER */}

      <CardHeader className="flex-row items-center justify-between gap-2 px-3 pb-2 pt-3">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border bg-muted/40">
            <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
          </span>

          Executive Summary
        </CardTitle>

        <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
          {total.toLocaleString()} posts
        </span>
      </CardHeader>

      <CardContent className="space-y-3 px-3 pb-3">
        {/* DONUT + INTERPRETATION */}

        <div className="flex items-center gap-3">
          {/* DONUT CHART */}

          <div className="relative h-[96px] w-[96px] shrink-0">
            <ChartContainer
              config={chartConfig}
              className="h-full w-full"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(
                        value,
                        name,
                        item,
                      ) => {
                        const sentiment = String(name)

                        const percentage = Number(
                          item?.payload?.percentage ?? 0,
                        )

                        const label =
                          chartConfig[
                            sentiment as keyof typeof chartConfig
                          ]?.label ?? sentiment

                        return [
                          `${Number(value).toLocaleString()} posts (${formatPercentage(percentage)})`,
                          label,
                        ]
                      }}
                    />
                  }
                />

                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="sentiment"
                  innerRadius="62%"
                  outerRadius="88%"
                  paddingAngle={3}
                  cornerRadius={4}
                  stroke="var(--background)"
                  strokeWidth={2}
                />
              </PieChart>
            </ChartContainer>

            {/* CENTER VALUE */}

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold leading-none tracking-tight tabular-nums">
                {formatPercentage(positivePercentage)}
              </span>

              <span className="mt-1 text-[9px] font-medium text-muted-foreground">
                positive
              </span>
            </div>
          </div>

          {/* INTERPRETATION */}

          <div className="min-w-0 flex-1">
            {total > 0 ? (
              <p className="text-xs leading-[1.55] text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {formatPercentage(positivePercentage)}
                </span>{" "}
                of analyzed posts are positive.{" "}

                {responseTopic.trim() && (
                  <>
                    <span className="font-semibold text-foreground">
                      {responseTopic}
                    </span>{" "}
                    is the topic to monitor for potential public concerns.
                  </>
                )}
              </p>
            ) : (
              <p className="text-xs leading-[1.55] text-muted-foreground">
                No sentiment results are available for the selected data.
                Synchronize posts and complete sentiment analysis to view
                the public response summary.
              </p>
            )}
          </div>
        </div>

        {/* SENTIMENT BREAKDOWN */}

        <div className="grid grid-cols-3 overflow-hidden rounded-md border bg-muted/10">
          {/* POSITIVE */}

          <div className="flex min-w-0 flex-col items-center justify-center gap-0.5 border-r px-2 py-2">
            <div className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3 shrink-0 text-emerald-600" />

              <span className="text-sm font-semibold tabular-nums">
                {positivePosts.toLocaleString()}
              </span>
            </div>

            <span className="text-[10px] text-muted-foreground">
              Positive
            </span>

            <span className="text-[10px] text-muted-foreground tabular-nums">
              {formatPercentage(positivePercentage)}
            </span>
          </div>

          {/* NEUTRAL */}

          <div className="flex min-w-0 flex-col items-center justify-center gap-0.5 border-r px-2 py-2">
            <div className="flex items-center gap-1">
              <Minus className="h-3 w-3 shrink-0 text-slate-500" />

              <span className="text-sm font-semibold tabular-nums">
                {neutralPosts.toLocaleString()}
              </span>
            </div>

            <span className="text-[10px] text-muted-foreground">
              Neutral
            </span>

            <span className="text-[10px] text-muted-foreground tabular-nums">
              {formatPercentage(neutralPercentage)}
            </span>
          </div>

          {/* NEGATIVE */}

          <div className="flex min-w-0 flex-col items-center justify-center gap-0.5 px-2 py-2">
            <div className="flex items-center gap-1">
              <ArrowDown className="h-3 w-3 shrink-0 text-red-600" />

              <span className="text-sm font-semibold tabular-nums">
                {negativePosts.toLocaleString()}
              </span>
            </div>

            <span className="text-[10px] text-muted-foreground">
              Negative
            </span>

            <span className="text-[10px] text-muted-foreground tabular-nums">
              {formatPercentage(negativePercentage)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
