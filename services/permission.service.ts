
import { api } from "@/lib/api/api"
import type { ApiSuccessResponse } from "@/types/api"
import type { Permission } from "@/types/permission"

class PermissionService {
  private readonly baseUrl = "/v1/permissions"

  /**
   * Get all permissions available for the API guard.
   */
  async list(): Promise<Permission[]> {
    const response =
      await api.get<
        ApiSuccessResponse<Permission[]>
      >(this.baseUrl)

    return response.data.data
  }
}

export const permissionService =
  new PermissionService()