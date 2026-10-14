import type { AuthUser } from "./user";

/*
|--------------------------------------------------------------------------
| MFA STATUS
|--------------------------------------------------------------------------
*/

/**
 * Current MFA configuration and activation status.
 *
 * GET /v1/security/mfa
 */
export interface MfaStatusData {
  /**
   * Whether MFA is currently enabled for authentication.
   */
  enabled: boolean;

  /**
   * Whether an MFA configuration exists.
   */
  configured: boolean;

  /**
   * Whether the MFA configuration has been confirmed.
   */
  confirmed: boolean;

  /**
   * Configured MFA method.
   */
  type: "TOTP" | null;

  /**
   * Human-readable MFA configuration name.
   *
   * Example:
   * "Authenticator App"
   */
  name: string | null;

  /**
   * Timestamp when MFA was confirmed.
   */
  confirmed_at: string | null;

  /**
   * Timestamp when MFA was last successfully used.
   */
  last_used_at: string | null;

  /**
   * Number of unused recovery codes.
   */
  recovery_codes_remaining: number;
}

/*
|--------------------------------------------------------------------------
| MFA SETUP
|--------------------------------------------------------------------------
*/

/**
 * Data returned when MFA setup is started.
 *
 * POST /v1/security/mfa/setup
 */
export interface MfaSetupStartData {
  /**
   * MFA configuration UUID.
   */
  id: string;

  /**
   * MFA method.
   */
  type: "TOTP";

  /**
   * Human-readable configuration name.
   *
   * Example:
   * "Authenticator App"
   */
  name: string;

  /**
   * TOTP secret.
   *
   * Sensitive data.
   *
   * Do not persist this in Redux, localStorage,
   * sessionStorage, analytics, or application logs.
   */
  secret: string;

  /**
   * Full TOTP provisioning URI.
   *
   * Used to generate the QR code.
   */
  otpauth_url: string;

  /**
   * TOTP issuer.
   */
  issuer: string;

  /**
   * User account represented by the TOTP credential.
   */
  account: string;

  /**
   * Whether the MFA configuration has been confirmed.
   */
  confirmed: boolean;
}

/*
|--------------------------------------------------------------------------
| MFA SETUP CONFIRMATION
|--------------------------------------------------------------------------
*/

/**
 * Request used to confirm MFA setup.
 *
 * POST /v1/security/mfa/confirm
 */
export interface MfaSetupConfirmRequest {
  /**
   * MFA configuration ID returned by the setup endpoint.
   */
  id: string;

  /**
   * Six-digit TOTP code from the authenticator application.
   */
  code: string;
}

/**
 * MFA method information returned after
 * successful setup confirmation.
 */
export interface MfaSetupConfirmMethod {
  /**
   * MFA configuration UUID.
   */
  id: string;

  /**
   * MFA method type.
   */
  type: "TOTP" | string;

  /**
   * Human-readable MFA method name.
   */
  name: string;

  /**
   * Timestamp when MFA was confirmed.
   */
  confirmed_at: string | null;
}

/**
 * Data returned after successfully confirming MFA setup.
 *
 * Actual backend response:
 *
 * {
 *   enabled: true,
 *   confirmed: true,
 *   method: {
 *     id: "...",
 *     type: "TOTP",
 *     name: "Authenticator App",
 *     confirmed_at: "..."
 *   },
 *   recovery_codes: [...]
 * }
 */
export interface MfaSetupConfirmData {
  /**
   * Whether MFA is now enabled.
   */
  enabled: boolean;

  /**
   * Whether the MFA configuration was successfully confirmed.
   */
  confirmed: boolean;

  /**
   * Confirmed MFA method information.
   */
  method: MfaSetupConfirmMethod;

  /**
   * One-time recovery codes generated after
   * successful MFA confirmation.
   *
   * These should only be held in frontend memory
   * and presented to the user once.
   *
   * Do not persist them in Redux, localStorage,
   * sessionStorage, analytics, or application logs.
   */
  recovery_codes: string[];
}

/*
|--------------------------------------------------------------------------
| MFA LOGIN CHALLENGE
|--------------------------------------------------------------------------
*/

/**
 * Request used to verify an MFA login challenge.
 *
 * POST /v1/security/mfa/verify
 */
export interface MfaChallengeVerifyRequest {
  /**
   * MFA login challenge identifier.
   */
  challenge_id: string;

  /**
   * Six-digit TOTP code from the authenticator application.
   */
  code: string;
}

/**
 * Data returned after successful MFA login verification.
 */
export interface MfaChallengeVerifyData {
  /**
   * Whether MFA verification succeeded.
   */
  authenticated: boolean;

  /**
   * Authenticated user when returned by the backend.
   */
  user?: AuthUser;
}
