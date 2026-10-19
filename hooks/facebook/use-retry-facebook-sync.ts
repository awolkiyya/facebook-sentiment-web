
"use client"

import { useQuery } from "@tanstack/react-query"

import { facebookSyncService } from "@/services/facebook-sync.service"
import { facebookSyncKeys } from "./use-facebook-sync-runs"

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const SYNC_POLL_INTERVAL_MS = 3_000

const TERMINAL_SYNC_STATUSES = new Set([
  "completed",
  "failed",
  "cancelled",
])

/*
|--------------------------------------------------------------------------
| Fetch Synchronization Run Details
|--------------------------------------------------------------------------
*/

export function useFacebookSyncRun(
  runId: string | undefined,
) {
  const normalizedRunId = runId?.trim() || undefined

  return useQuery({
    queryKey: normalizedRunId
      ? facebookSyncKeys.detail(normalizedRunId)
      : ["facebook-sync", "detail", "disabled"],

    queryFn: () => {
      if (!normalizedRunId) {
        throw new Error(
          "Synchronization run ID is required.",
        )
      }

      return facebookSyncService.get(normalizedRunId)
    },

    enabled: Boolean(normalizedRunId),

    /*
     * Poll while the synchronization run is active.
     * Stop polling after it reaches a terminal state.
     */
    refetchInterval: (query) => {
      const status = query.state.data?.status

      if (
        status &&
        TERMINAL_SYNC_STATUSES.has(status)
      ) {
        return false
      }

      return SYNC_POLL_INTERVAL_MS
    },

    /*
     * Retry transient request failures twice.
     */
    retry: 2,

    /*
     * Retain the previous detail while refreshing.
     */
    placeholderData: (previousData) => previousData,

    staleTime: 1_000,
  })
}
