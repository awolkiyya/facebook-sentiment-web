


/* -------------------------------------------------------------------------- */
/* Formatters                                                                 */
/* -------------------------------------------------------------------------- */

import { CommentTopic, FacebookComment, PostTopic, Sentiment, UiComment } from "@/types/facebook/post-comments-analytics"

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatDate(value: string | null) {
  if (!value) return "Date unavailable"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Date unavailable"

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
}

export function formatSentiment(value: Sentiment) {
  if (value === "positive") return "Positive"
  if (value === "negative") return "Negative"
  return "Neutral"
}

export function getSentimentScore(sentiment: Sentiment) {
  if (sentiment === "positive") return 5
  if (sentiment === "negative") return 1
  return 3
}

export function languageLabelOf(language: UiComment["language"]) {
  if (language === "am") return "Amharic"
  if (language === "om") return "Afaan Oromo"
  if (language === "en") return "English"
  if (language === "mixed") return "Mixed"
  return null
}

/* -------------------------------------------------------------------------- */
/* Mappers                                                                    */
/* -------------------------------------------------------------------------- */

/** API FacebookComment (camelCase) -> flat UI comment. */
export function mapComment(comment: FacebookComment): UiComment {
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
export function toFacebookComment(
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
 * Pulls the array out of a hook response. Handles the shapes in your types:
 * PaginatedCommentsResponse ({ data: [...] }) or a bare array, plus a few fallbacks.
 */
export function extractList(payload: unknown): unknown[] {
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
export function mapTopics(payload: unknown): PostTopic[] {
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