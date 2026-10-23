
import { api } from "@/lib/api/api"
import { PaginatedResponse } from "@/types/api"
import { FacebookComment, FacebookPostCommentsParams } from "@/types/facebook/comment"

import type {
  CommentsQueryParams,
  PaginatedCommentsResponse,
  PostCommentsAnalytics,
  PostCommentsAnalyticsResponse,
  SyncCommentsResult,
} from "@/types/facebook/post-comments-analytics"

/* -------------------------------------------------------------------------- */
/* Routes                                                                     */
/* -------------------------------------------------------------------------- */

const FACEBOOK_PAGES_BASE = "/v1/facebook/pages"

function encodePathSegment(value: string): string {
  return encodeURIComponent(value)
}

function getPostCommentsPath(
  facebookPageId: string,
  facebookPostId: string,
): string {
  return [
    FACEBOOK_PAGES_BASE,
    encodePathSegment(facebookPageId),
    "posts",
    encodePathSegment(facebookPostId),
    "comments",
  ].join("/")
}


/* -------------------------------------------------------------------------- */
/* Query Parameters                                                           */
/* -------------------------------------------------------------------------- */

function buildQueryParams(
  params: FacebookPostCommentsParams,
): URLSearchParams {
  const query = new URLSearchParams()

  const startDate = params.startDate?.trim()
  const endDate = params.endDate?.trim()

  const isValidDate = (value: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false
    }

    const date = new Date(`${value}T00:00:00.000Z`)

    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    )
  }

  if (startDate && !isValidDate(startDate)) {
    throw new Error("Invalid start date. Expected YYYY-MM-DD.")
  }

  if (endDate && !isValidDate(endDate)) {
    throw new Error("Invalid end date. Expected YYYY-MM-DD.")
  }

  if (startDate && endDate && startDate > endDate) {
    throw new Error("End date must be on or after start date.")
  }

  if (params.page !== undefined) {
    query.set("page", String(params.page))
  }

  if (params.perPage !== undefined) {
    query.set("per_page", String(params.perPage))
  }

  if (params.search?.trim()) {
    query.set("search", params.search.trim())
  }

  if (params.sentiment) {
    query.set("sentiment", params.sentiment)
  }

  if (params.language) {
    query.set("language", params.language)
  }

  if (params.analysisStatus) {
    query.set("analysis_status", params.analysisStatus)
  }

  if (params.commenter) {
    query.set("commenter", params.commenter)
  }

  if (params.sortBy) {
    query.set("sort_by", params.sortBy)
  }

  if (startDate) {
    query.set("start_date", startDate)
  }

  if (endDate) {
    query.set("end_date", endDate)
  }

  return query
}

/* -------------------------------------------------------------------------- */
/* Error Handling                                                             */
/* -------------------------------------------------------------------------- */

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const candidate = error as {
      response?: {
        data?: {
          message?: string
          error?: string
        }
      }
      message?: string
    }

    return (
      candidate.response?.data?.message ??
      candidate.response?.data?.error ??
      candidate.message ??
      "An unexpected error occurred while communicating with the API."
    )
  }

  return "An unexpected error occurred while communicating with the API."
}



/* -------------------------------------------------------------------------- */
/* Service                                                                    */
/* -------------------------------------------------------------------------- */

export const postCommentsAnalyticsService = {
  /**
   * Retrieve saved comments for a specific Facebook post.
   *
   * facebookPageId:
   *   External Meta/Facebook Page ID.
   *
   * facebookPostId:
   *   Internal Laravel FacebookPost UUID.
   */
  async getComments(
    facebookPageId: string,
    facebookPostId: string,
    params: FacebookPostCommentsParams = {},
  ): Promise<PaginatedResponse<FacebookComment>> {
    try {
      const path = getPostCommentsPath(
        facebookPageId,
        facebookPostId,
      )

      const query = buildQueryParams(params).toString()

      const response = await api.get(
        query ? `${path}?${query}` : path,
      )

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  /**
   * Retrieve comment analytics.
   *
   * IMPORTANT:
   * This assumes Laravel registers:
   * GET /{facebookPageId}/posts/{facebookPostId}/comments/analytics
   */
  async getAnalytics(
    facebookPageId: string,
    facebookPostId: string,
  ): Promise<PostCommentsAnalytics> {
    try {
      const path = `${getPostCommentsPath(
        facebookPageId,
        facebookPostId,
      )}/analytics`

      const response =
        await api.get<PostCommentsAnalyticsResponse>(path)

      return response.data.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  /**
   * Retrieve comment topics.
   *
   * IMPORTANT:
   * This assumes Laravel registers:
   * GET /{facebookPageId}/posts/{facebookPostId}/comments/topics
   */
  async getTopics(
    facebookPageId: string,
    facebookPostId: string,
  ): Promise<PostCommentsAnalytics["topics"]> {
    try {
      const path = `${getPostCommentsPath(
        facebookPageId,
        facebookPostId,
      )}/topics`

      const response = await api.get<{
        data: PostCommentsAnalytics["topics"]
      }>(path)

      return response.data.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  /**
   * Synchronize comments from Meta through Laravel.
   *
   * Expected route:
   * POST /{facebookPageId}/posts/{facebookPostId}/comments/sync
   */
  async syncComments(
    facebookPageId: string,
    facebookPostId: string,
  ): Promise<SyncCommentsResult> {
    try {
      const path = `${getPostCommentsPath(
        facebookPageId,
        facebookPostId,
      )}/sync`

      const response = await api.post<
        { data?: SyncCommentsResult } | SyncCommentsResult
      >(path)

      const payload = response.data

      if ("data" in payload && payload.data) {
        return payload.data
      }

      return payload as SyncCommentsResult
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },
}

export { getErrorMessage }
