"use client"

import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Loader2,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Tags,
  ThumbsDown,
  ThumbsUp,
  Meh,
  Users2,
} from "lucide-react"

import {
  useFacebookPostComments,
  useFacebookCommentTopics,
  useSyncFacebookComments,
  useFacebookPostSentimentOverview,
  useFacebookPostTopTopics,
} from "@/hooks/facebook/use-facebook-comments"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { ElementType } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import type {
  CommentAnalysisStatus,
  CommentSortMode,
  LanguageCode,
  SentimentLabel,
} from "@/types/facebook/common"

import { SentimentTimeline } from "@/components/facebook/sentiment-timeline"
import { FacebookPostSummary } from "@/components/facebook/FacebookPostSummary"
import {
  AnalysisStatusOption,
  CommenterFilter,
  CommentsSection,
  LanguageFilter,
} from "@/components/facebook/comments-section"
import { toast } from "sonner"
import type {
  CommentTopic,
  FacebookComment,
} from "@/types/facebook/post-comments-analytics"
import AiPostInsightPopover from "@/components/facebook/post-comments/ai-post-insight-sheet"
import { useFacebookPost } from "@/hooks/facebook/use-facebook-posts"
import { EthiopianDatePicker } from "@/components/inputs/EthiopianDatePicker"
import { formatEthiopianDate } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Sentiment = SentimentLabel
type SentimentFilter = "all" | Sentiment
type DateRange = "7d" | "30d" | "90d" | "all" | "custom"

interface UiComment {
  id: string
  authorId: string | null
  author: string
  message: string
  publishedAt: string | null
  sentiment: Sentiment | null
  sentimentConfidence: number | null
  language: LanguageCode | null
  likes: number
  permalinkUrl: string | null
  analyzedAt: string | null
}

interface PostTopic {
  topic: string
  score: number
}

/**
 * This matches the overview object returned by the Laravel endpoint.
 * The service/hook should unwrap the API response's `data` envelope.
 */
