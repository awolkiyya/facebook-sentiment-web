/**
 * FACEBOOK COMMENT SERVICE
 */

import { api } from "@/lib/api/api"

import type {
  FacebookCommentsQueryParams,
  FacebookCommentsResponse,
  FacebookCommentsSyncResponse,
  FacebookPostCommentInsightsResponse,
} from "@/types/facebook/comment"

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const DEFAULT_QUERY_PARAMS: Required<FacebookCommentsQueryParams> = {
  page: 1,
  perPage: 100,
  sortBy: "newest",
  search: "",
  sentiment: "negative",
  language: "am",
  analysisStatus: "pending",
  startDate: "",
  endDate: "",
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
    params?: FacebookCommentsQueryParams,
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
}

/* -------------------------------------------------------------------------- */
/* Comment Insights Types                                                     */
/* -------------------------------------------------------------------------- */

export interface FacebookPostCommentInsightsParams {
  startDate?: string
  endDate?: string
}
