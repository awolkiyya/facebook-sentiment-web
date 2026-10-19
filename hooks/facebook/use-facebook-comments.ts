
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

/* -------------------------------------------------------------------------- */
/* Query Keys                                                                 */
/* -------------------------------------------------------------------------- */

export const facebookCommentKeys = {
  all: ["facebook-comments"] as const,

  page: (facebookPageId: string) =>
    [...facebookCommentKeys.all, facebookPageId] as const,

  post: (facebookPageId: string, postId: string) =>
    [...facebookCommentKeys.page(facebookPageId), postId] as const,

  comments: (
    facebookPageId: string,
    postId: string,
    params: CommentsQueryParams,
  ) =>
    [
      ...facebookCommentKeys.post(facebookPageId, postId),
      "list",
      params,
    ] as const,

  analytics: (facebookPageId: string, postId: string) =>
    [
      ...facebookCommentKeys.post(facebookPageId, postId),
      "analytics",
    ] as const,

  topics: (facebookPageId: string, postId: string) =>
    [
      ...facebookCommentKeys.post(facebookPageId, postId),
      "topics",
    ] as const,

  sync: (facebookPageId: string, postId: string) =>
    [
      ...facebookCommentKeys.post(facebookPageId, postId),
      "sync",
    ] as const,
}

/* -------------------------------------------------------------------------- */
/* Fetch Post Comments                                                        */
/* -------------------------------------------------------------------------- */

export function useFacebookPostComments(
  facebookPageId: string,
  postId: string,
  params: CommentsQueryParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: facebookCommentKeys.comments(
      facebookPageId,
      postId,
      params,
    ),

    queryFn: () =>
      postCommentsAnalyticsService.getComments(
        facebookPageId,
        postId,
        params,
      ),

    enabled:
      Boolean(facebookPageId.trim()) &&
      Boolean(postId.trim()) &&
      enabled,

    placeholderData: (previousData) => previousData,

    staleTime: 30_000,
  })
}

/* -------------------------------------------------------------------------- */
/* Fetch Comment Sentiment Analytics                                          */
/* -------------------------------------------------------------------------- */

export function useFacebookPostCommentsAnalytics(
  facebookPageId: string,
  postId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: facebookCommentKeys.analytics(
      facebookPageId,
      postId,
    ),

    queryFn: () =>
      postCommentsAnalyticsService.getAnalytics(
        facebookPageId,
        postId,
      ),

    enabled:
      Boolean(facebookPageId.trim()) &&
      Boolean(postId.trim()) &&
      enabled,

    staleTime: 60_000,
  })
}

/* -------------------------------------------------------------------------- */
/* Fetch Classified Topics                                                    */
/* -------------------------------------------------------------------------- */

export function useFacebookCommentTopics(
  facebookPageId: string,
  postId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: facebookCommentKeys.topics(
      facebookPageId,
      postId,
    ),

    queryFn: () =>
      postCommentsAnalyticsService.getTopics(
        facebookPageId,
        postId,
      ),

    enabled:
      Boolean(facebookPageId.trim()) &&
      Boolean(postId.trim()) &&
      enabled,

    staleTime: 60_000,
  })
}

/* -------------------------------------------------------------------------- */
/* Synchronize Comments                                                       */
/* -------------------------------------------------------------------------- */

export function useSyncFacebookComments(
  facebookPageId: string,
  postId: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: facebookCommentKeys.sync(
      facebookPageId,
      postId,
    ),

    mutationFn: () => {
      if (!facebookPageId.trim()) {
        throw new Error(
          "A valid Facebook Page ID is required to synchronize comments.",
        )
      }

      if (!postId.trim()) {
        throw new Error(
          "A valid Facebook post ID is required to synchronize comments.",
        )
      }

      return postCommentsAnalyticsService.syncComments(
        facebookPageId,
        postId,
      )
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: facebookCommentKeys.post(
            facebookPageId,
            postId,
          ),
        }),
      ])
    },
  })
}
