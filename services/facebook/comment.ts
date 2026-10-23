
/**
 * FACEBOOK COMMENT SERVICE
 */

import { api } from "@/lib/api/api"
import { SingleResponse } from "@/types/api"

import type {
  FacebookCommentsResponse,
  FacebookCommentsSyncResponse,
  FacebookPostCommentInsightsParams,
  FacebookPostCommentInsightsResponse,
  FacebookPostCommentsParams,
  FacebookPostSentimentOverview,
  FacebookPostSentimentOverviewParams,
  FacebookPostTopTopics,
  FacebookPostTopTopicsParams,
} from "@/types/facebook/comment"

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const DEFAULT_QUERY_PARAMS: Required<FacebookPostCommentsParams> = {
  page: 1,
  perPage: 100,
  sortBy: "newest",
  search: "",
  sentiment: "negative",
  language: "am",
  analysisStatus: "pending",
  startDate: "",
  endDate: "",
  commenter: "all"
}

/* -------------------------------------------------------------------------- */
/* Service                                                                    */
/* -------------------------------------------------------------------------- */

export const facebookCommentService = {
  /**
   * Retrieve saved comments for a Facebook post.
   *
   * facebookPageId:
   *   External Meta/Facebook Page ID.
   *
   * facebookPostId:
   *   Internal Laravel FacebookPost UUID.
   *
   * GET /v1/facebook/pages/{facebookPageId}/posts/{facebookPostId}/comments
   */
  getComments: async (
    facebookPageId: string,
    facebookPostId: string,
    params?: FacebookPostCommentsParams,
  ): Promise<FacebookCommentsResponse> => {
    const pageId = encodeURIComponent(facebookPageId)
    const postId = encodeURIComponent(facebookPostId)

    const response = await api.get<FacebookCommentsResponse>(
      `/v1/facebook/pages/${pageId}/posts/${postId}/comments`,
      {
        params: {
          ...DEFAULT_QUERY_PARAMS,
          ...params,
        },
      },
    )

    return response.data
  },

  /**
   * Retrieve the most-liked positive and negative top-level comments
   * for a specific Facebook post.
   *
   * Reads persisted sentiment analysis from the Laravel API.
   * Does not synchronize comments or trigger AI analysis.
   *
   * Optional date filters use YYYY-MM-DD.
   *
   * GET /v1/facebook/pages/{facebookPageId}/posts/{facebookPostId}/comments/insights
   */
  getCommentInsights: async (
    facebookPageId: string,
    facebookPostId: string,
    params?: FacebookPostCommentInsightsParams,
  ): Promise<FacebookPostCommentInsightsResponse> => {
    const pageId = encodeURIComponent(facebookPageId)
    const postId = encodeURIComponent(facebookPostId)

    const response =
      await api.get<FacebookPostCommentInsightsResponse>(
        `/v1/facebook/pages/${pageId}/posts/${postId}/comments/insights`,
        {
          params: {
            ...(params?.startDate
              ? { start_date: params.startDate }
              : {}),
            ...(params?.endDate
              ? { end_date: params.endDate }
              : {}),
          },
        },
      )

    return response.data
  },

  /**
   * Retrieve overall sentiment, sentiment distribution, and daily
   * sentiment timeline for a Facebook post.
   *
   * Reads persisted sentiment analysis from the Laravel API.
   * Does not synchronize comments or trigger AI analysis.
   *
   * Optional date filters use YYYY-MM-DD.
   * If both dates are omitted, the backend applies its default range.
   *
   * GET /v1/facebook/pages/{facebookPageId}/posts/{facebookPostId}/comments/sentiment-overview
   */
  getSentimentOverview: async (
    facebookPageId: string,
    facebookPostId: string,
    params?: FacebookPostSentimentOverviewParams,
  ): Promise<SingleResponse<FacebookPostSentimentOverview>> => {
    const pageId = encodeURIComponent(facebookPageId)
    const postId = encodeURIComponent(facebookPostId)

    const response =
      await api.get<SingleResponse<FacebookPostSentimentOverview>>(
        `/v1/facebook/pages/${pageId}/posts/${postId}/comments/sentiment-overview`,
        {
          params: {
            ...(params?.startDate
              ? { start_date: params.startDate }
              : {}),
            ...(params?.endDate
              ? { end_date: params.endDate }
              : {}),
          },
        },
      )

    return response.data
  },

  /**
   * Synchronize comments for a Facebook post from Meta.
   *
   * POST /v1/facebook/pages/{facebookPageId}/posts/{facebookPostId}/comments/sync
   */
  syncComments: async (
    facebookPageId: string,
    facebookPostId: string,
  ): Promise<FacebookCommentsSyncResponse> => {
    const pageId = encodeURIComponent(facebookPageId)
    const postId = encodeURIComponent(facebookPostId)

    const response = await api.post<FacebookCommentsSyncResponse>(
      `/v1/facebook/pages/${pageId}/posts/${postId}/comments/sync`,
    )

    return response.data
  },


  /**
 * Retrieve the most common analyzed topics for a Facebook post.
 *
 * Reads persisted sentiment analysis from the Laravel API.
 * Does not synchronize comments or trigger AI analysis.
 *
 * Optional date filters use YYYY-MM-DD.
 * Limit defaults to 5 and must be between 1 and 20.
 *
 * GET /v1/facebook/pages/{facebookPageId}/posts/{facebookPostId}/comments/top-topics
 */
getTopTopics: async (
  facebookPageId: string,
  facebookPostId: string,
  params?: FacebookPostTopTopicsParams,
): Promise<SingleResponse<FacebookPostTopTopics>> => {
  const pageId = encodeURIComponent(facebookPageId)
  const postId = encodeURIComponent(facebookPostId)

  const response = await api.get<
    SingleResponse<FacebookPostTopTopics>
  >(
    `/v1/facebook/pages/${pageId}/posts/${postId}/comments/top-topics`,
    {
      params: {
        ...(params?.startDate
          ? { start_date: params.startDate }
          : {}),
        ...(params?.endDate
          ? { end_date: params.endDate }
          : {}),
        ...(params?.limit !== undefined
          ? { limit: params.limit }
          : {}),
      },
    },
  )

  return response.data
},

  
}
