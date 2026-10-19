
"use client"

import { UiComment } from "@/types/facebook/post-comments-analytics"
import { MessageCircle } from "lucide-react"


interface FacebookCommentPreviewProps {
  comment: UiComment
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function getSentimentClass(
  sentiment: UiComment["sentiment"],
): string {
  switch (sentiment) {
    case "positive":
      return "bg-emerald-50 text-emerald-700"

    case "negative":
      return "bg-red-50 text-red-700"

    case "neutral":
      return "bg-muted text-muted-foreground"

    default:
      return "bg-muted text-muted-foreground"
  }
}

export function FacebookCommentPreview({
  comment,
}: FacebookCommentPreviewProps) {
  return (
    <div className="flex gap-3 rounded-lg border bg-muted/20 p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
        {getInitials(comment.author || "?")}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">
            {comment.author || "Unknown user"}
          </span>

          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${getSentimentClass(
              comment.sentiment,
            )}`}
          >
            {comment.sentiment ?? "Unanalyzed"}
          </span>
        </div>

        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-muted-foreground">
          {comment.message || "No comment text available."}
        </p>

        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MessageCircle className="h-3 w-3 shrink-0" />

          <time dateTime={comment.publishedAt ?? undefined}>
            {comment.publishedAt
              ? new Date(comment.publishedAt).toLocaleString()
              : "Date unavailable"}
          </time>
        </div>
      </div>
    </div>
  )
}
