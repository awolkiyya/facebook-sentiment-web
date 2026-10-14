import { api } from "@/lib/api/api"
import type {
  PaginatedResponse,
  SingleResponse,
} from "@/types/api"
import { SystemLog, SystemLogQuery } from "@/types/auditLog"


export const systemLogService = {
  /**
   * Get paginated system logs.
   *
   * GET /v1/system-logs
   *
   * Supports:
   * - search
   * - action
   * - module
   * - status
   * - severity
   * - user
   * - resource
   * - request ID
   * - IP address
   * - date range
   * - pagination
   * - sorting
   */
  list: async (
    params?: SystemLogQuery,
  ): Promise<PaginatedResponse<SystemLog>> => {
    const response =
      await api.get<
        PaginatedResponse<SystemLog>
      >(
        "/v1/system-logs",
        {
          params,
        },
      )

    return response.data
  },

  /**
   * Get a single system log.
   *
   * GET /v1/system-logs/{systemLog}
   */
  get: async (
    systemLogId: number,
  ): Promise<SystemLog> => {
    const response =
      await api.get<
        SingleResponse<SystemLog>
      >(
        `/v1/system-logs/${systemLogId}`,
      )

    return response.data.data
  },
}