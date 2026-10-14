/**
 * ApiResponse.types.ts
 */

/*
|--------------------------------------------------------------------------
| API ERROR TYPES
|--------------------------------------------------------------------------
*/

export type ApiErrorType =
  | "CLIENT_ERROR"
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "VALIDATION_ERROR"
  | "NOT_FOUND_ERROR"
  | "CONFLICT_ERROR"
  | "BUSINESS_ERROR"
  | "RATE_LIMIT_ERROR"
  | "EXTERNAL_SERVICE_ERROR"
  | "SERVER_ERROR";

/*
|--------------------------------------------------------------------------
| API ERROR CODES
|--------------------------------------------------------------------------
|
| These values correspond to Laravel ApiErrorCode.
|
|--------------------------------------------------------------------------
*/

export type ApiErrorCode =
  | "ERROR"

  // Authentication
  | "UNAUTHENTICATED"
  | "INVALID_CREDENTIALS"
  | "TOKEN_EXPIRED"
  | "ACCOUNT_LOCKED"

  // Authorization
  | "FORBIDDEN"
  | "INSUFFICIENT_PERMISSION"

  // Validation
  | "VALIDATION_FAILED"

  // Resources
  | "RESOURCE_NOT_FOUND"
  | "FACEBOOK_PAGE_NOT_FOUND"
  | "REPORT_NOT_FOUND"

  // Conflict
  | "CONFLICT"

  // Business
  | "OPERATION_NOT_ALLOWED"
  | "FACEBOOK_CONNECTION_REQUIRED"
  | "FACEBOOK_CONNECTION_EXISTS"
  | "FACEBOOK_PAGE_ALREADY_CONNECTED"
  | "RESOURCE_LOCKED"

  // Rate limiting
  | "RATE_LIMIT_EXCEEDED"

  // Server / infrastructure
  | "INTERNAL_SERVER_ERROR"
  | "DATABASE_ERROR"
  | "EXTERNAL_SERVICE_ERROR";

/*
|--------------------------------------------------------------------------
| PAGINATION META
|--------------------------------------------------------------------------
*/

export interface ApiPaginationMeta {
  current_page: number;

  per_page: number;

  total: number;

  last_page: number;

  from: number | null;

  to: number | null;

  has_more: boolean;
}

/*
|--------------------------------------------------------------------------
| API META
|--------------------------------------------------------------------------
*/

export interface ApiResponseMeta<
  TSummary = undefined
> {
  /*
  |--------------------------------------------------------------------------
  | Request tracing
  |--------------------------------------------------------------------------
  */

  request_id: string;

  /*
  |--------------------------------------------------------------------------
  | API version
  |--------------------------------------------------------------------------
  */

  version: string;

  /*
  |--------------------------------------------------------------------------
  | Response timestamp
  |--------------------------------------------------------------------------
  */

  timestamp: string;

  /*
  |--------------------------------------------------------------------------
  | Optional pagination
  |--------------------------------------------------------------------------
  */

  pagination?: ApiPaginationMeta;

  /*
  |--------------------------------------------------------------------------
  | Optional summary
  |--------------------------------------------------------------------------
  */

  summary?: TSummary;
}

/*
|--------------------------------------------------------------------------
| VALIDATION ERROR DETAILS
|--------------------------------------------------------------------------
*/

export interface ApiValidationDetails {
  fields: Record<string, string[]>;
}

/*
|--------------------------------------------------------------------------
| API ERROR
|--------------------------------------------------------------------------
*/

export interface ApiError {
  code: ApiErrorCode | string;

  type: ApiErrorType | string;

  details:
    | ApiValidationDetails
    | Record<string, unknown>
    | null;
}

/*
|--------------------------------------------------------------------------
| SUCCESS RESPONSE
|--------------------------------------------------------------------------
*/

export interface ApiSuccessResponse<
  T = unknown,
  TSummary = undefined
> {
  success: true;

  message: string;

  data: T;

  error: null;

  meta: ApiResponseMeta<TSummary>;
}

/*
|--------------------------------------------------------------------------
| ERROR RESPONSE
|--------------------------------------------------------------------------
*/

export interface ApiErrorResponse {
  success: false;

  message: string;

  data: null;

  error: ApiError;

  meta: ApiResponseMeta;

}

/*
|--------------------------------------------------------------------------
| FULL API RESPONSE
|--------------------------------------------------------------------------
*/

export type ApiResponse<
  T = unknown,
  TSummary = undefined
> =
  | ApiSuccessResponse<T, TSummary>
  | ApiErrorResponse;

/*
|--------------------------------------------------------------------------
| TYPE GUARDS
|--------------------------------------------------------------------------
*/

export function isApiSuccess<
  T,
  TSummary = undefined
>(
  response: ApiResponse<T, TSummary>
): response is ApiSuccessResponse<
  T,
  TSummary
> {
  return response.success === true;
}

export function isApiError<
  T,
  TSummary = undefined
>(
  response: ApiResponse<T, TSummary>
): response is ApiErrorResponse {
  return response.success === false;
}

/*
|--------------------------------------------------------------------------
| PAGINATION GUARD
|--------------------------------------------------------------------------
*/

export function hasPagination<
  TSummary = undefined
>(
  meta: ApiResponseMeta<TSummary>
): meta is ApiResponseMeta<TSummary> & {
  pagination: ApiPaginationMeta;
} {
  return (
    meta.pagination !== undefined &&
    typeof meta.pagination.current_page ===
      "number"
  );
}

/*
|--------------------------------------------------------------------------
| RESPONSE ALIASES
|--------------------------------------------------------------------------
*/

export type SingleResponse<
  T,
  TSummary = undefined
> = ApiSuccessResponse<T, TSummary>;

export type ListResponse<
  T,
  TSummary = undefined
> = ApiSuccessResponse<T[], TSummary>;

export type PaginatedResponse<
  T,
  TSummary = undefined
> = ApiSuccessResponse<T[], TSummary>;
