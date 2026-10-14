"use client";

import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

import { authService } from "@/services/auth.service";

import {
  setUser,
  setSecurity,
  logout,
} from "@/lib/store/slices/user.slice";

import type {
  AuthUser,
  AuthSecurity,
} from "@/types/user";

import type { ApiClientError } from "@/lib/api/api-error";

/* =====================================================
   API RESPONSE TYPES
===================================================== */

/**
 * Backend authenticated-user response:
 *
 * {
 *   success: true,
 *   message: "User profile retrieved",
 *   data: {
 *     user: AuthUser,
 *     security: {
 *       require_two_factor: false,
 *       mfa_setup_required: false
 *     }
 *   }
 * }
 */

interface MeResponse {
  success?: boolean;

  message?: string;

  data?: {
    user?: AuthUser;

    security?: AuthSecurity;
  };

  /*
   * Optional support for already-unwrapped
   * API responses.
   */
  user?: AuthUser;

  security?: AuthSecurity;
}

/* =====================================================
   NORMALIZED AUTH CONTEXT
===================================================== */

/**
 * This is what React Query will store.
 *
 * It contains both:
 *
 * - authenticated user
 * - authentication/security context
 */

export interface AuthContext {
  user: AuthUser;

  security: AuthSecurity;
}

/* =====================================================
   NORMALIZE AUTH RESPONSE
===================================================== */

/**
 * Converts possible API response shapes into AuthContext.
 *
 * Supported:
 *
 * 1. {
 *      user: AuthUser,
 *      security: AuthSecurity
 *    }
 *
 * 2. {
 *      data: {
 *        user: AuthUser,
 *        security: AuthSecurity
 *      }
 *    }
 *
 * 3. Legacy:
 *    AuthUser
 *
 * In the legacy case, security defaults to null-like
 * safe values.
 */
function normalizeAuthContext(
  response:
    | AuthUser
    | MeResponse,
): AuthContext {
  /* ===================================================
     { data: { user, security } }
  =================================================== */

  if (
    "data" in response &&
    response.data?.user
  ) {
    return {
      user: response.data.user,

      security:
        response.data.security ??
        {
          require_two_factor: false,
          mfa_setup_required: false,
        },
    };
  }

  /* ===================================================
     { user, security }
  =================================================== */

  if (
    "user" in response &&
    response.user
  ) {
    return {
      user: response.user,

      security:
        response.security ??
        {
          require_two_factor: false,
          mfa_setup_required: false,
        },
    };
  }

  /* ===================================================
     DIRECT AUTH USER
  =================================================== */

  if (
    "id" in response &&
    "permissions" in response
  ) {
    return {
      user: response as AuthUser,

      security: {
        require_two_factor: false,
        mfa_setup_required: false,
      },
    };
  }

  /* ===================================================
     INVALID RESPONSE
  =================================================== */

  throw new Error(
    "Invalid authenticated user response.",
  );
}

/* =====================================================
   USE ME
===================================================== */

export const useMe = () => {
  const dispatch = useDispatch();

  /* ===================================================
     AUTHENTICATED USER QUERY
  =================================================== */

  const query = useQuery<
    AuthContext,
    ApiClientError
  >({
    /* =================================================
       QUERY KEY
    ================================================= */

    queryKey: [
      "auth",
      "me",
    ],

    /* =================================================
       REQUEST
    ================================================= */

    queryFn: async () => {
      /*
       * authService.me() may return:
       *
       * {
       *   data: {
       *     user,
       *     security
       *   }
       * }
       *
       * or another supported shape.
       */

      const response =
        await authService.me();

      /*
       * Normalize everything into:
       *
       * {
       *   user,
       *   security
       * }
       */

      return normalizeAuthContext(
        response as
          | AuthUser
          | MeResponse,
      );
    },

    /* =================================================
       CACHE
    ================================================= */

    staleTime:
      1000 * 60 * 5,

    /* =================================================
       RETRY POLICY
    ================================================= */

    retry: (
      failureCount,
      error,
    ) => {
      /* -----------------------------------------------
         Authentication failures
      ------------------------------------------------ */

      if (
        error.code ===
          "UNAUTHENTICATED" ||
        error.code ===
          "TOKEN_EXPIRED"
      ) {
        return false;
      }

      /* -----------------------------------------------
         Authorization failures
      ------------------------------------------------ */

      if (
        error.code ===
          "FORBIDDEN" ||
        error.code ===
          "INSUFFICIENT_PERMISSION"
      ) {
        return false;
      }

      /* -----------------------------------------------
         Validation / business errors
      ------------------------------------------------ */

      if (
        error.code ===
          "VALIDATION_FAILED" ||
        error.code ===
          "RESOURCE_NOT_FOUND" ||
        error.code ===
          "CONFLICT" ||
        error.code ===
          "OPERATION_NOT_ALLOWED"
      ) {
        return false;
      }

      /* -----------------------------------------------
         Rate limiting
      ------------------------------------------------ */

      if (
        error.code ===
        "RATE_LIMIT_EXCEEDED"
      ) {
        return false;
      }

      /* -----------------------------------------------
         Temporary failures
      ------------------------------------------------ */

      return failureCount < 2;
    },

    /* =================================================
       WINDOW FOCUS
    ================================================= */

    refetchOnWindowFocus: false,

    /* =================================================
       MOUNT
    ================================================= */

    refetchOnMount: true,
  });

  /* ===================================================
     SYNCHRONIZE USER WITH REDUX
  =================================================== */

  useEffect(() => {
    if (!query.data) {
      return;
    }

    /*
     * Store authenticated user.
     */

    dispatch(
      setUser(
        query.data.user,
      ),
    );

    /*
     * Store security context.
     */

    dispatch(
      setSecurity(
        query.data.security,
      ),
    );
  }, [
    query.data,
    dispatch,
  ]);

  /* ===================================================
     AUTHENTICATION FAILURE
  =================================================== */

  useEffect(() => {
    if (!query.isError) {
      return;
    }

    const error =
      query.error;

    const isUnauthenticated =
      error.code ===
        "UNAUTHENTICATED" ||
      error.code ===
        "TOKEN_EXPIRED";

    /*
     * Only clear Redux authentication state when
     * the backend explicitly reports an invalid/
     * expired authentication session.
     */

    if (!isUnauthenticated) {
      return;
    }

    dispatch(
      logout(),
    );
  }, [
    query.isError,
    query.error,
    dispatch,
  ]);

  /* ===================================================
     RETURN QUERY
  ===================================================== */

  return query;
};
