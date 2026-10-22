"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  Heart,
  MessageCircle,
  RefreshCw,
  Search,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  X,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn, formatEthiopianDateWithTime } from "@/lib/utils"

import type { FacebookComment } from "@/types/facebook/comment"
import type {
  CommentAnalysisStatus,
  CommentSortMode,
  LanguageCode,
  SentimentLabel,
} from "@/types/facebook/common"

import {  formatNumber } from "@/utils/post-comments-helpers"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type SentimentFilter = "all" | SentimentLabel
export type LanguageFilter = "all" | LanguageCode
export type AnalysisStatusFilter = "all" | CommentAnalysisStatus

/** "repeat" = authors with 2+ comments on this post, "single" = exactly 1. */
export type CommenterFilter = "all" | "repeat" | "single"

type CommentWithAuthorCount = FacebookComment & {
  author_comment_count?: number | null
}

export interface AnalysisStatusOption {
  value: CommentAnalysisStatus
  label: string
}

interface CommentInsight {
  id: string
  facebook_comment_id: string
  author: string | null
  message: string | null
  permalink_url: string | null
  commented_at: string | null
  likes: number | null
  sentiment: SentimentLabel
  sentiment_confidence: number | null
  language: string | null
}

interface CommentInsights {
  top_positive: CommentInsight | null
  top_negative: CommentInsight | null
}

interface CommentInsightsResponse {
  success: boolean
  message?: string
  data?: CommentInsights
}

export interface CommentsSectionProps {
  comments: FacebookComment[]
  totalComments: number

  search: string
  sentimentFilter: SentimentFilter
  languageFilter: LanguageFilter
  analysisStatusFilter: AnalysisStatusFilter
  sortMode: CommentSortMode

  /** Optional: when omitted, the Commenters filter is hidden. */
  commenterFilter?: CommenterFilter
  onCommenterChange?: (value: CommenterFilter) => void

  analysisStatusOptions: AnalysisStatusOption[]
  isCommentsLoading?: boolean

  onSearchChange: (value: string) => void
  onSentimentChange: (value: SentimentFilter) => void
  onLanguageChange: (value: LanguageFilter) => void
  onAnalysisStatusChange: (value: AnalysisStatusFilter) => void
  onSortChange: (value: CommentSortMode) => void
  onClearFilters: () => void

  /**
   * Complete Laravel comments-insights endpoint URL.
   * When omitted, the Top engaged comments button is hidden.
   */
  insightsUrl?: string

  className?: string
}

/* -------------------------------------------------------------------------- */
/* Constants and helpers                                                      */
/* -------------------------------------------------------------------------- */

const SORT_OPTIONS: { value: CommentSortMode; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "most_liked", label: "Most liked" },
  { value: "most_replies", label: "Most replies" },
  {
    value: "highest_sentiment_confidence",
    label: "Highest sentiment confidence",
  },
  { value: "highest_priority", label: "Highest priority" },
]

const COMMENTER_LABELS: Record<CommenterFilter, string> = {
  all: "All commenters",
  repeat: "Repeat commenters (2+)",
  single: "Single comment only",
}

const SENTIMENT_STYLES: Record<
  SentimentLabel,
  { label: string; className: string; accent: string }
> = {
  positive: {
    label: "Positive",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300",
    accent: "border-l-emerald-500",
  },
  neutral: {
    label: "Neutral",
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300",
    accent: "border-l-slate-300 dark:border-l-slate-700",
  },
  negative: {
    label: "Negative",
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300",
    accent: "border-l-rose-500",
  },
}

function formatLanguage(language: string): string {
  switch (language) {
    case "am":
      return "Amharic"
    case "om":
      return "Afaan Oromo"
    case "en":
      return "English"
    case "mixed":
      return "Mixed language"
    default:
      return language.toUpperCase()
  }
}

function isSentimentLabel(value: unknown): value is SentimentLabel {
  return value === "positive" || value === "neutral" || value === "negative"
}

