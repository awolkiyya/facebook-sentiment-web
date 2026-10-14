"use client"



import { FacebookPost } from "@/types/facebook/post"
import { FacebookPostCard } from "./facebook-post-card"

interface FacebookPostListProps {
  posts: FacebookPost[]
  expandedCommentsId: string | null
  onToggleComments: (
    postId: string,
  ) => void
  onViewComments: (
    postId: string,
  ) => void
}

export function FacebookPostList({
  posts,
  expandedCommentsId,
  onToggleComments,
  onViewComments,
}: FacebookPostListProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">
          No posts found
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Try changing your search or sentiment
          filter.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <FacebookPostCard
          key={post.id}
          post={post}
          isCommentsExpanded={
            expandedCommentsId === post.id
          }
          onToggleComments={() =>
            onToggleComments(post.id)
          }
          onViewComments={() =>
            onViewComments(post.id)
          }
        />
      ))}
    </div>
  )
}