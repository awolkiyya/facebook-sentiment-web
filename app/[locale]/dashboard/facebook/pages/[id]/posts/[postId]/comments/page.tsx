"use client"

import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Flame,
  Heart,
  Languages,
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
  useFacebookPostCommentsAnalytics,
  useFacebookCommentTopics,
  useSyncFacebookComments,
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

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { useFacebook } from "@/hooks/useFacebookConnect"

import type { FacebookPost } from "@/types/facebook/post"
import type { LanguageCode, SentimentLabel } from "@/types/facebook/common"

import { SentimentTimeline } from "@/components/facebook/sentiment-timeline"
import { FacebookPostSummary } from "@/components/facebook/FacebookPostSummary"
import {
  CommentsSection,
  LanguageFilter,
} from "@/components/facebook/comments-section"
import { toast } from "sonner"
import { CommentTopic, FacebookComment } from "@/types/facebook/post-comments-analytics"
import AiPostInsightPopover from "@/components/facebook/post-comments/ai-post-insight-sheet"

/* -------------------------------------------------------------------------- */
/* Mock mode                                                                  */
/* -------------------------------------------------------------------------- */

const USE_MOCK_DATA = true
const MOCK_NOW = "2026-09-26T23:59:59"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Sentiment = SentimentLabel
type SentimentFilter = "all" | Sentiment
type DateRange = "7d" | "30d" | "90d" | "all" | "custom"
type SortMode = "newest" | "oldest" | "most_liked"

interface UiComment {
  id: string
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

/* -------------------------------------------------------------------------- */
/* Mock data                                                                  */
/* -------------------------------------------------------------------------- */

function daysAgoIso(days: number, hour = 9) {
  const d = new Date(MOCK_NOW)
  d.setDate(d.getDate() - days)
  d.setHours(hour, Math.floor(Math.random() * 60), 0, 0)
  return d.toISOString()
}

const MOCK_AUTHORS = [
  "Abebe Kebede",
  "Hana Mohammed",
  "Mekonnen Tadesse",
  "Fatuma Ali",
  "Dawit Girma",
  "Ahmed Nur",
  "Selamawit Bekele",
  "Tesfaye Worku",
  "Aster Alemu",
  "Kedir Hussein",
  "Meron Fikadu",
  "Yonas Abebe",
  "Rahma Abdisa",
  "Bereket Solomon",
  "Nuru Ahmed",
  "Liya Tesfaye",
  "Sara Mulu",
  "Girma Tolla",
  "Ruth Assefa",
  "Sami Yusuf",
]

const POSITIVE_MSGS = [
  "This is a very good initiative. We appreciate the work being done for the city.",
  "The improvement is encouraging. Please continue with the same effort.",
  "Excellent work. The city is changing and we can see the difference.",
  "Very happy to see this progress. Keep going.",
  "This is exactly the kind of development our city needs.",
  "Thank you for listening to the community.",
]

const NEUTRAL_MSGS = [
  "When will this project reach the eastern part of the city?",
  "Can you provide more information about the next phase?",
  "The information is clear. We will wait for the next update.",
  "I hope the implementation will continue according to the plan.",
]

const NEGATIVE_MSGS = [
  "We need more attention to the roads in our neighborhood.",
  "Please also improve waste collection around the market area.",
  "There are still some problems that need to be addressed.",
  "Please make sure all neighborhoods receive equal attention.",
]

const POSITIVE_MSGS_AM = [
  "በጣም ጥሩ ስራ ነው፣ እናመሰግናለን።",
  "ይህ መሻሻል በጣም ያበረታታል፣ በዚሁ ይቀጥሉ።",
  "ከተማችን እየተለወጠ ነው፣ ይህን ማየት ያስደስታል።",
]

const NEUTRAL_MSGS_AM = [
  "ይህ ፕሮጀክት መቼ ወደ ምስራቅ ከተማ ክፍል ይደርሳል?",
  "ስለ ቀጣዩ ደረጃ ተጨማሪ መረጃ ማግኘት እንችላለን?",
]

const NEGATIVE_MSGS_AM = [
  "በአካባቢያችን ላሉ መንገዶች ተጨማሪ ትኩረት ያስፈልጋል።",
  "የቆሻሻ አሰባሰብ አገልግሎት መሻሻል አለበት።",
]

const pickOne = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]

