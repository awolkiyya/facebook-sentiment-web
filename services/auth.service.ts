import {
  api,
  initializeCsrf,
} from "@/lib/api/api";

import type {
  SingleResponse,
} from "@/types/api";

import type {
  AuthUser,
} from "@/types/user";

/*
|--------------------------------------------------------------------------
| Login Variables
|--------------------------------------------------------------------------
*/

export interface LoginVariables {
  email: string;
  password: string;
}

/*
|--------------------------------------------------------------------------
| Fully Authenticated Result
|--------------------------------------------------------------------------
|
| Returned when email/password authentication is sufficient
| and MFA verification is not required.
|
*/

export interface LoginAuthenticatedResult {
  authenticated: true;
  user: AuthUser;
}

/*
|--------------------------------------------------------------------------
| MFA Challenge Result
|--------------------------------------------------------------------------
|
| Returned when email/password authentication succeeds but
| the account requires MFA verification before authentication
| is fully completed.
|
*/

export interface LoginMfaChallengeResult {
  authenticated: false;
  mfa_required: true;
  mfa_setup_required: boolean;
  challenge_id: string;
  expires_in: number;
}

/*
|--------------------------------------------------------------------------
| Login Result
|--------------------------------------------------------------------------
*/

export type LoginResult =
  | LoginAuthenticatedResult
  | LoginMfaChallengeResult;

/*
|--------------------------------------------------------------------------
| Raw API Response Shapes
|--------------------------------------------------------------------------
|
| These mirror exactly what /v1/auth/web-login returns on the wire,
| before being normalized into LoginResult above. Kept private to
| this file — callers only ever see LoginResult.
|
*/

interface RawLoginMfaData {
  mfa_required: true;
  mfa_enabled: boolean;
  mfa_setup_required: boolean;
  challenge_required: boolean;
  challenge_id: string;
  expires_in: number;
}

type RawLoginData = AuthUser | RawLoginMfaData;

/*
|--------------------------------------------------------------------------
| Type Guard
|--------------------------------------------------------------------------
*/

const isMfaChallenge = (
  data: RawLoginData,
): data is RawLoginMfaData =>
  (data as RawLoginMfaData).mfa_required === true;

/**
 * authService
 *
 * WEB AUTHENTICATION API
 *
 * Authentication:
 *
 *     Laravel Sanctum Stateful SPA Authentication
 *
 * Authorization:
 *
 *     Laravel + Spatie Permission
 *
 * Session:
 *
 *     laravel_session
 *     XSRF-TOKEN
 */
export const authService = {
  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  login: async (
    data: LoginVariables,
  ): Promise<LoginResult> => {
    await initializeCsrf();

    const response =
      await api.post<
        SingleResponse<RawLoginData>
      >(
        "/v1/auth/web-login",
        data
      );

    const result = response.data.data;

    if (!result) {
      throw new Error(
        "Login succeeded but no authentication data was returned."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | MFA Challenge
    |--------------------------------------------------------------------------
    */

    if (isMfaChallenge(result)) {
      return {
        authenticated: false,
        mfa_required: true,
        mfa_setup_required: result.mfa_setup_required,
        challenge_id: result.challenge_id,
        expires_in: result.expires_in,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Fully Authenticated
    |--------------------------------------------------------------------------
    */

    return {
      authenticated: true,
      user: result,
    };
  },

  /*
  |--------------------------------------------------------------------------
  | CURRENT USER
  |--------------------------------------------------------------------------
  */

  me: async (): Promise<AuthUser> => {
    const response =
      await api.get<
        SingleResponse<AuthUser>
      >(
        "/v1/auth/web-me"
      );

    if (!response.data.data) {
      throw new Error(
        "Authenticated user data was not returned."
      );
    }

    return response.data.data;
  },

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  logout: async (): Promise<void> => {
    await api.post<
      SingleResponse<null>
    >(
      "/v1/auth/web-logout"
    );
  },

  /*
  |--------------------------------------------------------------------------
  | UPDATE PASSWORD
  |--------------------------------------------------------------------------
  */

  updatePassword: async (data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<void> => {
    await api.post<
      SingleResponse<null>
    >(
      "/v1/auth/update-password",
      data
    );
  },

  /*
  |--------------------------------------------------------------------------
  | UPDATE PROFILE
  |--------------------------------------------------------------------------
  */

  updateProfile: async (data: {
    name: string;
    email: string;
  }): Promise<AuthUser> => {
    const response =
      await api.put<
        SingleResponse<AuthUser>
      >(
        "/v1/auth/update-profile",
        data
      );

    if (!response.data.data) {
      throw new Error(
        "Profile update succeeded but no user data was returned."
      );
    }

    return response.data.data;
  },
};