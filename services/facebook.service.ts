/**
 * facebookService
 *
 * FACEBOOK / META INTEGRATION API
 *
 * Purpose:
 *
 *     Provides the frontend API layer for Facebook / Meta
 *     Page connection, monitoring, synchronization, posts,
 *     and comments.
 *
 * Backend:
 *
 *     Laravel API
 *
 * IMPORTANT:
 *
 *     `facebookPageId` means the Meta/Facebook Page ID:
 *
 *         facebook_pages.facebook_page_id
 *
 *     It does NOT mean the internal Laravel UUID:
 *
 *         facebook_pages.id
 *
 * Endpoints:
 *
 *     GET    /api/v1/facebook/pages
 *     PATCH  /api/v1/facebook/pages/{facebookPageId}/monitoring
 *     POST   /api/v1/facebook/pages/{facebookPageId}/sync
 *     DELETE /api/v1/facebook/pages/{facebookPageId}
 *
 *     GET    /api/v1/facebook/pages/{facebookPageId}/posts
 *     POST   /api/v1/facebook/pages/{facebookPageId}/posts/sync
 *
 *     GET    /api/v1/facebook/pages/{facebookPageId}/posts/{facebookPostId}/comments
 *     POST   /api/v1/facebook/pages/{facebookPageId}/posts/{facebookPostId}/comments/sync
 *
 * OAuth:
 *
 *     GET /api/v1/facebook/auth/redirect
 */

import { api } from "@/lib/api/api";
import { FacebookPostCommentsParams, FacebookCommentsResponse, FacebookCommentsSyncResponse } from "@/types/facebook/comment";
import { FacebookPageDisconnectResponse, FacebookPageResponse, FacebookPagesResponse } from "@/types/facebook/page";
import { FacebookPostsQueryParams, FacebookPostsResponse, FacebookPostsSyncResponse } from "@/types/facebook/post";



/*
|--------------------------------------------------------------------------
| FACEBOOK SERVICE
|--------------------------------------------------------------------------
*/

export const facebookService = {
  /*
  |--------------------------------------------------------------------------
  | OAUTH
  |--------------------------------------------------------------------------
  */

  /**
   * Start Facebook OAuth authorization.
   *
   * Laravel redirects the browser to Meta's OAuth page.
   */
  connect: (): void => {
    window.location.href = "/api/v1/facebook/auth/redirect";
  },

  /*
  |--------------------------------------------------------------------------
  | PAGES
  |--------------------------------------------------------------------------
  */

  /**
   * Get all Facebook Pages connected
   * to the authenticated user.
   */
  getPages: async (): Promise<FacebookPagesResponse> => {
    const response = await api.get<FacebookPagesResponse>(
      "/v1/facebook/pages"
    );

    return response.data;
  },

  /**
   * Enable or disable monitoring
   * for a Facebook Page.
   *
   * IMPORTANT:
   *
   *     facebookPageId must be the Meta/Facebook Page ID:
   *
   *         facebook_pages.facebook_page_id
   */
  updateMonitoring: async (
    facebookPageId: string,
    isActive: boolean
  ): Promise<FacebookPageResponse> => {
    const response = await api.patch<FacebookPageResponse>(
      `/v1/facebook/pages/${facebookPageId}/monitoring`,
      {
        is_active: isActive,
      }
    );

    return response.data;
  },

  /**
   * Synchronize Facebook Page metadata.
   *
   * This can refresh:
   *
   *     name
   *     category
   *     category_list
   *     followers_count
   *     last_synced_at
   *
   * IMPORTANT:
   *
   *     facebookPageId must be the Meta/Facebook Page ID.
   */
  syncPage: async (
    facebookPageId: string
  ): Promise<FacebookPageResponse> => {
    const response = await api.post<FacebookPageResponse>(
      `/v1/facebook/pages/${facebookPageId}/sync`
    );

    return response.data;
  },

  /**
   * Disconnect a Facebook Page
   * from the authenticated user.
   *
   * IMPORTANT:
   *
   *     facebookPageId must be the Meta/Facebook Page ID.
   */
  disconnect: async (
    facebookPageId: string
  ): Promise<FacebookPageDisconnectResponse> => {
    const response =
      await api.delete<FacebookPageDisconnectResponse>(
        `/v1/facebook/pages/${facebookPageId}`
      );

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | POSTS
  |--------------------------------------------------------------------------
  */

  /**
   * Get saved Facebook Page posts.
   *
   * Posts are retrieved from the Laravel database.
   *
   * Supports pagination.
   *
   * Example:
   *
   *     GET /v1/facebook/pages/{facebookPageId}/posts
   *
   *     ?per_page=20
   *
   *     &page=1
   *
   * IMPORTANT:
   *
   *     facebookPageId must be:
   *
   *         facebook_pages.facebook_page_id
   *
   *     NOT:
   *
   *         facebook_pages.id
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
    );

    return response.data;
  },

  /**
   * Synchronize Facebook Page posts from Meta.
   *
   * Laravel internally calls:
   *
   *     FacebookPostSyncService
   *
   * The response contains the local post IDs
   * that require downstream comment synchronization.
   *
   * IMPORTANT:
   *
   *     facebookPageId must be the Meta/Facebook Page ID.
   */
  syncPosts: async (
    facebookPageId: string
  ): Promise<FacebookPostsSyncResponse> => {
    const response =
      await api.post<FacebookPostsSyncResponse>(
        `/v1/facebook/pages/${facebookPageId}/posts/sync`
      );

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | COMMENTS
  |--------------------------------------------------------------------------
  */

  /**
   * Get saved comments for a Facebook post.
   *
   * Comments are retrieved from the Laravel database.
   *
   * Supports pagination.
   *
   * IMPORTANT:
   *
   *     facebookPageId = Meta/Facebook Page ID
   *
   *     facebookPostId = LOCAL Laravel FacebookPost UUID
   *
   * The backend route is:
   *
   *     GET /v1/facebook/pages/{facebookPageId}/posts/{facebookPostId}/comments
   *
   * Example:
   *
   *     GET /v1/facebook/pages/100297668388012/posts/{local-post-uuid}/comments
   *
   *     ?per_page=20
   *
   *     &page=1
   */
  getComments: async (
    facebookPageId: string,
    facebookPostId: string,
    params?: FacebookPostCommentsParams
  ): Promise<FacebookCommentsResponse> => {
    const response =
      await api.get<FacebookCommentsResponse>(
        `/v1/facebook/pages/${facebookPageId}/posts/${facebookPostId}/comments`,
        {
          params,
        }
      );

    return response.data;
  },

  /**
   * Synchronize Facebook post comments from Meta.
   *
   * Laravel internally calls:
   *
   *     FacebookCommentSyncService
   *
   * IMPORTANT:
   *
   *     facebookPageId = Meta/Facebook Page ID
   *
   *     facebookPostId = LOCAL Laravel FacebookPost UUID
   *
   * The backend uses the local FacebookPost record
   * to obtain the external Meta post ID before calling:
   *
   *     /{facebook_post_id}/comments
   *
   * Backend endpoint:
   *
   *     POST /v1/facebook/pages/{facebookPageId}/posts/{facebookPostId}/comments/sync
   */
  syncComments: async (
    facebookPageId: string,
    facebookPostId: string
  ): Promise<FacebookCommentsSyncResponse> => {
    const response =
      await api.post<FacebookCommentsSyncResponse>(
        `/v1/facebook/pages/${facebookPageId}/posts/${facebookPostId}/comments/sync`
      );

    return response.data;
  },
};