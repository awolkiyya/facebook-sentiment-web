"use client"

interface FacebookPostsDebugProps {
  facebookPageId: string
  postsCount: number
  totalPosts: number
}

export function FacebookPostsDebug({
  facebookPageId,
  postsCount,
  totalPosts,
}: FacebookPostsDebugProps) {
  return (
    <div className="rounded-lg border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
      <div className="grid gap-1 sm:grid-cols-3">
        <div>
          <span className="font-medium">
            Page ID:
          </span>{" "}
          {facebookPageId}
        </div>

        <div>
          <span className="font-medium">
            Loaded:
          </span>{" "}
          {postsCount}
        </div>

        <div>
          <span className="font-medium">
            API Total:
          </span>{" "}
          {totalPosts}
        </div>
      </div>
    </div>
  )
}