function pickSentimentConfidence(sentiment: Sentiment) {
  return sentiment === "neutral"
    ? 55 + Math.floor(Math.random() * 28)
    : 76 + Math.floor(Math.random() * 23)
}

function buildMockComments(): UiComment[] {
  const out: UiComment[] = []
  let id = 1

  for (let day = 44; day >= 0; day--) {
    const recentBoost = day <= 14 ? 1 : 0
    const count = 1 + Math.floor(Math.random() * (2 + recentBoost * 2))

    for (let i = 0; i < count; i++) {
      const roll = Math.random()
      const positiveChance = day <= 14 ? 0.62 : 0.4
      const negativeChance = day <= 14 ? 0.16 : 0.32

      let sentiment: Sentiment
      let pool: string[]
      let poolAm: string[]

      if (roll < positiveChance) {
        sentiment = "positive"
        pool = POSITIVE_MSGS
        poolAm = POSITIVE_MSGS_AM
      } else if (roll < positiveChance + negativeChance) {
        sentiment = "negative"
        pool = NEGATIVE_MSGS
        poolAm = NEGATIVE_MSGS_AM
      } else {
        sentiment = "neutral"
        pool = NEUTRAL_MSGS
        poolAm = NEUTRAL_MSGS_AM
      }

      const language: LanguageCode = Math.random() < 0.3 ? "am" : "en"
      const iso = daysAgoIso(day)

      out.push({
        id: String(id++),
        author: pickOne(MOCK_AUTHORS),
        message: language === "am" ? pickOne(poolAm) : pickOne(pool),
        publishedAt: iso,
        sentiment,
        sentimentConfidence: pickSentimentConfidence(sentiment),
        language,
        likes: Math.floor(Math.random() * 60),
        permalinkUrl: "https://facebook.com/",
        analyzedAt: iso,
      })
    }
  }

  return out.reverse()
}

const MOCK_COMMENTS = buildMockComments()

const MOCK_POST = {
  id: "mock-post",
  facebook_post_id: "mock-facebook-post",
  message:
    "We are pleased to share the latest development update with the community.",
  published_at: "2026-09-18T08:00:00",
  permalink_url: "https://facebook.com/",
  engagement: {
    likes: 1250,
    comments: MOCK_COMMENTS.length,
    shares: 87,
  },
} as FacebookPost

const MOCK_POST_TOPICS: PostTopic[] = [
  { topic: "Infrastructure & road development", score: 82 },
  { topic: "Community engagement", score: 64 },
  { topic: "Public services & waste management", score: 47 },
  { topic: "Project timeline & updates", score: 33 },
]

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

function formatSentiment(value: Sentiment) {
  if (value === "positive") return "Positive"
  if (value === "negative") return "Negative"
  return "Neutral"
}

function getSentimentScore(sentiment: Sentiment) {
  if (sentiment === "positive") return 5
  if (sentiment === "negative") return 1
  return 3
}

function languageLabelOf(language: LanguageCode | null) {
  if (language === "am") return "Amharic"
  if (language === "om") return "Afaan Oromo"
  if (language === "en") return "English"
  if (language === "mixed") return "Mixed"
  return null
}

/** API FacebookComment (camelCase) -> flat UI comment. */
function mapComment(comment: FacebookComment): UiComment {
  const raw = comment.sentimentConfidence ?? null

  return {
    id: comment.id,
    author: comment.author?.name?.trim() || "Facebook user",
    message: comment.message?.trim() || "",
    publishedAt: comment.publishedAt ?? null,
    sentiment: comment.sentiment ?? null,
    // Accepts both 0–1 and 0–100 from the backend; the UI uses 0–100.
    sentimentConfidence:
      typeof raw === "number" ? Math.round(raw <= 1 ? raw * 100 : raw) : null,
    language: comment.language ?? null,
    likes: comment.likeCount ?? 0,
    permalinkUrl: comment.permalinkUrl ?? null,
    analyzedAt: comment.analyzedAt ?? null,
  }
}

