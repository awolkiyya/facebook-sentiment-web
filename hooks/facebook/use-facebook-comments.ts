"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { facebookCommentService } from "@/services/facebook/comment"
import { postCommentsAnalyticsService } from "@/services/facebook/post-comments-analytics"

import type {
  CommentsQueryParams,
} from "@/types/facebook/post-comments-analytics"

import type {
  FacebookCommentsQueryParams,
  FacebookPostCommentInsightsParams,
} from "@/types/facebook/comment"

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
    params: FacebookCommentsQueryParams,
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

  insights: (
    facebookPageId: string,
    postId: string,
    params: FacebookPostCommentInsightsParams = {},
  ) =>
    [
      ...facebookCommentKeys.post(facebookPageId, postId),
      "insights",
      params,
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
  params: FacebookCommentsQueryParams = {},
  enabled = true,
) {
  const normalizedPageId = facebookPageId.trim()
  const normalizedPostId = postId.trim()

  const normalizedParams: FacebookCommentsQueryParams = {
    ...params,
    search: params.search?.trim() || undefined,
    startDate: params.startDate || undefined,
    endDate: params.endDate || undefined,
  }

  return useQuery({
    queryKey: facebookCommentKeys.comments(
      normalizedPageId,
      normalizedPostId,
      normalizedParams,
    ),

    queryFn: () =>
      postCommentsAnalyticsService.getComments(
        normalizedPageId,
        normalizedPostId,
        normalizedParams,
      ),

    enabled:
      enabled &&
      normalizedPageId.length > 0 &&
      normalizedPostId.length > 0,

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
  const normalizedPageId = facebookPageId.trim()
  const normalizedPostId = postId.trim()

  return useQuery({
    queryKey: facebookCommentKeys.analytics(
      normalizedPageId,
      normalizedPostId,
    ),

    queryFn: () =>
      postCommentsAnalyticsService.getAnalytics(
        normalizedPageId,
        normalizedPostId,
      ),

    enabled:
      enabled &&
      normalizedPageId.length > 0 &&
      normalizedPostId.length > 0,

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
  const normalizedPageId = facebookPageId.trim()
  const normalizedPostId = postId.trim()

  return useQuery({
    queryKey: facebookCommentKeys.topics(
      normalizedPageId,
      normalizedPostId,
    ),

    queryFn: () =>
      postCommentsAnalyticsService.getTopics(
        normalizedPageId,
        normalizedPostId,
      ),

    enabled:
      enabled &&
      normalizedPageId.length > 0 &&
      normalizedPostId.length > 0,

    staleTime: 60_000,
  })
}

/* -------------------------------------------------------------------------- */
/* Fetch Post Comment Insights                                                */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves the most-liked positive and negative top-level comments
 * for one Facebook post.
 *
 * The Laravel API reads persisted sentiment analysis.
 * This query does not synchronize comments or trigger AI analysis.
 */
export function useFacebookPostCommentInsights(
  facebookPageId: string,
  postId: string,
  params: FacebookPostCommentInsightsParams = {},
  enabled = true,
) {
  const normalizedPageId = facebookPageId.trim()
  const normalizedPostId = postId.trim()

  const normalizedParams: FacebookPostCommentInsightsParams = {
    startDate: params.startDate?.trim() || undefined,
    endDate: params.endDate?.trim() || undefined,
  }

  return useQuery({
    queryKey: facebookCommentKeys.insights(
      normalizedPageId,
      normalizedPostId,
      normalizedParams,
    ),

    queryFn: () =>
      facebookCommentService.getCommentInsights(
        normalizedPageId,
        normalizedPostId,
        normalizedParams,
      ),

    enabled:
      enabled &&
      normalizedPageId.length > 0 &&
      normalizedPostId.length > 0,

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

  const normalizedPageId = facebookPageId.trim()
  const normalizedPostId = postId.trim()

  return useMutation({
    mutationKey: facebookCommentKeys.sync(
      normalizedPageId,
      normalizedPostId,
    ),

    mutationFn: () => {
      if (!normalizedPageId) {
        throw new Error(
          "A valid Facebook Page ID is required to synchronize comments.",
        )
      }

      if (!normalizedPostId) {
        throw new Error(
          "A valid Facebook post ID is required to synchronize comments.",
        )
      }

      return postCommentsAnalyticsService.syncComments(
        normalizedPageId,
        normalizedPostId,
      )
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: facebookCommentKeys.post(
            normalizedPageId,
            normalizedPostId,
          ),
        }),
      ])
    },
  })
}
