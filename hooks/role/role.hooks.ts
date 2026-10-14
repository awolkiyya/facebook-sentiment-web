import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { roleService } from "@/services/role.service"

import type { ApiClientError } from "@/lib/api/api-error"
import type { PaginatedResponse } from "@/types/api"

import type {
  Role,
  RoleQueryParams,
  CreateRoleRequest,
  UpdateRoleRequest,
} from "@/types/role"

export const roleQueryKeys = {
  all: ["roles"] as const,

  lists: () =>
    [...roleQueryKeys.all, "list"] as const,

  list: (params?: RoleQueryParams) =>
    [
      ...roleQueryKeys.lists(),
      params ?? {},
    ] as const,

  details: () =>
    [...roleQueryKeys.all, "detail"] as const,

  detail: (roleId: string) =>
    [
      ...roleQueryKeys.details(),
      roleId,
    ] as const,
}

/**
 * Get paginated roles.
 */
export function useRoles(
  params?: RoleQueryParams,
) {
  return useQuery<
    PaginatedResponse<Role>,
    ApiClientError
  >({
    queryKey: roleQueryKeys.list(params),
    queryFn: () => roleService.list(params),
    placeholderData: (previousData) =>
      previousData,
  })
}

/**
 * Get a single role.
 */
export function useRole(roleId?: string) {
  return useQuery<Role, ApiClientError>({
    queryKey: roleQueryKeys.detail(roleId ?? ""),
    queryFn: () => roleService.get(roleId!),
    enabled: Boolean(roleId),
  })
}

/**
 * Create a role.
 */
export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation<
    Role,
    ApiClientError,
    CreateRoleRequest
  >({
    mutationFn: (data) =>
      roleService.create(data),

    onSuccess: (role) => {
      queryClient.setQueryData(
        roleQueryKeys.detail(role.id),
        role,
      )

      queryClient.invalidateQueries({
        queryKey: roleQueryKeys.lists(),
      })

      toast.success(
        "Role created successfully.",
      )
    },

    onError: (error) => {
      toast.error(
        error.message ??
          "Failed to create role.",
      )
    },
  })
}

/**
 * Update a role.
 *
 * PUT /v1/roles/{role}
 *
 * Updates the role name and completely
 * synchronizes its permissions.
 */
export function useUpdateRole() {
  const queryClient = useQueryClient()

  return useMutation<
    Role,
    ApiClientError,
    {
      roleId: string
      data: UpdateRoleRequest
    }
  >({
    mutationFn: ({
      roleId,
      data,
    }) =>
      roleService.update(
        roleId,
        data,
      ),

    onSuccess: (role) => {
      queryClient.setQueryData(
        roleQueryKeys.detail(role.id),
        role,
      )

      queryClient.invalidateQueries({
        queryKey: roleQueryKeys.lists(),
      })

      toast.success(
        "Role updated successfully.",
      )
    },

    onError: (error) => {
      toast.error(
        error.message ??
          "Failed to update role.",
      )
    },
  })
}

/**
 * Delete a role.
 */
export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    ApiClientError,
    string
  >({
    mutationFn: (roleId) =>
      roleService.delete(roleId),

    onSuccess: (_, roleId) => {
      queryClient.removeQueries({
        queryKey:
          roleQueryKeys.detail(roleId),
      })

      queryClient.invalidateQueries({
        queryKey:
          roleQueryKeys.lists(),
      })

      toast.success(
        "Role deleted successfully.",
      )
    },

    onError: (error) => {
      toast.error(
        error.message ??
          "Failed to delete role.",
      )
    },
  })
}