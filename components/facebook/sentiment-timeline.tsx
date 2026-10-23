"use client"

import { useState } from "react"

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
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

import {
  BarChart3,
  MessageCircle,
  TrendingUp,
} from "lucide-react"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface SentimentTimelineItem {
  date: string
  total: number
  average: number | null
}

interface SentimentTimelineProps {
  data: SentimentTimelineItem[]
  className?: string
}

type TimelineView = "combined" | "volume" | "sentiment"

/* -------------------------------------------------------------------------- */
/* Chart configuration                                                        */
/* -------------------------------------------------------------------------- */

const timelineChartConfig = {
  total: {
    label: "Comments",
    color: "hsl(221 83% 53%)",
  },
  average: {
    label: "Average score",
    color: "hsl(142 71% 45%)",
  },
} satisfies ChartConfig

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDay(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  const date = match
    ? new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
      )
    : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date)
}

function formatAverage(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return "N/A"
  }

  return value.toFixed(2)
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function SentimentTimeline({
  data,
  className,
}: SentimentTimelineProps) {
  const [view, setView] = useState<TimelineView>("combined")

  const hasData = data.length > 0
  const showVolume = view !== "sentiment"
  const showSentiment = view !== "volume"

  const activeChartConfig: ChartConfig =
    view === "volume"
      ? { total: timelineChartConfig.total }
      : view === "sentiment"
        ? { average: timelineChartConfig.average }
        : timelineChartConfig

  return (
    <Card
      className={`my-5 border-border/70 shadow-none ${
        className ?? ""
      }`}
    >
      <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-sm font-semibold tracking-tight">
                  Sentiment timeline
                </CardTitle>

                {hasData && (
                  <span className="inline-flex items-center rounded-full border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {data.length} {data.length === 1 ? "day" : "days"}
                  </span>
                )}
              </div>

              <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
                {view === "combined"
                  ? "Compare daily comment volume with average sentiment."
                  : view === "volume"
                    ? "Track the number of comments received each day."
                    : "Track the average sentiment score on a 1–5 scale."}
              </p>
            </div>

            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={view}
              onValueChange={(value) => {
                if (value) {
                  setView(value as TimelineView)
                }
              }}
              aria-label="Choose timeline chart view"
              className="w-fit shrink-0"
            >
              <ToggleGroupItem
                value="combined"
                aria-label="Combined chart"
                className="gap-1.5 px-2.5 text-xs"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Combined
              </ToggleGroupItem>

              <ToggleGroupItem
                value="volume"
                aria-label="Comment volume chart"
                className="px-2.5 text-xs"
              >
                Volume
              </ToggleGroupItem>

              <ToggleGroupItem
                value="sentiment"
                aria-label="Sentiment score chart"
                className="px-2.5 text-xs"
              >
                Sentiment
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 pb-5 sm:px-5">
        {!hasData ? (
          <EmptyTimeline />
        ) : (
          <div className="w-full overflow-x-auto">
            <div
              className={
                data.length > 14 ? "min-w-[900px]" : "min-w-full"
              }
            >
              <ChartContainer
                config={activeChartConfig}
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
                  <CartesianGrid
                    vertical={false}
                    className="stroke-border/40"
                  />

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

                  {showVolume && (
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
                  )}

                  {showSentiment && (
                    <YAxis
                      yAxisId="sentiment"
                      orientation="right"
                      domain={[1, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      allowDecimals
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={30}
                      fontSize={10}
                    />
                  )}

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
                        formatter={(value, name) => {
                          if (name === "average") {
                            return [
                              formatAverage(
                                value == null ? null : Number(value),
                              ),
                              "Average score",
                            ]
                          }

                          return [
                            Number(value).toLocaleString(),
                            "Comments",
                          ]
                        }}
                      />
                    }
                  />

                  {showVolume && (
                    <Bar
                      yAxisId="volume"
                      dataKey="total"
                      fill="var(--color-total)"
                      radius={[4, 4, 0, 0]}
                    />
                  )}

                  {showSentiment && (
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
                  )}

                  <ChartLegend
                    content={
                      <ChartLegendContent className="pt-2" />
                    }
                  />
                </ComposedChart>
              </ChartContainer>

              <div className="mt-2 flex flex-col gap-1 border-t px-1 pt-3 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                {showVolume && (
                  <span>
                    <span className="font-medium text-foreground">
                      Volume
                    </span>{" "}
                    · comments per day
                  </span>
                )}

                {showSentiment && (
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />

                    <span>
                      <span className="font-medium text-foreground">
                        Score
                      </span>{" "}
                      · average sentiment from 1–5
                    </span>
                  </span>
                )}
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
          There are no analyzed comments in this period.
        </p>
      </div>
    </div>
  )
}