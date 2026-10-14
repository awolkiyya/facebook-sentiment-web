/**
 * FACEBOOK POST SERVICE
 */

import { api } from "@/lib/api/api"

import type {
  FacebookPostsQueryParams,
  FacebookPostsResponse,
  FacebookPostsSyncResponse,
} from "@/types/facebook/post"

export const facebookPostService = {
  /**
   * Get saved Facebook Page posts.
   *
   * facebookPageId = external Meta/Facebook Page ID.
   */
  getPosts: async (
    facebookPageId: string,
    params?: FacebookPostsQueryParams
  ): Promise<FacebookPostsResponse> => {
    const response = await api.get<FacebookPostsResponse>(
      `/v1/facebook/pages/${facebookPageId}/posts`,
      {
        params,
      }
    )

    return response.data
  },

  /**
   * Synchronize Facebook Page posts from Meta.
   */
  syncPosts: async (
    facebookPageId: string
  ): Promise<FacebookPostsSyncResponse> => {
    const response =
      await api.post<FacebookPostsSyncResponse>(
        `/v1/facebook/pages/${facebookPageId}/posts/sync`
      )

    return response.data
  },
}