interface SentimentOverview {
  overall_sentiment: {
    score: number | null
    scale: {
      min: number
      max: number
    }
    label: string
    analyzed_count: number
  }
  sentiment_distribution: {
    positive: {
      count: number
      percentage: number
    }
    neutral: {
      count: number
      percentage: number
    }
    negative: {
      count: number
      percentage: number
    }
    total: number
    has_data: boolean
  }
  sentiment_timeline: {
    has_data: boolean
    data: Array<{
      date: string
      comment_count: number
      average_sentiment_score: number | null
    }>
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function formatDate(value: string | null) {
  if (!value) return "Date unavailable"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "Date unavailable"

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
}

/** API FacebookComment -> flat UI comment. */
function mapComment(comment: FacebookComment): UiComment {
  const raw = comment.sentimentConfidence ?? null

  const author = comment.author as
    | { id?: string | number; name?: string }
    | null
    | undefined

  return {
    id: comment.id,
    authorId: author?.id != null ? String(author.id) : null,
    author: author?.name?.trim() || "Facebook user",
    message: comment.message?.trim() || "",
    publishedAt: comment.publishedAt ?? null,
    sentiment: comment.sentiment ?? null,
    sentimentConfidence:
      typeof raw === "number"
        ? Math.round(raw <= 1 ? raw * 100 : raw)
        : null,
    language: comment.language ?? null,
    likes: comment.likeCount ?? 0,
    permalinkUrl: comment.permalinkUrl ?? null,
    analyzedAt: comment.analyzedAt ?? null,
  }
}

/**
 * Supports paginated responses, bare arrays, and common API response shapes.
 */
function extractList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload

  const p = payload as Record<string, unknown> | null | undefined

  if (Array.isArray(p?.data)) return p.data
  if (Array.isArray(p?.comments)) return p.comments
  if (Array.isArray(p?.items)) return p.items
  if (Array.isArray(p?.topics)) return p.topics

  const nested = p?.data as Record<string, unknown> | undefined

  if (Array.isArray(nested?.topics)) return nested.topics
  if (Array.isArray(nested?.comments)) return nested.comments

  return []
}

function mapTopics(payload: unknown): PostTopic[] {
  return (extractList(payload) as Partial<CommentTopic>[])
    .map((topicItem) => {
      const loose = topicItem as Record<string, unknown>
      const topic = String(
        topicItem.name ?? loose.topic ?? loose.label ?? "",
      )

      const score =
        typeof topicItem.percentage === "number"
          ? Math.round(topicItem.percentage)
          : (() => {
              const value = Number(
                loose.score ?? loose.relevance ?? 0,
              )

              return Math.round(value <= 1 ? value * 100 : value)
            })()

      return {
        topic,
        score: Math.min(100, Math.max(0, score)),
      }
    })
    .filter((topicItem) => topicItem.topic)
}

/* -------------------------------------------------------------------------- */
/* Design tokens                                                              */
/* -------------------------------------------------------------------------- */

const sentimentConfig = {
  positive: {
    label: "Positive",
    icon: ThumbsUp,
    hex: "#16a34a",
    soft: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  neutral: {
    label: "Neutral",
    icon: Meh,
    hex: "#d97706",
    soft: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  negative: {
    label: "Negative",
    icon: ThumbsDown,
    hex: "#dc2626",
    soft: "bg-red-500/10 text-red-600 dark:text-red-400",
    dot: "bg-red-500",
  },
} as const

const analysisStatusOptions: AnalysisStatusOption[] = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
]

/* -------------------------------------------------------------------------- */
/* Sentiment badge                                                            */
/* -------------------------------------------------------------------------- */

function SentimentBadge({
  sentiment,
  className = "",
}: {
  sentiment: Sentiment
  className?: string
}) {
  const config = sentimentConfig[sentiment]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${config.soft} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Gauge                                                                      */
/* -------------------------------------------------------------------------- */

function polarPoint(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
) {
  const rad = (angleDeg * Math.PI) / 180

  return {
    x: cx + radius * Math.sin(rad),
    y: cy - radius * Math.cos(rad),
  }
}

function arcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const p1 = polarPoint(cx, cy, radius, startAngle)
  const p2 = polarPoint(cx, cy, radius, endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0

  return `M ${p1.x} ${p1.y} A ${radius} ${radius} 0 ${largeArc} 1 ${p2.x} ${p2.y}`
}

function SentimentGauge({
  score,
  hasData,
}: {
  score: number
  hasData: boolean
}) {
  const cx = 110
  const cy = 108
  const radius = 88

  const clamped = Math.min(5, Math.max(1, score))
  const toAngle = (value: number) => -90 + ((value - 1) / 4) * 180
  const needleAngle = toAngle(clamped)

  const zones = [
    { from: 1, to: 2.2, color: sentimentConfig.negative.hex },
    { from: 2.2, to: 3.6, color: sentimentConfig.neutral.hex },
    { from: 3.6, to: 5, color: sentimentConfig.positive.hex },
  ]

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 220 130" className="h-36 w-56">
        {zones.map((zone) => (
          <path
            key={zone.color}
            d={arcPath(
              cx,
              cy,
              radius,
              toAngle(zone.from),
              toAngle(zone.to),
            )}
            fill="none"
            stroke={zone.color}
            strokeWidth={13}
            strokeLinecap="round"
            opacity={hasData ? 0.9 : 0.2}
          />
        ))}

        {hasData && (
          <g
            className="transition-transform duration-700 ease-out"
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
            }}
          >
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - radius + 26}
              stroke="currentColor"
              className="text-foreground"
              strokeWidth={3}
              strokeLinecap="round"
            />
          </g>
        )}

        <circle
          cx={cx}
          cy={cy}
          r={5.5}
          fill="currentColor"
          className="text-foreground"
        />
      </svg>

