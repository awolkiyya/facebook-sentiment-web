"use client"

import { useMemo, useState, type ReactNode } from "react"

import {
  ArrowUpDown,
  BrainCircuit,
  Check,
  ChevronDown,
  ExternalLink,
  Heart,
  Languages,
  MessageCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
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

const SENTIMENT_TABS: { value: SentimentFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "positive", label: "Positive" },
  { value: "neutral", label: "Neutral" },
  { value: "negative", label: "Negative" },
]

const SENTIMENT_STYLES: Record<
  SentimentLabel,
  { label: string; dot: string; ring: string; badge: string; bar: string }
> = {
  positive: {
    label: "Positive",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/60",
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300",
    bar: "bg-emerald-500",
  },
  neutral: {
    label: "Neutral",
    dot: "bg-slate-400",
    ring: "ring-slate-400/60",
    badge:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300",
    bar: "bg-slate-400",
  },
  negative: {
    label: "Negative",
    dot: "bg-rose-500",
    ring: "ring-rose-500/60",
    badge:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300",
    bar: "bg-rose-500",
  },
}

const TRUNCATE_AT = 280

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
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

function formatAnalysisStatus(status: CommentAnalysisStatus): string {
  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatConfidence(value: number): string {
  return `${Math.round(value * 100)}%`
}

function isValidConfidence(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 1
  )
}

function isSentimentLabel(value: unknown): value is SentimentLabel {
  return value === "positive" || value === "neutral" || value === "negative"
}

