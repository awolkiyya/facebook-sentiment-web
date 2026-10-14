"use client"

import { useFacebookPages } from "./use-facebook-pages"
import { useFacebookPosts } from "./use-facebook-posts"
import { useFacebookComments } from "./use-facebook-comments"

export const useFacebook = () => {
  const pages = useFacebookPages()
  const posts = useFacebookPosts()
  const comments = useFacebookComments()

  return {
    ...pages,
    posts: posts.posts,
    postsPagination: posts.pagination,
    isLoadingPosts: posts.isLoading,
    isSyncingPosts: posts.isSyncing,
    getPosts: posts.getPosts,
    syncPosts: posts.syncPosts,

    comments: comments.comments,
    commentsPagination: comments.pagination,
    isLoadingComments: comments.isLoading,
    isSyncingComments: comments.isSyncing,
    getComments: comments.getComments,
    syncComments: comments.syncComments,

    clearPosts: posts.clearPosts,
    clearComments: comments.clearComments,
  }
}