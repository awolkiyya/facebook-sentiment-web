import {
  api,
} from "@/lib/api/api";

import type {
  PaginatedResponse,
  SingleResponse,
} from "@/types/api";

import type {
  User,
  UserQueryParams,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  ResetUserPasswordRequest,
  AssignUserRolesRequest,
  ApiMessageResponse,
} from "@/types/user";

/**
 * userService
 *
 * USER MANAGEMENT API
 *
 * Authentication:
 *
 *     Laravel Sanctum Stateful SPA Authentication
 *
 * Authorization:
 *
 *     Laravel + Spatie Permission
 *
 * Base API:
 *
 *     /api/v1/users
 *
 * Permissions are enforced by the backend.
 *
 * The frontend should only use permissions to control
 * visibility of UI actions.
 */
export const userService = {
  /*
  |--------------------------------------------------------------------------
  | LIST USERS
  |--------------------------------------------------------------------------
  */

  list: async (
    params?: UserQueryParams
  ): Promise<PaginatedResponse<User>> => {
    /**
     * Laravel query-string boolean normalization.
     *
     * The UI works with:
     *
     *     true / false
     *
     * but the HTTP query parameter is sent as:
     *
     *     1 / 0
     *
     * This avoids boolean validation issues on the backend.
     */
    const queryParams = {
      ...params,

      is_active:
        typeof params?.is_active === "boolean"
          ? params.is_active
            ? 1
            : 0
          : undefined,
    };

    const response =
      await api.get<
        PaginatedResponse<User>
      >(
        "/v1/users",
        {
          params: queryParams,
        }
      );

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | GET USER
  |--------------------------------------------------------------------------
  */

  get: async (
    userId: string
  ): Promise<User> => {
    const response =
      await api.get<
        SingleResponse<User>
      >(
        `/v1/users/${userId}`
      );

    if (!response.data.data) {
      throw new Error(
        "User data was not returned."
      );
    }

    return response.data.data;
  },

  /*
  |--------------------------------------------------------------------------
  | CREATE USER
  |--------------------------------------------------------------------------
  */

  create: async (
    data: CreateUserRequest
  ): Promise<User> => {
    const response =
      await api.post<
        SingleResponse<User>
      >(
        "/v1/users",
        data
      );

    if (!response.data.data) {
      throw new Error(
        "User creation succeeded but no user data was returned."
      );
    }

    return response.data.data;
  },

  /*
  |--------------------------------------------------------------------------
  | UPDATE USER
  |--------------------------------------------------------------------------
  |
  | Updates profile information only.
  |
  | Roles, password and account status have dedicated
  | endpoints and should not be handled here.
  |
  */

  update: async (
    userId: string,
    data: UpdateUserRequest
  ): Promise<User> => {
    const response =
      await api.patch<
        SingleResponse<User>
      >(
        `/v1/users/${userId}`,
        data
      );

    if (!response.data.data) {
      throw new Error(
        "User update succeeded but no user data was returned."
      );
    }

    return response.data.data;
  },

  /*
  |--------------------------------------------------------------------------
  | UPDATE USER STATUS
  |--------------------------------------------------------------------------
  */

  updateStatus: async (
    userId: string,
    data: UpdateUserStatusRequest
  ): Promise<User> => {
    const response =
      await api.patch<
        SingleResponse<User>
      >(
        `/v1/users/${userId}/status`,
        data
      );

    if (!response.data.data) {
      throw new Error(
        "User status update succeeded but no user data was returned."
      );
    }

    return response.data.data;
  },

  /*
  |--------------------------------------------------------------------------
  | RESET USER PASSWORD
  |--------------------------------------------------------------------------
  */

  resetPassword: async (
    userId: string,
    data: ResetUserPasswordRequest
  ): Promise<User> => {
    const response =
      await api.post<
        SingleResponse<User>
      >(
        `/v1/users/${userId}/reset-password`,
        data
      );

    if (!response.data.data) {
      throw new Error(
        "Password reset succeeded but no user data was returned."
      );
    }

    return response.data.data;
  },

  /*
  |--------------------------------------------------------------------------
  | UNLOCK USER
  |--------------------------------------------------------------------------
  */

  unlock: async (
    userId: string
  ): Promise<User> => {
    const response =
      await api.post<
        SingleResponse<User>
      >(
        `/v1/users/${userId}/unlock`
      );

    if (!response.data.data) {
      throw new Error(
        "User unlock succeeded but no user data was returned."
      );
    }

    return response.data.data;
  },

  /*
  |--------------------------------------------------------------------------
  | ASSIGN ROLES
  |--------------------------------------------------------------------------
  |
  | Role management is intentionally separated from the normal
  | user update operation.
  |
  */

  assignRoles: async (
    userId: string,
    data: AssignUserRolesRequest
  ): Promise<User> => {
    const response =
      await api.patch<
        SingleResponse<User>
      >(
        `/v1/users/${userId}/roles`,
        data
      );

    if (!response.data.data) {
      throw new Error(
        "Role assignment succeeded but no user data was returned."
      );
    }

    return response.data.data;
  },

  /*
  |--------------------------------------------------------------------------
  | DELETE USER
  |--------------------------------------------------------------------------
  */

  delete: async (
    userId: string
  ): Promise<void> => {
    await api.delete<
      ApiMessageResponse
    >(
      `/v1/users/${userId}`
    );
  },
};