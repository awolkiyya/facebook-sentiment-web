import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { mfaService } from "@/services/mfa.service";

import type { ApiClientError } from "@/lib/api/api-error";

import type {
  MfaSetupStartData,
  MfaSetupConfirmRequest,
  MfaSetupConfirmData,
  MfaChallengeVerifyRequest,
  MfaChallengeVerifyData,
} from "@/types/mfa-setup";

/**
 * ============================================================================
 * MFA QUERY KEYS
 * ============================================================================
 *
 * Centralized React Query keys for all MFA-related queries.
 */
export const mfaQueryKeys = {
  all: ["mfa"] as const,

  status: () =>
    [...mfaQueryKeys.all, "status"] as const,

  setup: () =>
    [...mfaQueryKeys.all, "setup"] as const,

  challenge: () =>
    [...mfaQueryKeys.all, "challenge"] as const,

  recoveryCodes: () =>
    [...mfaQueryKeys.all, "recovery-codes"] as const,
};

/**
 * ============================================================================
 * MFA STATUS
 * ============================================================================
 *
 * Returns the current MFA status for the authenticated user.
 *
 * Endpoint:
 *
 *     GET /v1/security/mfa
 *
 * This query is useful for:
 *
 * - Security settings
 * - MFA management page
 * - Determining whether MFA is enabled
 * - Recovery-code management
 */
export function useMfaStatus() {
  return useQuery({
    queryKey: mfaQueryKeys.status(),

    queryFn: () =>
      mfaService.status(),
  });
}

/**
 * ============================================================================
 * START MFA SETUP
 * ============================================================================
 *
 * Creates a short-lived MFA setup challenge
 * and returns the TOTP information required
 * to configure the authenticator application.
 *
 * Endpoint:
 *
 *     POST /v1/security/mfa/setup
 *
 * Important:
 *
 * Starting setup does NOT enable MFA.
 *
 * MFA becomes enabled only after:
 *
 *     useConfirmMfaSetup()
 *
 * successfully verifies the TOTP code.
 */
export function useStartMfaSetup() {
  return useMutation<
    MfaSetupStartData,
    ApiClientError,
    void
  >({
    mutationFn: () =>
      mfaService.startSetup(),

    onError: (error) => {
      toast.error(
        error.message ??
          "Failed to start MFA setup.",
      );
    },
  });
}

/**
 * ============================================================================
 * CONFIRM MFA SETUP
 * ============================================================================
 *
 * Verifies the six-digit TOTP code generated
 * by the user's authenticator application.
 *
 * Endpoint:
 *
 *     POST /v1/security/mfa/confirm
 *
 * On success:
 *
 * - MFA is enabled
 * - mfa_confirmed_at is stored
 * - MFA status becomes enabled
 * - Current-user data should be refreshed
 */
export function useConfirmMfaSetup() {
  const queryClient =
    useQueryClient();

  return useMutation<
    MfaSetupConfirmData,
    ApiClientError,
    MfaSetupConfirmRequest
  >({
    mutationFn: (data) =>
      mfaService.confirmSetup(data),

    onSuccess: async () => {
      /*
       * Refresh MFA status.
       */
      await queryClient.invalidateQueries({
        queryKey:
          mfaQueryKeys.status(),
      });

      /*
       * Refresh authenticated user/session.
       *
       * This assumes your application uses
       * ["auth", "me"] for the current-user query.
       */
      await queryClient.invalidateQueries({
        queryKey: ["auth", "me"],
      });

      toast.success(
        "Two-factor authentication enabled successfully.",
      );
    },

    onError: (error) => {
      toast.error(
        error.message ??
          "Invalid verification code.",
      );
    },
  });
}

/**
 * ============================================================================
 * VERIFY MFA LOGIN CHALLENGE
 * ============================================================================
 *
 * Used after password authentication when
 * MFA verification is required.
 *
 * Endpoint:
 *
 *     POST /v1/security/mfa/verify
 *
 * A successful mutation means the backend
 * has completed MFA verification.
 *
 * The backend should then establish the
 * authenticated Laravel session.
 */
export function useVerifyMfaChallenge() {
  const queryClient =
    useQueryClient();

  return useMutation<
    MfaChallengeVerifyData,
    ApiClientError,
    MfaChallengeVerifyRequest
  >({
    mutationFn: (data) =>
      mfaService.verifyChallenge(data),

    onSuccess: async () => {
      /*
       * The authenticated user may now be
       * available through the normal session.
       */
      await queryClient.invalidateQueries({
        queryKey: ["auth", "me"],
      });
    },

    onError: (error) => {
      toast.error(
        error.message ??
          "Invalid verification code.",
      );
    },
  });
}

/**
 * ============================================================================
 * RECOVERY CODES STATUS
 * ============================================================================
 *
 * Returns recovery-code metadata/status.
 *
 * Endpoint:
 *
 *     GET /v1/security/mfa/recovery-codes
 *
 * IMPORTANT:
 *
 * This should NOT expose the actual recovery
 * codes unless the backend intentionally
 * returns them for a secure one-time display.
 */
export function useMfaRecoveryCodesStatus() {
  return useQuery({
    queryKey:
      mfaQueryKeys.recoveryCodes(),

    queryFn: () =>
      mfaService.recoveryCodesStatus(),

    enabled: true,
  });
}

/**
 * ============================================================================
 * REGENERATE RECOVERY CODES
 * ============================================================================
 *
 * Generates a new set of recovery codes.
 *
 * Endpoint:
 *
 *     POST /v1/security/mfa/recovery-codes/regenerate
 *
 * The backend should invalidate the previous
 * recovery codes when new ones are generated.
 */
export function useRegenerateMfaRecoveryCodes() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: () =>
      mfaService.regenerateRecoveryCodes(),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          mfaQueryKeys.recoveryCodes(),
      });

      toast.success(
        "Recovery codes regenerated successfully.",
      );
    },

    onError: (error: ApiClientError) => {
      toast.error(
        error.message ??
          "Failed to regenerate recovery codes.",
      );
    },
  });
}

/**
 * ============================================================================
 * DISABLE MFA
 * ============================================================================
 *
 * Disables MFA for the current user.
 *
 * Endpoint:
 *
 *     POST /v1/security/mfa/disable
 *
 * The backend must enforce the security
 * requirements for disabling MFA.
 *
 * In particular:
 *
 *     require_two_factor === true
 *
 * should prevent the user from disabling MFA
 * unless your administrative policy explicitly
 * allows an alternative flow.
 */
export function useDisableMfa() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data?: Record<string, unknown>,
    ) =>
      mfaService.disable(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          mfaQueryKeys.status(),
      });

      await queryClient.invalidateQueries({
        queryKey: ["auth", "me"],
      });

      toast.success(
        "Two-factor authentication has been disabled.",
      );
    },

    onError: (error: ApiClientError) => {
      toast.error(
        error.message ??
          "Failed to disable two-factor authentication.",
      );
    },
  });
}

/**
 * ============================================================================
 * CANCEL MFA SETUP
 * ============================================================================
 *
 * Cancels a pending MFA setup transaction.
 *
 * Endpoint:
 *
 *     POST /v1/security/mfa/cancel
 *
 * This should invalidate the pending setup
 * challenge and temporary MFA secret on the
 * backend.
 */
export function useCancelMfaSetup() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: () =>
      mfaService.cancelSetup(),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          mfaQueryKeys.status(),
      });

      toast.success(
        "MFA setup has been cancelled.",
      );
    },

    onError: (error: ApiClientError) => {
      toast.error(
        error.message ??
          "Failed to cancel MFA setup.",
      );
    },
  });
}
