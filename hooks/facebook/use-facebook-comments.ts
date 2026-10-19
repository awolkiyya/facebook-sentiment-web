
"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { postCommentsAnalyticsService } from "@/services/facebook/post-comments-analytics"

import type {
  CommentsQueryParams,
} from "@/types/facebook/post-comments-analytics"

/*
|--------------------------------------------------------------------------
| Query Keys
|--------------------------------------------------------------------------
*/

export const facebookCommentKeys = {
  all: ["facebook-comments"] as const,

  post: (postId: string) =>
    [...facebookCommentKeys.all, postId] as const,

  comments: (
    postId: string,
    params: CommentsQueryParams,
  ) =>
    [
      ...facebookCommentKeys.post(postId),
      "list",
      params,
    ] as const,

  analytics: (postId: string) =>
    [
      ...facebookCommentKeys.post(postId),
      "analytics",
    ] as const,

  topics: (postId: string) =>
    [
      ...facebookCommentKeys.post(postId),
      "topics",
    ] as const,

  sync: (postId: string) =>
    [
      ...facebookCommentKeys.post(postId),
      "sync",
    ] as const,
}

/*
|--------------------------------------------------------------------------
| Fetch Post Comments
|--------------------------------------------------------------------------
*/

export function useFacebookPostComments(
  postId: string,
  params: CommentsQueryParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: facebookCommentKeys.comments(postId, params),

    queryFn: () =>
      postCommentsAnalyticsService.getComments(
        postId,
        params,
      ),

    enabled: Boolean(postId.trim()) && enabled,

    placeholderData: (previousData) => previousData,

    staleTime: 30_000,
  })
}

/*
|--------------------------------------------------------------------------
| Fetch Comment Sentiment Analytics
|--------------------------------------------------------------------------
*/

export function useFacebookPostCommentsAnalytics(
  postId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: facebookCommentKeys.analytics(postId),

    queryFn: () =>
      postCommentsAnalyticsService.getAnalytics(postId),

    enabled: Boolean(postId.trim()) && enabled,

    staleTime: 60_000,
  })
}

/*
|--------------------------------------------------------------------------
| Fetch Classified Topics
|--------------------------------------------------------------------------
*/

export function useFacebookCommentTopics(
  postId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: facebookCommentKeys.topics(postId),

    queryFn: () =>
      postCommentsAnalyticsService.getTopics(postId),

    enabled: Boolean(postId.trim()) && enabled,

    staleTime: 60_000,
  })
}

/*
|--------------------------------------------------------------------------
| Synchronize Comments
|--------------------------------------------------------------------------
*/

export function useSyncFacebookComments(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: facebookCommentKeys.sync(postId),

    mutationFn: () => {
      if (!postId.trim()) {
        throw new Error(
          "A valid Facebook post ID is required to synchronize comments.",
        )
      }

      return postCommentsAnalyticsService.syncComments(postId)
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: facebookCommentKeys.post(postId),
      })
    },
  })
}
