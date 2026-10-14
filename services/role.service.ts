import { api } from "@/lib/api/api"
import type { PaginatedResponse, SingleResponse } from "@/types/api"
import type {
  Role,
  RoleQueryParams,
  CreateRoleRequest,
  UpdateRoleRequest,
} from "@/types/role"

export const roleService = {
  /**
   * Get paginated roles.
   *
   * GET /v1/roles
   */
  list: async (
    params?: RoleQueryParams,
  ): Promise<PaginatedResponse<Role>> => {
    const response =
      await api.get<PaginatedResponse<Role>>(
        "/v1/roles",
        {
          params,
        },
      )

    return response.data
  },

  /**
   * Get a single role.
   *
   * GET /v1/roles/{role}
   */
  get: async (
    roleId: string,
  ): Promise<Role> => {
    const response =
      await api.get<SingleResponse<Role>>(
        `/v1/roles/${roleId}`,
      )

    return response.data.data
  },

  /**
   * Create a role with its permissions.
   *
   * POST /v1/roles
   */
  create: async (
    data: CreateRoleRequest,
  ): Promise<Role> => {
    const response =
      await api.post<Role>(
        "/v1/roles",
        data,
      )

    return response.data
  },

  /**
   * Replace the complete role configuration.
   *
   * PUT /v1/roles/{role}
   *
   * Replaces:
   * - role name
   * - permission assignments
   */
  update: async (
    roleId: string,
    data: UpdateRoleRequest,
  ): Promise<Role> => {
    const response =
      await api.put<Role>(
        `/v1/roles/${roleId}`,
        data,
      )

    return response.data
  },

  /**
   * Delete a role.
   *
   * DELETE /v1/roles/{role}
   */
  delete: async (
    roleId: string,
  ): Promise<void> => {
    await api.delete(
      `/v1/roles/${roleId}`,
    )
  },
}