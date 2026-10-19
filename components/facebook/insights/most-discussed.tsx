
"use client"

import {
  MessageCircle,
  TrendingUp,
} from "lucide-react"

import type { FacebookPost } from "@/types/facebook/post"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

/*
|--------------------------------------------------------------------------
| PROPS
|--------------------------------------------------------------------------
*/

interface MostDiscussedProps {
  post: FacebookPost | null
  onViewComments: (postId: string) => void
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export function MostDiscussed({
  post,
  onViewComments,
}: MostDiscussedProps) {
  const title = "Most Discussed"
  const message = post?.message?.trim()
  const topic = post?.ai_analysis.topic.name
  const commentCount = post?.engagement.comments ?? 0

  if (!post) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            No posts available.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border bg-muted/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <span
              className="min-w-0 truncate rounded-full border bg-background px-2 py-1 text-[10px] font-medium"
              title={topic ?? "Uncategorized"}
            >
              {topic || "Uncategorized"}
            </span>

            <span
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold"
              aria-label={`${commentCount.toLocaleString()} comments`}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {commentCount.toLocaleString()}
            </span>
          </div>

          <p className="mt-3 line-clamp-3 break-words text-sm leading-5">
            {message || "This post has no text content."}
          </p>

          <button
            type="button"
            onClick={() => onViewComments(post.id)}
            className="mt-3 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            View discussion
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
