/**
 * FACEBOOK POST SERVICE
 */

import { api } from "@/lib/api/api"
import { PaginatedResponse, SingleResponse } from "@/types/api"

import type {
  FacebookPost,
  FacebookPostsQueryParams,
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
  ): Promise<PaginatedResponse<FacebookPost>> => {
    const response = await api.get<PaginatedResponse<FacebookPost>>(
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
  ): Promise<SingleResponse<FacebookPost>> => {
    const response =
      await api.post<SingleResponse<FacebookPost>>(
        `/v1/facebook/pages/${facebookPageId}/posts/sync`
      )

    return response.data
  },

  /**
   * Get a single saved Facebook post by ID.
   *
   * GET /v1/facebook/pages/{facebookPageId}/posts/{postId}
   */
  getPostById: async (
    facebookPageId: string,
    postId: string,
  ): Promise<SingleResponse<FacebookPost>> => {
    const response = await api.get<SingleResponse<FacebookPost>>(
      `/v1/facebook/pages/${facebookPageId}/posts/${postId}`,
    )

    return response.data
  },
}