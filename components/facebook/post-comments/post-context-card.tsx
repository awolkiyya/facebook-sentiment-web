
"use client"

import type { FacebookPost } from "@/types/facebook/post"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FacebookPostSummary } from "@/components/facebook/FacebookPostSummary"

import {
  formatDate,
  formatNumber,
} from "@/utils/post-comments-helpers"

/*
|--------------------------------------------------------------------------
| PROPS
|--------------------------------------------------------------------------
*/

interface PostContextCardProps {
  isLoading: boolean
  postDate: FacebookPost["published_at"]
  postMessage: string
  postLikes: number
  postShares: number
  totalComments: number
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export function PostContextCard({
  isLoading,
  postDate,
  postMessage,
  postLikes,
  postShares,
  totalComments,
}: PostContextCardProps) {
  return (
    <Card className="mt-6 overflow-hidden border-border/70 shadow-sm">
      {isLoading ? (
        <CardContent className="p-5 sm:p-6">
          <div className="flex gap-4">
            <Skeleton className="h-11 w-11 shrink-0 rounded-full" />

            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-16 max-w-3xl" />
            </div>
          </div>
        </CardContent>
      ) : (
        <FacebookPostSummary
          postDate={postDate}
          postMessage={postMessage}
          postLikes={postLikes}
          totalComments={totalComments}
          postShares={postShares}
          formatDate={formatDate}
          formatNumber={formatNumber}
        />
      )}
    </Card>
  )
}