/** UI comment -> API FacebookComment shape that <CommentsSection /> expects. */
function toFacebookComment(
  comment: UiComment,
  postId: string,
): FacebookComment {
  const language =
    comment.language === "am" ||
    comment.language === "om" ||
    comment.language === "en"
      ? comment.language
      : null

  return {
    id: comment.id,
    facebookCommentId: comment.id,
    postId,
    message: comment.message,
    author: { name: comment.author },
    sentiment: comment.sentiment,
    sentimentConfidence:
      comment.sentimentConfidence !== null
        ? comment.sentimentConfidence / 100
        : null,
    language,
    analysisStatus: comment.sentiment ? "completed" : "pending",
    likeCount: comment.likes,
    replyCount: 0,
    publishedAt: comment.publishedAt ?? "",
    analyzedAt: comment.analyzedAt,
    permalinkUrl: comment.permalinkUrl,
  }
}

/**
 * Pulls the array out of a hook response: PaginatedCommentsResponse
 * ({ data: [...] }), a bare array, or a few common fallbacks.
 */
function extractList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload
  const p = payload as Record<string, unknown> | null | undefined
  if (Array.isArray(p?.data)) return p.data as unknown[]
  if (Array.isArray(p?.comments)) return p.comments as unknown[]
  if (Array.isArray(p?.items)) return p.items as unknown[]
  if (Array.isArray(p?.topics)) return p.topics as unknown[]
  const nested = p?.data as Record<string, unknown> | undefined
  if (Array.isArray(nested?.topics)) return nested.topics as unknown[]
  if (Array.isArray(nested?.comments)) return nested.comments as unknown[]
  return []
}

/** CommentTopic[] (name / percentage) -> { topic, score } for TopicsSheet. */
function mapTopics(payload: unknown): PostTopic[] {
  return (extractList(payload) as Partial<CommentTopic>[])
    .map((t) => {
      const loose = t as Record<string, unknown>
      const topic = String(t.name ?? loose.topic ?? loose.label ?? "")

      // `percentage` is already 0–100 in your CommentTopic type.
      const score =
        typeof t.percentage === "number"
          ? Math.round(t.percentage)
          : (() => {
              const n = Number(loose.score ?? loose.relevance ?? 0)
              return Math.round(n <= 1 ? n * 100 : n)
            })()

      return { topic, score }
    })
    .filter((t) => t.topic)
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
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  neutral: {
    label: "Neutral",
    icon: Meh,
    hex: "#d97706",
    soft: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  negative: {
    label: "Negative",
    icon: ThumbsDown,
    hex: "#dc2626",
    soft: "bg-red-500/10 text-red-600 dark:text-red-400",
    text: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
  },
} as const

/* -------------------------------------------------------------------------- */
/* Avatar                                                                     */
/* -------------------------------------------------------------------------- */

const AVATAR_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-pink-500 to-rose-600",
  "from-indigo-500 to-blue-600",
  "from-fuchsia-500 to-pink-600",
  "from-sky-500 to-indigo-600",
]

function avatarGradient(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]
}

