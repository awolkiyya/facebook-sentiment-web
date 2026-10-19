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