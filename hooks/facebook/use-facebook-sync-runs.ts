import {
  facebookSyncService,
  type SyncRunFilters,
} from "@/services/facebook-sync.service"
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

export const facebookSyncKeys = {
  all: ["facebook-sync-runs"] as const,

  lists: () => [...facebookSyncKeys.all, "list"] as const,

  list: (filters: SyncRunFilters) =>
    [...facebookSyncKeys.lists(), filters] as const,

  details: () => [...facebookSyncKeys.all, "detail"] as const,

  detail: (id: string) =>
    [...facebookSyncKeys.details(), id] as const,
}

export function useFacebookSyncRuns(filters: SyncRunFilters) {
  return useQuery({
    queryKey: facebookSyncKeys.list(filters),
    queryFn: () => facebookSyncService.list(filters),

    staleTime: 5_000,

    refetchInterval: (query) => {
      const runs = query.state.data?.data ?? []

      // Poll more frequently while at least one synchronization
      // run is queued or running.
      return runs.some(
        (run) =>
          run.status === "queued" ||
          run.status === "running",
      )
        ? 5_000
        : false
    },

    refetchIntervalInBackground: false,

    refetchOnWindowFocus: true,
  })
}

export function useFacebookSyncRun(id: string | null) {
  return useQuery({
    queryKey: facebookSyncKeys.detail(id ?? ""),

    queryFn: () => {
      if (!id) {
        throw new Error("Synchronization run ID is required.")
      }

      return facebookSyncService.get(id)
    },

    enabled: Boolean(id),

    staleTime: 2_000,

    refetchInterval: (query) => {
      const status = query.state.data?.status

      // Continue polling while this synchronization run
      // is still being processed.
      return status === "queued" ||
        status === "running"
        ? 3_000
        : false
    },

    refetchIntervalInBackground: false,

    refetchOnWindowFocus: true,
  })
}

/**
 * Retry a failed or cancelled synchronization run.
 *
 * After retry succeeds:
 * - update the specific detail cache
 * - invalidate all sync-run list queries
 * - refresh the specific detail query
 */
export function useRetryFacebookSyncRun() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (runId: string) => {
      const normalizedRunId = runId.trim()

      if (!normalizedRunId) {
        throw new Error(
          "Synchronization run ID cannot be empty.",
        )
      }

      return facebookSyncService.retry(normalizedRunId)
    },

    onSuccess: async (run, runId) => {
      const normalizedRunId = runId.trim()

      // Update the detail cache immediately when the API
      // returns the retried run.
      if (run) {
        queryClient.setQueryData(
          facebookSyncKeys.detail(normalizedRunId),
          run,
        )

        // If the backend returns a different/new run ID,
        // also cache that returned run.
        if (run.id && run.id !== normalizedRunId) {
          queryClient.setQueryData(
            facebookSyncKeys.detail(run.id),
            run,
          )
        }
      }

      // The retry may create/change the run's list representation,
      // so refresh all list queries.
      await queryClient.invalidateQueries({
        queryKey: facebookSyncKeys.lists(),
      })

      // Refresh the original detail query as well.
      await queryClient.invalidateQueries({
        queryKey: facebookSyncKeys.detail(normalizedRunId),
      })

      // If retry returned a new run, refresh its detail too.
      if (run?.id && run.id !== normalizedRunId) {
        await queryClient.invalidateQueries({
          queryKey: facebookSyncKeys.detail(run.id),
        })
      }
    },
  })
}

/**
 * Cancel a queued or running synchronization run.
 *
 * After cancellation succeeds:
 * - immediately update the detail cache
 * - invalidate all sync-run list queries
 * - refresh the cancelled run's detail
 * - polling will automatically stop once status becomes "cancelled"
 */
export function useCancelFacebookSyncRun() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (runId: string) => {
      const normalizedRunId = runId.trim()

      if (!normalizedRunId) {
        throw new Error(
          "Synchronization run ID cannot be empty.",
        )
      }

      return facebookSyncService.cancel(normalizedRunId)
    },

    onSuccess: async (run, runId) => {
      const normalizedRunId = runId.trim()

      // Update the detail cache immediately.
      if (run) {
        queryClient.setQueryData(
          facebookSyncKeys.detail(normalizedRunId),
          run,
        )

        // If the backend returns a different run ID,
        // also cache that returned run.
        if (run.id && run.id !== normalizedRunId) {
          queryClient.setQueryData(
            facebookSyncKeys.detail(run.id),
            run,
          )
        }
      }

      // Refresh all list queries so the table immediately reflects
      // the cancelled status and updated counters.
      await queryClient.invalidateQueries({
        queryKey: facebookSyncKeys.lists(),
      })

      // Refresh the original detail query as well.
      await queryClient.invalidateQueries({
        queryKey: facebookSyncKeys.detail(normalizedRunId),
      })

      // If the backend returned a different run, refresh that detail.
      if (run?.id && run.id !== normalizedRunId) {
        await queryClient.invalidateQueries({
          queryKey: facebookSyncKeys.detail(run.id),
        })
      }
    },
  })
}