function isValidConfidence(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 1
  )
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`
}

function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  )
}

/* -------------------------------------------------------------------------- */
/* Insights data hook                                                         */
/* -------------------------------------------------------------------------- */

type InsightsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: CommentInsights; fetchedAt: number }

const INSIGHTS_CACHE_TTL_MS = 60_000

/**
 * Loads insights when `open` becomes true.
 * - Cancels the in-flight request on close, retry, or unmount.
 * - Reuses a fresh result for 60s so reopening is instant.
 * - Exposes `refresh` for retry and manual updates without closing the dialog.
 */
function useCommentInsights(open: boolean, url?: string) {
  const [state, setState] = useState<InsightsState>({ status: "idle" })
  const [nonce, setNonce] = useState(0)
  const cacheRef = useRef<{
    url: string
    data: CommentInsights
    fetchedAt: number
  } | null>(null)

  useEffect(() => {
    if (!open || !url) return

    const cached = cacheRef.current
    if (
      nonce === 0 &&
      cached &&
      cached.url === url &&
      Date.now() - cached.fetchedAt < INSIGHTS_CACHE_TTL_MS
    ) {
      setState({
        status: "success",
        data: cached.data,
        fetchedAt: cached.fetchedAt,
      })
      return
    }

    const controller = new AbortController()
    setState({ status: "loading" })

    async function load(endpoint: string) {
      try {
        const response = await fetch(endpoint, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        })

        let result: CommentInsightsResponse | null = null
        try {
          result = (await response.json()) as CommentInsightsResponse
        } catch {
          result = null
        }

        if (!response.ok || !result?.success) {
          throw new Error(
            result?.message ||
              `Unable to load comment insights (HTTP ${response.status}).`,
          )
        }

        if (!result.data) {
          throw new Error("The insights response did not contain any data.")
        }

        const data: CommentInsights = {
          top_positive: result.data.top_positive ?? null,
          top_negative: result.data.top_negative ?? null,
        }
        const fetchedAt = Date.now()
        cacheRef.current = { url: endpoint, data, fetchedAt }

        if (!controller.signal.aborted) {
          setState({ status: "success", data, fetchedAt })
        }
      } catch (error) {
        if (controller.signal.aborted) return
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to load comment insights.",
        })
      }
    }

    void load(url)

    return () => controller.abort()
  }, [open, url, nonce])

  const refresh = useCallback(() => {
    cacheRef.current = null
    setNonce((n) => n + 1)
  }, [])

  return { state, refresh }
}

/* -------------------------------------------------------------------------- */
/* Shared small components                                                    */
/* -------------------------------------------------------------------------- */

const COLLAPSE_AT = 280

/** Message text that collapses long content behind a Show more toggle. */
function CommentMessage({
  message,
  collapseAt = COLLAPSE_AT,
}: {
  message: string | null | undefined
  collapseAt?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const text = message?.trim()

  if (!text) {
    return (
      <p className="text-sm italic text-muted-foreground">
        No comment text available.
      </p>
    )
  }

  const isLong = text.length > collapseAt
  const visible =
    isLong && !expanded ? `${text.slice(0, collapseAt).trimEnd()}…` : text

  return (
    <div>
      <p className="whitespace-pre-wrap break-words text-sm leading-6">
        {visible}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-1 rounded text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      /* Clipboard can be blocked by the browser. Fail quietly. */
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={handleCopy}
      aria-label={copied ? "Comment copied" : "Copy comment text"}
    >
      {copied ? (
        <Check className="size-4 text-emerald-600" aria-hidden="true" />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}
    </Button>
  )
}

function DateText({ value }: { value: string | null | undefined }) {
  if (!value) return <span>Unknown date</span>
  return <time dateTime={value}>{formatEthiopianDateWithTime(value)}</time>
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export function CommentsSection({
  comments,
  totalComments,
  search,
  sentimentFilter,
  languageFilter,
  analysisStatusFilter,
  sortMode,
  commenterFilter = "all",
  onCommenterChange,
  analysisStatusOptions,
  isCommentsLoading = false,
  onSearchChange,
  onSentimentChange,
  onLanguageChange,
  onAnalysisStatusChange,
  onSortChange,
  onClearFilters,
  insightsUrl,
  className,
}: CommentsSectionProps) {
  const showCommenterFilter = Boolean(onCommenterChange)

  const hasActiveFilters =
    search.trim().length > 0 ||
    sentimentFilter !== "all" ||
    languageFilter !== "all" ||
    analysisStatusFilter !== "all" ||
    commenterFilter !== "all"

  const canReset = hasActiveFilters || sortMode !== "newest"

  /* Removable chips for every active filter, so users always see why the list
     looks the way it does and can drop one filter without resetting all. */
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = []

    if (search.trim()) {
      chips.push({
        key: "search",
        label: `Search: “${search.trim()}”`,
        onRemove: () => onSearchChange(""),
      })
    }
    if (sentimentFilter !== "all") {
      chips.push({
        key: "sentiment",
        label: SENTIMENT_STYLES[sentimentFilter].label,
        onRemove: () => onSentimentChange("all"),
      })
    }
    if (languageFilter !== "all") {
      chips.push({
        key: "language",
        label: formatLanguage(languageFilter),
        onRemove: () => onLanguageChange("all"),
      })
    }
    if (analysisStatusFilter !== "all") {
      const option = analysisStatusOptions.find(
        (o) => o.value === analysisStatusFilter,
      )
      chips.push({
        key: "status",
        label: option?.label ?? String(analysisStatusFilter),
        onRemove: () => onAnalysisStatusChange("all"),
      })
    }
    if (showCommenterFilter && commenterFilter !== "all") {
      chips.push({
        key: "commenter",
        label: COMMENTER_LABELS[commenterFilter],
        onRemove: () => onCommenterChange?.("all"),
      })
    }

    return chips
  }, [
    search,
    sentimentFilter,
    languageFilter,
    analysisStatusFilter,
    commenterFilter,
    showCommenterFilter,
    analysisStatusOptions,
    onSearchChange,
    onSentimentChange,
    onLanguageChange,
    onAnalysisStatusChange,
    onCommenterChange,
  ])

  const [insightsOpen, setInsightsOpen] = useState(false)
  const { state: insightsState, refresh: refreshInsights } =
    useCommentInsights(insightsOpen, insightsUrl)

  return (
    <section
      id="comments-section"
      aria-labelledby="comments-heading"
      className={cn("mt-8 scroll-mt-6", className)}
    >
      <div className="overflow-hidden rounded-sm border bg-card">
        {/* HEADER */}

        <div className="flex items-center justify-between gap-3 border-b px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2
              id="comments-heading"
              className="text-lg font-semibold tracking-tight"
            >
              Comments
            </h2>
            <p className="text-sm text-muted-foreground">
              Public feedback with AI sentiment and language analysis.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {insightsUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInsightsOpen(true)}
              >
                <TrendingUp className="mr-2 size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Top engaged</span>
                <span className="sm:hidden">Top</span>
              </Button>
            )}

            {!isCommentsLoading && (
              <Badge variant="secondary" className="tabular-nums">
                {formatNumber(totalComments)}{" "}
                {totalComments === 1 ? "comment" : "comments"}
              </Badge>
            )}
          </div>
        </div>

        {/* TOOLBAR */}

        <div
          role="search"
          aria-label="Filter comments"
          className="space-y-3 border-b bg-muted/30 px-4 py-4 sm:px-6"
        >
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />

            <Input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape" && search.length > 0) {
                  e.preventDefault()
                  onSearchChange("")
                }
              }}
              placeholder="Search comment text"
              aria-label="Search comments"
              className="h-10 bg-background pl-9 pr-9 [&::-webkit-search-cancel-button]:appearance-none"
            />

            {search.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>

          <div
            className={cn(
              "grid grid-cols-2 gap-2",
              showCommenterFilter ? "lg:grid-cols-5" : "lg:grid-cols-4",
            )}
          >
            <Select
              value={sentimentFilter}
              onValueChange={(v) => onSentimentChange(v as SentimentFilter)}
            >
              <SelectTrigger
                className="h-10 w-full bg-background"
                aria-label="Sentiment"
              >
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sentiments</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={languageFilter}
              onValueChange={(v) => onLanguageChange(v as LanguageFilter)}
            >
              <SelectTrigger
                className="h-10 w-full bg-background"
                aria-label="Language"
              >
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All languages</SelectItem>
                <SelectItem value="am">Amharic</SelectItem>
                <SelectItem value="om">Afaan Oromo</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="mixed">Mixed language</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={analysisStatusFilter}
              onValueChange={(v) =>
                onAnalysisStatusChange(v as AnalysisStatusFilter)
              }
            >
              <SelectTrigger
                className="h-10 w-full bg-background"
                aria-label="Analysis status"
              >
                <SelectValue placeholder="Analysis status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {analysisStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {showCommenterFilter && (
              <Select
                value={commenterFilter}
                onValueChange={(v) => onCommenterChange?.(v as CommenterFilter)}
              >
                <SelectTrigger
                  className="h-10 w-full bg-background"
                  aria-label="Commenters"
                >
                  <SelectValue placeholder="Commenters" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(COMMENTER_LABELS) as CommenterFilter[]).map(
                    (key) => (
                      <SelectItem key={key} value={key}>
                        {COMMENTER_LABELS[key]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            )}

            <Select
              value={sortMode}
              onValueChange={(v) => onSortChange(v as CommentSortMode)}
            >
              <SelectTrigger
                className="h-10 w-full bg-background"
                aria-label="Sort comments"
              >
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent align="end">
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active filter chips + result count + reset */}

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p
                className="text-sm text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                {isCommentsLoading ? (
                  "Loading comments…"
                ) : (
                  <>
                    <span className="font-medium tabular-nums text-foreground">
                      {formatNumber(totalComments)}
                    </span>{" "}
                    {totalComments === 1 ? "result" : "results"}
                  </>
                )}
              </p>

              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  aria-label={`Remove filter: ${chip.label}`}
                  className="inline-flex max-w-[16rem] items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="truncate">{chip.label}</span>
                  <X className="size-3 shrink-0" aria-hidden="true" />
                </button>
              ))}
            </div>

            {canReset && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
              >
                <X className="mr-1.5 size-3.5" aria-hidden="true" />
                Reset all
              </Button>
            )}
          </div>
        </div>

        {/* COMMENT LIST */}

        {isCommentsLoading ? (
          <LoadingState />
        ) : comments.length === 0 ? (
          <EmptyState
            hasActiveFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
          />
        ) : (
          <>
            <ul className="divide-y">
              {comments.map((comment) => (
                <li key={comment.id}>
                  <CommentRow comment={comment} />
                </li>
              ))}
            </ul>

            <div className="border-t px-4 py-3 text-sm text-muted-foreground sm:px-6">
              Showing{" "}
              <span className="font-medium tabular-nums text-foreground">
                {formatNumber(comments.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium tabular-nums text-foreground">
                {formatNumber(totalComments)}
              </span>{" "}
              {totalComments === 1 ? "comment" : "comments"}
            </div>
          </>
        )}
      </div>

      <TopEngagedDialog
        open={insightsOpen}
        onOpenChange={setInsightsOpen}
        state={insightsState}
        onRefresh={refreshInsights}
      />
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Top engaged comments dialog                                                */
/* -------------------------------------------------------------------------- */

function TopEngagedDialog({
  open,
  onOpenChange,
  state,
  onRefresh,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  state: InsightsState
  onRefresh: () => void
}) {
  const isLoading = state.status === "idle" || state.status === "loading"
  const hasAny =
    state.status === "success" &&
    (state.data.top_positive !== null || state.data.top_negative !== null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="size-5" aria-hidden="true" />
            Top engaged comments
          </DialogTitle>
          <DialogDescription>
            The most-liked positive and negative comments for the period
            configured by the insights endpoint.
          </DialogDescription>
        </DialogHeader>

        <div aria-live="polite" aria-busy={isLoading}>
          {isLoading && (
            <div
              className="grid gap-4 py-1 sm:grid-cols-2"
              aria-label="Loading comment insights"
            >
              <InsightSkeleton />
              <InsightSkeleton />
            </div>
          )}

          {state.status === "error" && (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-4"
              role="alert"
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="mt-0.5 size-4 shrink-0 text-destructive"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    Unable to load comment insights
                  </p>
                  <p className="mt-1 break-words text-sm text-muted-foreground">
                    {state.message}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={onRefresh}
                  >
                    <RefreshCw className="mr-2 size-3.5" aria-hidden="true" />
                    Try again
                  </Button>
                </div>
              </div>
            </div>
          )}

          {state.status === "success" && !hasAny && (
            <div className="flex flex-col items-center py-10 text-center">
              <MessageCircle
                className="size-8 text-muted-foreground/60"
                aria-hidden="true"
              />
              <p className="mt-3 text-sm font-medium">
                No engaged comments yet
              </p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Top comments appear here once analyzed comments receive likes.
              </p>
            </div>
          )}

          {state.status === "success" && hasAny && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <InsightCard
                  title="Top positive comment"
                  description="Most-liked comment classified as positive."
                  sentiment="positive"
                  comment={state.data.top_positive}
                />
                <InsightCard
                  title="Top negative comment"
                  description="Most-liked comment classified as negative."
                  sentiment="negative"
                  comment={state.data.top_negative}
                />
              </div>

              <div className="flex items-center justify-between gap-3 border-t pt-3 text-xs text-muted-foreground">
                <span>
                  Updated{" "}
                  {new Date(state.fetchedAt).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={onRefresh}
                >
                  <RefreshCw className="mr-1.5 size-3.5" aria-hidden="true" />
                  Refresh
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/* Insight card                                                               */
/* -------------------------------------------------------------------------- */

function InsightCard({
  title,
  description,
  sentiment,
  comment,
}: {
  title: string
  description: string
  sentiment: "positive" | "negative"
  comment: CommentInsight | null
}) {
  const isPositive = sentiment === "positive"
  const sentimentStyle = SENTIMENT_STYLES[sentiment]
  const Icon = isPositive ? ThumbsUp : ThumbsDown
  const iconClass = isPositive
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-rose-600 dark:text-rose-400"

  if (!comment) {
    return (
      <section
        aria-label={title}
        className="flex min-h-48 flex-col rounded-xl border border-dashed p-4"
      >
        <div className="flex items-center gap-2">
          <Icon className={cn("size-4", iconClass)} aria-hidden="true" />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>

        <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
          <MessageCircle
            className="size-6 text-muted-foreground/60"
            aria-hidden="true"
          />
          <p className="mt-2 text-sm font-medium">No matching comment found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            No eligible {sentiment} comment was found for this period.
          </p>
        </div>
      </section>
    )
  }

  const authorName = comment.author?.trim() || "Unknown commenter"
  const likes = comment.likes ?? 0

  return (
    <article
      aria-label={title}
      className={cn(
        "flex min-w-0 flex-col rounded-none border border-l-2 p-4",
        sentimentStyle.accent,
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon
            className={cn("size-4 shrink-0", iconClass)}
            aria-hidden="true"
          />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>

        <Badge
          variant="outline"
          className={cn("shrink-0", sentimentStyle.className)}
        >
          {sentimentStyle.label}
        </Badge>
      </header>

      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {description}
      </p>

      <div className="mt-4 flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="bg-muted text-[11px] font-semibold text-muted-foreground">
              {getInitials(authorName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{authorName}</p>
            <p className="text-xs text-muted-foreground">
              <DateText value={comment.commented_at} />
            </p>
          </div>
        </div>

        <CommentMessage message={comment.message} collapseAt={220} />

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Heart className="size-3.5" aria-hidden="true" />
            <span className="font-medium tabular-nums text-foreground">
              {formatNumber(likes)}
            </span>
            {likes === 1 ? "like" : "likes"}
          </span>

          {isValidConfidence(comment.sentiment_confidence) && (
            <span>
              Confidence{" "}
              <span className="font-medium tabular-nums text-foreground">
                {percent(comment.sentiment_confidence)}
              </span>
            </span>
          )}

          {comment.language && (
            <span>
              <span className="font-medium text-foreground">
                {formatLanguage(comment.language)}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {comment.permalink_url && (
            <Button asChild variant="outline" size="sm" className="flex-1">
              <a
                href={comment.permalink_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Facebook
                <ExternalLink className="ml-2 size-3.5" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </Button>
          )}
          {comment.message?.trim() && <CopyButton text={comment.message.trim()} />}
        </div>
      </div>
    </article>
  )
}

/* -------------------------------------------------------------------------- */
/* Comment row                                                                */
/* -------------------------------------------------------------------------- */

function CommentRow({ comment }: { comment: CommentWithAuthorCount }) {
  const authorName = comment.author?.name?.trim() || "Unknown commenter"

  const authorCommentCount = comment.author_comment_count ?? 0
  const isRepeatCommenter = authorCommentCount >= 2

  const sentimentRaw = comment.ai_analysis?.sentiment?.label
  const sentiment = isSentimentLabel(sentimentRaw) ? sentimentRaw : null
  const language = comment.ai_analysis?.language
  const sentimentConfidence = comment.ai_analysis?.sentiment?.confidence
  const languageConfidence = comment.ai_analysis?.language_confidence
  const analyzedAt = comment.ai_analysis?.analyzed_at
  const likes = comment.engagement?.like_count ?? 0

  return (
    <article
      id={`comment-${comment.id}`}
      className={cn(
        "scroll-mt-24 border-l-2 px-4 py-5 transition-colors hover:bg-muted/20 sm:px-6",
        sentiment ? SENTIMENT_STYLES[sentiment].accent : "border-l-transparent",
      )}
    >
      <div className="flex gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
            {getInitials(authorName)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-3">
          {/* Author, date, sentiment */}

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold">{authorName}</p>

                {isRepeatCommenter && (
                  <Badge
                    variant="outline"
                    className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300"
                    title="Number of comments this person has written on this post"
                  >
                    {authorCommentCount} comments on this post
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                <DateText value={comment.commented_at} />
              </p>
            </div>

            {sentiment ? (
              <Badge
                variant="outline"
                className={cn("shrink-0", SENTIMENT_STYLES[sentiment].className)}
              >
                {SENTIMENT_STYLES[sentiment].label}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="shrink-0 font-normal text-muted-foreground"
              >
                {comment.ai_analysis ? "No sentiment result" : "Not analyzed"}
              </Badge>
            )}
          </div>

          {/* Message */}

          <CommentMessage message={comment.message} />

          {/* Details */}

          <dl className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Heart className="size-3.5" aria-hidden="true" />
              <dt className="sr-only">Likes</dt>
              <dd className="tabular-nums">
                {formatNumber(likes)} {likes === 1 ? "like" : "likes"}
              </dd>
            </div>

            {language && (
              <div className="flex gap-1">
                <dt>Language:</dt>
                <dd className="font-medium text-foreground">
                  {formatLanguage(language)}
                  {isValidConfidence(languageConfidence) &&
                    ` (${percent(languageConfidence)})`}
                </dd>
              </div>
            )}

            {isValidConfidence(sentimentConfidence) && (
              <div className="flex gap-1">
                <dt>Sentiment confidence:</dt>
                <dd className="font-medium tabular-nums text-foreground">
                  {percent(sentimentConfidence)}
                </dd>
              </div>
            )}

            {analyzedAt && (
              <div className="flex gap-1">
                <dt>Analyzed:</dt>
                <dd>
                  <DateText value={analyzedAt} />
                </dd>
              </div>
            )}

            {comment.permalink_url && (
              <a
                href={comment.permalink_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1 rounded font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                View on Facebook
                <ExternalLink className="size-3" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </dl>
        </div>
      </div>
    </article>
  )
}

/* -------------------------------------------------------------------------- */
/* Loading and empty states                                                   */
/* -------------------------------------------------------------------------- */

function InsightSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-48" />
      <div className="flex items-center gap-2.5 pt-2">
        <Skeleton className="size-8 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-8 w-full" />
    </div>
  )
}

function LoadingState() {
  return (
    <div className="divide-y" aria-label="Loading comments" aria-busy="true">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex gap-3 px-4 py-5 sm:px-6">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full max-w-2xl" />
            <Skeleton className="h-4 w-4/5 max-w-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({
  hasActiveFilters,
  onClearFilters,
}: {
  hasActiveFilters: boolean
  onClearFilters: () => void
}) {
  return (
    <div className="flex min-h-[260px] items-center justify-center px-6 py-12">
      <div className="max-w-sm text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
          <MessageCircle
            className="size-5 text-muted-foreground"
            aria-hidden="true"
          />
        </div>

        <h3 className="mt-4 text-sm font-semibold">
          {hasActiveFilters ? "No matching comments" : "No comments yet"}
        </h3>

        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {hasActiveFilters
            ? "Try a different search or reset the filters."
            : "Comments appear here once people react to this post."}
        </p>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={onClearFilters}
          >
            Reset filters
          </Button>
        )}
      </div>
    </div>
  )
}