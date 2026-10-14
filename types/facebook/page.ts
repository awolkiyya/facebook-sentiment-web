import type { LanguageCode } from "./common"

export type FacebookPageMonitoringStatus =
  | "monitoring"
  | "not_monitoring"

export type FacebookPageSyncStatus =
  | "pending"
  | "synced"
  | "stale"

export type FacebookPageConnectionStatus =
  | "connected"

export interface FacebookPageCategory {
  id?: string
  name?: string
}

export interface FacebookPage {
  /**
   * Internal Laravel UUID.
   */
  id: string

  /**
   * External Meta/Facebook Page ID.
   */
  facebook_page_id: string

  name: string

  category: string | null

  category_list: FacebookPageCategory[]

  followers_count: number | null

  is_active: boolean

  monitoring: {
    enabled: boolean
    status: FacebookPageMonitoringStatus
  }

  sync: {
    last_synced_at: string | null
    status: FacebookPageSyncStatus
  }

  connection: {
    status: FacebookPageConnectionStatus
    page_access_token_expires_at: string | null
  }

  created_at: string | null
  updated_at: string | null
}

/**
 * Summary information for one Facebook page
 * used by page-level UI components.
 *
 * This is different from FacebookPagesSummary,
 * which represents aggregate statistics for all pages.
 */
export interface FacebookPageSummary {
  /**
   * Internal Laravel UUID.
   */
  id: string

  /**
   * External Meta/Facebook Page ID.
   */
  facebookPageId: string

  name: string

  category: string

  followers: number

  isActive: boolean
}

/**
 * Aggregate summary for all connected Facebook pages.
 */
export interface FacebookPagesSummary {
  total: number
  monitoring: number
}

export interface FacebookPagesResponse {
  success: boolean

  data: {
    pages: FacebookPage[]
    summary: FacebookPagesSummary
  }

  message?: string
}

export interface FacebookPageResponse {
  success: boolean
  message: string
  data: FacebookPage
}

export interface FacebookPageDisconnectResponse {
  success: boolean

  message: string

  data: {
    id: string
    facebook_page_id: string
  }
}