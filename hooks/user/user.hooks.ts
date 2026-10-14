import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { toast } from "sonner";

import { userService } from "@/services/user.service";

import type {
  ApiClientError,
} from "@/lib/api/api-error";

import type {
  PaginatedResponse,
} from "@/types/api";

import type {
  User,
  UserQueryParams,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  ResetUserPasswordRequest,
  AssignUserRolesRequest,
} from "@/types/user";

/**
 * ============================================================================
 * QUERY KEYS
 * ============================================================================
 *
 * Centralized React Query keys for User Management.
 *
 * This keeps list and detail caches predictable and allows mutations
 * to invalidate the correct queries.
 * ============================================================================
 */

export const userQueryKeys = {
  /*
  |--------------------------------------------------------------------------
  | ALL USERS
  |--------------------------------------------------------------------------
  */

  all: ["users"] as const,

  /*
  |--------------------------------------------------------------------------
  | USER LISTS
  |--------------------------------------------------------------------------
  */

  lists: () =>
    [
      ...userQueryKeys.all,
      "list",
    ] as const,

  /*
  |--------------------------------------------------------------------------
  | SPECIFIC USER LIST
  |--------------------------------------------------------------------------
  */

  list: (
    params?: UserQueryParams
  ) =>
    [
      ...userQueryKeys.lists(),
      params ?? {},
    ] as const,

  /*
  |--------------------------------------------------------------------------
  | USER DETAILS
  |--------------------------------------------------------------------------
  */

  details: () =>
    [
      ...userQueryKeys.all,
      "detail",
    ] as const,

  /*
  |--------------------------------------------------------------------------
  | SPECIFIC USER
  |--------------------------------------------------------------------------
  */

  detail: (
    userId: string
  ) =>
    [
      ...userQueryKeys.details(),
      userId,
    ] as const,
};

/**
 * ============================================================================
 * LIST USERS
 * ============================================================================
 *
 * GET /api/v1/users
 *
 * Supports:
 *
 *     search
 *     is_active
 *     role
 *     sort_by
 *     sort_direction
 *     page
 *     per_page
 * ============================================================================
 */

export const useUsers = (
  params?: UserQueryParams
) => {
  return useQuery<
    PaginatedResponse<User>,
    ApiClientError
  >({
    queryKey:
      userQueryKeys.list(params),

    queryFn: () =>
      userService.list(params),

    staleTime: 30_000,
  });
};

/**
 * ============================================================================
 * GET USER
 * ============================================================================
 *
 * GET /api/v1/users/{user}
 * ============================================================================
 */

export const useUser = (
  userId?: string
) => {
  return useQuery<
    User,
    ApiClientError
  >({
    queryKey:
      userQueryKeys.detail(
        userId ?? ""
      ),

    queryFn: () => {
      if (!userId) {
        throw new Error(
          "User ID is required."
        );
      }

      return userService.get(
        userId
      );
    },

    enabled:
      Boolean(userId),

    staleTime: 30_000,
  });
};

/**
 * ============================================================================
 * CREATE USER
 * ============================================================================
 *
 * POST /api/v1/users
 * ============================================================================
 */

export const useCreateUser = () => {
  const queryClient =
    useQueryClient();

  return useMutation<
    User,
    ApiClientError,
    CreateUserRequest
  >({
    mutationFn:
      userService.create,

    onSuccess: (user) => {
      /*
       * Refresh all user list queries.
       */
      queryClient.invalidateQueries({
        queryKey:
          userQueryKeys.lists(),
      });

      /*
       * Store the newly created user
       * in the detail cache.
       */
      queryClient.setQueryData(
        userQueryKeys.detail(
          user.id
        ),
        user
      );

      toast.success(
        "User created successfully",
        {
          description:
            `${user.name} has been added successfully.`,
        }
      );
    },

    onError: (error) => {
      toast.error(
        "Unable to create user",
        {
          description:
            error.message ||
            "Please check the information and try again.",
        }
      );
    },
  });
};

/**
 * ============================================================================
 * UPDATE USER
 * ============================================================================
 *
 * PATCH /api/v1/users/{user}
 *
 * Updates profile information only.
 *
 * Roles, password and account status are handled by
 * their dedicated mutations.
 * ============================================================================
 */

export const useUpdateUser = () => {
  const queryClient =
    useQueryClient();

  return useMutation<
    User,
    ApiClientError,
    {
      userId: string;
      data: UpdateUserRequest;
    }
  >({
    mutationFn: ({
      userId,
      data,
    }) =>
      userService.update(
        userId,
        data
      ),

    onSuccess: (user) => {
      /*
       * Immediately update the detail cache.
       */
      queryClient.setQueryData(
        userQueryKeys.detail(
          user.id
        ),
        user
      );

      /*
       * Refresh all user lists.
       */
      queryClient.invalidateQueries({
        queryKey:
          userQueryKeys.lists(),
      });

      toast.success(
        "User updated successfully",
        {
          description:
            `${user.name}'s information has been updated.`,
        }
      );
    },

    onError: (error) => {
      toast.error(
        "Unable to update user",
        {
          description:
            error.message ||
            "Please check the information and try again.",
        }
      );
    },
  });
};

/**
 * ============================================================================
 * UPDATE USER STATUS
 * ============================================================================
 *
 * PATCH /api/v1/users/{user}/status
 *
 * Payload:
 *
 *     {
 *       is_active: boolean
 *     }
 * ============================================================================
 */

