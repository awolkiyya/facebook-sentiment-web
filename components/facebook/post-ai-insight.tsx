"use client"

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Lightbulb,
  MessageSquareText,
  Sparkles,
  Tags,
  TrendingUp,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

import { Separator } from "@/components/ui/separator"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type PostAiInsightSentiment =
  | "positive"
  | "neutral"
  | "negative"
  | "mixed"

export type PostAiInsightPriority =
  | "low"
  | "medium"
  | "high"
  | "critical"

export interface PostAiInsightProps {
  /**
   * Short AI-generated summary of the conversation.
   */
  summary: string

  /**
   * Main issue/theme identified by AI.
   */
  keyConcern?: string | null

  /**
   * Dominant sentiment detected across the conversation.
   */
  sentiment?: PostAiInsightSentiment | null

  /**
   * Priority assigned to the conversation.
   */
  priority?: PostAiInsightPriority | null

  /**
   * Optional number of analyzed comments.
   */
  analyzedComments?: number | null

  /**
   * Optional dominant topic.
   */
  primaryTopic?: string | null

  /**
   * Optional sentiment change compared with a previous period.
   */
  sentimentChange?: number | null

  /**
   * Optional indicator when AI has detected an actionable concern.
   */
  actionable?: boolean

  /**
   * Optional loading state.
   */
  isLoading?: boolean

  /**
   * Optional className for page-level layout control.
   */
  className?: string
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatNumber(
  value: number | null | undefined,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null
  }

  return new Intl.NumberFormat().format(
    value,
  )
}

function sentimentLabel(
  sentiment:
    | PostAiInsightSentiment
    | null
    | undefined,
) {
  switch (sentiment) {
    case "positive":
      return "Mostly positive"

    case "negative":
      return "Mostly negative"

    case "mixed":
      return "Mixed"

    case "neutral":
      return "Mostly neutral"

    default:
      return null
  }
}

function priorityLabel(
  priority:
    | PostAiInsightPriority
    | null
    | undefined,
) {
  switch (priority) {
    case "critical":
      return "Critical"

    case "high":
      return "High"

    case "medium":
      return "Medium"

    case "low":
      return "Low"

    default:
      return null
  }
}

/* -------------------------------------------------------------------------- */
/* Sentiment icon                                                             */
/* -------------------------------------------------------------------------- */

function SentimentIcon({
  sentiment,
}: {
  sentiment:
    | PostAiInsightSentiment
    | null
    | undefined
}) {
  if (
    sentiment ===
    "negative"
  ) {
    return (
      <ArrowDownRight className="h-3.5 w-3.5" />
    )
  }

  if (
    sentiment ===
    "positive"
  ) {
    return (
      <ArrowUpRight className="h-3.5 w-3.5" />
    )
  }

  return (
    <MessageSquareText className="h-3.5 w-3.5" />
  )
}

/* -------------------------------------------------------------------------- */
/* Loading                                                                    */
/* -------------------------------------------------------------------------- */

function PostAiInsightSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-64 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function PostAiInsight({
  summary,
  keyConcern,
  sentiment,
  priority,
  analyzedComments,
  primaryTopic,
  sentimentChange,
  actionable = false,
  isLoading = false,
  className,
}: PostAiInsightProps) {
  if (isLoading) {
    return (
      <PostAiInsightSkeleton />
    )
  }

  const formattedComments =
    formatNumber(
      analyzedComments,
    )

  const formattedSentiment =
    sentimentLabel(
      sentiment,
    )

  const formattedPriority =
    priorityLabel(
      priority,
    )

  const hasDetails =
    Boolean(
      keyConcern ||
        primaryTopic ||
        formattedSentiment ||
        formattedPriority ||
        formattedComments,
    )

  return (
    <Card
      className={`overflow-hidden border-primary/20 bg-primary/[0.025] ${className ?? ""}`}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-sm">
                AI Insight
              </CardTitle>

              <Badge
                variant="secondary"
                className="gap-1 text-[9px] font-medium"
              >
                <Sparkles className="h-3 w-3" />
                AI
              </Badge>

              {actionable && (
                <Badge
                  variant="outline"
                  className="gap-1 border-amber-500/30 bg-amber-500/5 text-[9px] text-amber-700 dark:text-amber-400"
                >
                  <CircleAlert className="h-3 w-3" />
                  Actionable
                </Badge>
              )}
            </div>

            <CardDescription className="mt-1 text-xs leading-5">
              AI-generated summary of the
              conversation around this post.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* ------------------------------------------------------------------ */}
      {/* Summary                                                            */}
      {/* ------------------------------------------------------------------ */}

      <CardContent className="space-y-5">
        <div className="rounded-xl border bg-background/80 p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Summary
              </p>

              <p className="mt-1.5 text-sm leading-6">
                {summary}
              </p>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Details                                                          */}
        {/* ---------------------------------------------------------------- */}

        {hasDetails && (
          <>
            <Separator />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* ---------------------------------------------------------- */}
              {/* Key concern                                                 */}
              {/* ---------------------------------------------------------- */}

              {keyConcern && (
                <div className="rounded-xl border bg-background p-3.5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5" />

                    <span className="text-[10px] font-medium uppercase tracking-wider">
                      Key concern
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium leading-5">
                    {keyConcern}
                  </p>
                </div>
              )}

              {/* ---------------------------------------------------------- */}
              {/* Primary topic                                               */}
              {/* ---------------------------------------------------------- */}

              {primaryTopic && (
                <div className="rounded-xl border bg-background p-3.5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tags className="h-3.5 w-3.5" />

                    <span className="text-[10px] font-medium uppercase tracking-wider">
                      Primary topic
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium leading-5">
                    {primaryTopic}
                  </p>
                </div>
              )}

              {/* ---------------------------------------------------------- */}
              {/* Sentiment                                                    */}
              {/* ---------------------------------------------------------- */}

              {formattedSentiment && (
                <div className="rounded-xl border bg-background p-3.5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <SentimentIcon
                      sentiment={
                        sentiment
                      }
                    />

                    <span className="text-[10px] font-medium uppercase tracking-wider">
                      Sentiment
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium leading-5">
                    {formattedSentiment}
                  </p>

                  {sentimentChange !==
                    null &&
                    sentimentChange !==
                      undefined && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />

                        {sentimentChange >
                        0
                          ? `+${sentimentChange}% change`
                          : `${sentimentChange}% change`}
                      </div>
                    )}
                </div>
              )}

              {/* ---------------------------------------------------------- */}
              {/* Priority                                                     */}
              {/* ---------------------------------------------------------- */}

              {formattedPriority && (
                <div className="rounded-xl border bg-background p-3.5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {priority ===
                      "critical" ||
                    priority ===
                      "high" ? (
                      <CircleAlert className="h-3.5 w-3.5" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}

                    <span className="text-[10px] font-medium uppercase tracking-wider">
                      Priority
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium leading-5">
                    {formattedPriority}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Analysis metadata                                               */}
        {/* ---------------------------------------------------------------- */}

        {formattedComments && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2.5">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <MessageSquareText className="h-3.5 w-3.5" />

              <span>
                Based on{" "}
                <span className="font-medium text-foreground">
                  {formattedComments}
                </span>{" "}
                analyzed comments
              </span>
            </div>

            <Badge
              variant="outline"
              className="text-[9px] font-normal"
            >
              AI-generated signal
            </Badge>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Disclaimer                                                       */}
        {/* ---------------------------------------------------------------- */}

        <p className="text-[10px] leading-4 text-muted-foreground">
          AI insights summarize detected patterns in
          the analyzed conversation and should be
          interpreted together with the underlying
          comments and analytics.
        </p>
      </CardContent>
    </Card>
  )
}