import { useQuery } from "@tanstack/react-query"

import { facebookSyncKeys } from "./use-facebook-sync-runs"
import { facebookSyncApi } from "@/services/facebook-sync.service"

export function useFacebookSyncRun(
  runId: string | undefined,
) {
  return useQuery({
    queryKey: runId
      ? facebookSyncKeys.detail(runId)
      : ["facebook-sync", "detail", "disabled"],

    queryFn: () => {
      if (!runId) {
        throw new Error("Synchronization run ID is required.")
      }

      return facebookSyncApi.get(runId)
    },

    enabled: Boolean(runId),

    /*
     * Sync runs change while queue workers are processing them.
     *
     * Poll while the run is active so the UI can automatically move:
     *
     * queued → running → completed / failed
     */
    refetchInterval: (query) => {
      const status = query.state.data?.status

      if (
        status === "completed" ||
        status === "failed"
      ) {
        return false
      }

      return 3000
    },

    /*
     * Don't aggressively refetch failed requests.
     */
    retry: 2,

    /*
     * Keep the previous detail visible while React Query
     * is fetching the latest state.
     */
    placeholderData: (previousData) => previousData,

    staleTime: 1000,
  })
}