      <div className="-mt-3 text-center">
        <div className="text-4xl font-bold tracking-tight tabular-nums">
          {hasData ? score.toFixed(2) : "—"}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          sentiment score / 5
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Donut                                                                      */
/* -------------------------------------------------------------------------- */

function SentimentDonut({
  counts,
  percentages,
  hasData,
  onSelect,
}: {
  counts: Record<Sentiment, number>
  percentages: Record<Sentiment, number>
  hasData: boolean
  onSelect: (sentiment: Sentiment) => void
}) {
  const order: Sentiment[] = ["positive", "neutral", "negative"]

  const size = 178
  const radius = 65
  const stroke = 25
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * radius

  const totalCount = order.reduce((sum, sentiment) => {
    return sum + counts[sentiment]
  }, 0)

  const total = totalCount || 1
  let cumulative = 0

  return (
    <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
      <div
        className="relative shrink-0"
        style={{ height: size, width: size }}
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90 h-full w-full"
        >
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-muted"
            strokeWidth={stroke}
          />

          {hasData &&
            order.map((sentiment) => {
              const value = counts[sentiment]

              if (value === 0) return null

              const fraction = value / total
              const dash = fraction * circumference
              const offset = cumulative * circumference

              cumulative += fraction

              return (
                <circle
                  key={sentiment}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={sentimentConfig[sentiment].hex}
                  strokeWidth={stroke}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                  className="cursor-pointer transition-opacity hover:opacity-75"
                  onClick={() => onSelect(sentiment)}
                />
              )
            })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tabular-nums">
            {totalCount}
          </span>
          <span className="text-[11px] text-muted-foreground">
            analyzed
          </span>
        </div>
      </div>

      <div className="grid min-w-[150px] gap-2">
        {order.map((sentiment) => {
          const config = sentimentConfig[sentiment]
          const Icon = config.icon

          return (
            <button
              key={sentiment}
              type="button"
              onClick={() => onSelect(sentiment)}
              className="group flex items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-muted/60"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.soft}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium">
                  {config.label}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {counts[sentiment]} comments
                </span>
              </span>

              <span className="text-sm font-semibold tabular-nums">
                {percentages[sentiment]}%
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* KPI                                                                        */
/* -------------------------------------------------------------------------- */

function StatCard({
  icon: Icon,
  label,
  value,
  growthPercent,
  accent,
}: {
  icon: ElementType
  label: string
  value: number
  growthPercent: number | null
  accent: string
}) {
  const isUp = (growthPercent ?? 0) >= 0

  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}
          >
            <Icon className="h-4 w-4" />
          </div>

          {growthPercent !== null && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[10px] font-medium ${
                    isUp
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}
                >
                  {isUp ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {Math.abs(growthPercent)}%
                </span>
              </TooltipTrigger>

              <TooltipContent side="top" className="text-xs">
                Compared with the previous equivalent period.
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="mt-4">
          <div className="text-2xl font-semibold tracking-tight tabular-nums">
            {formatNumber(value)}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


/* -------------------------------------------------------------------------- */
/* Topics                                                                     */
/* -------------------------------------------------------------------------- */

import type { FacebookPostTopTopic } from "@/types/facebook/comment"
import DotGrid from "@/components/Threads"
import Threads from "@/components/Threads"


function TopicsSheet({
  topics,
}: {
  topics: FacebookPostTopTopic[]
}) {
  if (topics.length === 0) return null

  const sorted = [...topics].sort(
    (a, b) => b.comment_count - a.comment_count,
  )

  const primary = sorted[0]

  const clampPercentage = (value: number) =>
    Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))

  const formatTopic = (topic: string) =>
    topic
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

  const formatPercentage = (value: number) =>
    `${clampPercentage(value).toLocaleString(undefined, {
      maximumFractionDigits: 1,
    })}%`

  const formatCount = (value: number) =>
    value.toLocaleString()

  const progressStyle = (
    percentage: number,
    delay = 100,
  ): React.CSSProperties => ({
    "--topic-progress-width": `${clampPercentage(percentage)}%`,
    animationDelay: `${delay}ms`,
  }) as React.CSSProperties

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2">
          <Tags className="h-3.5 w-3.5" />
          <span>Topics</span>
          <Badge
            variant="secondary"
            className="h-5 min-w-5 justify-center px-1.5 text-[10px]"
          >
            {topics.length}
          </Badge>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        {/* Header */}
        <SheetHeader className="border-b px-5 py-4 text-left">
          <div className="flex items-center gap-2">
            <Tags className="h-4 w-4 text-muted-foreground" />
            <SheetTitle className="text-base">
              Conversation topics
            </SheetTitle>
          </div>

          <SheetDescription className="text-xs leading-5">
            The most discussed themes in analyzed comments on this post.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-5">
            {/* Leading topic */}
            <section>
              <p className="text-xs font-medium tracking-wide text-muted-foreground">
                TOP DISCUSSION
              </p>

              <div className="mt-2 rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold leading-5">
                      {formatTopic(primary.topic)}
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatCount(primary.comment_count)}{" "}
                      {primary.comment_count === 1
                        ? "comment"
                        : "comments"}
                    </p>
                  </div>

                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatPercentage(primary.percentage)}
                  </span>
                </div>

                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-label={`${formatTopic(primary.topic)} discussion percentage`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={clampPercentage(primary.percentage)}
                >
                  <div
                    className="topic-progress-bar h-full rounded-full bg-primary"
                    style={progressStyle(primary.percentage, 100)}
                  />
                </div>
              </div>
            </section>

            {/* Ranked topic list */}
            <section>
              <div className="mb-3">
                <h3 className="text-sm font-semibold">All topics</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ordered by analyzed comment count.
                </p>
              </div>

              <div className="space-y-4">
                {sorted.map((topic, index) => {
                  const percentage = clampPercentage(topic.percentage)

                  return (
                    <div key={topic.topic} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {formatTopic(topic.topic)}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {formatCount(topic.comment_count)}{" "}
                          {topic.comment_count === 1
                            ? "comment"
                            : "comments"}
                        </span>
                      </div>

                      <div className="ml-8 flex items-center gap-3">
                        <div
                          className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                          role="progressbar"
                          aria-label={`${formatTopic(topic.topic)} percentage`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={percentage}
                        >
                          <div
                            className="topic-progress-bar h-full rounded-full bg-primary/70"
                            style={progressStyle(
                              percentage,
                              180 + index * 90,
                            )}
                          />
                        </div>

                        <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums">
                          {formatPercentage(topic.percentage)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Metric explanation */}
            <p className="border-t pt-4 text-xs leading-5 text-muted-foreground">
              Percentages reflect the API&apos;s topic calculation. They may
              not add up to 100% if comments can be assigned to multiple
              topics.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-3">
          <p className="text-xs text-muted-foreground">
            {topics.length} {topics.length === 1 ? "topic" : "topics"} detected
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}


/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

function PostComments() {
  const router = useRouter()

  const params = useParams<{ id: string; postId: string }>()
  const facebookPageId = params.id
  const facebookPostId = params.postId

  const { data: post, isPending } = useFacebookPost(
    facebookPageId,
    facebookPostId,
  )

  const topicsQuery = useFacebookCommentTopics(
    facebookPageId,
    facebookPostId,
  )

  const syncMutation = useSyncFacebookComments(
    facebookPageId,
    facebookPostId,
  )

  const isSyncingComments = syncMutation.isPending

  /* ------------------------------------------------------------------------ */
  /* Local UI state                                                            */
  /* ------------------------------------------------------------------------ */

  const [search, setSearch] = useState("")
  const [sentimentFilter, setSentimentFilter] =
    useState<SentimentFilter>("all")
  const [languageFilter, setLanguageFilter] =
    useState<LanguageFilter>("all")
  const [sortMode, setSortMode] = useState<CommentSortMode>("newest")
  const [analysisStatusFilter, setAnalysisStatusFilter] =
    useState<CommentAnalysisStatus | "all">("all")
  const [commenterFilter, setCommenterFilter] =
    useState<CommenterFilter>("all")

  const [dateRange, setDateRange] = useState<DateRange>("all")
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")
  const [showBackToTop, setShowBackToTop] = useState(false)

  /* ------------------------------------------------------------------------ */
  /* Date range                                                                */
  /* ------------------------------------------------------------------------ */

  const { startDate, endDate } = useMemo(() => {
    const today = new Date()
  
    const toDateString = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
  
      return `${year}-${month}-${day}`
    }
  
    // All time: do not send date filters.
    if (dateRange === "all") {
      return {
        startDate: undefined,
        endDate: undefined,
      }
    }
  
    // Custom range: use only the selected dates.
    if (dateRange === "custom") {
      return {
        startDate: customFrom || undefined,
        endDate: customTo || undefined,
      }
    }
  
    const daysByRange: Record<"7d" | "30d" | "90d", number> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
    }
  
    const from = new Date(today)
    from.setDate(from.getDate() - (daysByRange[dateRange] - 1))
  
    return {
      startDate: toDateString(from),
      endDate: toDateString(today),
    }
  }, [dateRange, customFrom, customTo])

  const isDateRangeValid =
    dateRange !== "custom" ||
    (!customFrom && !customTo) ||
    (!!customFrom && !!customTo && customFrom <= customTo)

  /* ------------------------------------------------------------------------ */
  /* Queries                                                                   */
  /* ------------------------------------------------------------------------ */

  const commentsQuery = useFacebookPostComments(
    facebookPageId,
    facebookPostId,
    {
      page: 1,
      perPage: 100,
      sortBy: sortMode,
      ...(search.trim() && {
        search: search.trim(),
      }),
      ...(commenterFilter !== "all" && {
        commenter: commenterFilter,
      }),
      ...(sentimentFilter !== "all" && {
        sentiment: sentimentFilter,
      }),
      ...(languageFilter !== "all" &&
        languageFilter !== "mixed" && {
          language: languageFilter,
        }),
      ...(analysisStatusFilter !== "all" && {
        analysisStatus: analysisStatusFilter,
      }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    },
    isDateRangeValid,
  )
  const sentimentOverviewQuery = useFacebookPostSentimentOverview(
    facebookPageId,
    facebookPostId,
    {
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    },
    isDateRangeValid,
  )


  const {
    data: topTopicsResponse,
    isPending: isTopTopicsPending,
    isError: isTopTopicsError,
  } = useFacebookPostTopTopics(
    facebookPageId,
    facebookPostId,
    {
      startDate,
      endDate,
      limit: 5,
    },
  )
  
  const topTopics = topTopicsResponse?.data.topics ?? []

  /* ------------------------------------------------------------------------ */
  /* Back to top                                                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500)
    }

    handleScroll()

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }, [])

  /* ------------------------------------------------------------------------ */
  /* Comments                                                                   */
  /* ------------------------------------------------------------------------ */

  const uiComments = useMemo<UiComment[]>(() => {
    return (extractList(commentsQuery.data) as FacebookComment[]).map(
      mapComment,
    )
  }, [commentsQuery.data])

  /* ------------------------------------------------------------------------ */
  /* Server-side sentiment analytics                                           */
  /* ------------------------------------------------------------------------ */

  const overview = sentimentOverviewQuery.data?.data as
    | SentimentOverview
    | undefined

  console.log(overview);

  const overallSentiment = overview?.overall_sentiment
  const distribution = overview?.sentiment_distribution

  const analyzedCount = overallSentiment?.analyzed_count ?? 0

  const sentimentCounts: Record<Sentiment, number> = {
    positive: distribution?.positive.count ?? 0,
    neutral: distribution?.neutral.count ?? 0,
    negative: distribution?.negative.count ?? 0,
  }

  const sentimentPercentages: Record<Sentiment, number> = {
    positive: distribution?.positive.percentage ?? 0,
    neutral: distribution?.neutral.percentage ?? 0,
    negative: distribution?.negative.percentage ?? 0,
  }

  const hasData = distribution?.has_data ?? false
  const overallScore = overallSentiment?.score ?? 0
  const overallLabel = overallSentiment?.label ?? "No analysis yet"

  const overallTone: Sentiment =
    overallSentiment?.label === "Positive"
      ? "positive"
      : overallSentiment?.label === "Negative"
        ? "negative"
        : "neutral"

  /**
   * The backend returns a daily comment count and average sentiment score.
   * It does not return daily positive/neutral/negative counts, so do not
   * fabricate those values in the frontend.
   */
  const timeline = useMemo(
    () =>
      (overview?.sentiment_timeline?.data ?? []).map((item) => ({
        date: item.date,
        total: item.comment_count,
        average: item.average_sentiment_score ?? null,
      })),
    [overview],
  )

  /* ------------------------------------------------------------------------ */
  /* KPI calculations                                                          */
  /* ------------------------------------------------------------------------ */

  const dateBounds = useMemo(() => {
    const parseDate = (value: string | undefined, endOfDay = false) => {
      if (!value) return null

      const date = new Date(
        `${value}T${endOfDay ? "23:59:59.999" : "00:00:00"}`,
      )

      return Number.isNaN(date.getTime()) ? null : date
    }

    if (dateRange === "all") {
      return {
        from: null as Date | null,
        to: null as Date | null,
      }
    }

    if (dateRange === "custom") {
      return {
        from: parseDate(customFrom),
        to: parseDate(customTo, true),
      }
    }

    return {
      from: parseDate(startDate),
      to: parseDate(endDate, true),
    }
  }, [dateRange, customFrom, customTo, startDate, endDate])

  const periodComments = useMemo(() => {
    const { from, to } = dateBounds

    return uiComments.filter((comment) => {
      if (!comment.publishedAt) return false

      const publishedAt = new Date(comment.publishedAt)

      if (Number.isNaN(publishedAt.getTime())) return false
      if (from && publishedAt < from) return false
      if (to && publishedAt > to) return false

      return true
    })
  }, [uiComments, dateBounds])

  const previousPeriodComments = useMemo(() => {
    const { from, to } = dateBounds

    if (!from || !to || dateRange === "all") return null

    const spanMs = to.getTime() - from.getTime()
    const previousTo = new Date(from.getTime() - 1)
    const previousFrom = new Date(previousTo.getTime() - spanMs)

    return uiComments.filter((comment) => {
      if (!comment.publishedAt) return false

      const publishedAt = new Date(comment.publishedAt)

      if (Number.isNaN(publishedAt.getTime())) return false

      return publishedAt >= previousFrom && publishedAt <= previousTo
    })
  }, [uiComments, dateBounds, dateRange])

  const uniqueAuthors = useCallback((list: UiComment[]) => {
    const uniqueCommenters = new Set(
      list.map((comment) =>
        comment.authorId
          ? `id:${comment.authorId}`
          : comment.author !== "Facebook user"
            ? `name:${comment.author}`
            : `unknown:${comment.id}`,
      ),
    )
  
    return uniqueCommenters.size
  }, [])

  const commentsGrowth = useMemo(() => {
    if (!previousPeriodComments) return null

    const previous = previousPeriodComments.length

    if (previous === 0) {
      return periodComments.length > 0 ? 100 : 0
    }

    return Math.round(
      ((periodComments.length - previous) / previous) * 100,
    )
  }, [previousPeriodComments, periodComments])

  const usersGrowth = useMemo(() => {
    if (!previousPeriodComments) return null

    const currentUsers = uniqueAuthors(periodComments)
    const previousUsers = uniqueAuthors(previousPeriodComments)

    if (previousUsers === 0) {
      return currentUsers > 0 ? 100 : 0
    }

    return Math.round(
      ((currentUsers - previousUsers) / previousUsers) * 100,
    )
  }, [previousPeriodComments, periodComments, uniqueAuthors])

  const currentUsersCount = useMemo(() => {
    return uniqueAuthors(periodComments)
  }, [periodComments, uniqueAuthors])

  /* ------------------------------------------------------------------------ */
  /* Navigation                                                                 */
  /* ------------------------------------------------------------------------ */

  const scrollToComments = useCallback(() => {
    window.setTimeout(() => {
      document.getElementById("comments-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }, 50)
  }, [])

  const viewSentiment = useCallback(
    (sentiment: Sentiment) => {
      setSentimentFilter(sentiment)
      scrollToComments()
    },
    [scrollToComments],
  )

  /* ------------------------------------------------------------------------ */
  /* Sync                                                                       */
  /* ------------------------------------------------------------------------ */

  const handleSync = useCallback(async () => {
    if (!facebookPageId || !facebookPostId) {
      toast.error("Unable to sync comments", {
        description: "Facebook page or post information is missing.",
      })
      return
    }

    try {
      await syncMutation.mutateAsync()

      toast.success("Comments synced")

      await Promise.all([
        commentsQuery.refetch(),
        topicsQuery.refetch(),
        sentimentOverviewQuery.refetch(),
      ])
    } catch (error) {
      toast.error("Unable to sync comments", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      })
    }
  }, [
    facebookPageId,
    facebookPostId,
    syncMutation,
    commentsQuery,
    topicsQuery,
    sentimentOverviewQuery,
  ])

  /* ------------------------------------------------------------------------ */
  /* Labels                                                                     */
  /* ------------------------------------------------------------------------ */

  const dateLabel =
    dateRange === "all"
      ? "All time"
      : dateRange === "7d"
        ? "Past 7 days"
        : dateRange === "30d"
          ? "Past 30 days"
          : dateRange === "90d"
            ? "Past 3 months"
            : customFrom || customTo
              ? `${formatEthiopianDate(customFrom) || "..."} – ${formatEthiopianDate(customTo) || "..."}`
              : "Custom range"

  const postMessage = post?.data.message ?? "Post content unavailable."
  const postLikes = post?.data.engagement.likes ?? 0
  const postShares = post?.data.engagement?.shares ?? 0

  const totalComments =
  commentsQuery.data?.meta.pagination?.total ?? 0

  /* ------------------------------------------------------------------------ */
  /* Render                                                                     */
  /* ------------------------------------------------------------------------ */

  return (
    <TooltipProvider delayDuration={150}>
      <div className="m-auto min-h-screen max-w-7xl bg-muted/20">
        <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {/* Top bar */}
          <header className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="-ml-2 gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to posts</span>
              <span className="sm:hidden">Back</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleSync()}
              disabled={
                !facebookPageId ||
                !facebookPostId ||
                isSyncingComments
              }
              className="gap-2"
            >
              {isSyncingComments ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}

              <span className="hidden sm:inline">
                {isSyncingComments ? "Checking comments..." : "Sync comments"}
              </span>
              <span className="sm:hidden">
                {isSyncingComments ? "Checking..." : "Sync"}
              </span>
            </Button>
          </header>

{/* Compact Public Response Card */}
<section className="relative isolate mt-5 overflow-hidden rounded-sm bg-blue-950 shadow-none">
  {/* Animated background */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 -z-10"
  >
    <Threads
    color="#ffffff"
    lineCount={90}
    thickness={0.6}
    softness={1.3}
    amplitude={1.7}
    distance={0.4}
    waves={1.05}
    speed={0.6}
    split={0.04}
    fray={0.5}
    angle={25}
    taper={0.85}
    brightness={1.4}
    parting={0}
    enableMouseInteraction
    fade={0}
    opacity={1}
    seed={0}
/>
  </div>

  {/* Blue readability overlay */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-blue-950/95 via-blue-900/80 to-blue-700/50"
  />

  {/* Compact content */}
  <div className="relative flex items-center gap-3 px-4 py-4 sm:px-5">
    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 backdrop-blur-sm">
      <MessageCircle className="size-4 text-blue-200" />
    </div>

    <div className="min-w-0">
      <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
        Public response
      </h1>
      <p className="mt-1 text-xs leading-5 text-blue-100/80 sm:text-sm">
        Understand sentiment, engagement, and comment activity.
      </p>
    </div>
  </div>
</section>

          {/* Post context */}
          {/* <Card className="mt-6 overflow-hidden border-border/70 shadow-sm">
            {isPending ? (
              <CardContent className="p-5 sm:p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-16 max-w-3xl" />
                  </div>
                </div>
              </CardContent>
            ) : (
              <FacebookPostSummary
                postDate={post?.data.published_at!}
                postMessage={postMessage}
                attachments={post?.data.attachments}
                postLikes={postLikes}
                totalComments={post?.data.engagement.comments ?? 0}
                postShares={postShares}
                formatDate={formatDate}
                formatNumber={formatNumber}
              />
            )}
          </Card> */}

        {/* Post tools */}
{!isPending && (
  <div className="mt-3 flex flex-wrap items-center gap-2">
    {/* Top topics */}
    {isTopTopicsPending ? (
      <Badge
        variant="outline"
        className="gap-1.5 text-[10px] font-normal text-muted-foreground"
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
        Loading topics
      </Badge>
    ) : isTopTopicsError ? (
      <Badge
        variant="outline"
        className="gap-1.5 text-[10px] font-normal text-muted-foreground"
      >
        Topics unavailable
      </Badge>
    ) : topTopics.length > 0 ? (
      <TopicsSheet topics={topTopics} />
    ) : (
      <Badge
        variant="outline"
        className="gap-1.5 text-[10px] font-normal text-muted-foreground"
      >
        No topics available
      </Badge>
    )}

    {/* Sentiment analysis status */}
    <Badge
      variant="outline"
      className="gap-1.5 text-[10px] font-normal"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Analysis available
    </Badge>
  </div>
)}

          {/* Analytics */}
          <section className="mt-9">
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
                  {analyzedCount} comments analyzed during{" "}
                  {dateLabel.toLowerCase()}.
                </p>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <Tabs
                  value={
                    ["7d", "30d", "90d"].includes(dateRange)
                      ? dateRange
                      : undefined
                  }
                  onValueChange={(value) =>
                    setDateRange(value as DateRange)
                  }
                  className="w-full sm:w-auto"
                >
                  <TabsList className="grid h-9 w-full grid-cols-3 sm:w-auto">
                    <TabsTrigger value="7d" className="text-xs">
                      7 days
                    </TabsTrigger>
                    <TabsTrigger value="30d" className="text-xs">
                      30 days
                    </TabsTrigger>
                    <TabsTrigger value="90d" className="text-xs">
                      3 months
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={
                        dateRange === "all" || dateRange === "custom"
                          ? "secondary"
                          : "outline"
                      }
                      size="sm"
                      className="h-9 gap-1.5"
                    >
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span className="max-w-[150px] truncate">
                        {dateRange === "all" || dateRange === "custom"
                          ? dateLabel
                          : "More ranges"}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => setDateRange("all")}
                    >
                      All time
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDateRange("custom")}
                    >
                      Custom range
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Custom dates */}
            {dateRange === "custom" && (
              <Card className="mt-4 border-border/70 shadow-none">
                <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
                  <div className="min-w-0 space-y-1.5">
                    <label className="block text-xs font-medium">
                      From
                    </label>

                    <EthiopianDatePicker
                      value={
                        customFrom
                          ? new Date(`${customFrom}T00:00:00`)
                          : undefined
                      }
                      onChange={(date) => {
                        const formattedDate = [
                          date.getFullYear(),
                          String(date.getMonth() + 1).padStart(2, "0"),
                          String(date.getDate()).padStart(2, "0"),
                        ].join("-")

                        setCustomFrom(formattedDate)

                        if (customTo && customTo < formattedDate) {
                          setCustomTo("")
                        }
                      }}
                      placeholder="Select start date"
                      maxYear={new Date().getFullYear()}
                      showTime
                    />
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <label className="block text-xs font-medium">
                      To
                    </label>

                    <EthiopianDatePicker
                      value={
                        customTo
                          ? new Date(`${customTo}T00:00:00`)
                          : undefined
                      }
                      onChange={(date) => {
                        const formattedDate = [
                          date.getFullYear(),
                          String(date.getMonth() + 1).padStart(2, "0"),
                          String(date.getDate()).padStart(2, "0"),
                        ].join("-")

                        setCustomTo(formattedDate)
                      }}
                      placeholder="Select end date"
                      minYear={1900}
                      maxYear={new Date().getFullYear()}
                      showTime
                      timeFormat="12h"
                    />
                  </div>

                  {!isDateRangeValid && (
                    <p className="text-xs text-destructive sm:col-span-2">
                      Select a valid date range. The start date must not be
                      later than the end date.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Analytics query states */}
            {sentimentOverviewQuery.isPending && (
              <div className="mt-5 grid gap-4 xl:grid-cols-3">
                <Skeleton className="h-[300px] rounded-xl" />
                <Skeleton className="h-[300px] rounded-xl" />
                <Skeleton className="h-[300px] rounded-xl" />
              </div>
            )}

            {sentimentOverviewQuery.isError && (
              <Card className="mt-5 border-destructive/30 shadow-none">
                <CardContent className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Unable to load sentiment analytics
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      The sentiment overview could not be retrieved. Check
                      your connection and try again.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void sentimentOverviewQuery.refetch()}
                    disabled={sentimentOverviewQuery.isFetching}
                    className="gap-2"
                  >
                    {sentimentOverviewQuery.isFetching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Retry
                  </Button>
                </CardContent>
              </Card>
            )}

            {!sentimentOverviewQuery.isPending &&
              !sentimentOverviewQuery.isError &&
              isDateRangeValid && (
                <>
                  {/* Analytics grid */}
                  <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_240px]">
                    {/* Overall */}
                    <Card className="border-border/70 shadow-none">
                      <CardHeader className="pb-0">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold">
                            Overall sentiment
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-normal"
                          >
                            {overallSentiment?.scale.min ?? 1}–
                            {overallSentiment?.scale.max ?? 5} scale
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="flex flex-col items-center justify-center pt-2">
                        <SentimentGauge
                          score={overallScore}
                          hasData={hasData}
                        />

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
                            onSelect={viewSentiment}
                          />
                        ) : (
                          <div className="flex flex-col items-center text-center">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                              <Sparkles className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <p className="mt-3 text-sm font-medium">
                              No analysis yet
                            </p>
                            <p className="mt-1 max-w-[220px] text-xs leading-5 text-muted-foreground">
                              Analyzed comments will appear here.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* KPI */}
                    <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
                      <StatCard
                        icon={MessageCircle}
                        label="Total comments"
                        value={totalComments}
                        growthPercent={commentsGrowth}
                        accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      />

                      <StatCard
                        icon={Users2}
                        label="Distinct commenters loaded"
                        value={currentUsersCount}
                        growthPercent={usersGrowth}
                        accent="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                      /> 
                   </div>
                  </div>

                  {/* Timeline */}
                  {timeline.length > 0 ? (
                    <SentimentTimeline data={timeline} />
                  ) : (
                    <Card className="mt-5 border-border/70 shadow-none">
                      <CardContent className="flex flex-col items-center py-10 text-center">
                        <CalendarDays className="h-8 w-8 text-muted-foreground" />
                        <p className="mt-3 text-sm font-medium">
                          No timeline data
                        </p>
                        <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                          Daily sentiment activity will appear here when
                          analyzed comments are available for this period.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
          </section>

          {/* Comments */}
          <CommentsSection
            comments={commentsQuery.data?.data ?? []}
            totalComments={totalComments}
            search={search}
            sentimentFilter={sentimentFilter}
            languageFilter={languageFilter}
            analysisStatusFilter={analysisStatusFilter}
            commenterFilter={commenterFilter}
            sortMode={sortMode}
            analysisStatusOptions={analysisStatusOptions}
            isCommentsLoading={commentsQuery.isPending}
            onSearchChange={setSearch}
            onSentimentChange={setSentimentFilter}
            onLanguageChange={setLanguageFilter}
            onAnalysisStatusChange={setAnalysisStatusFilter}
            onCommenterChange={setCommenterFilter}
            onSortChange={setSortMode}
            insightsUrl={`/api/v1/facebook/pages/${facebookPageId}/posts/${facebookPostId}/comments/insights`}
            onClearFilters={() => {
              setSearch("")
              setSentimentFilter("all")
              setLanguageFilter("all")
              setAnalysisStatusFilter("all")
              setCommenterFilter("all")
              setSortMode("newest")
              setDateRange("all")
              setCustomFrom("")
              setCustomTo("")
            }}
          />

          <div className="h-10" />
        </div>

        {/* Floating action dock */}
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-center gap-3 sm:bottom-7 sm:right-7">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="group relative">
                <div className="absolute -inset-1 rounded-full bg-primary/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative rounded-full border border-border/70 bg-background/90 p-1 shadow-lg shadow-black/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                  <AiPostInsightPopover
                    postId={facebookPostId}
                    initialLanguage="en"
                    triggerLabel="AI Insight"
                  />
                </div>
              </div>
            </TooltipTrigger>

            <TooltipContent side="left">
              View AI-powered public insights
            </TooltipContent>
          </Tooltip>

          {showBackToTop && (
            <>
              <div className="h-px w-6 bg-border/80" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={scrollToTop}
                    aria-label="Back to top"
                    className="size-11 rounded-full border-border/70 bg-background/90 text-foreground shadow-lg shadow-black/10 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary hover:text-primary-foreground hover:shadow-xl"
                  >
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>

                <TooltipContent side="left">
                  Back to top
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

export default PostComments