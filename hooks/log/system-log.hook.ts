import {
  useQuery,
} from "@tanstack/react-query"

import type { ApiClientError } from "@/lib/api/api-error"
import type { PaginatedResponse } from "@/types/api"

import type {
  SystemLog,
  SystemLogQuery,
} from "@/types/auditLog"

import { systemLogService } from "@/services/system-logs.service"

/* -------------------------------------------------------------------------- */
/* Query Keys                                                                 */
/* -------------------------------------------------------------------------- */

export const systemLogQueryKeys = {
  all: ["system-logs"] as const,

  lists: () =>
    [
      ...systemLogQueryKeys.all,
      "list",
    ] as const,

  list: (
    params?: SystemLogQuery,
  ) =>
    [
      ...systemLogQueryKeys.lists(),
      params ?? {},
    ] as const,

  details: () =>
    [
      ...systemLogQueryKeys.all,
      "detail",
    ] as const,

  detail: (
    systemLogId: number,
  ) =>
    [
      ...systemLogQueryKeys.details(),
      systemLogId,
    ] as const,
}

/* -------------------------------------------------------------------------- */
/* List                                                                        */
/* -------------------------------------------------------------------------- */

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
export function useSystemLogs(
  params?: SystemLogQuery,
) {
  return useQuery<
    PaginatedResponse<SystemLog>,
    ApiClientError
  >({
    queryKey:
      systemLogQueryKeys.list(params),

    queryFn: () =>
      systemLogService.list(params),

    placeholderData:
      (previousData) =>
        previousData,
  })
}

/* -------------------------------------------------------------------------- */
/* Detail                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Get a single system log.
 *
 * GET /v1/system-logs/{systemLog}
 */
export function useSystemLog(
  systemLogId?: number,
) {
  return useQuery<
    SystemLog,
    ApiClientError
  >({
    queryKey:
      systemLogQueryKeys.detail(
        systemLogId ?? 0,
      ),

    queryFn: () =>
      systemLogService.get(
        systemLogId!,
      ),

    enabled:
      Boolean(systemLogId),
  })
}