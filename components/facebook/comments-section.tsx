"use client"

import {
  Heart,
  Languages,
  MessageCircle,
  Search,
  SlidersHorizontal,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import type { FacebookComment } from "@/types/facebook/comment"
import type {
  CommentAnalysisStatus,
  CommentSortMode,
  LanguageCode,
  SentimentLabel,
} from "@/types/facebook/common"

import {
  formatDate,
  formatNumber,
  formatSentiment,
} from "@/utils/post-comments-helpers"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type SentimentFilter = "all" | SentimentLabel

export type LanguageFilter = "all" | LanguageCode

export type AnalysisStatusFilter = "all" | CommentAnalysisStatus


export interface AnalysisStatusOption {
  value: CommentAnalysisStatus
  label: string
}

export interface CommentsSectionProps {
  /** Comments returned by the server for the current query and page. */
  comments: FacebookComment[]

  /** Total matching comments across all pages. */
  totalComments: number

  /** Current controlled search value. */
  search: string

  /** Current sentiment filter. */
  sentimentFilter: SentimentFilter

  /** Current language filter. */
  languageFilter: LanguageFilter

  /** Current AI analysis status filter. */
  analysisStatusFilter: AnalysisStatusFilter

  /** Current server-side sorting mode. */
  sortMode: CommentSortMode

  /** Supported analysis statuses and their display labels. */
  analysisStatusOptions: AnalysisStatusOption[]

  /** Whether the current comments query is loading. */
  isCommentsLoading?: boolean

  onSearchChange: (value: string) => void
  onSentimentChange: (value: SentimentFilter) => void
  onLanguageChange: (value: LanguageFilter) => void
  onAnalysisStatusChange: (value: AnalysisStatusFilter) => void
  onSortChange: (value: CommentSortMode) => void

  /** Reset search, filters, and sorting to their defaults. */
  onClearFilters: () => void

  className?: string
}

/* -------------------------------------------------------------------------- */
/* Formatting helpers                                                         */
/* -------------------------------------------------------------------------- */

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

function formatAnalysisStatus(
  status: CommentAnalysisStatus,
): string {
  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
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
  const activeFilterCount =
    Number(search.trim().length > 0) +
    Number(sentimentFilter !== "all") +
    Number(languageFilter !== "all") +
    Number(analysisStatusFilter !== "all")

  const hasActiveFilters = activeFilterCount > 0
  const hasNonDefaultSort = sortMode !== "newest"

  const resetDisabled =
    !hasActiveFilters && !hasNonDefaultSort

    const sortLabel: Record<CommentSortMode, string> = {
      newest: "Newest first",
      oldest: "Oldest first",
      most_liked: "Most liked",
      most_replies: "Most replies",
      highest_sentiment_confidence: "Highest sentiment confidence",
      highest_priority: "Highest priority",
    }
  return (
    <section
      id="comments-section"
      className={["mt-10 scroll-mt-6", className]
        .filter(Boolean)
        .join(" ")}
    >
      {/* SECTION HEADER */}

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">
            Comments
          </h2>

          {!isCommentsLoading && (
            <Badge
              variant="secondary"
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            >
              {formatNumber(totalComments)}
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Search, filter, and explore comments and their sentiment.
        </p>
      </div>

      {/* SEARCH AND FILTER TOOLBAR */}

      <Card className="mt-4 border-border/70 shadow-none">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* SEARCH — VISIBLE ON THE PAGE */}

            <div className="relative min-w-0 flex-1">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />

              <Input
                value={search}
                onChange={(event) =>
                  onSearchChange(event.target.value)
                }
                placeholder="Search comments..."
                aria-label="Search comments"
                className="h-10 border-muted bg-muted/30 pl-9"
              />
            </div>

            {/* FILTER SHEET */}

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 shrink-0 gap-2"
                  aria-label={
                    activeFilterCount > 0
                      ? `Open comment filters, ${activeFilterCount} active`
                      : "Open comment filters"
                  }
                >
                  <SlidersHorizontal
                    className="size-4"
                    aria-hidden="true"
                  />

                  Filters

                  {activeFilterCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>

              {/* FILTER SHEET CONTENT */}

              <SheetContent
                side="right"
                className="flex w-full flex-col gap-0 sm:max-w-md"
              >
                <SheetHeader className="border-b px-5 py-5 text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <SlidersHorizontal
                      className="size-5"
                      aria-hidden="true"
                    />

                    Comment filters
                  </SheetTitle>

                  <SheetDescription>
                    Refine comments by language, sentiment, analysis
                    status, and sorting. Results update automatically.
                  </SheetDescription>
                </SheetHeader>

                <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6">
                  {/* LANGUAGE */}

                  <div className="space-y-2">
                    <label
                      htmlFor="comments-language-filter"
                      className="text-sm font-medium"
                    >
                      Language
                    </label>

                    <p className="text-xs text-muted-foreground">
                      Show comments written in a specific language.
                    </p>

                    <Select
                      value={languageFilter}
                      onValueChange={(value) =>
                        onLanguageChange(value as LanguageFilter)
                      }
                    >
                      <SelectTrigger
                        id="comments-language-filter"
                        className="h-10 w-full"
                        aria-label="Filter by language"
                      >
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="all">
                          All languages
                        </SelectItem>

                        <SelectItem value="am">
                          Amharic
                        </SelectItem>

                        <SelectItem value="om">
                          Afaan Oromo
                        </SelectItem>

                        <SelectItem value="en">
                          English
                        </SelectItem>

                        <SelectItem value="mixed">
                          Mixed language
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t" />

                  {/* SENTIMENT */}

                  <div className="space-y-2">
                    <label
                      htmlFor="comments-sentiment-filter"
                      className="text-sm font-medium"
                    >
                      Sentiment
                    </label>

                    <p className="text-xs text-muted-foreground">
                      Filter comments by their AI-detected sentiment.
                    </p>

                    <Select
                      value={sentimentFilter}
                      onValueChange={(value) =>
                        onSentimentChange(value as SentimentFilter)
                      }
                    >
                      <SelectTrigger
                        id="comments-sentiment-filter"
                        className="h-10 w-full"
                        aria-label="Filter by sentiment"
                      >
                        <SelectValue placeholder="Select sentiment" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="all">
                          All sentiments
                        </SelectItem>

                        <SelectItem value="positive">
                          Positive
                        </SelectItem>

                        <SelectItem value="neutral">
                          Neutral
                        </SelectItem>

                        <SelectItem value="negative">
                          Negative
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t" />

                  {/* ANALYSIS STATUS */}

                  <div className="space-y-2">
                    <label
                      htmlFor="comments-analysis-status-filter"
                      className="text-sm font-medium"
                    >
                      Analysis status
                    </label>

                    <p className="text-xs text-muted-foreground">
                      Filter comments by their AI analysis status.
                    </p>

                    <Select
                      value={analysisStatusFilter}
                      onValueChange={(value) =>
                        onAnalysisStatusChange(
                          value as AnalysisStatusFilter,
                        )
                      }
                    >
                      <SelectTrigger
                        id="comments-analysis-status-filter"
                        className="h-10 w-full"
                        aria-label="Filter by analysis status"
                      >
                        <SelectValue placeholder="Select analysis status" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="all">
                          All statuses
                        </SelectItem>

                        {analysisStatusOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t" />

                  {/* SORTING */}

                  <div className="space-y-2">
                    <label
                      htmlFor="comments-sort-filter"
                      className="text-sm font-medium"
                    >
                      Sort comments
                    </label>

                    <p className="text-xs text-muted-foreground">
                      Choose how the server orders the results.
                    </p>

                    <Select
                      value={sortMode}
                      onValueChange={(value) =>
                        onSortChange(value as CommentSortMode)
                      }
                    >
                      <SelectTrigger
                        id="comments-sort-filter"
                        className="h-10 w-full"
                        aria-label="Sort comments"
                      >
                        <SelectValue placeholder="Sort comments" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="newest">
                          {sortLabel.newest}
                        </SelectItem>

                        <SelectItem value="oldest">
                          {sortLabel.oldest}
                        </SelectItem>

                        <SelectItem value="most_liked">
                          {sortLabel.most_liked}
                        </SelectItem>

                        <SelectItem value="most_replies">
                          {sortLabel.most_replies}
                        </SelectItem>

                        <SelectItem value="highest_sentiment_confidence">
                          {sortLabel.highest_sentiment_confidence}
                        </SelectItem>

                        <SelectItem value="highest_priority">
                          {sortLabel.highest_priority}
                        </SelectItem>

                      </SelectContent>
                    </Select>
                  </div>

                  {/* CURRENT SELECTION SUMMARY */}

                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium">
                      Current selection
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {languageFilter === "all"
                          ? "All languages"
                          : formatLanguage(languageFilter)}
                      </Badge>

                      <Badge variant="secondary">
                        {sentimentFilter === "all"
                          ? "All sentiments"
                          : formatSentiment(sentimentFilter)}
                      </Badge>

                      <Badge variant="secondary">
                        {analysisStatusFilter === "all"
                          ? "All analysis statuses"
                          : formatAnalysisStatus(
                              analysisStatusFilter,
                            )}
                      </Badge>

                      <Badge variant="outline">
                        {sortLabel[sortMode]}
                      </Badge>

                      {search.trim() && (
                        <Badge variant="outline">
                          Search active
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* SHEET ACTIONS */}

                <SheetFooter className="border-t px-5 py-4 sm:flex-row sm:justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClearFilters}
                    disabled={resetDisabled}
                  >
                    Reset filters
                  </Button>

                  <SheetClose asChild>
                    <Button type="button">
                      Done
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          {/* SERVER RESULT SUMMARY */}

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3 text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">
              {formatNumber(totalComments)}
            </span>

            <span>
              {totalComments === 1 ? "comment" : "comments"}
            </span>

            {languageFilter !== "all" && (
              <>
                <span aria-hidden="true">•</span>

                <span className="inline-flex items-center gap-1">
                  <Languages
                    className="size-3"
                    aria-hidden="true"
                  />

                  {formatLanguage(languageFilter)}
                </span>
              </>
            )}

            {sentimentFilter !== "all" && (
              <>
                <span aria-hidden="true">•</span>

                <SentimentBadge sentiment={sentimentFilter} />
              </>
            )}

            {analysisStatusFilter !== "all" && (
              <>
                <span aria-hidden="true">•</span>

                <Badge variant="secondary">
                  {formatAnalysisStatus(analysisStatusFilter)}
                </Badge>
              </>
            )}

            {search.trim() && (
              <>
                <span aria-hidden="true">•</span>

                <span className="max-w-48 truncate">
                  Search: {search.trim()}
                </span>
              </>
            )}

            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto h-7 px-2 text-[11px]"
                onClick={onClearFilters}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SERVER-RETURNED COMMENT LIST */}

      <Card className="mt-3 overflow-hidden border-border/70 shadow-none">
        <CardContent className="p-0">
          {isCommentsLoading ? (
            <CommentsLoadingState />
          ) : comments.length === 0 ? (
            <CommentsEmptyState
              hasActiveFilters={hasActiveFilters}
              onClearFilters={onClearFilters}
            />
          ) : (
            <div className="divide-y">
              {comments.map((comment) => (
                <CommentRow
                  key={comment.id}
                  comment={comment}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Comment row                                                                */
/* -------------------------------------------------------------------------- */

interface CommentRowProps {
  comment: FacebookComment
}

function CommentRow({ comment }: CommentRowProps) {
  const authorName =
    comment.author?.name?.trim() || "Unknown commenter"

  const sentiment = comment.ai_analysis?.sentiment?.label
  const language = comment.ai_analysis?.language
  const confidence = comment.ai_analysis?.sentiment?.confidence
  const analyzedAt = comment.ai_analysis?.analyzed_at
  const likes = comment.engagement?.like_count ?? 0

  return (
    <article
      id={`comment-${comment.id}`}
      className="scroll-mt-24 p-4 transition-colors hover:bg-muted/20 sm:p-5"
    >
      <div className="flex gap-3">
        <AuthorAvatar name={authorName} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {authorName}
              </p>

              <CommentMeta
                publishedAt={comment.commented_at}
                language={language}
                confidence={confidence}
              />
            </div>

            {sentiment && (
              <SentimentBadge sentiment={sentiment} />
            )}
          </div>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
            {comment.message || "No comment text available."}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Heart className="size-3.5" aria-hidden="true" />
              {formatNumber(likes)}
            </span>

            {analyzedAt && (
              <span className="text-[11px] text-muted-foreground">
                Analyzed {formatDate(analyzedAt)}
              </span>
            )}

            {comment.permalink_url && (
              <Button
                variant="link"
                size="sm"
                className="ml-auto h-auto p-0 text-xs"
                asChild
              >
                <a
                  href={comment.permalink_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Facebook
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

/* -------------------------------------------------------------------------- */
/* Loading state                                                              */
/* -------------------------------------------------------------------------- */

function CommentsLoadingState() {
  return (
    <div
      className="divide-y"
      aria-label="Loading comments"
      aria-busy="true"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="flex gap-3 p-4 sm:p-5"
        >
          <Skeleton className="size-9 shrink-0 rounded-full" />

          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-full max-w-xl" />
            <Skeleton className="h-3 w-2/3 max-w-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                */
/* -------------------------------------------------------------------------- */

interface CommentsEmptyStateProps {
  hasActiveFilters: boolean
  onClearFilters: () => void
}

function CommentsEmptyState({
  hasActiveFilters,
  onClearFilters,
}: CommentsEmptyStateProps) {
  return (
    <div className="flex min-h-[320px] items-center justify-center p-8">
      <div className="max-w-sm text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-muted">
          <MessageCircle
            className="size-5 text-muted-foreground"
            aria-hidden="true"
          />
        </div>

        <p className="mt-4 text-sm font-semibold">
          No comments found
        </p>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {hasActiveFilters
            ? "Try changing your search, language, sentiment, or analysis status filters."
            : "Comments will appear here when they are available for this post."}
        </p>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Author avatar                                                              */
/* -------------------------------------------------------------------------- */

function AuthorAvatar({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

  return (
    <Avatar className="size-9 shrink-0">
      <AvatarFallback className="text-[11px] font-medium">
        {initials || "?"}
      </AvatarFallback>
    </Avatar>
  )
}

/* -------------------------------------------------------------------------- */
/* Comment metadata                                                           */
/* -------------------------------------------------------------------------- */

interface CommentMetaProps {
  publishedAt: string | null
  language?: LanguageCode | null
  confidence?: number | null
}

function CommentMeta({
  publishedAt,
  language,
  confidence,
}: CommentMetaProps) {
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
      {publishedAt ? (
        <span>{formatDate(publishedAt)}</span>
      ) : (
        <span>Unknown date</span>
      )}

      {language && (
        <>
          <span className="text-border" aria-hidden="true">
            •
          </span>

          <span>{formatLanguage(language)}</span>
        </>
      )}

      {typeof confidence === "number" &&
        Number.isFinite(confidence) && (
          <>
            <span className="text-border" aria-hidden="true">
              •
            </span>

            <span>
              {Math.round(confidence * 100)}% confidence
            </span>
          </>
        )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Sentiment badge                                                            */
/* -------------------------------------------------------------------------- */

interface SentimentBadgeProps {
  sentiment: SentimentLabel
}

function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  const config = {
    positive: {
      label: "Positive",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
    },
    neutral: {
      label: "Neutral",
      className:
        "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
    },
    negative: {
      label: "Negative",
      className:
        "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
    },
  } satisfies Record<
    SentimentLabel,
    { label: string; className: string }
  >

  const { label, className } = config[sentiment]

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}