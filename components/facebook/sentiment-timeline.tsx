"use client"

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  MessageCircle,
  TrendingUp,
} from "lucide-react"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface SentimentTimelineItem {
  date: string
  positive: number
  neutral: number
  negative: number
  average: number
  total: number
}

interface SentimentTimelineProps {
  data: SentimentTimelineItem[]
  className?: string
}

/* -------------------------------------------------------------------------- */
/* Chart configuration                                                        */
/* -------------------------------------------------------------------------- */

const timelineChartConfig = {
  positive: {
    label: "Positive",
    color: "hsl(142 71% 45%)",
  },

  neutral: {
    label: "Neutral",
    color: "hsl(38 92% 50%)",
  },

  negative: {
    label: "Negative",
    color: "hsl(0 72% 51%)",
  },

  average: {
    label: "Average score",
    color: "hsl(221 83% 53%)",
  },
} satisfies ChartConfig

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDay(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date)
}

function formatAverage(value: number) {
  return Number(value).toFixed(2)
}

function getTotalComments(data: SentimentTimelineItem[]) {
  return data.reduce(
    (sum, item) => sum + item.total,
    0,
  )
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function SentimentTimeline({
  data,
  className,
}: SentimentTimelineProps) {
  const hasData = data.length > 0

  const totalComments = hasData
    ? getTotalComments(data)
    : 0

  return (
    <Card
      className={`border-border/70 shadow-none my-5 ${
        className ?? ""
      }`}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            {/* Title ------------------------------------------------------- */}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold tracking-tight">
                  Sentiment timeline
                </CardTitle>

                {hasData && (
                  <span className="inline-flex items-center rounded-full border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {data.length}{" "}
                    {data.length === 1
                      ? "day"
                      : "days"}
                  </span>
                )}
              </div>

              <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
                Daily comment volume and average
                sentiment score over the selected
                period.
              </p>
            </div>

          </div>
        </div>
      </CardHeader>

      {/* ------------------------------------------------------------------ */}
      {/* Content                                                            */}
      {/* ------------------------------------------------------------------ */}

      <CardContent className="px-2 pb-5 sm:px-5">
        {!hasData ? (
          <EmptyTimeline />
        ) : (
          <div className="w-full overflow-x-auto">
            <div
              className={
                data.length > 14
                  ? "min-w-[900px]"
                  : "min-w-full"
              }
            >
              <ChartContainer
                config={timelineChartConfig}
                className="h-[330px] w-full"
              >
                <ComposedChart
                  accessibilityLayer
                  data={data}
                  margin={{
                    top: 12,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  {/* ------------------------------------------------------ */}
                  {/* Grid                                                    */}
                  {/* ------------------------------------------------------ */}

                  <CartesianGrid
                    vertical={false}
                    className="stroke-border/40"
                  />

                  {/* ------------------------------------------------------ */}
                  {/* X axis                                                  */}
                  {/* ------------------------------------------------------ */}

                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    minTickGap={28}
                    fontSize={11}
                    tickFormatter={(value) =>
                      formatDay(String(value))
                    }
                  />

                  {/* ------------------------------------------------------ */}
                  {/* Volume axis                                             */}
                  {/* ------------------------------------------------------ */}

                  <YAxis
                    yAxisId="volume"
                    orientation="left"
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={36}
                    fontSize={10}
                    tickFormatter={(value) =>
                      Number(value).toLocaleString()
                    }
                  />

                  {/* ------------------------------------------------------ */}
                  {/* Sentiment axis                                          */}
                  {/* ------------------------------------------------------ */}

                  <YAxis
                    yAxisId="sentiment"
                    orientation="right"
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={30}
                    fontSize={10}
                  />

                  {/* ------------------------------------------------------ */}
                  {/* Tooltip                                                 */}
                  {/* ------------------------------------------------------ */}

                  <ChartTooltip
                    cursor={{
                      fill: "hsl(var(--muted))",
                      opacity: 0.25,
                    }}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) =>
                          formatDay(String(value))
                        }
                        formatter={(
                          value,
                          name,
                        ) => {
                          if (
                            name ===
                            "average"
                          ) {
                            return [
                              formatAverage(
                                Number(value),
                              ),
                              "Average score",
                            ]
                          }

                          return [
                            Number(
                              value,
                            ).toLocaleString(),
                            name,
                          ]
                        }}
                      />
                    }
                  />

                  {/* ------------------------------------------------------ */}
                  {/* Positive                                                */}
                  {/* ------------------------------------------------------ */}

                  <Bar
                    yAxisId="volume"
                    dataKey="positive"
                    stackId="sentiment"
                    fill="var(--color-positive)"
                    radius={[0, 0, 0, 0]}
                  />

                  {/* ------------------------------------------------------ */}
                  {/* Neutral                                                 */}
                  {/* ------------------------------------------------------ */}

                  <Bar
                    yAxisId="volume"
                    dataKey="neutral"
                    stackId="sentiment"
                    fill="var(--color-neutral)"
                    radius={[0, 0, 0, 0]}
                  />

                  {/* ------------------------------------------------------ */}
                  {/* Negative                                                */}
                  {/* ------------------------------------------------------ */}

                  <Bar
                    yAxisId="volume"
                    dataKey="negative"
                    stackId="sentiment"
                    fill="var(--color-negative)"
                    radius={[4, 4, 0, 0]}
                  />

                  {/* ------------------------------------------------------ */}
                  {/* Average sentiment line                                  */}
                  {/* ------------------------------------------------------ */}

                  <Line
                    yAxisId="sentiment"
                    dataKey="average"
                    type="monotone"
                    stroke="var(--color-average)"
                    strokeWidth={2.5}
                    dot={{
                      r: 3,
                      strokeWidth: 2,
                      fill: "var(--color-average)",
                    }}
                    activeDot={{
                      r: 5,
                      strokeWidth: 2,
                      fill: "var(--color-average)",
                    }}
                    connectNulls
                  />

                  {/* ------------------------------------------------------ */}
                  {/* Shadcn chart legend                                     */}
                  {/* ------------------------------------------------------ */}

                  <ChartLegend
                    content={
                      <ChartLegendContent
                        className="pt-2"
                      />
                    }
                  />
                </ComposedChart>
              </ChartContainer>

              {/* ---------------------------------------------------------- */}
              {/* Axis explanation                                           */}
              {/* ---------------------------------------------------------- */}

              <div className="mt-2 flex flex-col gap-1 border-t px-1 pt-3 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <span className="font-medium text-foreground">
                    Volume
                  </span>{" "}
                  · comments per day
                </span>

                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />

                  <span>
                    <span className="font-medium text-foreground">
                      Score
                    </span>{" "}
                    · average sentiment from 1–5
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                */
/* -------------------------------------------------------------------------- */

function EmptyTimeline() {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed bg-muted/10">
      <div className="max-w-xs px-5 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border bg-background">
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
        </div>

        <p className="mt-3 text-sm font-medium">
          No sentiment data
        </p>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          There are no analyzed comments in this
          period.
        </p>
      </div>
    </div>
  )
}