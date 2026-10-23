
"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { facebookCommentService } from "@/services/facebook/comment"
import { postCommentsAnalyticsService } from "@/services/facebook/post-comments-analytics"
import type {
  FacebookPostCommentInsightsParams,
  FacebookPostCommentsParams,
  FacebookPostSentimentOverviewParams,
  FacebookPostTopTopicsParams,
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
    params: FacebookPostCommentsParams,
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

  topics: (
      facebookPageId: string,
      postId: string,
      params: FacebookPostTopTopicsParams = {},
    ) =>
      [
        ...facebookCommentKeys.post(facebookPageId, postId),
        "top-topics",
        params,
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

  sentimentOverview: (
    facebookPageId: string,
    postId: string,
    params: FacebookPostSentimentOverviewParams = {},
  ) =>
    [
      ...facebookCommentKeys.post(facebookPageId, postId),
      "sentiment-overview",
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
  params: FacebookPostCommentsParams = {},
  enabled = true,
) {
  const normalizedPageId = facebookPageId.trim()
  const normalizedPostId = postId.trim()

  const normalizedParams: FacebookPostCommentsParams = {
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
 * Reads persisted sentiment analysis from Laravel.
 * Does not synchronize comments or trigger AI analysis.
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
/* Fetch Post Sentiment Overview                                              */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves the overall sentiment score, sentiment distribution,
 * and daily sentiment timeline for one Facebook post.
 *
 * Reads persisted sentiment analysis from Laravel.
 * Does not synchronize comments or trigger AI analysis.
 *
 * Optional date filters use YYYY-MM-DD.
 * If both dates are omitted, the backend applies its default range.
 */
export function useFacebookPostSentimentOverview(
  facebookPageId: string,
  postId: string,
  params: FacebookPostSentimentOverviewParams = {},
  enabled = true,
) {
  const normalizedPageId = facebookPageId.trim()
  const normalizedPostId = postId.trim()

  const normalizedParams: FacebookPostSentimentOverviewParams = {
    startDate: params.startDate?.trim() || undefined,
    endDate: params.endDate?.trim() || undefined,
  }

  return useQuery({
    queryKey: facebookCommentKeys.sentimentOverview(
      normalizedPageId,
      normalizedPostId,
      normalizedParams,
    ),

    queryFn: () =>
      facebookCommentService.getSentimentOverview(
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
      await queryClient.invalidateQueries({
        queryKey: facebookCommentKeys.post(
          normalizedPageId,
          normalizedPostId,
        ),
      })
    },
  })

}


/* -------------------------------------------------------------------------- */
/* Fetch Post Top Topics                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves the most common analyzed topics for one Facebook post.
 *
 * Reads persisted sentiment analysis from Laravel.
 * Does not synchronize comments or trigger AI analysis.
 *
 * Optional date filters use YYYY-MM-DD.
 * The backend defaults the limit to 5 and allows values from 1 to 20.
 */
export function useFacebookPostTopTopics(
  facebookPageId: string,
  postId: string,
  params: FacebookPostTopTopicsParams = {},
  enabled = true,
) {
  const normalizedPageId = facebookPageId.trim()
  const normalizedPostId = postId.trim()

  const normalizedParams: FacebookPostTopTopicsParams = {
    startDate: params.startDate?.trim() || undefined,
    endDate: params.endDate?.trim() || undefined,
    limit: params.limit,
  }

  return useQuery({
    queryKey: facebookCommentKeys.topics(
      normalizedPageId,
      normalizedPostId,
      normalizedParams,
    ),

    queryFn: () =>
      facebookCommentService.getTopTopics(
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