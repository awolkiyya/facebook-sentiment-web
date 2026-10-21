
"use client"

import {
  ExternalLink,
  FileImage,
  Heart,
  Image as ImageIcon,
  Link as LinkIcon,
  MessageCircle,
  MoreHorizontal,
  Play,
  Share2,
  Video,
} from "lucide-react"

import Image from "next/image"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type {
  FacebookPost,
  FacebookPostAttachment,
} from "@/types/facebook/post"


import { FacebookCommentPreview } from "./facebook-comment-preview"
import { SentimentLabel } from "@/types/facebook/common"
import { UiComment } from "@/types/facebook/post-comments-analytics"

/*
|--------------------------------------------------------------------------
| PROPS
|--------------------------------------------------------------------------
*/

interface FacebookPostCardProps {
  post: FacebookPost
  isCommentsExpanded: boolean
  onToggleComments: () => void
  onViewComments: () => void
}

/*
|--------------------------------------------------------------------------
| SENTIMENT STYLES
|--------------------------------------------------------------------------
*/

const SENTIMENT_STYLES: Record<SentimentLabel, string> = {
  positive:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  neutral:
    "border-slate-200 bg-slate-50 text-slate-700",

  negative:
    "border-red-200 bg-red-50 text-red-700",
}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function formatDateTime(
  value: string | null | undefined,
): string {
  if (!value) {
    return "Date unavailable"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable"
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function getSentimentClass(
  sentiment: SentimentLabel | null | undefined,
): string {
  return sentiment
    ? SENTIMENT_STYLES[sentiment]
    : "border-slate-200 bg-slate-50 text-slate-600"
}

/**
 * Adapt the backend's API comment model to the existing
 * UI comment model consumed by FacebookCommentPreview.
 */
function toUiComment(
  comment: FacebookPost["top_comments"][number],
): UiComment {
  return {
  id: comment.id,
  author: comment.author.name ?? "Unknown user",
  message: comment.message ?? "",
  publishedAt: comment.commented_at,
  sentiment: comment.ai_analysis?.sentiment.label ?? null,
  sentimentConfidence: comment.ai_analysis?.sentiment.confidence ?? null,
  // language: comment.ai_analysis?.language ?? null,
  likes: comment.engagement.like_count,
  permalinkUrl: comment.permalink_url,
  analyzedAt: comment.ai_analysis?.analyzed_at ?? null,
  language: null,
}
}

/*
|--------------------------------------------------------------------------
| ATTACHMENT IMAGE
|--------------------------------------------------------------------------
*/

interface AttachmentImageProps {
  attachment: FacebookPostAttachment
  className?: string
  alt?: string
}

function AttachmentImage({
  attachment,
  className = "",
  alt = "Facebook post attachment",
}: AttachmentImageProps) {
  const [hasError, setHasError] = useState(false)

  const imageUrl =
    attachment.thumbnail_url ??
    attachment.media_url ??
    (attachment.media_type === "image"
      ? attachment.url
      : null)

  if (!imageUrl || hasError) {
    return (
      <div
        className={`flex h-full min-h-40 items-center justify-center bg-muted ${className}`}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageIcon className="h-7 w-7" />

          <span className="text-xs">
            Image unavailable
          </span>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 600px"
      unoptimized
      onError={() => setHasError(true)}
      className={`object-cover ${className}`}
    />
  )
}

/*
|--------------------------------------------------------------------------
| SINGLE IMAGE
|--------------------------------------------------------------------------
*/

function SingleImageAttachment({
  attachment,
}: {
  attachment: FacebookPostAttachment
}) {
  const aspectClass =
    attachment.width && attachment.height
      ? attachment.width >= attachment.height
        ? "aspect-video"
        : "aspect-[4/5]"
      : "aspect-video"

  return (
    <div
      className={`relative mt-5 overflow-hidden rounded-xl border bg-muted ${aspectClass}`}
    >
      <AttachmentImage
        attachment={attachment}
        alt={attachment.title ?? "Facebook post photo"}
      />
    </div>
  )
}

/*
|--------------------------------------------------------------------------
| VIDEO
|--------------------------------------------------------------------------
*/

function VideoAttachment({
  attachment,
}: {
  attachment: FacebookPostAttachment
}) {
  const [hasError, setHasError] = useState(false)

  const videoUrl = attachment.media_url ?? attachment.url
  const thumbnailUrl = attachment.thumbnail_url

  if (!videoUrl || hasError) {
    return (
      <div className="relative mt-5 flex aspect-video items-center justify-center overflow-hidden rounded-xl border bg-muted">
        {thumbnailUrl ? (
          <>
            <AttachmentImage
              attachment={attachment}
              alt={attachment.title ?? "Facebook video"}
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background/95 shadow-lg">
                <Play className="ml-0.5 h-6 w-6 fill-current" />
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Video className="h-8 w-8" />

            <span className="text-xs">
              Video unavailable
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mt-5 overflow-hidden rounded-xl border bg-black">
      <video
        controls
        preload="metadata"
        poster={thumbnailUrl ?? undefined}
        className="block max-h-[600px] w-full"
        onError={() => setHasError(true)}
      >
        <source src={videoUrl} />

        Your browser does not support video playback.
      </video>
    </div>
  )
}

/*
|--------------------------------------------------------------------------
| ALBUM
|--------------------------------------------------------------------------
*/

function AlbumAttachment({
  attachment,
}: {
  attachment: FacebookPostAttachment
}) {
  const children = attachment.children ?? []

  if (children.length === 0) {
    return <SingleImageAttachment attachment={attachment} />
  }

  const visibleChildren = children.slice(0, 4)
  const remainingCount = children.length - visibleChildren.length

  return (
    <div className="mt-5 overflow-hidden rounded-xl border bg-muted">
      <div className="grid grid-cols-2">
        {visibleChildren.map((child, index) => {
          const showRemaining =
            index === visibleChildren.length - 1 &&
            remainingCount > 0

          return (
            <div
              key={child.id}
              className={`relative aspect-square overflow-hidden ${
                visibleChildren.length > 2 && index < 2
                  ? "border-b"
                  : ""
              } ${
                index % 2 === 0 && visibleChildren.length > 1
                  ? "border-r"
                  : ""
              }`}
            >
              <AttachmentImage
                attachment={child}
                alt={
                  child.title ?? `Album photo ${index + 1}`
                }
              />

              {showRemaining && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="text-lg font-semibold text-white">
                    +{remainingCount}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {attachment.title && (
        <div className="border-t bg-background px-4 py-3">
          <p className="truncate text-sm font-medium">
            {attachment.title}
          </p>
        </div>
      )}
    </div>
  )
}

/*
|--------------------------------------------------------------------------
| LINK ATTACHMENT
|--------------------------------------------------------------------------
*/

function LinkAttachment({
  attachment,
}: {
  attachment: FacebookPostAttachment
}) {
  const targetUrl =
    attachment.target.url ?? attachment.url

  if (!targetUrl) {
    return null
  }

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-5 block overflow-hidden rounded-xl border bg-muted/20 transition-colors hover:bg-muted/40"
    >
      {attachment.thumbnail_url && (
        <div className="relative aspect-[2/1] overflow-hidden bg-muted">
          <AttachmentImage
            attachment={attachment}
            alt={attachment.title ?? "Shared link"}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="min-w-0">
            {attachment.title && (
              <p className="line-clamp-2 text-sm font-semibold">
                {attachment.title}
              </p>
            )}

            {attachment.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                {attachment.description}
              </p>
            )}

            <p className="mt-2 truncate text-xs text-muted-foreground">
              {targetUrl}
            </p>
          </div>
        </div>
      </div>
    </a>
  )
}

/*
|--------------------------------------------------------------------------
| UNAVAILABLE ATTACHMENT
|--------------------------------------------------------------------------
*/

function UnavailableAttachment({
  attachment,
}: {
  attachment: FacebookPostAttachment
}) {
  const targetUrl =
    attachment.target.url ?? attachment.url

  return (
    <div className="mt-5 flex items-center gap-3 rounded-xl border border-dashed bg-muted/20 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <FileImage className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium">
          Media unavailable
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          This Facebook attachment is no longer available.
        </p>
      </div>

      {targetUrl && (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="ml-auto shrink-0"
        >
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open
          </a>
        </Button>
      )}
    </div>
  )
}

/*
|--------------------------------------------------------------------------
| ATTACHMENT RENDERER
|--------------------------------------------------------------------------
*/

function PostAttachment({
  attachment,
}: {
  attachment: FacebookPostAttachment
}) {
  switch (attachment.media_type) {
    case "image":
      return <SingleImageAttachment attachment={attachment} />

    case "video":
      return <VideoAttachment attachment={attachment} />

    case "album":
      return <AlbumAttachment attachment={attachment} />

    case "link":
      return <LinkAttachment attachment={attachment} />

    case "unavailable":
      return <UnavailableAttachment attachment={attachment} />

    default:
      return null
  }
}

/*
|--------------------------------------------------------------------------
| POST ATTACHMENTS
|--------------------------------------------------------------------------
*/

function PostAttachments({
  attachments,
}: {
  attachments: FacebookPostAttachment[]
}) {
  if (attachments.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {attachments.map((attachment) => (
        <PostAttachment
          key={attachment.id}
          attachment={attachment}
        />
      ))}
    </div>
  )
}

/*
|--------------------------------------------------------------------------
| FACEBOOK POST CARD
|--------------------------------------------------------------------------
*/

export function FacebookPostCard({
  post,
  isCommentsExpanded,
  onToggleComments,
  onViewComments,
}: FacebookPostCardProps) {
  const hasMessage = Boolean(post.message?.trim())
  const hasAttachments = post.attachments.length > 0

  const sentiment =
    post.ai_analysis?.sentiment?.label ?? null

  const topic =
    post.ai_analysis?.topic?.name ?? null

  const hasSentiment = Boolean(sentiment)

  const hasTopic = Boolean(
    topic && topic !== "Uncategorized",
  )

  const hasAIAnalysis = hasSentiment || hasTopic

  const sentimentStyle = getSentimentClass(sentiment)

  const comments = post.top_comments ?? []

  const reactionCount = post.engagement.likes
  const commentCount = post.engagement.comments
  const shareCount = post.engagement.shares

  return (
    <Card className="overflow-hidden shadow-none">
      <CardContent className="p-0">
        {/* MAIN CONTENT */}

        <div className="p-5 sm:p-6">
          {/* POST HEADER */}

          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-muted text-sm font-semibold"
                aria-label="Facebook page"
              >
                AC
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  Adama City Administration
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <time dateTime={post.published_at ?? undefined}>
                    {formatDateTime(post.published_at)}
                  </time>

                  {hasAttachments && (
                    <>
                      <span aria-hidden="true">•</span>

                      <span>
                        {post.attachments.length}{" "}
                        {post.attachments.length === 1
                          ? "attachment"
                          : "attachments"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ACTION MENU */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  aria-label="Post actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52">
                {post.permalink_url && (
                  <DropdownMenuItem asChild>
                    <a
                      href={post.permalink_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open on Facebook
                    </a>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={onToggleComments}>
                  <MessageCircle className="mr-2 h-4 w-4" />

                  {isCommentsExpanded
                    ? "Hide comments"
                    : "Show comments"}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onViewComments}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  View all comments
                </DropdownMenuItem>

                {post.permalink_url && (
                  <>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <a
                        href={post.permalink_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View original post
                      </a>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* POST MESSAGE */}

          {hasMessage && (
            <div className="mt-5">
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                {post.message}
              </p>
            </div>
          )}

          {/* ATTACHMENTS */}

          {hasAttachments && (
            <PostAttachments attachments={post.attachments} />
          )}

          {/* AI ANALYSIS */}

          {hasAIAnalysis && (
            <div className="mt-5 rounded-xl border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    AI Analysis
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    Public response analysis
                  </p>
                </div>

                {sentiment && (
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${sentimentStyle}`}
                  >
                    {sentiment}
                  </span>
                )}
              </div>

              <div className="mt-3 text-sm leading-6 text-muted-foreground">
                {hasSentiment && hasTopic && (
                  <p>
                    Public response is{" "}
                    <span className="font-medium text-foreground">
                      {sentiment}
                    </span>{" "}
                    around the topic of{" "}
                    <span className="font-medium text-foreground">
                      {topic}
                    </span>
                    .
                  </p>
                )}

                {hasSentiment && !hasTopic && (
                  <p>
                    Public response is{" "}
                    <span className="font-medium text-foreground">
                      {sentiment}
                    </span>
                    .
                  </p>
                )}

                {!hasSentiment && hasTopic && (
                  <p>
                    The detected topic is{" "}
                    <span className="font-medium text-foreground">
                      {topic}
                    </span>
                    .
                  </p>
                )}
              </div>
            </div>
          )}

          {/* AI METADATA */}

          {(sentiment || hasTopic) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {sentiment && (
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${sentimentStyle}`}
                >
                  {sentiment}
                </span>
              )}

              {hasTopic && (
                <span className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {topic}
                </span>
              )}
            </div>
          )}

          {/* ENGAGEMENT */}

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-t pt-4">
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Heart className="h-4 w-4" />

              <span>{formatCompactNumber(reactionCount)}</span>

              <span className="sr-only">likes</span>
            </span>

            <button
              type="button"
              onClick={onToggleComments}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              aria-expanded={isCommentsExpanded}
            >
              <MessageCircle className="h-4 w-4" />

              <span>{formatCompactNumber(commentCount)}</span>

              <span className="sr-only">comments</span>
            </button>

            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Share2 className="h-4 w-4" />

              <span>{formatCompactNumber(shareCount)}</span>

              <span className="sr-only">shares</span>
            </span>

            <button
              type="button"
              onClick={onViewComments}
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-foreground transition-colors hover:text-primary"
            >
              View all comments

              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* COMMENT PREVIEWS */}

        {isCommentsExpanded && (
          <div className="border-t bg-muted/10 p-5 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold">
                  Top Comments
                </h4>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  AI-analyzed public responses
                </p>
              </div>

              {commentCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {formatCompactNumber(commentCount)} total
                </span>
              )}
            </div>

            {comments.length > 0 ? (
              <div className="space-y-2">
                {comments.map((comment) => (
                  <FacebookCommentPreview
                    key={comment.id}
                    comment={toUiComment(comment)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed bg-background p-6 text-center">
                <MessageCircle className="mx-auto h-6 w-6 text-muted-foreground" />

                <p className="mt-2 text-sm font-medium">
                  No comments available
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Comments have not been synchronized for this post yet.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
