import axios, {
    AxiosError,
  } from "axios";
  
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
  | These should correspond to Laravel ApiErrorCode.
  |
  | The frontend uses `code` for programmatic decisions.
  | The human-readable `message` is for presentation only.
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
    | "EXTERNAL_SERVICE_ERROR"
  
    // Frontend / transport
    | "NETWORK_ERROR"
    | "REQUEST_TIMEOUT"
    | "UNKNOWN_ERROR";
  
  /*
  |--------------------------------------------------------------------------
  | VALIDATION ERROR DETAILS
  |--------------------------------------------------------------------------
  */
  
  export interface ApiValidationDetails {
    fields?: Record<string, string[]>;
  }
  
  /*
  |--------------------------------------------------------------------------
  | API ERROR PAYLOAD
  |--------------------------------------------------------------------------
  */
  
  export interface ApiErrorPayload {
    code: string;
    type: string;
    details: unknown;
  }
  
  /*
  |--------------------------------------------------------------------------
  | API ERROR RESPONSE
  |--------------------------------------------------------------------------
  */
  
  export interface ApiErrorResponse {
    success: false;
  
    message: string;
  
    error: ApiErrorPayload;
  
    meta?: {
      request_id?: string;
      version?: string;
      timestamp?: string;
    };
  }
  
  /*
  |--------------------------------------------------------------------------
  | NORMALIZED API ERROR
  |--------------------------------------------------------------------------
  |
  | Every error reaching the application should become this type.
  |
  |--------------------------------------------------------------------------
  */
  
  export class ApiClientError extends Error {
    readonly code: string;
  
    readonly type: string;
  
    readonly status: number | null;
  
    readonly details: unknown;
  
    readonly requestId: string | null;
  
    readonly originalError?: unknown;
  
    constructor({
      message,
      code,
      type,
      status = null,
      details = null,
      requestId = null,
      originalError,
    }: {
      message: string;
      code: string;
      type: string;
      status?: number | null;
      details?: unknown;
      requestId?: string | null;
      originalError?: unknown;
    }) {
      super(message);
  
      this.name = "ApiClientError";
  
      this.code = code;
  
      this.type = type;
  
      this.status = status;
  
      this.details = details;
  
      this.requestId = requestId;
  
      this.originalError = originalError;
  
      /*
      |--------------------------------------------------------------------------
      | Restore prototype chain
      |--------------------------------------------------------------------------
      */
  
      Object.setPrototypeOf(
        this,
        ApiClientError.prototype
      );
    }
  
    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */
  
    get validationFields(): Record<
      string,
      string[]
    > {
      if (
        this.type !==
        "VALIDATION_ERROR"
      ) {
        return {};
      }
  
      if (
        !this.details ||
        typeof this.details !== "object"
      ) {
        return {};
      }
  
      const details =
        this.details as ApiValidationDetails;
  
      return details.fields ?? {};
    }
  
    /*
    |--------------------------------------------------------------------------
    | Error classification
    |--------------------------------------------------------------------------
    */
  
    get isAuthenticationError(): boolean {
      return (
        this.type ===
        "AUTHENTICATION_ERROR"
      );
    }
  
    get isAuthorizationError(): boolean {
      return (
        this.type ===
        "AUTHORIZATION_ERROR"
      );
    }
  
    get isValidationError(): boolean {
      return (
        this.type ===
        "VALIDATION_ERROR"
      );
    }
  
    get isNotFoundError(): boolean {
      return (
        this.type ===
        "NOT_FOUND_ERROR"
      );
    }
  
    get isConflictError(): boolean {
      return (
        this.type ===
        "CONFLICT_ERROR"
      );
    }
  
    get isBusinessError(): boolean {
      return (
        this.type ===
        "BUSINESS_ERROR"
      );
    }
  
    get isRateLimitError(): boolean {
      return (
        this.type ===
        "RATE_LIMIT_ERROR"
      );
    }
  
    get isExternalServiceError(): boolean {
      return (
        this.type ===
        "EXTERNAL_SERVICE_ERROR"
      );
    }
  
    get isServerError(): boolean {
      return (
        this.type ===
        "SERVER_ERROR"
      );
    }
  
    get isNetworkError(): boolean {
      return (
        this.code ===
        "NETWORK_ERROR"
      );
    }
  
    get isTimeoutError(): boolean {
      return (
        this.code ===
        "REQUEST_TIMEOUT"
      );
    }
  
    /*
    |--------------------------------------------------------------------------
    | Specific error helpers
    |--------------------------------------------------------------------------
    */
  
    get isUnauthenticated(): boolean {
      return (
        this.code ===
        "UNAUTHENTICATED"
      );
    }
  
    get isForbidden(): boolean {
      return (
        this.code ===
        "FORBIDDEN" ||
        this.code ===
        "INSUFFICIENT_PERMISSION"
      );
    }
  
    get isAccountLocked(): boolean {
      return (
        this.code ===
        "ACCOUNT_LOCKED"
      );
    }
  
    get isRateLimited(): boolean {
      return (
        this.code ===
        "RATE_LIMIT_EXCEEDED"
      );
    }
  }
  
  /*
  |--------------------------------------------------------------------------
  | DEFAULT ERROR
  |--------------------------------------------------------------------------
  */
  
  const createUnknownError = (
    error?: unknown
  ): ApiClientError => {
    return new ApiClientError({
      message:
        "An unexpected error occurred.",
  
      code: "UNKNOWN_ERROR",
  
      type: "SERVER_ERROR",
  
      status: null,
  
      details: null,
  
      originalError: error,
    });
  };
  
  /*
  |--------------------------------------------------------------------------
  | NETWORK ERROR
  |--------------------------------------------------------------------------
  */
  
  const createNetworkError = (
    error: unknown
  ): ApiClientError => {
    return new ApiClientError({
      message:
        "Unable to connect to the server. Please check your connection and try again.",
  
      code: "NETWORK_ERROR",
  
      type: "SERVER_ERROR",
  
      status: null,
  
      details: null,
  
      originalError: error,
    });
  };
  
  /*
  |--------------------------------------------------------------------------
  | TIMEOUT ERROR
  |--------------------------------------------------------------------------
  */
  
  const createTimeoutError = (
    error: unknown
  ): ApiClientError => {
    return new ApiClientError({
      message:
        "The request took too long to complete. Please try again.",
  
      code: "REQUEST_TIMEOUT",
  
      type: "SERVER_ERROR",
  
      status: null,
  
      details: null,
  
      originalError: error,
    });
  };
  
  /*
  |--------------------------------------------------------------------------
  | LARAVEL API ERROR
  |--------------------------------------------------------------------------
  */
  
  const createLaravelApiError = (
    error: AxiosError<ApiErrorResponse>
  ): ApiClientError | null => {
    const response =
      error.response;
  
    /*
    |--------------------------------------------------------------------------
    | No HTTP response
    |--------------------------------------------------------------------------
    */
  
    if (!response) {
      return null;
    }
  
    const data =
      response.data;
  
    /*
    |--------------------------------------------------------------------------
    | Validate canonical Laravel response
    |--------------------------------------------------------------------------
    */
  
    if (
      !data ||
      data.success !== false ||
      !data.error
    ) {
      return null;
    }
  
    return new ApiClientError({
      message:
        data.message ||
        "The request could not be completed.",
  
      code:
        data.error.code ||
        "ERROR",
  
      type:
        data.error.type ||
        "CLIENT_ERROR",
  
      status:
        response.status,
  
      details:
        data.error.details ?? null,
  
      requestId:
        data.meta?.request_id ?? null,
  
      originalError:
        error,
    });
  };
  
  /*
  |--------------------------------------------------------------------------
  | NON-STANDARD HTTP ERROR
  |--------------------------------------------------------------------------
  */
  
  const createHttpError = (
    error: AxiosError
  ): ApiClientError => {
    const status =
      error.response?.status ?? null;
  
    /*
    |--------------------------------------------------------------------------
    | HTTP status classification
    |--------------------------------------------------------------------------
    */
  
    if (
      status === 401
    ) {
      return new ApiClientError({
        message:
          "Authentication is required.",
  
        code:
          "UNAUTHENTICATED",
  
        type:
          "AUTHENTICATION_ERROR",
  
        status,
  
        details: null,
  
        originalError:
          error,
      });
    }
  
    if (
      status === 403
    ) {
      return new ApiClientError({
        message:
          "You do not have permission to perform this action.",
  
        code:
          "FORBIDDEN",
  
        type:
          "AUTHORIZATION_ERROR",
  
        status,
  
        details: null,
  
        originalError:
          error,
      });
    }
  
    if (
      status === 404
    ) {
      return new ApiClientError({
        message:
          "The requested resource was not found.",
  
        code:
          "RESOURCE_NOT_FOUND",
  
        type:
          "NOT_FOUND_ERROR",
  
        status,
  
        details: null,
  
        originalError:
          error,
      });
    }
  
    if (
      status === 409
    ) {
      return new ApiClientError({
        message:
          "The request conflicts with the current state of the resource.",
  
        code:
          "CONFLICT",
  
        type:
          "CONFLICT_ERROR",
  
        status,
  
        details: null,
  
        originalError:
          error,
      });
    }
  
    if (
      status === 422
    ) {
      return new ApiClientError({
        message:
          "The given data is invalid.",
  
        code:
          "VALIDATION_FAILED",
  
        type:
          "VALIDATION_ERROR",
  
        status,
  
        details: null,
  
        originalError:
          error,
      });
    }
  
    if (
      status === 429
    ) {
      return new ApiClientError({
        message:
          "Too many requests. Please try again later.",
  
        code:
          "RATE_LIMIT_EXCEEDED",
  
        type:
          "RATE_LIMIT_ERROR",
  
        status,
  
        details: null,
  
        originalError:
          error,
      });
    }
  
    if (
      status !== null &&
      status >= 500
    ) {
      return new ApiClientError({
        message:
          "Something went wrong on our end. Please try again later.",
  
        code:
          "INTERNAL_SERVER_ERROR",
  
        type:
          "SERVER_ERROR",
  
        status,
  
        details: null,
  
        originalError:
          error,
      });
    }
  
    return new ApiClientError({
      message:
        "The request could not be completed.",
  
      code:
        "ERROR",
  
      type:
        "CLIENT_ERROR",
  
      status,
  
      details: null,
  
      originalError:
        error,
    });
  };
  
  /*
  |--------------------------------------------------------------------------
  | NORMALIZE API ERROR
  |--------------------------------------------------------------------------
  |
  | This is the ONLY function the rest of the frontend needs to call.
  |
  |--------------------------------------------------------------------------
  */
  
  export const normalizeApiError = (
    error: unknown
  ): ApiClientError => {
    /*
    |--------------------------------------------------------------------------
    | Already normalized
    |--------------------------------------------------------------------------
    */
  
    if (
      error instanceof ApiClientError
    ) {
      return error;
    }
  
    /*
    |--------------------------------------------------------------------------
    | Axios error
    |--------------------------------------------------------------------------
    */
  
    if (
      axios.isAxiosError(error)
    ) {
      /*
      |--------------------------------------------------------------------------
      | Timeout
      |--------------------------------------------------------------------------
      */
  
      if (
        error.code ===
        "ECONNABORTED" ||
        error.code ===
        "ETIMEDOUT"
      ) {
        return createTimeoutError(
          error
        );
      }
  
      /*
      |--------------------------------------------------------------------------
      | Laravel canonical error
      |--------------------------------------------------------------------------
      */
  
      const laravelError =
        createLaravelApiError(
          error
        );
  
      if (laravelError) {
        return laravelError;
      }
  
      /*
      |--------------------------------------------------------------------------
      | Network / connection error
      |--------------------------------------------------------------------------
      */
  
      if (!error.response) {
        return createNetworkError(
          error
        );
      }
  
      /*
      |--------------------------------------------------------------------------
      | Non-standard HTTP response
      |--------------------------------------------------------------------------
      */
  
      return createHttpError(
        error
      );
    }
  
    /*
    |--------------------------------------------------------------------------
    | Native JavaScript error
    |--------------------------------------------------------------------------
      */
  
    if (
      error instanceof Error
    ) {
      return new ApiClientError({
        message:
          error.message ||
          "An unexpected error occurred.",
  
        code:
          "UNKNOWN_ERROR",
  
        type:
          "SERVER_ERROR",
  
        status: null,
  
        details: null,
  
        originalError:
          error,
      });
    }
  
    /*
    |--------------------------------------------------------------------------
    | Unknown value
    |--------------------------------------------------------------------------
    */
  
    return createUnknownError(
      error
    );
  };