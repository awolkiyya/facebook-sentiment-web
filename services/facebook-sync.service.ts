import { api } from "@/lib/api/api"

import type {
  PaginatedResponse,
  SingleResponse,
} from "@/types/api"

import type {
  FacebookSyncRun,
  FacebookSyncRunDetail,
  SyncStatus,
  SyncTrigger,
  SyncType,
} from "../types/facebook-sync.types"

export interface SyncRunFilters {
  facebookPageId?: string
  status?: SyncStatus | "all"
  type?: SyncType | "all"
  trigger?: SyncTrigger | "all"
  page?: number
  perPage?: number
}

export const facebookSyncService = {
  /**
   * Get paginated synchronization runs.
   *
   * GET /v1/sync-runs
   */
  list: async (
    filters: SyncRunFilters = {},
  ): Promise<PaginatedResponse<FacebookSyncRun>> => {
    const params: Record<string, string | number> = {
      page: filters.page ?? 1,
      per_page: filters.perPage ?? 10,
    }

    if (filters.facebookPageId?.trim()) {
      params.facebook_page_id =
        filters.facebookPageId.trim()
    }

    if (
      filters.status &&
      filters.status !== "all"
    ) {
      params.status = filters.status
    }

    if (
      filters.type &&
      filters.type !== "all"
    ) {
      params.type = filters.type
    }

    if (
      filters.trigger &&
      filters.trigger !== "all"
    ) {
      params.trigger = filters.trigger
    }

    const response =
      await api.get<
        PaginatedResponse<FacebookSyncRun>
      >(
        "/v1/sync-runs",
        {
          params,
        },
      )

    return response.data
  },

  /**
   * Get synchronization run details.
   *
   * GET /v1/sync-runs/{id}
   */
  get: async (
    runId: string,
  ): Promise<FacebookSyncRunDetail> => {
    const normalizedRunId = runId.trim()

    if (!normalizedRunId) {
      throw new Error(
        "Synchronization run ID cannot be empty.",
      )
    }

    const response =
      await api.get<
        SingleResponse<FacebookSyncRunDetail>
      >(
        `/v1/sync-runs/${encodeURIComponent(normalizedRunId)}`,
      )

    return response.data.data
  },

  /**
   * Retry a failed or cancelled synchronization run.
   *
   * POST /v1/sync-runs/{id}/retry
   *
   * The backend is responsible for validating whether the
   * synchronization run is eligible for retry and for creating
   * or dispatching the appropriate synchronization work.
   */
  retry: async (
    runId: string,
  ): Promise<FacebookSyncRunDetail> => {
    const normalizedRunId = runId.trim()

    if (!normalizedRunId) {
      throw new Error(
        "Synchronization run ID cannot be empty.",
      )
    }

    const response =
      await api.post<
        SingleResponse<FacebookSyncRunDetail>
      >(
        `/v1/sync-runs/${encodeURIComponent(normalizedRunId)}/retry`,
      )

    return response.data.data
  },

  /**
   * Cancel a queued or running synchronization run.
   *
   * POST /v1/sync-runs/{id}/cancel
   *
   * The backend is responsible for validating whether the
   * synchronization run can be cancelled and for changing
   * its lifecycle status to "cancelled".
   *
   * Cancellation is cooperative for work that has already
   * started. Queue jobs should check the synchronization
   * run status before continuing expensive processing.
   */
  cancel: async (
    runId: string,
  ): Promise<FacebookSyncRunDetail> => {
    const normalizedRunId = runId.trim()

    if (!normalizedRunId) {
      throw new Error(
        "Synchronization run ID cannot be empty.",
      )
    }

    const response =
      await api.post<
        SingleResponse<FacebookSyncRunDetail>
      >(
        `/v1/sync-runs/${encodeURIComponent(normalizedRunId)}/cancel`,
      )

    return response.data.data
  },
}