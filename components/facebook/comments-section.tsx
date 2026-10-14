"use client"

import {
  ChevronDown,
  Heart,
  Languages,
  MessageCircle,
  Search,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import type { FacebookComment } from "@/types/facebook/comment"
import type {
  LanguageCode,
  SentimentLabel,
} from "@/types/facebook/common"

/* ====================================================================== */
/* TYPES                                                                  */
/* ====================================================================== */

export type SentimentFilter =
  | "all"
  | SentimentLabel

export type LanguageFilter =
  | "all"
  | LanguageCode

export type CommentSortMode =
  | "newest"
  | "oldest"
  | "most_liked"

export interface CommentsSectionProps {
  comments: FacebookComment[]

  /**
   * Comments after search, language,
   * sentiment, and sorting have been applied.
   */
  filteredComments: FacebookComment[]

  search: string

  sentimentFilter: SentimentFilter

  languageFilter: LanguageFilter

  sortMode: CommentSortMode

  dateLabel: string

  isCommentsLoading?: boolean

  onSearchChange: (
    value: string,
  ) => void

  onSentimentChange: (
    value: SentimentFilter,
  ) => void

  onLanguageChange: (
    value: LanguageFilter,
  ) => void

  onSortChange: (
    value: CommentSortMode,
  ) => void

  onClearFilters: () => void

  formatDate: (
    value: string,
  ) => string

  formatNumber: (
    value: number,
  ) => string

  formatSentiment: (
    value: Exclude<
      SentimentFilter,
      "all"
    >,
  ) => string

  className?: string
}

/* ====================================================================== */
/* LANGUAGE LABEL                                                         */
/* ====================================================================== */

function formatLanguage(
  language: LanguageCode,
): string {
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

/* ====================================================================== */
/* MAIN COMPONENT                                                         */
/* ====================================================================== */

export function CommentsSection({
  comments,
  filteredComments,
  search,
  sentimentFilter,
  languageFilter,
  sortMode,
  dateLabel,
  isCommentsLoading = false,
  onSearchChange,
  onSentimentChange,
  onLanguageChange,
  onSortChange,
  onClearFilters,
  formatDate,
  formatNumber,
  formatSentiment,
  className,
}: CommentsSectionProps) {
  const hasActiveFilters =
    search.trim().length > 0 ||
    sentimentFilter !== "all" ||
    languageFilter !== "all"

  return (
    <section
      id="comments-section"
      className={[
        "mt-10 scroll-mt-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ================================================================ */}
      {/* SECTION HEADER                                                    */}
      {/* ================================================================ */}

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
              {formatNumber(
                comments.length,
              )}
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Explore the comments behind the
          sentiment analysis.
        </p>
      </div>

      {/* ================================================================ */}
      {/* FILTER TOOLBAR                                                    */}
      {/* ================================================================ */}

      <Card className="mt-4 border-border/70 shadow-none">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* ======================================================== */}
            {/* SEARCH                                                     */}
            {/* ======================================================== */}

            <div className="relative min-w-0 flex-1">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />

              <Input
                value={search}
                onChange={(event) =>
                  onSearchChange(
                    event.target.value,
                  )
                }
                placeholder="Search by commenter or comment..."
                className="h-10 border-muted bg-muted/30 pl-9"
              />
            </div>

            {/* ======================================================== */}
            {/* LANGUAGE FILTER                                             */}
            {/* ======================================================== */}

            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
              >
                <Button
                  variant="outline"
                  className="h-10 justify-between gap-3 lg:min-w-[155px]"
                >
                  <span className="flex items-center gap-2">
                    <Languages className="h-3.5 w-3.5 text-muted-foreground" />

                    {languageFilter ===
                    "all"
                      ? "All languages"
                      : formatLanguage(
                          languageFilter,
                        )}
                  </span>

                  <ChevronDown className="h-4 w-4 shrink-0" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-48"
              >
                {/* All */}

                <DropdownMenuItem
                  onClick={() =>
                    onLanguageChange(
                      "all",
                    )
                  }
                >
                  <span className="mr-2 h-2 w-2 rounded-full bg-muted-foreground/40" />

                  All languages
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Amharic */}

                <DropdownMenuItem
                  onClick={() =>
                    onLanguageChange(
                      "am" as LanguageCode,
                    )
                  }
                >
                  <span className="mr-2 h-2 w-2 rounded-full bg-blue-500" />

                  Amharic
                </DropdownMenuItem>

                {/* Afaan Oromo */}

                <DropdownMenuItem
                  onClick={() =>
                    onLanguageChange(
                      "om" as LanguageCode,
                    )
                  }
                >
                  <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />

                  Afaan Oromo
                </DropdownMenuItem>

                {/* Mixed */}

                <DropdownMenuItem
                  onClick={() =>
                    onLanguageChange(
                      "mixed" as LanguageCode,
                    )
                  }
                >
                  <span className="mr-2 h-2 w-2 rounded-full bg-violet-500" />

                  Mixed language
                </DropdownMenuItem>

                {/* English */}

                <DropdownMenuItem
                  onClick={() =>
                    onLanguageChange(
                      "en" as LanguageCode,
                    )
                  }
                >
                  <span className="mr-2 h-2 w-2 rounded-full bg-slate-500" />

                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* ======================================================== */}
            {/* SENTIMENT FILTER                                            */}
            {/* ======================================================== */}

            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
              >
                <Button
                  variant="outline"
                  className="h-10 justify-between gap-3 lg:min-w-[145px]"
                >
                  {sentimentFilter ===
                  "all"
                    ? "All sentiment"
                    : formatSentiment(
                        sentimentFilter,
                      )}

                  <ChevronDown className="h-4 w-4 shrink-0" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-44"
              >
                {/* All */}

                <DropdownMenuItem
                  onClick={() =>
                    onSentimentChange(
                      "all",
                    )
                  }
                >
                  All sentiment
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Positive */}

                <DropdownMenuItem
                  onClick={() =>
                    onSentimentChange(
                      "positive" as SentimentLabel,
                    )
                  }
                >
                  <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />

                  Positive
                </DropdownMenuItem>

                {/* Neutral */}

                <DropdownMenuItem
                  onClick={() =>
                    onSentimentChange(
                      "neutral" as SentimentLabel,
                    )
                  }
                >
                  <span className="mr-2 h-2 w-2 rounded-full bg-amber-500" />

                  Neutral
                </DropdownMenuItem>

                {/* Negative */}

                <DropdownMenuItem
                  onClick={() =>
                    onSentimentChange(
                      "negative" as SentimentLabel,
                    )
                  }
                >
                  <span className="mr-2 h-2 w-2 rounded-full bg-red-500" />

                  Negative
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* ======================================================== */}
            {/* SORT                                                       */}
            {/* ======================================================== */}

            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
              >
                <Button
                  variant="outline"
                  className="h-10 justify-between gap-3 lg:min-w-[125px]"
                >
                  {sortMode ===
                  "newest"
                    ? "Newest"
                    : sortMode ===
                        "oldest"
                      ? "Oldest"
                      : "Most liked"}

                  <ChevronDown className="h-4 w-4 shrink-0" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-40"
              >
                <DropdownMenuItem
                  onClick={() =>
                    onSortChange(
                      "newest",
                    )
                  }
                >
                  Newest
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    onSortChange(
                      "oldest",
                    )
                  }
                >
                  Oldest
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    onSortChange(
                      "most_liked",
                    )
                  }
                >
                  Most liked
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ============================================================ */}
          {/* RESULT SUMMARY                                                */}
          {/* ============================================================ */}

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3 text-[11px] text-muted-foreground">
            {/* Result count */}

            <span className="font-medium text-foreground">
              {formatNumber(
                filteredComments.length,
              )}
            </span>

            <span>
              {filteredComments.length ===
              1
                ? "comment"
                : "comments"}
            </span>

            <span>•</span>

            {/* Date range */}

            <span>{dateLabel}</span>

            {/* Language */}

            {languageFilter !==
              "all" && (
              <>
                <span>•</span>

                <span className="inline-flex items-center gap-1">
                  <Languages className="h-3 w-3" />

                  {formatLanguage(
                    languageFilter,
                  )}
                </span>
              </>
            )}

            {/* Sentiment */}

            {sentimentFilter !==
              "all" && (
              <>
                <span>•</span>

                <SentimentBadge
                  sentiment={
                    sentimentFilter
                  }
                />
              </>
            )}

            {/* Clear */}

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-7 px-2 text-[11px]"
                onClick={
                  onClearFilters
                }
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* COMMENT LIST                                                      */}
      {/* ================================================================ */}

      <Card className="mt-3 overflow-hidden border-border/70 shadow-none">
        <CardContent className="p-0">
          {isCommentsLoading ? (
            <CommentsLoadingState />
          ) : filteredComments.length ===
            0 ? (
            <CommentsEmptyState
              hasActiveFilters={
                hasActiveFilters
              }
              onClearFilters={
                onClearFilters
              }
            />
          ) : (
            <div className="divide-y">
              {filteredComments.map(
                (comment) => (
                  <CommentRow
                    key={comment.id}
                    comment={comment}
                    formatDate={
                      formatDate
                    }
                    formatNumber={
                      formatNumber
                    }
                  />
                ),
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

/* ====================================================================== */
/* COMMENT ROW                                                            */
/* ====================================================================== */

interface CommentRowProps {
  comment: FacebookComment

  formatDate: (
    value: string,
  ) => string

  formatNumber: (
    value: number,
  ) => string
}

function CommentRow({
  comment,
  formatDate,
  formatNumber,
}: CommentRowProps) {
  const authorName =
    comment.author?.name ||
    "-"

  const sentiment =
    comment.ai_analysis?.sentiment
      ?.label

  const language =
    comment.ai_analysis?.language

  const confidence =
    comment.ai_analysis?.sentiment
      ?.confidence

  const analyzedAt =
    comment.ai_analysis?.analyzed_at

  const likes =
    comment.engagement?.likes ?? 0

  return (
    <article
      id={`comment-${comment.id}`}
      className="scroll-mt-24 p-4 transition-colors hover:bg-muted/20 sm:p-5"
    >
      <div className="flex gap-3">
        {/* ============================================================ */}
        {/* AUTHOR AVATAR                                                  */}
        {/* ============================================================ */}

        <AuthorAvatar
          name={authorName}
        />

        <div className="min-w-0 flex-1">
          {/* ========================================================== */}
          {/* AUTHOR / SENTIMENT                                          */}
          {/* ========================================================== */}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {authorName}
              </p>

              <CommentMeta
                publishedAt={
                  comment.commented_at
                }
                language={language}
                confidence={
                  confidence
                }
                formatDate={
                  formatDate
                }
              />
            </div>

            {sentiment && (
              <SentimentBadge
                sentiment={
                  sentiment
                }
              />
            )}
          </div>

          {/* ========================================================== */}
          {/* COMMENT MESSAGE                                             */}
          {/* ========================================================== */}

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
            {comment.message ||
              "No comment text available."}
          </p>

          {/* ========================================================== */}
          {/* COMMENT FOOTER                                              */}
          {/* ========================================================== */}

          <div className="mt-3 flex items-center gap-4">
            {/* Likes */}

            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Heart
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              {formatNumber(
                likes,
              )}
            </span>

            {/* AI analyzed timestamp */}

            {analyzedAt && (
              <span className="hidden text-[11px] text-muted-foreground sm:inline">
                Analyzed{" "}
                {formatDate(
                  analyzedAt,
                )}
              </span>
            )}

            {/* Facebook permalink */}

            {comment.permalink_url && (
              <Button
                variant="link"
                size="sm"
                className="ml-auto h-auto p-0 text-xs"
                asChild
              >
                <a
                  href={
                    comment.permalink_url
                  }
                  target="_blank"
                  rel="noreferrer"
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

/* ====================================================================== */
/* LOADING STATE                                                          */
/* ====================================================================== */

function CommentsLoadingState() {
  return (
    <div className="divide-y">
      {Array.from({
        length: 5,
      }).map((_, index) => (
        <div
          key={index}
          className="flex gap-3 p-4 sm:p-5"
        >
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />

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

/* ====================================================================== */
/* EMPTY STATE                                                            */
/* ====================================================================== */

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
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
        </div>

        <p className="mt-4 text-sm font-semibold">
          No comments found
        </p>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Try changing the search
          term, language, sentiment,
          or date range.
        </p>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={
              onClearFilters
            }
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}

/* ====================================================================== */
/* AVATAR                                                                 */
/* ====================================================================== */

function AuthorAvatar({
  name,
}: {
  name: string
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (part) => part[0],
    )
    .join("")
    .toUpperCase()

  return (
    <Avatar className="h-9 w-9 shrink-0">
      <AvatarFallback className="text-[11px] font-medium">
        {initials || "?"}
      </AvatarFallback>
    </Avatar>
  )
}

/* ====================================================================== */
/* COMMENT META                                                           */
/* ====================================================================== */

interface CommentMetaProps {
  publishedAt:
    | string
    | null

  language?:
    | LanguageCode
    | null

  confidence?:
    | number
    | null

  formatDate: (
    value: string,
  ) => string
}

function CommentMeta({
  publishedAt,
  language,
  confidence,
  formatDate,
}: CommentMetaProps) {
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
      {/* Date */}

      {publishedAt ? (
        <span>
          {formatDate(
            publishedAt,
          )}
        </span>
      ) : (
        <span>Unknown date</span>
      )}

      {/* Language */}

      {language && (
        <>
          <span className="text-border">
            •
          </span>

          <span>
            {formatLanguage(
              language,
            )}
          </span>
        </>
      )}

      {/* Sentiment confidence */}

      {typeof confidence ===
        "number" && (
        <>
          <span className="text-border">
            •
          </span>

          <span>
            {Math.round(
              confidence * 100,
            )}
            % confidence
          </span>
        </>
      )}
    </div>
  )
}

/* ====================================================================== */
/* SENTIMENT BADGE                                                        */
/* ====================================================================== */

interface SentimentBadgeProps {
  sentiment: SentimentLabel
}

function SentimentBadge({
  sentiment,
}: SentimentBadgeProps) {
  const config = {
    positive: {
      label: "Positive",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    neutral: {
      label: "Neutral",
      className:
        "border-slate-200 bg-slate-50 text-slate-700",
    },

    negative: {
      label: "Negative",
      className:
        "border-rose-200 bg-rose-50 text-rose-700",
    },
  }[sentiment]

  return (
    <Badge
      variant="outline"
      className={config.className}
    >
      {config.label}
    </Badge>
  )
}