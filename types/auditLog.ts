// src/modules/audit/types/system-log.ts

/**
 * System Log / Audit Types
 *
 * These types are aligned with the Laravel `system_logs` table.
 *
 * Database:
 * - id            BIGINT
 * - user_id       UUID nullable
 * - action        VARCHAR
 * - module        VARCHAR nullable
 * - status        VARCHAR
 * - severity      VARCHAR
 * - resource_type VARCHAR nullable
 * - resource_id   VARCHAR nullable
 * - description   TEXT nullable
 * - old_values    JSON nullable
 * - new_values    JSON nullable
 * - request_id    UUID nullable
 * - http_method   VARCHAR nullable
 * - endpoint      TEXT nullable
 * - ip_address    IP nullable
 * - user_agent    TEXT nullable
 * - duration_ms   UNSIGNED INT nullable
 * - metadata      JSON nullable
 * - created_at    TIMESTAMP
 */

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PERMISSION_DENIED'
  | 'EXPORT'
  | 'CONNECT'
  | 'DISCONNECT'
  | 'SYNC'
  | 'SYNC_STARTED'
  | 'SYNC_COMPLETED'
  | 'SYNC_FAILED'
  | 'ANALYZE'
  | 'ANALYSIS_STARTED'
  | 'ANALYSIS_COMPLETED'
  | 'ANALYSIS_FAILED'
  | 'GENERATE_REPORT'
  | 'REPORT_GENERATED'
  | 'CACHE_CLEARED'
  | 'RATE_LIMIT_WARNING'
  | string;

/* -------------------------------------------------------------------------- */
/* Status                                                                      */
/* -------------------------------------------------------------------------- */

export type AuditStatus =
  | 'SUCCESS'
  | 'FAILED'
  | 'DENIED';

/* -------------------------------------------------------------------------- */
/* Severity                                                                    */
/* -------------------------------------------------------------------------- */

export type AuditSeverity =
  | 'INFO'
  | 'WARNING'
  | 'ERROR'
  | 'CRITICAL';

/* -------------------------------------------------------------------------- */
/* Modules                                                                     */
/* -------------------------------------------------------------------------- */

export type AuditModule =
  | 'AUTHENTICATION'
  | 'USERS'
  | 'ROLES'
  | 'PERMISSIONS'
  | 'FACEBOOK'
  | 'FACEBOOK_PAGES'
  | 'FACEBOOK_POSTS'
  | 'FACEBOOK_COMMENTS'
  | 'FACEBOOK_REACTIONS'
  | 'FACEBOOK_INSIGHTS'
  | 'SENTIMENT'
  | 'AI'
  | 'REPORTS'
  | 'SYSTEM'
  | 'API'
  | string;

/* -------------------------------------------------------------------------- */
/* Sort                                                                        */
/* -------------------------------------------------------------------------- */

export type AuditSortField =
  | 'id'
  | 'created_at'
  | 'action'
  | 'module'
  | 'status'
  | 'severity'
  | 'user_id'
  | 'resource_type'
  | 'resource_id'
  | 'request_id'
  | 'duration_ms';

export type AuditSortDirection = 'asc' | 'desc';

/* -------------------------------------------------------------------------- */
/* User                                                                        */
/* -------------------------------------------------------------------------- */

export interface AuditUser {
  id: string;
  name: string;
  email: string | null;
}

/* -------------------------------------------------------------------------- */
/* Resource                                                                    */
/* -------------------------------------------------------------------------- */

export interface AuditResource {
  type: string;
  id: string;
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                    */
/* -------------------------------------------------------------------------- */

export interface AuditMetadata {
  source?: 'web' | 'mobile' | 'api' | 'cli' | 'queue' | string;

  latency_ms?: number;

  endpoint?: string;

  method?: string;

  job?: string;

  queue?: string;

  facebook_page_id?: string;

  records_processed?: number;

  records_created?: number;

  records_updated?: number;

  records_failed?: number;

