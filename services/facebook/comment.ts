/**
 * FACEBOOK COMMENT SERVICE
 */

import { api } from "@/lib/api/api"

import type {
  FacebookCommentsQueryParams,
  FacebookCommentsResponse,
  FacebookCommentsSyncResponse,
} from "@/types/facebook/comment"

export const facebookCommentService = {
  /**
   * Get saved comments for a Facebook post.
   *
   * facebookPageId = external Meta/Facebook Page ID.
   *
   * facebookPostId = internal Laravel FacebookPost UUID.
   */
  getComments: async (
    facebookPageId: string,
    facebookPostId: string,
    params?: FacebookCommentsQueryParams
  ): Promise<FacebookCommentsResponse> => {
    const response =
      await api.get<FacebookCommentsResponse>(
        `/v1/facebook/pages/${facebookPageId}/posts/${facebookPostId}/comments`,
        {
          params,
        }
      )

    return response.data
  },

  /**
   * Synchronize comments for a Facebook post from Meta.
   *
   * facebookPageId = external Meta/Facebook Page ID.
   *
   * facebookPostId = internal Laravel FacebookPost UUID.
   */
  syncComments: async (
    facebookPageId: string,
    facebookPostId: string
  ): Promise<FacebookCommentsSyncResponse> => {
    const response =
      await api.post<FacebookCommentsSyncResponse>(
        `/v1/facebook/pages/${facebookPageId}/posts/${facebookPostId}/comments/sync`
      )

    return response.data
  },
}