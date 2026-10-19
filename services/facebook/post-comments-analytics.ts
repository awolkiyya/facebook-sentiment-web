
import { api } from "@/lib/api/api"

import type {
  CommentsQueryParams,
  FacebookComment,
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
  params: CommentsQueryParams,
): URLSearchParams {
  const query = new URLSearchParams()

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

  if (params.sortBy) {
    query.set("sort_by", params.sortBy)
  }

  if (params.startDate) {
    query.set("start_date", params.startDate)
  }

  if (params.endDate) {
    query.set("end_date", params.endDate)
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
/* Response Normalization                                                     */
/* -------------------------------------------------------------------------- */

function normalizePaginatedCommentsResponse(
  response: unknown,
): PaginatedCommentsResponse {
  const payload = response as {
    data?:
      | FacebookComment[]
      | {
          data?: FacebookComment[]
        }
    meta?: {
      current_page?: number
      per_page?: number
      total?: number
      last_page?: number
      pagination?: {
        current_page?: number
        per_page?: number
        total?: number
        last_page?: number
      }
    }
    current_page?: number
    per_page?: number
    total?: number
    last_page?: number
  }

  const nested = Array.isArray(payload.data)
    ? payload.data
    : payload.data?.data ?? []

  const pagination = payload.meta?.pagination ?? payload.meta

  const currentPage = Number(
    pagination?.current_page ?? payload.current_page ?? 1,
  )

  const perPage = Number(
    pagination?.per_page ?? payload.per_page ?? nested.length,
  )

  const total = Number(
    pagination?.total ?? payload.total ?? nested.length,
  )

  const lastPage = Number(
    pagination?.last_page ??
      payload.last_page ??
      Math.max(1, Math.ceil(total / Math.max(perPage, 1))),
  )

  return {
    data: nested,
    meta: {
      currentPage,
      perPage,
      total,
      lastPage,
      hasMorePages: currentPage < lastPage,
    },
  }
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
    params: CommentsQueryParams = {},
  ): Promise<PaginatedCommentsResponse> {
    try {
      const path = getPostCommentsPath(
        facebookPageId,
        facebookPostId,
      )

      const query = buildQueryParams(params).toString()

      const response = await api.get(
        query ? `${path}?${query}` : path,
      )

      return normalizePaginatedCommentsResponse(response.data)
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
