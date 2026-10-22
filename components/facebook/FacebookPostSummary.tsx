"use client"

import {
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type RefObject,
  type SVGProps,
} from "react"

import { Clock3, FileText, Heart, MessageCircle, Repeat2 } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { cn, formatEthiopianDateWithTime } from "@/lib/utils"

import type { FacebookPostAttachment } from "@/types/facebook/post"

import { PostAttachments } from "./facebook-post-attachments"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface FacebookPostSummaryProps {
  postDate: string | null
  postMessage: string

  /** Photos, albums, videos and links shown under the message. */
  attachments?: FacebookPostAttachment[]

  postLikes: number
  totalComments: number
  postShares: number

  /**
   * @deprecated No longer used. The date is formatted with
   * formatEthiopianDateWithTime. Kept optional so existing callers compile.
   */
  formatDate?: (value: string) => string
  formatNumber: (value: number) => string

  className?: string
}

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

interface Metric {
  label: string
  value: number
  icon: IconComponent
  iconClassName: string
  iconBackground: string
}

/* -------------------------------------------------------------------------- */
/* Hooks                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * True when the element's content is taller than its box, i.e. the line clamp
 * is actually cutting text. Re-checks when the element is resized.
 * Pass `active=false` while expanded so the result is kept as it was.
 */
function useIsOverflowing(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  content: string,
) {
  const [overflowing, setOverflowing] = useState(false)

  useLayoutEffect(() => {
    const element = ref.current

    if (!element || !active) {
      return
    }

    const check = () =>
      setOverflowing(element.scrollHeight > element.clientHeight + 1)

    check()

    const observer = new ResizeObserver(check)
    observer.observe(element)

    return () => observer.disconnect()
  }, [ref, active, content])

  return overflowing
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

/** Colors #hashtags (including Amharic and other scripts) inside the message. */
function HighlightedMessage({ text }: { text: string }) {
  // With a capture group, split() puts every hashtag at an odd index.
  const parts = text.split(/(#[\p{L}\p{N}_]+)/u)

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <span key={index} className="text-primary">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

export function FacebookPostSummary({
  postDate,
  postMessage,
  attachments = [],
  postLikes,
  totalComments,
  postShares,
  formatNumber,
  className,
}: FacebookPostSummaryProps) {
  const [expanded, setExpanded] = useState(false)
  const messageRef = useRef<HTMLParagraphElement>(null)

  const message = postMessage.trim()
  const hasAttachments = attachments.length > 0

  const isOverflowing = useIsOverflowing(messageRef, !expanded, message)
  const canToggle = isOverflowing || expanded

  const metrics: Metric[] = [
    {
      label: "Reactions",
      value: postLikes,
      icon: Heart,
      iconClassName: "text-rose-500",
      iconBackground: "bg-rose-500/10",
    },
    {
      label: "Comments",
      value: totalComments,
      icon: MessageCircle,
      iconClassName: "text-blue-600 dark:text-blue-400",
      iconBackground: "bg-blue-500/10",
    },
    {
      label: "Shares",
      value: postShares,
      icon: Repeat2,
      iconClassName: "text-emerald-600 dark:text-emerald-400",
      iconBackground: "bg-emerald-500/10",
    },
  ]

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-none border-none bg-card shadow-none",
        className,
      )}
    >
      <CardContent className="p-0">
        {/* Post identity */}
        <header className="flex items-center gap-3 border-b border-border/60 px-4 py-4 sm:px-5">
          <Avatar className="size-10 shrink-0 rounded-xl border border-blue-500/15">
            <AvatarFallback className="rounded-xl bg-blue-600 text-white">
              <span
                className="text-xl font-bold leading-none"
                aria-hidden="true"
              >
                f
              </span>
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 space-y-1">
            <h2 className="truncate text-sm font-semibold tracking-tight">
              Facebook post
            </h2>

            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
              {postDate ? (
                <time dateTime={postDate} className="truncate">
                  {formatEthiopianDateWithTime(postDate)}
                </time>
              ) : (
                <span>Date unavailable</span>
              )}
            </p>
          </div>
        </header>

        {/* Post content */}
        <div className="space-y-4 px-4 py-5 sm:px-5 sm:py-6">
          {message ? (
            <div>
              <p
                ref={messageRef}
                className={cn(
                  "whitespace-pre-wrap break-words text-sm leading-7 text-foreground/90",
                  // Ellipsis after 4 lines until expanded.
                  !expanded && "line-clamp-4",
                )}
              >
                <HighlightedMessage text={message} />
              </p>

              {canToggle && (
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  aria-expanded={expanded}
                  className="mt-1.5 rounded text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          ) : (
            // Only show the "no text" notice when there is nothing else to see.
            !hasAttachments && (
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-4">
                <FileText
                  className="size-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />

                <div className="min-w-0">
                  <p className="text-sm font-medium">No text content</p>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    This post has no text or media to display.
                  </p>
                </div>
              </div>
            )
          )}

          {hasAttachments && <PostAttachments attachments={attachments} />}
        </div>

        {/* Engagement */}
        <dl
          aria-label="Post engagement"
          className="grid grid-cols-3 gap-2 border-t border-border/60 bg-muted/20 px-4 py-4 sm:gap-3 sm:px-5"
        >
          {metrics.map((metric) => (
            <EngagementMetric
              key={metric.label}
              metric={metric}
              formattedValue={formatNumber(metric.value)}
            />
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/* Engagement metric                                                          */
/* -------------------------------------------------------------------------- */

function EngagementMetric({
  metric,
  formattedValue,
}: {
  metric: Metric
  formattedValue: string
}) {
  const Icon = metric.icon

  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-lg border border-border/60 bg-card px-2.5 py-3 sm:px-3">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          metric.iconBackground,
        )}
        aria-hidden="true"
      >
        <Icon className={cn("size-4", metric.iconClassName)} />
      </span>

      <div className="min-w-0">
        <dd
          title={metric.value.toLocaleString()}
          className="truncate text-sm font-semibold tabular-nums tracking-tight text-foreground sm:text-base"
        >
          {formattedValue}
        </dd>

        <dt className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">
          {metric.label}
        </dt>
      </div>
    </div>
  )
}