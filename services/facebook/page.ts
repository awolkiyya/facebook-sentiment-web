/**
 * FACEBOOK PAGE SERVICE
 */

import { api } from "@/lib/api/api"

import type {
  FacebookPageDisconnectResponse,
  FacebookPageResponse,
  FacebookPagesResponse,
} from "@/types/facebook/page"

export const facebookPageService = {
  /**
   * Get all Facebook Pages connected
   * to the authenticated user.
   */
  getPages: async (): Promise<FacebookPagesResponse> => {
    const response = await api.get<FacebookPagesResponse>(
      "/v1/facebook/pages"
    )

    return response.data
  },

  /**
   * Enable or disable monitoring for a Facebook Page.
   *
   * facebookPageId = external Meta/Facebook Page ID.
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
    )

    return response.data
  },

  /**
   * Synchronize Facebook Page metadata.
   */
  syncPage: async (
    facebookPageId: string
  ): Promise<FacebookPageResponse> => {
    const response = await api.post<FacebookPageResponse>(
      `/v1/facebook/pages/${facebookPageId}/sync`
    )

    return response.data
  },

  /**
   * Disconnect a Facebook Page.
   */
  disconnect: async (
    facebookPageId: string
  ): Promise<FacebookPageDisconnectResponse> => {
    const response =
      await api.delete<FacebookPageDisconnectResponse>(
        `/v1/facebook/pages/${facebookPageId}`
      )

    return response.data
  },
}