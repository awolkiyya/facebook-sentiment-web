export type SyncStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"

export type SyncTrigger =
  | "manual"
  | "scheduler"
  | "system"

export type SyncType =
  | "full"
  | "posts"
  | "comments"
  | "incremental"

export type SyncFilterValue<T> = T | "all"

/*
|--------------------------------------------------------------------------
| Facebook Page
|--------------------------------------------------------------------------
*/

export interface FacebookSyncRunPage {
  /**
   * Internal Laravel UUID.
   */
  id: string

  /**
   * External Meta/Facebook Page ID.
   */
  facebook_page_id: string

  /**
   * Facebook page display name.
   */
  name: string

  /**
   * Whether the Facebook page connection is active.
   */
  is_active: boolean
}

/*
|--------------------------------------------------------------------------
| Triggered By
|--------------------------------------------------------------------------
*/

export interface FacebookSyncRunUser {
  id: string
  name: string
}

/*
|--------------------------------------------------------------------------
| Synchronization Statistics
|--------------------------------------------------------------------------
*/

export interface FacebookSyncRunStatistics {
  posts_fetched: number
  posts_created: number
  posts_updated: number

  comments_fetched: number
  comments_created: number
  comments_updated: number
  comments_failed: number

  posts_queued_for_ai: number
  comments_queued_for_ai: number

  ai_completed: number
  ai_failed: number
}

/*
|--------------------------------------------------------------------------
| Pipeline Job Progress
|--------------------------------------------------------------------------
*/

export interface SyncPipelineJobProgress {
  expected: number
  completed: number
  failed: number
  finished: number
  progressPercent: number

  startedAt?: string | null
  completedAt?: string | null
}

/*
|--------------------------------------------------------------------------
| Pipeline
|--------------------------------------------------------------------------
|
| The detailed endpoint returns this additional structure.
|
*/

export interface FacebookSyncRunPipeline {
  initialized: boolean
  completed: boolean

  initializedAt: string | null
  completedAt: string | null

  commentJobs: SyncPipelineJobProgress

  postAiJobs: SyncPipelineJobProgress

  commentAiJobs: SyncPipelineJobProgress

  overall: {
    expected: number
    completed: number
    failed: number
    finished: number
    remaining: number
    progressPercent: number
    isFinished: boolean
  }
}

/*
|--------------------------------------------------------------------------
| Error
|--------------------------------------------------------------------------
*/

export interface FacebookSyncRunError {
  hasError: boolean
  message: string | null
  code?: string | null
}

/*
|--------------------------------------------------------------------------
| Basic Sync Run
|--------------------------------------------------------------------------
|
| GET /api/v1/facebook/sync-runs
|
| This interface now matches the Laravel JSON response directly.
|
*/

export interface FacebookSyncRun {
  id: string

  /**
   * Internal UUID from facebook_pages table.
   */
  facebook_page_id: string

  /**
   * External Meta/Facebook Page ID.
   */
  meta_page_id: string

  page: FacebookSyncRunPage | null

  type: SyncType

  trigger: SyncTrigger

  status: SyncStatus

  /**
   * Laravel queue name.
   */
  queue: string

  /**
   * Queue job identifier.
   */
  job_id: string | null

  attempts: number

  triggered_by: FacebookSyncRunUser | null

  statistics: FacebookSyncRunStatistics

  queued_at: string

  started_at: string | null

  completed_at: string | null

  /**
   * Backend calculated active status.
   */
  is_active: boolean

  duration_seconds: number | null

  has_error: boolean

  /**
   * Present when the backend includes a top-level error message.
   */
  error_message?: string | null

  created_at: string

  updated_at: string
}

/*
|--------------------------------------------------------------------------
| Detailed Sync Run
|--------------------------------------------------------------------------
|
| GET /api/v1/facebook/sync-runs/{id}
|
| The detail endpoint can contain pipeline/error/metadata.
|
*/

export interface FacebookSyncRunDetail
  extends FacebookSyncRun {
  pipeline: FacebookSyncRunPipeline

  error: FacebookSyncRunError

  metadata: Record<string, unknown> | null
}

/*
|--------------------------------------------------------------------------
| Pagination
|--------------------------------------------------------------------------
|
| Actual Laravel response:
|
| "pagination": {
|   "current_page": 1,
|   "per_page": 10,
|   "total": 6,
|   "last_page": 1,
|   "from": 1,
|   "to": 6,
|   "has_more": false
| }
|
*/

export interface FacebookSyncRunPagination {
  current_page: number

  per_page: number

  total: number

  last_page: number

  from: number | null

  to: number | null

  has_more: boolean
}

/*
|--------------------------------------------------------------------------
| Pagination Links
|--------------------------------------------------------------------------
*/

export interface FacebookSyncRunPaginationLinks {
  first: string | null

  last: string | null

  prev: string | null

  next: string | null
}

/*
|--------------------------------------------------------------------------
| Response Meta
|--------------------------------------------------------------------------
*/

export interface FacebookSyncRunsResponseMeta {
  timestamp: string

  request_id: string

  version: string

  pagination: FacebookSyncRunPagination
}

/*
|--------------------------------------------------------------------------
| GET /api/v1/facebook/sync-runs
|--------------------------------------------------------------------------
*/

export interface FacebookSyncRunsResponse {
  success: boolean

  message: string

  data: FacebookSyncRun[]

  meta: FacebookSyncRunsResponseMeta

  links?: FacebookSyncRunPaginationLinks
}

/*
|--------------------------------------------------------------------------
| GET /api/v1/facebook/sync-runs/{id}
|--------------------------------------------------------------------------
*/

export interface FacebookSyncRunDetailResponse {
  success: boolean

  message: string

  data: FacebookSyncRunDetail

  meta?: {
    timestamp?: string
    request_id?: string
    version?: string
  }
}

/*
|--------------------------------------------------------------------------
| Supported Filters
|--------------------------------------------------------------------------
*/

export interface FacebookSyncRunFilters {
  facebookPageId?: string

  metaPageId?: string

  status?: SyncStatus | "all"

  trigger?: SyncTrigger | "all"

  type?: SyncType | "all"

  page?: number

  perPage?: number
}