  duration_ms?: number;

  [key: string]: unknown;
}

/* -------------------------------------------------------------------------- */
/* System Log                                                                  */
/* -------------------------------------------------------------------------- */

export interface SystemLog {
  /**
   * Laravel `$table->id()`
   */
  id: number;

  /**
   * Authenticated user responsible for the action.
   *
   * Can be null for:
   * - queue workers
   * - scheduled jobs
   * - Facebook webhooks
   * - system processes
   */
  user: AuditUser | null;

  user_id: string | null;

  /**
   * Example:
   * CREATE
   * UPDATE
   * LOGIN
   * SYNC_COMPLETED
   */
  action: AuditAction;

  /**
   * Example:
   * AUTHENTICATION
   * FACEBOOK
   * AI
   * SYSTEM
   */
  module: AuditModule | null;

  /**
   * Operation result.
   */
  status: AuditStatus;

  /**
   * Importance/severity of the event.
   */
  severity: AuditSeverity;

  /**
   * Resource affected by the operation.
   */
  resource: AuditResource | null;

  /**
   * Direct database representation.
   *
   * Useful if the API returns:
   * resource_type/resource_id separately.
   */
  resource_type: string | null;

  resource_id: string | null;

  description: string | null;

  /**
   * Previous state before UPDATE/DELETE.
   */
  old_values: Record<string, unknown> | null;

  /**
   * New state after CREATE/UPDATE.
   */
  new_values: Record<string, unknown> | null;

  /**
   * Request correlation ID.
   */
  request_id: string | null;

  /**
   * HTTP method associated with the event.
   *
   * Example:
   * GET
   * POST
   * PATCH
   * DELETE
   */
  http_method: string | null;

  /**
   * API endpoint associated with the event.
   *
   * Example:
   * /api/v1/facebook/pages/sync
   */
  endpoint: string | null;

  ip_address: string | null;

  user_agent: string | null;

  /**
   * Operation execution time in milliseconds.
   */
  duration_ms: number | null;

  /**
   * Additional structured context.
   */
  metadata: AuditMetadata | null;

  /**
   * ISO-8601 timestamp.
   */
  created_at: string;
}

/* -------------------------------------------------------------------------- */
/* Query                                                                       */
/* -------------------------------------------------------------------------- */

export interface SystemLogQuery {
  /**
   * General search.
   *
   * Can search:
   * - action
   * - description
   * - request ID
   * - IP address
   * - resource ID
   * - user name/email
   */
  search?: string;

  action?: AuditAction | string;

  module?: AuditModule | string;

  status?: AuditStatus;

  severity?: AuditSeverity;

  user_id?: string;

  resource_type?: string;

  resource_id?: string;

  request_id?: string;

  ip_address?: string;

  /**
   * ISO date/datetime.
   *
   * Example:
   * 2026-09-01
   * 2026-09-01T00:00:00
   */
  from?: string;

  to?: string;

  /**
   * Pagination.
   */
  per_page?: number;

  page?: number;

  /**
   * Sorting.
   */
  sort_by?: AuditSortField;

  sort_direction?: AuditSortDirection;
}

/* -------------------------------------------------------------------------- */
/* Pagination                                                                  */
/* -------------------------------------------------------------------------- */

export interface PaginationMeta {
  current_page: number;

  from: number | null;

  last_page: number;

  per_page: number;

  to: number | null;

  total: number;
}

export interface PaginationLinks {
  first: string | null;

  last: string | null;

  prev: string | null;

  next: string | null;
}

export interface PaginatedData<T> {
  data: T[];

  meta: PaginationMeta;

  links?: PaginationLinks;
}

/* -------------------------------------------------------------------------- */
/* API Response                                                                */
/* -------------------------------------------------------------------------- */

export interface ApiResponse<T> {
  success: boolean;

  message: string;

  data: T;

  errors: Record<string, string[]> | null;

  meta?: {
    timestamp: string;

    request_id: string | null;

    version: string;
  };
}