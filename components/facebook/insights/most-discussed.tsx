"use client"

import {
  MessageCircle,
  TrendingUp,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FacebookPost } from "@/types/facebook-post"



interface MostDiscussedProps {
  post: FacebookPost | null
  onViewComments: (
    postId: string,
  ) => void
}

export function MostDiscussed({
  post,
  onViewComments,
}: MostDiscussedProps) {
  if (!post) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4" />
            Most Discussed
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
          Most Discussed
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border bg-muted/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full border bg-background px-2 py-1 text-[10px] font-medium">
              {post.topic}
            </span>

            <span className="inline-flex items-center gap-1 text-xs font-semibold">
              <MessageCircle className="h-3.5 w-3.5" />

              {post.comments.toLocaleString()}
            </span>
          </div>

          <p className="mt-3 line-clamp-3 text-sm leading-5">
            {post.message}
          </p>

          <button
            type="button"
            onClick={() =>
              onViewComments(post.id)
            }
            className="mt-3 text-xs font-medium hover:underline"
          >
            View discussion
          </button>
        </div>
      </CardContent>
    </Card>
  )
}