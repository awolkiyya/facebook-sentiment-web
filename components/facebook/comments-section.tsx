"use client"

import {
  ArrowUpDown,
  BrainCircuit,
  Check,
  ExternalLink,
  Filter,
  Heart,
  Languages,
  MessageCircle,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
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
  comments: FacebookComment[]
  totalComments: number

  search: string
  sentimentFilter: SentimentFilter
  languageFilter: LanguageFilter
  analysisStatusFilter: AnalysisStatusFilter
  sortMode: CommentSortMode

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
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const SORT_OPTIONS: {
  value: CommentSortMode
  label: string
}[] = [
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

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
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

function formatConfidence(value: number): string {
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

  const selectedSort =
    SORT_OPTIONS.find((option) => option.value === sortMode)
      ?.label ?? "Newest first"

  return (
    <section
      id="comments-section"
      className={["mt-8 space-y-4 scroll-mt-6", className]
        .filter(Boolean)
        .join(" ")}
    >
      {/* SECTION HEADER */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">
              Comments
            </h2>

            {!isCommentsLoading && (
              <Badge
                variant="secondary"
                className="rounded-full px-2.5 tabular-nums"
              >
                {formatNumber(totalComments)}
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Review public feedback and its AI sentiment analysis.
          </p>
        </div>

        {!isCommentsLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BrainCircuit className="size-4" aria-hidden="true" />
            <span>AI-assisted feedback review</span>
          </div>
        )}
      </div>

      {/* SEARCH AND CONTROLS */}

      <Card className="gap-0 border-border/70 py-0 shadow-none">
        <CardContent className="space-y-3 p-3 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />

              <Input
                value={search}
                onChange={(event) =>
                  onSearchChange(event.target.value)
                }
                placeholder="Search comment text..."
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
                  aria-label="Clear comment search"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>

            {/* SORTING */}

            <div className="flex min-w-0 items-center gap-2 sm:w-auto">
              <ArrowUpDown
                className="hidden size-4 shrink-0 text-muted-foreground sm:block"
                aria-hidden="true"
              />

              <Select
                value={sortMode}
                onValueChange={(value) =>
                  onSortChange(value as CommentSortMode)
                }
              >
                <SelectTrigger
                  className="h-10 w-full sm:w-[210px]"
                  aria-label="Sort comments"
                >
                  <SelectValue placeholder="Sort comments">
                    {selectedSort}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent align="end">
                  {SORT_OPTIONS.map((option) => (
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

            {/* FILTER SHEET */}

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 shrink-0 gap-2"
                  aria-label={`Open comment filters${
                    activeFilterCount
                      ? `, ${activeFilterCount} active`
                      : ""
                  }`}
                >
                  <SlidersHorizontal
                    className="size-4"
                    aria-hidden="true"
                  />

                  <span>Filters</span>

                  {activeFilterCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="size-5 justify-center rounded-full p-0 text-[10px]"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="flex w-full flex-col gap-0 sm:max-w-md"
              >
                <SheetHeader className="border-b px-5 py-5 text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <Filter className="size-5" />
                    Filter comments
                  </SheetTitle>

                  <SheetDescription>
                    Narrow the results by language, sentiment, or AI
                    analysis status. Changes are applied through the
                    existing query handlers.
                  </SheetDescription>
                </SheetHeader>

                <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6">
                  {/* LANGUAGE */}

                  <FilterField
                    id="comments-language-filter"
                    label="Language"
                    description="Choose the detected language of a comment."
                  >
                    <Select
                      value={languageFilter}
                      onValueChange={(value) =>
                        onLanguageChange(value as LanguageFilter)
                      }
                    >
                      <SelectTrigger
                        id="comments-language-filter"
                        className="h-10 w-full"
                      >
                        <SelectValue placeholder="All languages" />
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
                  </FilterField>

                  <div className="border-t" />

                  {/* SENTIMENT */}

                  <FilterField
                    id="comments-sentiment-filter"
                    label="Sentiment"
                    description="Filter by the sentiment predicted by the AI model."
                  >
                    <Select
                      value={sentimentFilter}
                      onValueChange={(value) =>
                        onSentimentChange(value as SentimentFilter)
                      }
                    >
                      <SelectTrigger
                        id="comments-sentiment-filter"
                        className="h-10 w-full"
                      >
                        <SelectValue placeholder="All sentiments" />
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
                  </FilterField>

                  <div className="border-t" />

                  {/* ANALYSIS STATUS */}

                  <FilterField
                    id="comments-analysis-status-filter"
                    label="AI analysis status"
                    description="Find comments by their analysis processing status."
                  >
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
                      >
                        <SelectValue placeholder="All statuses" />
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
                  </FilterField>

                  {/* ACTIVE FILTERS */}

                  {hasActiveFilters && (
                    <>
                      <div className="border-t" />

                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Active filters
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {search.trim() && (
                            <Badge variant="secondary">
                              Search: {search.trim()}
                            </Badge>
                          )}

                          {languageFilter !== "all" && (
                            <Badge variant="secondary">
                              {formatLanguage(languageFilter)}
                            </Badge>
                          )}

                          {sentimentFilter !== "all" && (
                            <Badge variant="secondary">
                              {formatSentiment(sentimentFilter)}
                            </Badge>
                          )}

                          {analysisStatusFilter !== "all" && (
                            <Badge variant="secondary">
                              {formatAnalysisStatus(
                                analysisStatusFilter,
                              )}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <SheetFooter className="border-t px-5 py-4 sm:flex-row sm:justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={resetDisabled}
                    onClick={onClearFilters}
                  >
                    Reset all
                  </Button>

                  <SheetClose asChild>
                    <Button type="button">
                      <Check className="mr-2 size-4" />
                      Done
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          {/* ACTIVE FILTER CHIPS */}

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 border-t pt-3">
              <span className="mr-1 text-xs text-muted-foreground">
                Active:
              </span>

              {search.trim() && (
                <Badge variant="secondary" className="gap-1">
                  <Search className="size-3" />
                  <span className="max-w-40 truncate">
                    {search.trim()}
                  </span>
                  <button
                    type="button"
                    className="ml-1 rounded-full outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => onSearchChange("")}
                    aria-label="Remove search filter"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}

              {languageFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  <Languages className="size-3" />
                  {formatLanguage(languageFilter)}
                  <button
                    type="button"
                    className="ml-1 rounded-full outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => onLanguageChange("all")}
                    aria-label="Remove language filter"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}

              {sentimentFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {formatSentiment(sentimentFilter)}
                  <button
                    type="button"
                    className="ml-1 rounded-full outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => onSentimentChange("all")}
                    aria-label="Remove sentiment filter"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}

              {analysisStatusFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {formatAnalysisStatus(analysisStatusFilter)}
                  <button
                    type="button"
                    className="ml-1 rounded-full outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => onAnalysisStatusChange("all")}
                    aria-label="Remove analysis status filter"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto h-7 px-2 text-xs"
                onClick={onClearFilters}
              >
                Clear all
              </Button>
            </div>
          )}

          {/* RESULTS SUMMARY */}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
            <p
              className="text-xs text-muted-foreground"
              aria-live="polite"
            >
              {isCommentsLoading ? (
                "Loading comments..."
              ) : (
                <>
                  <span className="font-medium text-foreground tabular-nums">
                    {formatNumber(totalComments)}
                  </span>{" "}
                  {totalComments === 1
                    ? "matching comment"
                    : "matching comments"}
                </>
              )}
            </p>

            {hasNonDefaultSort && (
              <p className="text-xs text-muted-foreground">
                Sorted by{" "}
                <span className="font-medium text-foreground">
                  {selectedSort.toLowerCase()}
                </span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* COMMENTS */}

      <Card className="gap-0 overflow-hidden border-border/70 py-0 shadow-none">
        <CardContent className="p-0">
          {isCommentsLoading ? (
            <CommentsLoadingState />
          ) : comments.length === 0 ? (
            <CommentsEmptyState
              hasActiveFilters={hasActiveFilters}
              onClearFilters={onClearFilters}
            />
          ) : (
            <>
              <div className="divide-y">
                {comments.map((comment) => (
                  <CommentRow
                    key={comment.id}
                    comment={comment}
                  />
                ))}
              </div>

              <div className="border-t bg-muted/20 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {formatNumber(comments.length)}
                  </span>{" "}
                  comments on this page.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Filter field                                                               */
/* -------------------------------------------------------------------------- */

interface FilterFieldProps {
  id: string
  label: string
  description: string
  children: React.ReactNode
}

function FilterField({
  id,
  label,
  description,
  children,
}: FilterFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium"
      >
        {label}
      </label>

      <p className="text-xs leading-5 text-muted-foreground">
        {description}
      </p>

      {children}
    </div>
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

  const hasSentiment =
    sentiment === "positive" ||
    sentiment === "neutral" ||
    sentiment === "negative"

  const hasAnalysis = Boolean(comment.ai_analysis)

  const validConfidence =
    typeof confidence === "number" &&
    Number.isFinite(confidence) &&
    confidence >= 0 &&
    confidence <= 1

  return (
    <article
      id={`comment-${comment.id}`}
      className="scroll-mt-24 px-4 py-5 transition-colors hover:bg-muted/20 sm:px-5"
    >
      <div className="flex items-start gap-3">
        <AuthorAvatar name={authorName} />

        <div className="min-w-0 flex-1 space-y-3">
          {/* AUTHOR AND SENTIMENT */}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <p className="truncate text-sm font-semibold">
                {authorName}
              </p>

              <CommentMeta
                publishedAt={comment.commented_at}
                language={language}
                confidence={validConfidence ? confidence : null}
              />
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {hasSentiment ? (
                <SentimentBadge sentiment={sentiment} />
              ) : (
                <Badge
                  variant="outline"
                  className="font-normal text-muted-foreground"
                >
                  {hasAnalysis
                    ? "No sentiment result"
                    : "Not analyzed"}
                </Badge>
              )}
            </div>
          </div>

          {/* COMMENT TEXT */}

          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90">
            {comment.message?.trim() ||
              "No comment text available."}
          </p>

          {/* ENGAGEMENT AND AI METADATA */}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/60 pt-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Heart
                className="size-3.5"
                aria-hidden="true"
              />
              <span className="tabular-nums">
                {formatNumber(likes)}
              </span>
              <span>{likes === 1 ? "like" : "likes"}</span>
            </span>

            {validConfidence && (
              <span
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                title="Confidence of the sentiment prediction"
              >
                <BrainCircuit
                  className="size-3.5"
                  aria-hidden="true"
                />
                Sentiment confidence:{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {formatConfidence(confidence)}
                </span>
              </span>
            )}

            {analyzedAt && (
              <span className="text-xs text-muted-foreground">
                Analyzed {formatDate(analyzedAt)}
              </span>
            )}

            {comment.permalink_url && (
              <Button
                variant="link"
                size="sm"
                className="ml-auto h-auto gap-1.5 p-0 text-xs"
                asChild
              >
                <a
                  href={comment.permalink_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Facebook
                  <ExternalLink
                    className="size-3"
                    aria-hidden="true"
                  />
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
          className="flex gap-3 px-4 py-5 sm:px-5"
        >
          <Skeleton className="size-9 shrink-0 rounded-full" />

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-44 max-w-full" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            <Skeleton className="h-4 w-full max-w-2xl" />
            <Skeleton className="h-4 w-4/5 max-w-xl" />

            <div className="flex gap-3 pt-1">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-36" />
            </div>
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
    <div className="flex min-h-[280px] items-center justify-center px-6 py-12">
      <div className="max-w-sm text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl border bg-muted/40">
          <MessageCircle
            className="size-5 text-muted-foreground"
            aria-hidden="true"
          />
        </div>

        <h3 className="mt-4 text-sm font-semibold">
          {hasActiveFilters
            ? "No matching comments"
            : "No comments available"}
        </h3>

        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {hasActiveFilters
            ? "Try adjusting your search or removing some filters to see more comments."
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
            <X className="mr-2 size-3.5" />
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
      <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
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
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
      <span>
        {publishedAt ? formatDate(publishedAt) : "Unknown date"}
      </span>

      {language && (
        <>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Languages className="size-3" aria-hidden="true" />
            {formatLanguage(language)}
          </span>
        </>
      )}

      {typeof confidence === "number" &&
        Number.isFinite(confidence) &&
        confidence >= 0 &&
        confidence <= 1 && (
          <>
            <span aria-hidden="true">·</span>
            <span>
              {formatConfidence(confidence)} sentiment confidence
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
  } satisfies Record<
    SentimentLabel,
    { label: string; className: string }
  >

  const { label, className } = config[sentiment]

  return (
    <Badge
      variant="outline"
      className={className}
    >
      {label}
    </Badge>
  )
}
