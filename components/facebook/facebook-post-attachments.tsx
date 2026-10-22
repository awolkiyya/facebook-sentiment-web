"use client"

import { useCallback, useState } from "react"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileImage,
  Image as ImageIcon,
  Link as LinkIcon,
  Play,
  Video,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

import type { FacebookPostAttachment } from "@/types/facebook/post"

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getImageUrl(attachment: FacebookPostAttachment): string | null {
  return (
    attachment.thumbnail_url ??
    attachment.media_url ??
    (attachment.media_type === "image" ? attachment.url : null) ??
    null
  )
}

function getTargetUrl(attachment: FacebookPostAttachment): string | null {
  return attachment.target?.url ?? attachment.url ?? null
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

/** Width / height, defaulting to landscape when the size is unknown. */
function getAspectRatio(attachment: FacebookPostAttachment): number {
  const { width, height } = attachment

  return width && height && width > 0 && height > 0 ? width / height : 16 / 9
}

/* -------------------------------------------------------------------------- */
/* Image with graceful fallback                                               */
/* -------------------------------------------------------------------------- */

/** Parent must be `relative` and have a size. */
function AttachmentImage({
  src,
  alt,
  className,
  fit = "cover",
}: {
  src: string | null
  alt: string
  className?: string
  fit?: "cover" | "contain"
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const failed = !src || failedSrc === src

  if (failed) {
    return (
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-muted",
          className,
        )}
      >
        <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
          <ImageIcon className="size-6" aria-hidden="true" />
          <span className="text-xs">Image unavailable</span>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 600px"
      unoptimized
      // Facebook's CDN often rejects requests that carry another site's referrer.
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
      className={cn(
        fit === "cover" ? "object-cover" : "object-contain",
        className,
      )}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Lightbox                                                                   */
/* -------------------------------------------------------------------------- */

function ImageLightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: FacebookPostAttachment[]
  index: number | null
  onIndexChange: (next: number) => void
  onClose: () => void
}) {
  const open = index !== null
  const total = images.length
  const current = index !== null ? images[index] : null

  const go = useCallback(
    (direction: 1 | -1) => {
      if (index === null) return
      onIndexChange((index + direction + total) % total)
    },
    [index, total, onIndexChange],
  )

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") go(1)
          if (event.key === "ArrowLeft") go(-1)
        }}
        className="max-w-4xl overflow-hidden border-0 bg-black p-0 sm:rounded-xl"
      >
        <DialogTitle className="sr-only">
          {current?.title ?? "Post photo"}
          {total > 1 && index !== null ? ` (${index + 1} of ${total})` : ""}
        </DialogTitle>

        <div className="relative h-[75vh] w-full">
          {current && (
            <AttachmentImage
              src={
                current.media_url ??
                current.thumbnail_url ??
                current.url ??
                null
              }
              alt={current.title ?? "Post photo"}
              fit="contain"
            />
          )}

          {total > 1 && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute left-3 top-1/2 size-9 -translate-y-1/2 rounded-full opacity-90"
                onClick={() => go(-1)}
                aria-label="Previous photo"
              >
                <ChevronLeft className="size-5" />
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-3 top-1/2 size-9 -translate-y-1/2 rounded-full opacity-90"
                onClick={() => go(1)}
                aria-label="Next photo"
              >
                <ChevronRight className="size-5" />
              </Button>

              <span
                className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium tabular-nums text-white"
                aria-hidden="true"
              >
                {(index ?? 0) + 1} / {total}
              </span>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/* Image gallery (single image and albums)                                    */
/* -------------------------------------------------------------------------- */

const MAX_TILES = 4

function ImageGallery({
  images,
  caption,
}: {
  images: FacebookPostAttachment[]
  caption?: string | null
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const visible = images.slice(0, MAX_TILES)
  const remaining = images.length - visible.length
  const count = visible.length

  if (count === 0) {
    return null
  }

  const first = visible[0]
  const singleAspect =
    first.width && first.height && first.height > first.width
      ? "aspect-[4/5]"
      : "aspect-video"

  return (
    <figure className="overflow-hidden rounded-xl border bg-muted">
      <div
        className={cn(
          "grid gap-0.5",
          count === 1 ? "grid-cols-1" : "grid-cols-2",
        )}
      >
        {visible.map((image, index) => {
          const isLastTile = index === count - 1
          const showRemaining = isLastTile && remaining > 0
          const url = getImageUrl(image)

          const tileClass =
            count === 1
              ? singleAspect
              : count === 3 && index === 0
                ? "col-span-2 aspect-video"
                : "aspect-square"

          return (
            <button
              key={image.id}
              type="button"
              disabled={!url}
              onClick={() => setActiveIndex(index)}
              aria-label={
                images.length > 1
                  ? `View photo ${index + 1} of ${images.length}`
                  : "View photo"
              }
              className={cn(
                "relative block w-full overflow-hidden",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                url ? "cursor-zoom-in" : "cursor-default",
                tileClass,
              )}
            >
              <AttachmentImage
                src={url}
                alt={image.title ?? `Photo ${index + 1}`}
              />

              {showRemaining && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-semibold text-white">
                  +{remaining}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {caption && (
        <figcaption className="border-t bg-background px-4 py-3">
          <p className="truncate text-sm font-medium">{caption}</p>
        </figcaption>
      )}

      <ImageLightbox
        images={images}
        index={activeIndex}
        onIndexChange={setActiveIndex}
        onClose={() => setActiveIndex(null)}
      />
    </figure>
  )
}

/* -------------------------------------------------------------------------- */
/* Video (portrait-aware, loads only when played)                             */
/* -------------------------------------------------------------------------- */

function VideoAttachment({
  attachment,
}: {
  attachment: FacebookPostAttachment
}) {
  const [playing, setPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)

  const videoUrl = attachment.media_url ?? null
  const poster = attachment.thumbnail_url ?? null
  const targetUrl = getTargetUrl(attachment)

  // Reels and phone videos are portrait. Keep their real shape instead of
  // cropping them into a 16:9 box, and cap the width so they are not huge.
  const ratio = getAspectRatio(attachment)
  const isPortrait = ratio < 1
  const isReel = /\/reel\//.test(attachment.url ?? targetUrl ?? "")

  const frameStyle = { aspectRatio: String(ratio) }
  const wrapperClass = cn(isPortrait && "mx-auto max-w-[320px]")

  const caption = attachment.title?.trim()

  const captionNode = caption ? (
    <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
      {caption}
    </p>
  ) : null

  // No playable file, or the (expiring) file URL stopped working.
  if (!videoUrl || hasError) {
    return (
      <div className={wrapperClass}>
        <div
          style={frameStyle}
          className="relative flex w-full items-center justify-center overflow-hidden rounded-xl border bg-muted"
        >
          {poster && (
            <AttachmentImage
              src={poster}
              alt={attachment.title ?? "Video thumbnail"}
              className="opacity-30"
            />
          )}

          <div className="relative flex flex-col items-center gap-2 px-4 text-center text-muted-foreground">
            <Video className="size-8" aria-hidden="true" />
            <span className="text-xs">Video can’t be played here</span>

            {targetUrl && (
              <Button asChild variant="outline" size="sm" className="mt-1">
                <a href={targetUrl} target="_blank" rel="noopener noreferrer">
                  Watch on Facebook
                  <ExternalLink className="ml-2 size-3.5" aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </Button>
            )}
          </div>
        </div>
        {captionNode}
      </div>
    )
  }

  if (!playing) {
    return (
      <div className={wrapperClass}>
        <button
          type="button"
          onClick={() => setPlaying(true)}
          style={frameStyle}
          aria-label={`Play ${isReel ? "reel" : "video"}${
            caption ? `: ${caption}` : ""
          }`}
          className="group relative block w-full overflow-hidden rounded-xl border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {poster ? (
            <AttachmentImage
              src={poster}
              alt={attachment.title ?? "Video thumbnail"}
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <Video className="size-8" aria-hidden="true" />
            </span>
          )}

          <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
            <span className="flex size-14 items-center justify-center rounded-full bg-background/95 shadow-lg">
              <Play className="ml-0.5 size-6 fill-current" aria-hidden="true" />
            </span>
          </span>

          {isReel && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
              Reel
            </span>
          )}
        </button>
        {captionNode}
      </div>
    )
  }

  return (
    <div className={wrapperClass}>
      <div
        style={frameStyle}
        className="relative w-full overflow-hidden rounded-xl border bg-black"
      >
        <video
          controls
          autoPlay
          playsInline
          preload="metadata"
          poster={poster ?? undefined}
          className="absolute inset-0 size-full object-contain"
          onError={() => setHasError(true)}
        >
          <source src={videoUrl} />
          Your browser does not support video playback.
        </video>
      </div>
      {captionNode}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Link                                                                       */
/* -------------------------------------------------------------------------- */

function LinkAttachment({
  attachment,
}: {
  attachment: FacebookPostAttachment
}) {
  const targetUrl = getTargetUrl(attachment)

  if (!targetUrl) {
    return null
  }

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-xl border bg-muted/20 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {attachment.thumbnail_url && (
        <div className="relative aspect-[2/1] overflow-hidden bg-muted">
          <AttachmentImage
            src={attachment.thumbnail_url}
            alt={attachment.title ?? "Shared link preview"}
          />
        </div>
      )}

      <div className="flex items-start gap-3 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <LinkIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        </span>

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
            {getHostname(targetUrl)}
            <span className="sr-only"> (opens in a new tab)</span>
          </p>
        </div>
      </div>
    </a>
  )
}

/* -------------------------------------------------------------------------- */
/* Unavailable                                                                */
/* -------------------------------------------------------------------------- */

function UnavailableAttachment({
  attachment,
}: {
  attachment: FacebookPostAttachment
}) {
  const targetUrl = getTargetUrl(attachment)

  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed bg-muted/20 p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <FileImage className="size-5 text-muted-foreground" aria-hidden="true" />
      </span>

      <div className="min-w-0">
        <p className="text-sm font-medium">Media unavailable</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          This Facebook attachment is no longer available.
        </p>
      </div>

      {targetUrl && (
        <Button asChild variant="outline" size="sm" className="ml-auto shrink-0">
          <a href={targetUrl} target="_blank" rel="noopener noreferrer">
            Open
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </Button>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

function PostAttachment({ attachment }: { attachment: FacebookPostAttachment }) {
  switch (attachment.media_type) {
    case "image":
      return <ImageGallery images={[attachment]} />

    case "album": {
      const children = attachment.children ?? []
      return (
        <ImageGallery
          images={children.length > 0 ? children : [attachment]}
          caption={attachment.title}
        />
      )
    }

    case "video":
      return <VideoAttachment attachment={attachment} />

    case "link":
      return <LinkAttachment attachment={attachment} />

    case "unavailable":
      return <UnavailableAttachment attachment={attachment} />

    default:
      return null
  }
}

export function PostAttachments({
  attachments,
  className,
}: {
  attachments: FacebookPostAttachment[]
  className?: string
}) {
  if (attachments.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-3", className)}>
      {attachments.map((attachment) => (
        <PostAttachment key={attachment.id} attachment={attachment} />
      ))}
    </div>
  )
}