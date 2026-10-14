import { MessageCircle, Sparkles, Users2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { CommentFilters, CustomDateRangeCard } from "./comment-filters"
import { CommentHighlights } from "./comment-highlights"
import { SentimentDonut } from "./sentiment-donut"
import { SentimentGauge } from "./sentiment-gauge"
import { SentimentStatCard } from "./sentiment-stat-card"
import { SentimentTimelineCard } from "./sentiment-timeline-card"
import { DateRange, Sentiment, TimelinePoint, UiComment } from "@/types/facebook/post-comments-analytics"
import { sentimentConfig } from "@/configs/sentiment-config"


interface SentimentOverviewProps {
  /* Summary */
  hasData: boolean
  analyzedCount: number
  periodCommentsCount: number

  /* Date range */
  dateLabel: string
  dateRange: DateRange
  customFrom: string
  customTo: string
  onDateRangeChange: (range: DateRange) => void
  onCustomFromChange: (value: string) => void
  onCustomToChange: (value: string) => void

  /* Overall sentiment */
  overallScore: number
  overallLabel: string
  overallTone: Sentiment
  sentimentCounts: Record<Sentiment, number>
  sentimentPercentages: Record<Sentiment, number>

  /* KPIs */
  commentersCount: number
  commentsGrowth: number | null
  commentersGrowth: number | null

  /* Timeline + highlights */
  timeline: TimelinePoint[]
  topPositive: UiComment | null
  topNegative: UiComment | null

  /* Actions */
  onSelectSentiment: (sentiment: Sentiment) => void
  onJumpToComment: (id: string) => void
}

export function SentimentOverview({
  hasData,
  analyzedCount,
  periodCommentsCount,
  dateLabel,
  dateRange,
  customFrom,
  customTo,
  onDateRangeChange,
  onCustomFromChange,
  onCustomToChange,
  overallScore,
  overallLabel,
  overallTone,
  sentimentCounts,
  sentimentPercentages,
  commentersCount,
  commentsGrowth,
  commentersGrowth,
  timeline,
  topPositive,
  topNegative,
  onSelectSentiment,
  onJumpToComment,
}: SentimentOverviewProps) {
  return (
    <section className="mt-9">
      {/* Header + date filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">
              Sentiment overview
            </h2>

            {hasData && (
              <Badge variant="secondary" className="text-[10px]">
                AI analyzed
              </Badge>
            )}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            {analyzedCount} of {periodCommentsCount} comments analyzed during{" "}
            {dateLabel.toLowerCase()}.
          </p>
        </div>

        <CommentFilters
          dateRange={dateRange}
          dateLabel={dateLabel}
          onDateRangeChange={onDateRangeChange}
        />
      </div>

      {dateRange === "custom" && (
        <CustomDateRangeCard
          customFrom={customFrom}
          customTo={customTo}
          onCustomFromChange={onCustomFromChange}
          onCustomToChange={onCustomToChange}
        />
      )}

      {/* Analytics grid */}
      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_240px]">
        {/* Overall */}
        <Card className="border-border/70 shadow-none">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                Overall sentiment
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-normal">
                1–5 scale
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center pt-2">
            <SentimentGauge score={overallScore} hasData={hasData} />

            <div
              className={`mt-2 rounded-full px-3 py-1 text-xs font-medium ${
                hasData
                  ? sentimentConfig[overallTone].soft
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {overallLabel}
            </div>
          </CardContent>
        </Card>

        {/* Distribution */}
        <Card className="border-border/70 shadow-none">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                Sentiment distribution
              </CardTitle>
              <span className="text-[11px] text-muted-foreground">
                {analyzedCount} analyzed
              </span>
            </div>
          </CardHeader>

          <CardContent className="flex min-h-[255px] items-center justify-center">
            {hasData ? (
              <SentimentDonut
                counts={sentimentCounts}
                percentages={sentimentPercentages}
                hasData={hasData}
                onSelect={onSelectSentiment}
              />
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm font-medium">No analysis yet</p>
                <p className="mt-1 max-w-[220px] text-xs leading-5 text-muted-foreground">
                  Analyzed comments will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
          <SentimentStatCard
            icon={MessageCircle}
            label="Comments"
            value={periodCommentsCount}
            growthPercent={commentsGrowth}
            accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          />

          <SentimentStatCard
            icon={Users2}
            label="Commenters"
            value={commentersCount}
            growthPercent={commentersGrowth}
            accent="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          />
        </div>
      </div>

      <SentimentTimelineCard data={timeline} />

      <CommentHighlights
        topPositive={topPositive}
        topNegative={topNegative}
        onJumpToComment={onJumpToComment}
      />
    </section>
  )
}