export const useUpdateUserStatus =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation<
      User,
      ApiClientError,
      {
        userId: string;
        data: UpdateUserStatusRequest;
      }
    >({
      mutationFn: ({
        userId,
        data,
      }) =>
        userService.updateStatus(
          userId,
          data
        ),

      onSuccess: (user) => {
        /*
         * Immediately update the user detail cache.
         */
        queryClient.setQueryData(
          userQueryKeys.detail(
            user.id
          ),
          user
        );

        /*
         * Refresh user lists because
         * status is displayed there.
         */
        queryClient.invalidateQueries({
          queryKey:
            userQueryKeys.lists(),
        });

        toast.success(
          user.is_active
            ? "User activated"
            : "User deactivated",
          {
            description:
              user.is_active
                ? `${user.name} can now access the system.`
                : `${user.name} no longer has access to the system.`,
          }
        );
      },

      onError: (error) => {
        toast.error(
          "Unable to update user status",
          {
            description:
              error.message ||
              "Please try again later.",
          }
        );
      },
    });
  };

/**
 * ============================================================================
 * RESET USER PASSWORD
 * ============================================================================
 *
 * POST /api/v1/users/{user}/reset-password
 * ============================================================================
 */

export const useResetUserPassword =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation<
      User,
      ApiClientError,
      {
        userId: string;
        data: ResetUserPasswordRequest;
      }
    >({
      mutationFn: ({
        userId,
        data,
      }) =>
        userService.resetPassword(
          userId,
          data
        ),

      onSuccess: (user) => {
        /*
         * Refresh the user detail cache.
         *
         * The backend returns the updated
         * UserResource after the password reset.
         */
        queryClient.setQueryData(
          userQueryKeys.detail(
            user.id
          ),
          user
        );

        toast.success(
          "Password reset successfully",
          {
            description:
              `${user.name}'s password has been reset.`,
          }
        );
      },

      onError: (error) => {
        toast.error(
          "Unable to reset password",
          {
            description:
              error.message ||
              "Please try again later.",
          }
        );
      },
    });
  };

/**
 * ============================================================================
 * UNLOCK USER
 * ============================================================================
 *
 * POST /api/v1/users/{user}/unlock
 * ============================================================================
 */

export const useUnlockUser = () => {
  const queryClient =
    useQueryClient();

  return useMutation<
    User,
    ApiClientError,
    string
  >({
    mutationFn:
      userService.unlock,

    onSuccess: (user) => {
      /*
       * Update detail cache.
       */
      queryClient.setQueryData(
        userQueryKeys.detail(
          user.id
        ),
        user
      );

      /*
       * Refresh lists because lock/unlock
       * state may affect the UI.
       */
      queryClient.invalidateQueries({
        queryKey:
          userQueryKeys.lists(),
      });

      toast.success(
        "User unlocked",
        {
          description:
            `${user.name}'s account has been unlocked.`,
        }
      );
    },

    onError: (error) => {
      toast.error(
        "Unable to unlock user",
        {
          description:
            error.message ||
            "Please try again later.",
        }
      );
    },
  });
};

/**
 * ============================================================================
 * ASSIGN USER ROLES
 * ============================================================================
 *
 * PATCH /api/v1/users/{user}/roles
 *
 * Payload:
 *
 *     {
 *       roles: string[]
 *     }
 *
 * Role management is intentionally separate from normal
 * profile updates.
 * ============================================================================
 */

export const useAssignUserRoles =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation<
      User,
      ApiClientError,
      {
        userId: string;
        data: AssignUserRolesRequest;
      }
    >({
      mutationFn: ({
        userId,
        data,
      }) =>
        userService.assignRoles(
          userId,
          data
        ),

      onSuccess: (user) => {
        /*
         * Update the detail cache immediately.
         */
        queryClient.setQueryData(
          userQueryKeys.detail(
            user.id
          ),
          user
        );

        /*
         * Refresh lists because roles
         * may be displayed in the table.
         */
        queryClient.invalidateQueries({
          queryKey:
            userQueryKeys.lists(),
        });

        toast.success(
          "Roles updated successfully",
          {
            description:
              `${user.name}'s roles have been updated.`,
          }
        );
      },

      onError: (error) => {
        toast.error(
          "Unable to update roles",
          {
            description:
              error.message ||
              "Please try again later.",
          }
        );
      },
    });
  };

/**
 * ============================================================================
 * DELETE USER
 * ============================================================================
 *
 * DELETE /api/v1/users/{user}
 * ============================================================================
 */

export const useDeleteUser = () => {
  const queryClient =
    useQueryClient();

  return useMutation<
    void,
    ApiClientError,
    string
  >({
    mutationFn:
      userService.delete,

    onSuccess: (
      _,
      userId
    ) => {
      /*
       * Remove the deleted user's
       * detail cache completely.
       */
      queryClient.removeQueries({
        queryKey:
          userQueryKeys.detail(
            userId
          ),
      });

      /*
       * Refresh all user lists.
       */
      queryClient.invalidateQueries({
        queryKey:
          userQueryKeys.lists(),
      });

      toast.success(
        "User deleted successfully",
        {
          description:
            "The user account has been removed.",
        }
      );
    },

    onError: (error) => {
      toast.error(
        "Unable to delete user",
        {
          description:
            error.message ||
            "Please try again later.",
        }
      );
    },
  });
};