function AuthorAvatar({
  name,
  className = "h-9 w-9",
}: {
  name: string
  className?: string
}) {
  return (
    <Avatar className={`${className} shrink-0 ring-2 ring-background`}>
      <AvatarFallback
        className={`bg-gradient-to-br text-[11px] font-semibold text-white ${avatarGradient(
          name,
        )}`}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

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

function polarPoint(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const p1 = polarPoint(cx, cy, r, startAngle)
  const p2 = polarPoint(cx, cy, r, endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y}`
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
  const r = 88

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
            d={arcPath(cx, cy, r, toAngle(zone.from), toAngle(zone.to))}
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
              y2={cy - r + 26}
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
  const r = 65
  const stroke = 25
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r

  const totalCount = order.reduce((sum, s) => sum + counts[s], 0)
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
            r={r}
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
                  r={r}
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
          <span className="text-2xl font-bold tabular-nums">{totalCount}</span>
          <span className="text-[11px] text-muted-foreground">analyzed</span>
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
  icon: React.ElementType
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
          <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/* Topics                                                                     */
/* -------------------------------------------------------------------------- */

function TopicsSheet({ topics }: { topics: PostTopic[] }) {
  if (topics.length === 0) return null

  const sorted = [...topics].sort((a, b) => b.score - a.score)
  const primary = sorted[0]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Tags className="h-3.5 w-3.5" />
          <span>Conversation topics</span>
          <Badge
            variant="secondary"
            className="ml-0.5 h-5 min-w-5 justify-center px-1.5 text-[10px]"
          >
            {topics.length}
          </Badge>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b px-5 py-5 text-left">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Tags className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base">
                  Conversation topics
                </SheetTitle>
                <Badge
                  variant="secondary"
                  className="gap-1 text-[9px] font-medium"
                >
                  <Sparkles className="h-3 w-3" />
                  AI
                </Badge>
              </div>

              <SheetDescription className="mt-1.5 text-xs leading-5">
                Main themes detected across the comments on this post.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-5 p-5">
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Primary topic
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-5">
                    {primary.topic}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${primary.score}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold tabular-nums">
                      {primary.score}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Detected topics</h3>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Ranked by topic relevance.
                  </p>
                </div>

                <Badge variant="outline" className="text-[10px] font-normal">
                  {topics.length} topics
                </Badge>
              </div>

              <div className="divide-y rounded-xl border">
                {sorted.map((topic, index) => {
                  const isPrimary = topic.topic === primary.topic

                  return (
                    <div key={topic.topic} className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold ${
                            isPrimary
                              ? "bg-blue-600 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium leading-5">
                                {topic.topic}
                              </p>

                              {isPrimary && (
                                <Badge
                                  variant="secondary"
                                  className="mt-1.5 text-[9px]"
                                >
                                  Primary topic
                                </Badge>
                              )}
                            </div>

                            <span className="shrink-0 text-xs font-semibold tabular-nums">
                              {topic.score}%
                            </span>
                          </div>

                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className={
                                isPrimary
                                  ? "h-full rounded-full bg-blue-600"
                                  : "h-full rounded-full bg-blue-500/50"
                              }
                              style={{ width: `${topic.score}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border border-dashed bg-muted/20 p-4">
              <div className="flex gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium">About topic detection</p>
                  <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                    Topic scores indicate how strongly a theme is represented in
                    the analyzed conversation. They are AI-generated signals,
                    not percentages of all comments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t bg-background px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              AI analysis available
            </div>

            <Badge variant="outline" className="text-[10px] font-normal">
              {topics.length} detected
            </Badge>
          </div>
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
  const [insightOpen, setInsightOpen] = useState(false);

  const params = useParams<{ id: string; postId: string }>()
  const facebookPageId = params.id
  const facebookPostId = params.postId

  const { posts, isLoadingPosts } = useFacebook()

  /* ------------------------------------------------------------------------ */
  /* Data hooks                                                               */
  /* ------------------------------------------------------------------------ */

  const commentsQuery = useFacebookPostComments(facebookPostId, {
    page: 1,
    perPage: 100,
    sortBy: "newest",
  })

  // Server-side analytics: available for when you move aggregation off the client.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _analyticsQuery = useFacebookPostCommentsAnalytics(facebookPostId)

  const topicsQuery = useFacebookCommentTopics(facebookPostId)
  const syncMutation = useSyncFacebookComments(facebookPostId)

  const isSyncingComments = syncMutation.isPending

  /* ------------------------------------------------------------------------ */
  /* Local UI state                                                           */
  /* ------------------------------------------------------------------------ */

  const [search, setSearch] = useState("")
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>("all")
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>("all")
  const [sortMode, setSortMode] = useState<SortMode>("newest")
  const [dateRange, setDateRange] = useState<DateRange>("30d")
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")
  const [showBackToTop, setShowBackToTop] = useState(false)

  /* ------------------------------------------------------------------------ */
  /* Back to top                                                              */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500)

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  /* ------------------------------------------------------------------------ */
  /* Post                                                                     */
  /* ------------------------------------------------------------------------ */

  const realPost = useMemo(
    () => posts.find((item) => item.id === facebookPostId) ?? null,
    [posts, facebookPostId],
  )

  const post = USE_MOCK_DATA ? MOCK_POST : realPost

  /* ------------------------------------------------------------------------ */
  /* Topics                                                                   */
  /* ------------------------------------------------------------------------ */

  const postTopics = useMemo<PostTopic[]>(
    () => (USE_MOCK_DATA ? MOCK_POST_TOPICS : mapTopics(topicsQuery.data)),
    [topicsQuery.data],
  )

  /* ------------------------------------------------------------------------ */
  /* Comments                                                                 */
  /* ------------------------------------------------------------------------ */

  const uiComments = useMemo<UiComment[]>(() => {
    if (USE_MOCK_DATA) return MOCK_COMMENTS

    return (extractList(commentsQuery.data) as FacebookComment[]).map(
      mapComment,
    )
  }, [commentsQuery.data])

  const totalComments = uiComments.length

  /* ------------------------------------------------------------------------ */
  /* Date range                                                               */
  /* ------------------------------------------------------------------------ */

  // Stable "now" so memoized values don't recompute on every render.
  const now = useMemo(
    () => (USE_MOCK_DATA ? new Date(MOCK_NOW) : new Date()),
    [],
  )

  const dateBounds = useMemo(() => {
    if (dateRange === "all") {
      return { from: null as Date | null, to: null as Date | null }
    }

    if (dateRange === "custom") {
      return {
        from: customFrom ? new Date(`${customFrom}T00:00:00`) : null,
        to: customTo ? new Date(`${customTo}T23:59:59`) : null,
      }
    }

    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90

    const from = new Date(now)
    from.setDate(from.getDate() - (days - 1))
    from.setHours(0, 0, 0, 0)

    return { from, to: now }
  }, [dateRange, customFrom, customTo, now])

  const filterByBounds = useCallback(
    (list: UiComment[], from: Date | null, to: Date | null) => {
      if (!from && !to) return list

      return list.filter((comment) => {
        if (!comment.analyzedAt) return false

        const analyzed = new Date(comment.analyzedAt)
        if (Number.isNaN(analyzed.getTime())) return false
        if (from && analyzed < from) return false
        if (to && analyzed > to) return false

        return true
      })
    },
    [],
  )

  const periodComments = useMemo(
    () => filterByBounds(uiComments, dateBounds.from, dateBounds.to),
    [uiComments, dateBounds, filterByBounds],
  )

  /* ------------------------------------------------------------------------ */
  /* Previous period                                                          */
  /* ------------------------------------------------------------------------ */

  const previousPeriodComments = useMemo(() => {
    const { from, to } = dateBounds
    if (!from || !to) return null

    const spanMs = to.getTime() - from.getTime()
    const prevTo = new Date(from.getTime() - 1)
    const prevFrom = new Date(prevTo.getTime() - spanMs)

    return filterByBounds(uiComments, prevFrom, prevTo)
  }, [uiComments, dateBounds, filterByBounds])

  /* ------------------------------------------------------------------------ */
  /* Analysis                                                                 */
  /* ------------------------------------------------------------------------ */

  const analyzedComments = useMemo(
    () =>
      periodComments.filter((comment) =>
        Boolean(comment.sentiment && comment.analyzedAt),
      ),
    [periodComments],
  )

  const analyzedCount = analyzedComments.length

  const sentimentCounts = useMemo(
    () => ({
      positive: analyzedComments.filter((c) => c.sentiment === "positive")
        .length,
      neutral: analyzedComments.filter((c) => c.sentiment === "neutral")
        .length,
      negative: analyzedComments.filter((c) => c.sentiment === "negative")
        .length,
    }),
    [analyzedComments],
  )

  const sentimentPercentages = useMemo(() => {
    if (analyzedCount === 0) return { positive: 0, neutral: 0, negative: 0 }

    return {
      positive: Math.round((sentimentCounts.positive / analyzedCount) * 100),
      neutral: Math.round((sentimentCounts.neutral / analyzedCount) * 100),
      negative: Math.round((sentimentCounts.negative / analyzedCount) * 100),
    }
  }, [analyzedCount, sentimentCounts])

  const overallScore =
    analyzedCount > 0
      ? analyzedComments.reduce(
          (total, comment) => total + getSentimentScore(comment.sentiment!),
          0,
        ) / analyzedCount
      : 0

  const overallLabel =
    analyzedCount === 0
      ? "No analysis yet"
      : overallScore >= 4
        ? "Very positive"
        : overallScore >= 3.2
          ? "Positive"
          : overallScore >= 2.2
            ? "Mixed response"
            : "Negative"

  const overallTone: Sentiment =
    overallScore >= 3.6
      ? "positive"
      : overallScore >= 2.2
        ? "neutral"
        : "negative"

  /* ------------------------------------------------------------------------ */
  /* KPIs                                                                     */
  /* ------------------------------------------------------------------------ */

  const uniqueAuthors = useCallback(
    (list: UiComment[]) => new Set(list.map((c) => c.author)).size,
    [],
  )

  const commentsGrowth = useMemo(() => {
    if (!previousPeriodComments) return null

    const previous = previousPeriodComments.length

    if (previous === 0) return periodComments.length > 0 ? 100 : 0

    return Math.round(((periodComments.length - previous) / previous) * 100)
  }, [previousPeriodComments, periodComments])

  const usersGrowth = useMemo(() => {
    if (!previousPeriodComments) return null

    const currentUsers = uniqueAuthors(periodComments)
    const previousUsers = uniqueAuthors(previousPeriodComments)

    if (previousUsers === 0) return currentUsers > 0 ? 100 : 0

    return Math.round(((currentUsers - previousUsers) / previousUsers) * 100)
  }, [previousPeriodComments, periodComments, uniqueAuthors])

  const currentUsersCount = useMemo(
    () => uniqueAuthors(periodComments),
    [periodComments, uniqueAuthors],
  )

  /* ------------------------------------------------------------------------ */
  /* Timeline                                                                 */
  /* ------------------------------------------------------------------------ */

  const timeline = useMemo(() => {
    const map = new Map<
      string,
      {
        date: string
        positive: number
        neutral: number
        negative: number
        average: number
        total: number
      }
    >()

    analyzedComments.forEach((comment) => {
      if (!comment.analyzedAt || !comment.sentiment) return

      const date = new Date(comment.analyzedAt)
      if (Number.isNaN(date.getTime())) return

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-")

      const item = map.get(key) ?? {
        date: key,
        positive: 0,
        neutral: 0,
        negative: 0,
        average: 0,
        total: 0,
      }

      item[comment.sentiment] += 1
      item.total += 1
      map.set(key, item)
    })

    return Array.from(map.values())
      .map((item) => {
        const score = item.positive * 5 + item.neutral * 3 + item.negative * 1

        return {
          ...item,
          average:
            item.total > 0 ? Number((score / item.total).toFixed(2)) : 0,
        }
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [analyzedComments])

  /* ------------------------------------------------------------------------ */
  /* Highlights                                                               */
  /* ------------------------------------------------------------------------ */

  const topPositive = useMemo(
    () =>
      [...analyzedComments]
        .filter((c) => c.sentiment === "positive")
        .sort((a, b) => b.likes - a.likes)[0] ?? null,
    [analyzedComments],
  )

  const topNegative = useMemo(
    () =>
      [...analyzedComments]
        .filter((c) => c.sentiment === "negative")
        .sort((a, b) => b.likes - a.likes)[0] ?? null,
    [analyzedComments],
  )

  /* ------------------------------------------------------------------------ */
  /* Filtered comments                                                        */
  /* ------------------------------------------------------------------------ */

  const filteredComments = useMemo(() => {
    const query = search.trim().toLowerCase()

    const result = periodComments.filter((comment) => {
      const matchesSearch =
        !query ||
        comment.author.toLowerCase().includes(query) ||
        comment.message.toLowerCase().includes(query)

      const matchesSentiment =
        sentimentFilter === "all" || comment.sentiment === sentimentFilter

      const matchesLanguage =
        languageFilter === "all" || comment.language === languageFilter

      return matchesSearch && matchesSentiment && matchesLanguage
    })

    return [...result].sort((a, b) => {
      if (sortMode === "most_liked") return b.likes - a.likes

      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0

      return sortMode === "newest" ? dateB - dateA : dateA - dateB
    })
  }, [periodComments, search, sentimentFilter, languageFilter, sortMode])

  /* ------------------------------------------------------------------------ */
  /* Convert UI comments to Facebook comment shape                            */
  /* ------------------------------------------------------------------------ */

  const commentsForSection = useMemo(
    () => uiComments.map((c) => toFacebookComment(c, facebookPostId)),
    [uiComments, facebookPostId],
  )

  const filteredCommentsForSection = useMemo(
    () => filteredComments.map((c) => toFacebookComment(c, facebookPostId)),
    [filteredComments, facebookPostId],
  )

  /* ------------------------------------------------------------------------ */
  /* Navigation                                                               */
  /* ------------------------------------------------------------------------ */

  const scrollToComments = useCallback(() => {
    setTimeout(() => {
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

  const jumpToComment = useCallback((id: string) => {
    setSentimentFilter("all")
    setLanguageFilter("all")
    setSearch("")

    setTimeout(() => {
      document.getElementById(`comment-${id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }, 60)
  }, [])

  /* ------------------------------------------------------------------------ */
  /* Sync                                                                     */
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
      void commentsQuery.refetch()
      void topicsQuery.refetch()
    } catch (error) {
      toast.error("Unable to sync comments", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      })
    }
  }, [facebookPageId, facebookPostId, syncMutation, commentsQuery, topicsQuery])

  /* ------------------------------------------------------------------------ */
  /* Labels                                                                   */
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
              ? `${customFrom || "..."} – ${customTo || "..."}`
              : "Custom range"

  const postMessage = post?.message ?? "Post content unavailable."
  const postDate = post?.published_at ?? null
  const postLikes = post?.engagement?.likes ?? 0
  const postShares = post?.engagement?.shares ?? 0

  const hasData = analyzedCount > 0

  const isPostLoading = isLoadingPosts && !post && !USE_MOCK_DATA
  const isCommentsLoading = !USE_MOCK_DATA && commentsQuery.isLoading

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-muted/20 max-w-5xl m-auto">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
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

            <div className="flex items-center gap-2">
              {USE_MOCK_DATA && (
                <Badge
                  variant="secondary"
                  className="hidden gap-1.5 text-[10px] font-normal sm:flex"
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Preview data
                </Badge>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleSync()}
                disabled={
                  !facebookPageId || !facebookPostId || isSyncingComments
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
            </div>
          </header>

          {/* Page title */}
          <div className="mt-7">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Public response
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Understand how people are responding to this post through
              sentiment, engagement, and comment activity.
            </p>
          </div>

          {/* Post context */}
          <Card className="mt-6 overflow-hidden border-border/70 shadow-sm">
            {isPostLoading ? (
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
                postDate={postDate}
                postMessage={postMessage}
                postLikes={postLikes}
                totalComments={totalComments}
                postShares={postShares}
                formatDate={formatDate}
                formatNumber={formatNumber}
              />
            )}
          </Card>

          {/* Post tools */}
          {!isPostLoading && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {postTopics.length > 0 && <TopicsSheet topics={postTopics} />}

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
                  {analyzedCount} of {periodComments.length} comments analyzed
                  during {dateLabel.toLowerCase()}.
                </p>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <Tabs
                  value={
                    ["7d", "30d", "90d"].includes(dateRange)
                      ? dateRange
                      : undefined
                  }
                  onValueChange={(value) => setDateRange(value as DateRange)}
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
                    <DropdownMenuItem onClick={() => setDateRange("all")}>
                      All time
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDateRange("custom")}>
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
                  <div>
                    <label className="mb-1.5 block text-xs font-medium">
                      From
                    </label>
                    <Input
                      type="date"
                      value={customFrom}
                      onChange={(event) => setCustomFrom(event.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium">
                      To
                    </label>
                    <Input
                      type="date"
                      value={customTo}
                      min={customFrom || undefined}
                      onChange={(event) => setCustomTo(event.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
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
                    <Badge
                      variant="outline"
                      className="text-[10px] font-normal"
                    >
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
                  label="Comments"
                  value={periodComments.length}
                  growthPercent={commentsGrowth}
                  accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                />

                <StatCard
                  icon={Users2}
                  label="Commenters"
                  value={currentUsersCount}
                  growthPercent={usersGrowth}
                  accent="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                />
              </div>
            </div>

            {/* Timeline */}
            <SentimentTimeline data={timeline} />

            {/* What people are saying */}
            {(topPositive || topNegative) && (
              <div className="mt-4">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold">
                    What people are saying
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Highly engaged comments from this analysis period.
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {[
                    {
                      comment: topPositive,
                      sentiment: "positive" as Sentiment,
                      title: "Most liked positive comment",
                    },
                    {
                      comment: topNegative,
                      sentiment: "negative" as Sentiment,
                      title: "Most liked negative comment",
                    },
                  ].map(
                    ({ comment, sentiment, title }) =>
                      comment && (
                        <Card
                          key={sentiment}
                          className="border-border/70 shadow-none"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${sentimentConfig[sentiment].soft}`}
                                >
                                  <Flame
                                    className={`h-3.5 w-3.5 ${sentimentConfig[sentiment].text}`}
                                  />
                                </span>
                                <p className="text-xs font-medium">{title}</p>
                              </div>

                              <SentimentBadge sentiment={sentiment} />
                            </div>

                            <div className="mt-4 flex gap-3">
                              <AuthorAvatar
                                name={comment.author}
                                className="h-8 w-8"
                              />

                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold">
                                  {comment.author}
                                </p>

                                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                                  {comment.language && (
                                    <span className="flex items-center gap-1">
                                      <Languages className="h-2.5 w-2.5" />
                                      {languageLabelOf(comment.language)}
                                    </span>
                                  )}

                                  {comment.sentimentConfidence !== null && (
                                    <span>
                                      {comment.sentimentConfidence}% confidence
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1.5 line-clamp-3 text-sm leading-5 text-foreground/90">
                                  {comment.message}
                                </p>

                                <div className="mt-3 flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                    <Heart className="h-3 w-3" />
                                    {formatNumber(comment.likes)}
                                  </span>

                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-[11px]"
                                    onClick={() => jumpToComment(comment.id)}
                                  >
                                    View comment
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ),
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Comments */}
          <CommentsSection
            comments={commentsForSection}
            filteredComments={filteredCommentsForSection}
            search={search}
            sentimentFilter={sentimentFilter}
            languageFilter={languageFilter}
            sortMode={sortMode}
            dateLabel={dateLabel}
            isCommentsLoading={isCommentsLoading}
            onSearchChange={setSearch}
            onSentimentChange={setSentimentFilter}
            onLanguageChange={setLanguageFilter}
            onSortChange={setSortMode}
            onClearFilters={() => {
              setSearch("")
              setSentimentFilter("all")
              setLanguageFilter("all")
              setSortMode("newest")
            }}
            formatDate={formatDate}
            formatNumber={formatNumber}
            formatSentiment={formatSentiment}
          />

          <div className="h-10" />
        </div>

{/* Floating Action Dock */}
<div className="fixed bottom-5 right-5 z-50 flex flex-col items-center gap-3 sm:bottom-7 sm:right-7">
  {/* AI Insight */}
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="group relative">
        <div className="absolute -inset-1 rounded-full bg-primary/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative rounded-full border border-border/70 bg-background/90 p-1 shadow-lg shadow-black/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
          <AiPostInsightPopover
            analytics="Overall public sentiment is slightly positive, although a substantial number of comments express neutral or negative views. Roads and infrastructure are the most frequently mentioned public concern. The city should review reported road problems and prioritize repairs based on their urgency and impact."
            isLoading={false}
            isGenerating={false}
            error={null}
            preferredLanguage="am"
            onRefresh={() => {
              // refreshInsight();
            }}
            onGenerateInsight={(language) => {
              // generateInsight({ language });
            }}
            triggerLabel="AI Insight"
          />
        </div>
      </div>
    </TooltipTrigger>
    <TooltipContent side="left">
      View AI-powered public insights
    </TooltipContent>
  </Tooltip>

  {/* Separator */}
  {showBackToTop && (
    <>
      <div className="h-px w-6 bg-border/80" />

      {/* Back to Top */}
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