/** "just now", "5m", "3h", "2d", "4w" — then falls back to the full date. */
function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "Unknown date"
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return "Unknown date"

  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000))
  if (seconds < 45) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${Math.max(1, minutes)}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w`
  return formatDate(iso)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Wraps search matches in <mark> so people see why a comment matched. */
function highlight(text: string, query: string): ReactNode {
  const q = query.trim()
  if (!q) return text
  const parts = text.split(new RegExp(`(${escapeRegExp(q)})`, "gi"))
  return parts.map((part, index) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark
        key={index}
        className="rounded bg-amber-200/70 px-0.5 text-foreground dark:bg-amber-500/30"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  )
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
  // Search and sentiment have their own always-visible controls,
  // so the Filters button only counts what lives inside the sheet.
  const sheetFilterCount =
    Number(languageFilter !== "all") + Number(analysisStatusFilter !== "all")

  const hasActiveFilters =
    search.trim().length > 0 ||
    sentimentFilter !== "all" ||
    sheetFilterCount > 0

  const hasNonDefaultSort = sortMode !== "newest"
  const resetDisabled = !hasActiveFilters && !hasNonDefaultSort

  const selectedSort =
    SORT_OPTIONS.find((o) => o.value === sortMode)?.label ?? "Newest first"

  // Sentiment mix of the comments currently on screen.
  const mix = useMemo(() => {
    const counts = { positive: 0, neutral: 0, negative: 0 }
    for (const comment of comments) {
      const label = comment.ai_analysis?.sentiment?.label
      if (isSentimentLabel(label)) counts[label] += 1
    }
    const analyzed = counts.positive + counts.neutral + counts.negative
    return { counts, analyzed }
  }, [comments])

  return (
    <section
      id="comments-section"
      className={["mt-8 scroll-mt-6", className].filter(Boolean).join(" ")}
    >
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        {/* HEADER */}

        <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4 sm:px-5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight">
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

          {!isCommentsLoading && (
            <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Sentiment by AI
            </div>
          )}
        </div>

        {/* STICKY TOOLBAR */}

        <div className="sticky top-0 z-10 space-y-3 border-y bg-card/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:px-5">
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search comments"
                aria-label="Search comments"
                className="h-10 rounded-full border-transparent bg-muted pl-10 pr-10 shadow-none focus-visible:bg-background"
              />
              {search.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 size-8 -translate-y-1/2 rounded-full"
                  onClick={() => onSearchChange("")}
                  aria-label="Clear comment search"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>

            {/* SORT */}

            <Select
              value={sortMode}
              onValueChange={(v) => onSortChange(v as CommentSortMode)}
            >
              <SelectTrigger
                className="h-10 w-10 shrink-0 justify-center gap-0 rounded-full border-transparent bg-muted px-0 shadow-none sm:w-[190px] sm:justify-between sm:gap-2 sm:px-3 [&>svg:last-child]:hidden sm:[&>svg:last-child]:block"
                aria-label={`Sort comments, currently ${selectedSort}`}
              >
                <ArrowUpDown
                  className="size-4 shrink-0 sm:hidden"
                  aria-hidden="true"
                />
                <span className="hidden truncate text-sm sm:inline">
                  <SelectValue placeholder="Sort">{selectedSort}</SelectValue>
                </span>
              </SelectTrigger>
              <SelectContent align="end">
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* MORE FILTERS */}

            <FiltersSheet
              search={search}
              sentimentFilter={sentimentFilter}
              languageFilter={languageFilter}
              analysisStatusFilter={analysisStatusFilter}
              analysisStatusOptions={analysisStatusOptions}
              activeCount={sheetFilterCount}
              resetDisabled={resetDisabled}
              onLanguageChange={onLanguageChange}
              onAnalysisStatusChange={onAnalysisStatusChange}
              onClearFilters={onClearFilters}
            />
          </div>

          {/* QUICK SENTIMENT PILLS */}

          <div
            role="tablist"
            aria-label="Filter by sentiment"
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {SENTIMENT_TABS.map((tab) => {
              const selected = sentimentFilter === tab.value
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => onSentimentChange(tab.value)}
                  className={[
                    "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  {tab.value !== "all" && (
                    <span
                      className={[
                        "size-2 rounded-full",
                        SENTIMENT_STYLES[tab.value].dot,
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  )}
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* ACTIVE FILTER CHIPS (only the ones not visible elsewhere) */}

          {(search.trim() || sheetFilterCount > 0) && (
            <div className="flex flex-wrap items-center gap-2">
              {languageFilter !== "all" && (
                <RemovableChip
                  icon={<Languages className="size-3" />}
                  label={formatLanguage(languageFilter)}
                  removeLabel="Remove language filter"
                  onRemove={() => onLanguageChange("all")}
                />
              )}
              {analysisStatusFilter !== "all" && (
                <RemovableChip
                  icon={<BrainCircuit className="size-3" />}
                  label={formatAnalysisStatus(analysisStatusFilter)}
                  removeLabel="Remove analysis status filter"
                  onRemove={() => onAnalysisStatusChange("all")}
                />
              )}
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-7 px-2 text-xs"
                  onClick={onClearFilters}
                >
                  Clear all
                </Button>
              )}
            </div>
          )}

          {/* RESULTS SUMMARY */}

          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p
              className="text-xs text-muted-foreground"
              aria-live="polite"
            >
              {isCommentsLoading ? (
                "Loading comments…"
              ) : (
                <>
                  <span className="font-medium text-foreground tabular-nums">
                    {formatNumber(totalComments)}
                  </span>{" "}
                  {totalComments === 1 ? "comment" : "comments"}
                  {hasActiveFilters ? " match your filters" : ""}
                  {hasNonDefaultSort && (
                    <> · {selectedSort.toLowerCase()}</>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        {/* SENTIMENT SNAPSHOT */}

        {!isCommentsLoading && mix.analyzed > 0 && (
          <SentimentSnapshot counts={mix.counts} analyzed={mix.analyzed} />
        )}

        {/* FEED */}

        {isCommentsLoading ? (
          <CommentsLoadingState />
        ) : comments.length === 0 ? (
          <CommentsEmptyState
            hasActiveFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
          />
        ) : (
          <>
            <ul className="divide-y divide-border/60">
              {comments.map((comment) => (
                <li key={comment.id}>
                  <CommentRow comment={comment} searchQuery={search} />
                </li>
              ))}
            </ul>

            <div className="border-t bg-muted/30 px-4 py-3 text-center sm:px-5">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {formatNumber(comments.length)}
                </span>{" "}
                of{" "}
                <span className="tabular-nums">
                  {formatNumber(totalComments)}
                </span>{" "}
                comments
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Sentiment snapshot                                                         */
/* -------------------------------------------------------------------------- */

function SentimentSnapshot({
  counts,
  analyzed,
}: {
  counts: Record<SentimentLabel, number>
  analyzed: number
}) {
  const order: SentimentLabel[] = ["positive", "neutral", "negative"]

  return (
    <div className="space-y-2 border-b px-4 py-3 sm:px-5">
      <div
        className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`Sentiment on this page: ${order
          .map((k) => `${counts[k]} ${k}`)
          .join(", ")}`}
      >
        {order.map((key) =>
          counts[key] > 0 ? (
            <div
              key={key}
              className={SENTIMENT_STYLES[key].bar}
              style={{ width: `${(counts[key] / analyzed) * 100}%` }}
            />
          ) : null,
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>On this page</span>
        {order.map((key) => (
          <span key={key} className="inline-flex items-center gap-1.5">
            <span
              className={["size-2 rounded-full", SENTIMENT_STYLES[key].dot].join(
                " ",
              )}
              aria-hidden="true"
            />
            <span className="font-medium text-foreground tabular-nums">
              {Math.round((counts[key] / analyzed) * 100)}%
            </span>
            {SENTIMENT_STYLES[key].label.toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Filters sheet                                                              */
/* -------------------------------------------------------------------------- */

interface FiltersSheetProps {
  search: string
  sentimentFilter: SentimentFilter
  languageFilter: LanguageFilter
  analysisStatusFilter: AnalysisStatusFilter
  analysisStatusOptions: AnalysisStatusOption[]
  activeCount: number
  resetDisabled: boolean
  onLanguageChange: (value: LanguageFilter) => void
  onAnalysisStatusChange: (value: AnalysisStatusFilter) => void
  onClearFilters: () => void
}

function FiltersSheet({
  languageFilter,
  analysisStatusFilter,
  analysisStatusOptions,
  activeCount,
  resetDisabled,
  onLanguageChange,
  onAnalysisStatusChange,
  onClearFilters,
}: FiltersSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="relative h-10 shrink-0 gap-2 rounded-full bg-muted px-3 hover:bg-muted/70"
          aria-label={`Open more filters${
            activeCount ? `, ${activeCount} active` : ""
          }`}
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Filters</span>
          {activeCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 sm:max-w-md"
      >
        <SheetHeader className="border-b px-5 py-5 text-left">
          <SheetTitle>More filters</SheetTitle>
          <SheetDescription>
            Narrow comments by language or AI analysis status.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6">
          <FilterField
            id="comments-language-filter"
            label="Language"
            description="The language detected in the comment."
          >
            <Select
              value={languageFilter}
              onValueChange={(v) => onLanguageChange(v as LanguageFilter)}
            >
              <SelectTrigger
                id="comments-language-filter"
                className="h-10 w-full"
              >
                <SelectValue placeholder="All languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All languages</SelectItem>
                <SelectItem value="am">Amharic</SelectItem>
                <SelectItem value="om">Afaan Oromo</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="mixed">Mixed language</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>

          <div className="border-t" />

          <FilterField
            id="comments-analysis-status-filter"
            label="AI analysis status"
            description="Whether the comment has been analyzed yet."
          >
            <Select
              value={analysisStatusFilter}
              onValueChange={(v) =>
                onAnalysisStatusChange(v as AnalysisStatusFilter)
              }
            >
              <SelectTrigger
                id="comments-analysis-status-filter"
                className="h-10 w-full"
              >
                <SelectValue placeholder="All statuses" />
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
          </FilterField>
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
              Show results
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function FilterField({
  id,
  label,
  description,
  children,
}: {
  id: string
  label: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      {children}
    </div>
  )
}

function RemovableChip({
  icon,
  label,
  removeLabel,
  onRemove,
}: {
  icon?: ReactNode
  label: string
  removeLabel: string
  onRemove: () => void
}) {
  return (
    <Badge variant="secondary" className="gap-1 rounded-full pl-2 pr-1">
      {icon}
      <span className="max-w-40 truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="flex size-4 items-center justify-center rounded-full outline-none hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-3" />
      </button>
    </Badge>
  )
}

/* -------------------------------------------------------------------------- */
/* Comment row                                                                */
/* -------------------------------------------------------------------------- */

function CommentRow({
  comment,
  searchQuery,
}: {
  comment: FacebookComment
  searchQuery: string
}) {
  const [expanded, setExpanded] = useState(false)
  const [insightOpen, setInsightOpen] = useState(false)

  const authorName = comment.author?.name?.trim() || "Unknown commenter"
  const message = comment.message?.trim() || ""

  const sentimentRaw = comment.ai_analysis?.sentiment?.label
  const sentiment = isSentimentLabel(sentimentRaw) ? sentimentRaw : null
  const language = comment.ai_analysis?.language
  const sentimentConfidence = comment.ai_analysis?.sentiment?.confidence
  const languageConfidence = comment.ai_analysis?.language_confidence
  const analyzedAt = comment.ai_analysis?.analyzed_at
  const likes = comment.engagement?.like_count ?? 0

  const hasAnalysis = Boolean(comment.ai_analysis)
  const validSentiment = isValidConfidence(sentimentConfidence)
  const validLanguage = isValidConfidence(languageConfidence)
  const hasInsight =
    sentiment !== null || validSentiment || validLanguage || Boolean(analyzedAt)

  const isLong = message.length > TRUNCATE_AT
  const shownText =
    isLong && !expanded ? `${message.slice(0, TRUNCATE_AT).trimEnd()}…` : message

  return (
    <article
      id={`comment-${comment.id}`}
      className="scroll-mt-24 px-4 py-4 sm:px-5"
    >
      <div className="flex items-start gap-3">
        <AuthorAvatar name={authorName} sentiment={sentiment} />

        <div className="min-w-0 flex-1">
          {/* BUBBLE */}

          <div className="inline-block max-w-full rounded-2xl rounded-tl-md bg-muted px-3.5 py-2.5">
            <p className="truncate text-sm font-semibold">{authorName}</p>

            <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-6">
              {message ? (
                highlight(shownText, searchQuery)
              ) : (
                <span className="text-muted-foreground">
                  No comment text available.
                </span>
              )}
              {isLong && (
                <>
                  {" "}
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="font-medium text-muted-foreground underline-offset-2 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                    aria-expanded={expanded}
                  >
                    {expanded ? "See less" : "See more"}
                  </button>
                </>
              )}
            </p>
          </div>

          {/* ACTION LINE */}

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 pl-1 text-xs text-muted-foreground">
            <time
              dateTime={comment.commented_at ?? undefined}
              title={
                comment.commented_at ? formatDate(comment.commented_at) : ""
              }
            >
              {relativeTime(comment.commented_at)}
            </time>

            <span className="inline-flex items-center gap-1">
              <Heart
                className={[
                  "size-3.5",
                  likes > 0 ? "fill-rose-500 text-rose-500" : "",
                ].join(" ")}
                aria-hidden="true"
              />
              <span className="tabular-nums">{formatNumber(likes)}</span>
              <span className="sr-only">{likes === 1 ? "like" : "likes"}</span>
            </span>

            {language && (
              <span className="inline-flex items-center gap-1">
                <Languages className="size-3.5" aria-hidden="true" />
                {formatLanguage(language)}
              </span>
            )}

            {sentiment ? (
              <SentimentBadge sentiment={sentiment} />
            ) : (
              <Badge
                variant="outline"
                className="h-5 rounded-full px-2 text-[11px] font-normal"
              >
                {hasAnalysis ? "No sentiment result" : "Not analyzed"}
              </Badge>
            )}

            {comment.permalink_url && (
              <a
                href={comment.permalink_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1 font-medium outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                View on Facebook
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            )}
          </div>

          {/* AI INSIGHT (collapsed by default to keep the feed calm) */}

          {hasInsight && (
            <div className="mt-1 pl-1">
              <button
                type="button"
                onClick={() => setInsightOpen((v) => !v)}
                aria-expanded={insightOpen}
                className="inline-flex items-center gap-1 rounded text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <BrainCircuit className="size-3.5" aria-hidden="true" />
                AI insight
                <ChevronDown
                  className={[
                    "size-3.5 transition-transform",
                    insightOpen ? "rotate-180" : "",
                  ].join(" ")}
                  aria-hidden="true"
                />
              </button>

              {insightOpen && (
                <div className="mt-2 max-w-sm space-y-2.5 rounded-xl border bg-background p-3">
                  {validSentiment && sentiment && (
                    <ConfidenceMeter
                      label={`${formatSentiment(sentiment)} sentiment`}
                      value={sentimentConfidence}
                      barClass={SENTIMENT_STYLES[sentiment].bar}
                    />
                  )}
                  {validSentiment && !sentiment && (
                    <ConfidenceMeter
                      label="Sentiment"
                      value={sentimentConfidence}
                      barClass="bg-slate-400"
                    />
                  )}
                  {validLanguage && (
                    <ConfidenceMeter
                      label={
                        language
                          ? `${formatLanguage(language)} detected`
                          : "Language detected"
                      }
                      value={languageConfidence}
                      barClass="bg-sky-500"
                    />
                  )}
                  {analyzedAt && (
                    <p className="text-[11px] text-muted-foreground">
                      Analyzed {formatDate(analyzedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function ConfidenceMeter({
  label,
  value,
  barClass,
}: {
  label: string
  value: number
  barClass: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">
          {formatConfidence(value)}
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
      >
        <div
          className={["h-full rounded-full", barClass].join(" ")}
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Avatar + sentiment badge                                                   */
/* -------------------------------------------------------------------------- */

function AuthorAvatar({
  name,
  sentiment,
}: {
  name: string
  sentiment: SentimentLabel | null
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

  return (
    <Avatar
      className={[
        "size-10 shrink-0 ring-2 ring-offset-2 ring-offset-card",
        sentiment ? SENTIMENT_STYLES[sentiment].ring : "ring-transparent",
      ].join(" ")}
    >
      <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
        {initials || "?"}
      </AvatarFallback>
    </Avatar>
  )
}

function SentimentBadge({ sentiment }: { sentiment: SentimentLabel }) {
  const { label, badge } = SENTIMENT_STYLES[sentiment]
  return (
    <Badge
      variant="outline"
      className={["h-5 rounded-full px-2 text-[11px]", badge].join(" ")}
    >
      {label}
    </Badge>
  )
}

/* -------------------------------------------------------------------------- */
/* Loading state                                                              */
/* -------------------------------------------------------------------------- */

function CommentsLoadingState() {
  return (
    <div
      className="divide-y divide-border/60"
      aria-label="Loading comments"
      aria-busy="true"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex gap-3 px-4 py-4 sm:px-5">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-16 w-full max-w-md rounded-2xl rounded-tl-md" />
            <div className="flex gap-3 pl-1">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-16" />
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

function CommentsEmptyState({
  hasActiveFilters,
  onClearFilters,
}: {
  hasActiveFilters: boolean
  onClearFilters: () => void
}) {
  return (
    <div className="flex min-h-[280px] items-center justify-center px-6 py-12">
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
            ? "Try a different search or remove a filter."
            : "Comments appear here once people react to this post."}
        </p>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4 rounded-full"
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