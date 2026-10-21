"use client"

import { ExternalLink, Heart, MessageCircle, Search, X } from "lucide-react"

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

import type { FacebookComment } from "@/types/facebook/comment"
import type {
  CommentAnalysisStatus,
  CommentSortMode,
  LanguageCode,
  SentimentLabel,
} from "@/types/facebook/common"

import { formatDate, formatNumber } from "@/utils/post-comments-helpers"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type SentimentFilter = "all" | SentimentLabel
export type LanguageFilter = "all" | LanguageCode
export type AnalysisStatusFilter = "all" | CommentAnalysisStatus

/** "repeat" = authors with 2+ comments on this post, "single" = exactly 1. */
export type CommenterFilter = "all" | "repeat" | "single"

/** Backend should return how many comments this author has on the post. */
type CommentWithAuthorCount = FacebookComment & {
  author_comment_count?: number | null
}

export interface AnalysisStatusOption {
  value: CommentAnalysisStatus
  label: string
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

const SENTIMENT_STYLES: Record<SentimentLabel, { label: string; className: string }> = {
  positive: {
    label: "Positive",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  neutral: {
    label: "Neutral",
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300",
  },
  negative: {
    label: "Negative",
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300",
  },
}

function formatLanguage(language: LanguageCode): string {
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
      return language
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

  return (
    <section
      id="comments-section"
      className={["mt-8 scroll-mt-6", className].filter(Boolean).join(" ")}
    >
      <div className="rounded-xl border bg-card">
        {/* HEADER */}

        <div className="flex items-center justify-between gap-3 border-b px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Comments</h2>
            <p className="text-sm text-muted-foreground">
              Public feedback with AI sentiment and language analysis.
            </p>
          </div>

          {!isCommentsLoading && (
            <Badge variant="secondary" className="tabular-nums">
              {formatNumber(totalComments)}{" "}
              {totalComments === 1 ? "comment" : "comments"}
            </Badge>
          )}
        </div>

        {/* TOOLBAR */}

        <div className="space-y-3 border-b bg-muted/30 px-4 py-4 sm:px-6">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search comment text"
              aria-label="Search comments"
              className="h-10 bg-background pl-9 pr-9"
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
            className={[
              "grid grid-cols-2 gap-2",
              showCommenterFilter ? "lg:grid-cols-5" : "lg:grid-cols-4",
            ].join(" ")}
          >
            <Select
              value={sentimentFilter}
              onValueChange={(v) => onSentimentChange(v as SentimentFilter)}
            >
              <SelectTrigger className="h-10 w-full bg-background" aria-label="Sentiment">
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
              <SelectTrigger className="h-10 w-full bg-background" aria-label="Language">
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
              <SelectTrigger className="h-10 w-full bg-background" aria-label="Analysis status">
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
                <SelectTrigger className="h-10 w-full bg-background" aria-label="Commenters">
                  <SelectValue placeholder="Commenters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All commenters</SelectItem>
                  <SelectItem value="repeat">Repeat commenters (2+)</SelectItem>
                  <SelectItem value="single">Single comment only</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Select
              value={sortMode}
              onValueChange={(v) => onSortChange(v as CommentSortMode)}
            >
              <SelectTrigger className="h-10 w-full bg-background" aria-label="Sort comments">
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

          <div className="flex min-h-8 items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {isCommentsLoading ? (
                "Loading comments…"
              ) : (
                <>
                  <span className="font-medium text-foreground tabular-nums">
                    {formatNumber(totalComments)}
                  </span>{" "}
                  {totalComments === 1 ? "result" : "results"}
                </>
              )}
            </p>

            {canReset && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
              >
                <X className="mr-1.5 size-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* LIST */}

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
              <span className="font-medium text-foreground tabular-nums">
                {formatNumber(comments.length)}
              </span>{" "}
              comments on this page
            </div>
          </>
        )}
      </div>
    </section>
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

  const initials =
    authorName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"

  return (
    <article
      id={`comment-${comment.id}`}
      className="scroll-mt-24 px-4 py-5 sm:px-6"
    >
      <div className="flex gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
            {initials}
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
                {comment.commented_at
                  ? formatDate(comment.commented_at)
                  : "Unknown date"}
              </p>
            </div>

            {sentiment ? (
              <Badge
                variant="outline"
                className={["shrink-0", SENTIMENT_STYLES[sentiment].className].join(" ")}
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
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {comment.message?.trim() || (
              <span className="text-muted-foreground">
                No comment text available.
              </span>
            )}
          </p>

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
                <dd className="font-medium text-foreground tabular-nums">
                  {percent(sentimentConfidence)}
                </dd>
              </div>
            )}

            {analyzedAt && (
              <div className="flex gap-1">
                <dt>Analyzed:</dt>
                <dd>{formatDate(analyzedAt)}</dd>
              </div>
            )}

            {comment.permalink_url && (
              <a
                href={comment.permalink_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1 font-medium text-foreground hover:underline"
              >
                View on Facebook
                <ExternalLink className="size-3" aria-hidden="true" />
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