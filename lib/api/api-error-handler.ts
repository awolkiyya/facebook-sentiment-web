import {
    ApiClientError,
  } from "./api-error";
  
  /*
  |--------------------------------------------------------------------------
  | ERROR ACTION
  |--------------------------------------------------------------------------
  */
  
  export type ApiErrorAction =
    | "NONE"
    | "LOGIN"
    | "FORBIDDEN"
    | "VALIDATION"
    | "NOT_FOUND"
    | "CONFLICT"
    | "BUSINESS"
    | "RATE_LIMIT"
    | "EXTERNAL_SERVICE"
    | "SERVER"
    | "RETRY";
  
  /*
  |--------------------------------------------------------------------------
  | ERROR HANDLER RESULT
  |--------------------------------------------------------------------------
  */
  
  export interface ApiErrorHandlerResult {
    action: ApiErrorAction;
  
    error: ApiClientError;
  
    /*
    |--------------------------------------------------------------------------
    | Whether the UI should normally show a notification.
    |--------------------------------------------------------------------------
    */
  
    shouldNotify: boolean;
  
    /*
    |--------------------------------------------------------------------------
    | Whether the operation may safely be retried.
    |--------------------------------------------------------------------------
    */
  
    canRetry: boolean;
  }
  
  /*
  |--------------------------------------------------------------------------
  | DETERMINE ERROR ACTION
  |--------------------------------------------------------------------------
  */
  
  export const getApiErrorAction = (
    error: ApiClientError
  ): ApiErrorAction => {
    switch (error.code) {
      /*
      |--------------------------------------------------------------------------
      | Authentication
      |--------------------------------------------------------------------------
      */
  
      case "UNAUTHENTICATED":
      case "TOKEN_EXPIRED":
        return "LOGIN";
  
      /*
      |--------------------------------------------------------------------------
      | Authorization
      |--------------------------------------------------------------------------
      */
  
      case "FORBIDDEN":
      case "INSUFFICIENT_PERMISSION":
        return "FORBIDDEN";
  
      /*
      |--------------------------------------------------------------------------
      | Validation
      |--------------------------------------------------------------------------
      */
  
      case "VALIDATION_FAILED":
        return "VALIDATION";
  
      /*
      |--------------------------------------------------------------------------
      | Not Found
      |--------------------------------------------------------------------------
      */
  
      case "RESOURCE_NOT_FOUND":
      case "FACEBOOK_PAGE_NOT_FOUND":
      case "REPORT_NOT_FOUND":
        return "NOT_FOUND";
  
      /*
      |--------------------------------------------------------------------------
      | Conflict
      |--------------------------------------------------------------------------
      */
  
      case "CONFLICT":
      case "FACEBOOK_CONNECTION_EXISTS":
      case "FACEBOOK_PAGE_ALREADY_CONNECTED":
        return "CONFLICT";
  
      /*
      |--------------------------------------------------------------------------
      | Rate Limit
      |--------------------------------------------------------------------------
      */
  
      case "RATE_LIMIT_EXCEEDED":
        return "RATE_LIMIT";
  
      /*
      |--------------------------------------------------------------------------
      | External Services
      |--------------------------------------------------------------------------
      */
  
      case "EXTERNAL_SERVICE_ERROR":
        return "EXTERNAL_SERVICE";
  
      /*
      |--------------------------------------------------------------------------
      | Business
      |--------------------------------------------------------------------------
      */
  
      case "OPERATION_NOT_ALLOWED":
      case "FACEBOOK_CONNECTION_REQUIRED":
      case "RESOURCE_LOCKED":
        return "BUSINESS";
  
      /*
      |--------------------------------------------------------------------------
      | Server
      |--------------------------------------------------------------------------
      */
  
      case "INTERNAL_SERVER_ERROR":
      case "DATABASE_ERROR":
        return "SERVER";
  
      /*
      |--------------------------------------------------------------------------
      | Network
      |--------------------------------------------------------------------------
      */
  
      case "NETWORK_ERROR":
      case "REQUEST_TIMEOUT":
        return "RETRY";
  
      /*
      |--------------------------------------------------------------------------
      | Default
      |--------------------------------------------------------------------------
      */
  
      default:
        return "NONE";
    }
  };
  
  /*
  |--------------------------------------------------------------------------
  | HANDLE API ERROR
  |--------------------------------------------------------------------------
  */
  
  export const handleApiError = (
    error: ApiClientError
  ): ApiErrorHandlerResult => {
    const action =
      getApiErrorAction(error);
  
    switch (action) {
      /*
      |--------------------------------------------------------------------------
      | Authentication
      |--------------------------------------------------------------------------
      |
      | Axios is responsible for the actual redirect.
      |
      |--------------------------------------------------------------------------
      */
  
      case "LOGIN":
        return {
          action,
          error,
          shouldNotify: false,
          canRetry: false,
        };
  
      /*
      |--------------------------------------------------------------------------
      | Validation
      |--------------------------------------------------------------------------
      |
      | Forms should consume validationFields directly.
      |
      |--------------------------------------------------------------------------
      */
  
      case "VALIDATION":
        return {
          action,
          error,
          shouldNotify: false,
          canRetry: false,
        };
  
      /*
      |--------------------------------------------------------------------------
      | Permission
      |--------------------------------------------------------------------------
      */
  
      case "FORBIDDEN":
        return {
          action,
          error,
          shouldNotify: true,
          canRetry: false,
        };
  
      /*
      |--------------------------------------------------------------------------
      | Resource Not Found
      |--------------------------------------------------------------------------
      */
  
      case "NOT_FOUND":
        return {
          action,
          error,
          shouldNotify: false,
          canRetry: false,
        };
  
      /*
      |--------------------------------------------------------------------------
      | Conflict
      |--------------------------------------------------------------------------
      */
  
      case "CONFLICT":
        return {
          action,
          error,
          shouldNotify: true,
          canRetry: false,
        };
  
      /*
      |--------------------------------------------------------------------------
      | Business Rule
      |--------------------------------------------------------------------------
      */
  
      case "BUSINESS":
        return {
          action,
          error,
          shouldNotify: true,
          canRetry: false,
        };
  
      /*
      |--------------------------------------------------------------------------
      | Rate Limit
      |--------------------------------------------------------------------------
      */
  
      case "RATE_LIMIT":
        return {
          action,
          error,
          shouldNotify: true,
          canRetry: true,
        };
  
      /*
      |--------------------------------------------------------------------------
      | External Service
      |--------------------------------------------------------------------------
      */
  
      case "EXTERNAL_SERVICE":
        return {
          action,
          error,
          shouldNotify: true,
          canRetry: true,
        };
  
      /*
      |--------------------------------------------------------------------------
      | Server
      |--------------------------------------------------------------------------
      */
  
      case "SERVER":
        return {
          action,
          error,
          shouldNotify: true,
          canRetry: true,
        };
  
      /*
      |--------------------------------------------------------------------------
      | Network / Timeout
      |--------------------------------------------------------------------------
      */
  
      case "RETRY":
        return {
          action,
          error,
          shouldNotify: true,
          canRetry: true,
        };
  
      /*
      |--------------------------------------------------------------------------
      | No special handling
      |--------------------------------------------------------------------------
      */
  
      case "NONE":
      default:
        return {
          action,
          error,
          shouldNotify: true,
          canRetry: false,
        };
    }
  };