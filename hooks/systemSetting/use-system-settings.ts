import {
    useMutation,
    useQuery,
    useQueryClient,
  } from "@tanstack/react-query"
  import { toast } from "sonner"
  
  import {
    systemSettingService,
  } from "@/services/system-setting.service"
  
  import type {
    ApiClientError,
  } from "@/lib/api/api-error"
  
  import type {
    SystemSetting,
    UpdateSystemSettingRequest,
  } from "@/types/system-setting"
  
  /*
  |--------------------------------------------------------------------------
  | QUERY KEYS
  |--------------------------------------------------------------------------
  */
  
  export const systemSettingQueryKeys = {
    all: ["system-settings"] as const,
  
    detail: () =>
      [
        ...systemSettingQueryKeys.all,
        "detail",
      ] as const,
  }
  
  /*
  |--------------------------------------------------------------------------
  | GET SYSTEM SETTINGS
  |--------------------------------------------------------------------------
  */
  
  /**
   * Get the singleton system settings.
   *
   * GET /v1/system-settings
   *
   * Requires:
   *
   *     system.settings.view
   */
  export function useSystemSettings() {
    return useQuery<
      SystemSetting,
      ApiClientError
    >({
      queryKey:
        systemSettingQueryKeys.detail(),
  
      queryFn: () =>
        systemSettingService.get(),
  
      staleTime: 5 * 60 * 1000,
    })
  }
  
  /*
  |--------------------------------------------------------------------------
  | UPDATE SYSTEM SETTINGS
  |--------------------------------------------------------------------------
  */
  
  /**
   * Update system settings.
   *
   * PATCH /v1/system-settings
   *
   * Partial update:
   *
   *     Only the supplied fields are updated.
   *
   * Requires:
   *
   *     system.settings.update
   */
  export function useUpdateSystemSettings() {
    const queryClient =
      useQueryClient()
  
    return useMutation<
      SystemSetting,
      ApiClientError,
      UpdateSystemSettingRequest
    >({
      mutationFn: (data) =>
        systemSettingService.update(
          data,
        ),
  
      onSuccess: (settings) => {
        /*
        |--------------------------------------------------------------------------
        | UPDATE CACHED SETTINGS
        |--------------------------------------------------------------------------
        */
  
        queryClient.setQueryData(
          systemSettingQueryKeys.detail(),
          settings,
        )
  
        /*
        |--------------------------------------------------------------------------
        | INVALIDATE
        |--------------------------------------------------------------------------
        |
        | This ensures other components using
        | system settings will refetch when needed.
        |
        */
  
        queryClient.invalidateQueries({
          queryKey:
            systemSettingQueryKeys.all,
        })
  
        toast.success(
          "System settings updated successfully.",
        )
      },
  
      onError: (error) => {
        toast.error(
          error.message ??
            "Failed to update system settings.",
        )
      },
    })
  }