import { api } from "@/lib/api/api";

import type { SingleResponse } from "@/types/api";

import type {
  MfaChallengeVerifyData,
  MfaChallengeVerifyRequest,
  MfaSetupConfirmData,
  MfaSetupConfirmRequest,
  MfaSetupStartData,
} from "@/types/mfa-setup";

/**
 * mfaService
 *
 * MULTI-FACTOR AUTHENTICATION API
 *
 * Base endpoint:
 *
 *     /v1/security/mfa
 *
 * Responsibilities:
 *
 * - MFA status
 * - Start TOTP MFA setup
 * - Confirm TOTP MFA setup
 * - Verify MFA login challenges
 * - Recovery-code management
 * - Disable MFA
 * - Cancel pending MFA setup
 *
 * Authentication:
 *
 *     Laravel Sanctum Stateful SPA Authentication
 *
 * MFA:
 *
 *     TOTP / Authenticator App
 *
 * Server-side MFA state:
 *
 *     Redis challenge
 *     Encrypted MFA secret
 */
export const mfaService = {
  /*
  |--------------------------------------------------------------------------
  | MFA STATUS
  |--------------------------------------------------------------------------
  |
  | GET /v1/security/mfa
  |
  | Returns the current MFA status for the
  | authenticated user.
  |
  */
  status: async () => {
    const response =
      await api.get(
        "/v1/security/mfa",
      );

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | START MFA SETUP
  |--------------------------------------------------------------------------
  |
  | POST /v1/security/mfa/setup
  |
  | Starts a new TOTP MFA setup transaction
  | for the authenticated user.
  |
  | The backend should:
  |
  | - Verify the authenticated user
  | - Generate or reuse the pending TOTP secret
  | - Create the setup challenge
  | - Store temporary state securely
  | - Return the challenge ID
  | - Return the otpauth URI
  |
  | IMPORTANT:
  |
  | This endpoint must NOT enable MFA.
  |
  | MFA becomes enabled only after confirmSetup()
  | successfully verifies the TOTP code.
  |
  */
  startSetup: async (): Promise<MfaSetupStartData> => {
    const response =
      await api.post<
        SingleResponse<MfaSetupStartData>
      >(
        "/v1/security/mfa/setup",
      );

    if (!response.data.data) {
      throw new Error(
        "MFA setup could not be started.",
      );
    }

    return response.data.data;
  },

  /*
  |--------------------------------------------------------------------------
  | CONFIRM MFA SETUP
  |--------------------------------------------------------------------------
  |
  | POST /v1/security/mfa/confirm
  |
  | Confirms that the user successfully
  | configured the authenticator application.
  |
  | The backend should:
  |
  | - Validate the setup challenge
  | - Retrieve the pending TOTP secret
  | - Verify the 6-digit TOTP code
  | - Set users.mfa_enabled = true
  | - Set users.mfa_confirmed_at
  |
  */
  confirmSetup: async (
    data: MfaSetupConfirmRequest,
  ): Promise<MfaSetupConfirmData> => {
    const response =
      await api.post<
        SingleResponse<MfaSetupConfirmData>
      >(
        "/v1/security/mfa/confirm",
        data,
      );

    if (!response.data.data) {
      throw new Error(
        "MFA setup confirmation did not return any data.",
      );
    }

    return response.data.data;
  },

  /*
  |--------------------------------------------------------------------------
  | VERIFY MFA LOGIN CHALLENGE
  |--------------------------------------------------------------------------
  |
  | POST /v1/security/mfa/verify
  |
  | Used after password authentication when
  | MFA verification is required.
  |
  | The backend should:
  |
  | - Validate the MFA challenge
  | - Retrieve the user's MFA secret
  | - Verify the TOTP code
  | - Complete authentication
  | - Create the authenticated session
  | - Update last_login_at
  |
  */
  verifyChallenge: async (
    data: MfaChallengeVerifyRequest,
  ): Promise<MfaChallengeVerifyData> => {
    const response =
      await api.post<
        SingleResponse<MfaChallengeVerifyData>
      >(
        "/v1/auth/mfa/verify",
        data,
      );

    if (!response.data.data) {
      throw new Error(
        "MFA verification did not return any data.",
      );
    }

    return response.data.data;
  },

  /*
  |--------------------------------------------------------------------------
  | RECOVERY CODES STATUS
  |--------------------------------------------------------------------------
  |
  | GET /v1/security/mfa/recovery-codes
  |
  */
  recoveryCodesStatus: async () => {
    const response =
      await api.get(
        "/v1/security/mfa/recovery-codes",
      );

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | REGENERATE RECOVERY CODES
  |--------------------------------------------------------------------------
  |
  | POST /v1/security/mfa/recovery-codes/regenerate
  |
  */
  regenerateRecoveryCodes: async () => {
    const response =
      await api.post(
        "/v1/security/mfa/recovery-codes/regenerate",
      );

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | DISABLE MFA
  |--------------------------------------------------------------------------
  |
  | POST /v1/security/mfa/disable
  |
  | The backend should enforce appropriate
  | verification before disabling MFA.
  |
  | In particular, disabling must be rejected
  | when the system requires MFA.
  |
  */
  disable: async (
    data?: Record<string, unknown>,
  ) => {
    const response =
      await api.post(
        "/v1/security/mfa/disable",
        data,
      );

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | CANCEL MFA SETUP
  |--------------------------------------------------------------------------
  |
  | POST /v1/security/mfa/cancel
  |
  | Cancels the currently pending MFA setup
  | transaction.
  |
  */
  cancelSetup: async () => {
    const response =
      await api.post(
        "/v1/security/mfa/cancel",
      );

    return response.data;
  },
};
