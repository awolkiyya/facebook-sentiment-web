"use client";

import{
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  KeyRound,
  Loader2,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import {
  useCancelMfaSetup,
  useConfirmMfaSetup,
  useMfaStatus,
  useStartMfaSetup,
} from "@/hooks/mfa/mfa.hooks";

import { setUser } from "@/lib/store/slices/user.slice";

import type {
  RootState,
  AppDispatch,
} from "@/lib/store/store";

type SetupStep =
  | "idle"
  | "setup"
  | "success";

export default function MfaSecurityPage() {
  const router = useRouter();

  const dispatch =
    useDispatch<AppDispatch>();

  // =========================================================
  // AUTH STATE
  // =========================================================

  const user = useSelector(
    (state: RootState) =>
      state.auth.user,
  );

  const security = useSelector(
    (state: RootState) =>
      state.auth.security,
  );

  // =========================================================
  // MFA POLICY
  // =========================================================

  const mfaRequired =
    security?.require_two_factor ?? false;

  const userMfaEnabled =
    user?.mfa_enabled ?? false;

  // =========================================================
  // SERVER MFA STATUS
  // =========================================================

  const {
    data: mfaStatus,
    isLoading: isLoadingMfaStatus,
    isError: isMfaStatusError,
    refetch: refetchMfaStatus,
  } = useMfaStatus();

  /**
   * The MFA status endpoint is authoritative.
   *
   * Expected response:
   *
   * {
   *   enabled: boolean,
   *   configured: boolean,
   *   confirmed: boolean,
   *   type: string | null,
   *   name: string | null,
   *   confirmed_at: string | null,
   *   last_used_at: string | null,
   *   recovery_codes_remaining: number
   * }
   */
  const effectiveMfaEnabled =
    mfaStatus?.enabled ??
    userMfaEnabled;

  const mfaConfigured =
    mfaStatus?.configured ??
    false;

  const mfaConfirmed =
    mfaStatus?.confirmed ??
    false;

  const recoveryCodesRemaining =
    mfaStatus?.recovery_codes_remaining ??
    0;

  /**
   * MFA setup is required when the organization
   * requires MFA and the account is not enabled.
   */
  const isSetupRequired =
    mfaRequired &&
    !effectiveMfaEnabled;

  /**
   * MFA may only be disabled when:
   *
   * 1. MFA is currently enabled.
   * 2. The organization does not require MFA.
   */
  const canDisableMfa =
    effectiveMfaEnabled &&
    !mfaRequired;

  // =========================================================
  // MFA MUTATIONS
  // =========================================================

  const {
    mutateAsync: startMfaSetup,
    isPending: isStartingSetup,
  } = useStartMfaSetup();

  const {
    mutateAsync: confirmMfaSetup,
    isPending: isConfirmingSetup,
  } = useConfirmMfaSetup();

  const {
    mutateAsync: cancelMfaSetup,
    isPending: isCancellingSetup,
  } = useCancelMfaSetup();

  // =========================================================
  // LOCAL SETUP STATE
  // =========================================================

  /**
   * MFA configuration ID returned by:
   *
   * POST /v1/security/mfa/setup
   */
  const [mfaId, setMfaId] =
    useState<string | null>(null);

  /**
   * TOTP provisioning URI.
   */
  const [otpauthUrl, setOtpauthUrl] =
    useState<string | null>(null);

  const [issuer, setIssuer] =
    useState(
      "Municipal Social Analytics",
    );

   const [account, setAccount] = useState(user?.email ?? "");

  const [code, setCode] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [copied, setCopied] =
    useState(false);

  const [step, setStep] =
    useState<SetupStep>("idle");

  /**
   * Recovery codes returned only after
   * successful MFA confirmation.
   *
   * These remain only in component memory.
   */
  const [recoveryCodes, setRecoveryCodes] =
    useState<string[]>([]);

  /**
   * Either:
   *
   * - a specific recovery code
   * - "__all__" for all recovery codes
   * - null
   */
  const [copiedRecoveryCode, setCopiedRecoveryCode] =
    useState<string | null>(null);

  // =========================================================
  // DERIVED STATE
  // =========================================================

  const loading =
    isStartingSetup ||
    isConfirmingSetup ||
    isCancellingSetup;

  const canVerify =
    Boolean(mfaId) &&
    code.length === 6 &&
    !loading;

 // =========================================================
// DERIVED ACCOUNT DISPLAY
// =========================================================

const displayedAccount =
step === "idle" && user?.email
  ? user.email
  : account;

  // =========================================================
  // CLIPBOARD HELPER
  // =========================================================

  /**
   * Copies text using the modern Clipboard API when
   * available, then falls back to document.execCommand().
   *
   * The fallback is useful when:
   *
   * - Clipboard API is unavailable
   * - browser permissions block Clipboard API
   * - development/server environment is not secure
   */
  const copyTextToClipboard = async (
    text: string,
  ): Promise<boolean> => {
    // -------------------------------------------------------
    // MODERN CLIPBOARD API
    // -------------------------------------------------------

    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof window !== "undefined" &&
      window.isSecureContext
    ) {
      try {
        await navigator.clipboard.writeText(
          text,
        );

        return true;
      } catch {
        // Continue to fallback.
      }
    }

    // -------------------------------------------------------
    // FALLBACK
    // -------------------------------------------------------

    try {
      const textarea =
        document.createElement(
          "textarea",
        );

      textarea.value = text;

      textarea.setAttribute(
        "readonly",
        "",
      );

      textarea.style.position =
        "fixed";

      textarea.style.top =
        "0";

      textarea.style.left =
        "0";

      textarea.style.width =
        "1px";

      textarea.style.height =
        "1px";

      textarea.style.padding =
        "0";

      textarea.style.border =
        "0";

      textarea.style.outline =
        "0";

      textarea.style.boxShadow =
        "none";

      textarea.style.background =
        "transparent";

      textarea.style.opacity =
        "0";

      textarea.style.pointerEvents =
        "none";

      document.body.appendChild(
        textarea,
      );

      textarea.focus();

      textarea.select();

      textarea.setSelectionRange(
        0,
        textarea.value.length,
      );

      const copied =
        document.execCommand(
          "copy",
        );

      document.body.removeChild(
        textarea,
      );

      return copied;
    } catch {
      return false;
    }
  };

  // =========================================================
  // START MFA SETUP
  // =========================================================

  const startSetup = async () => {
    setError(null);
    setCopied(false);
    setCode("");
    setRecoveryCodes([]);
    setCopiedRecoveryCode(null);

    try {
      const data =
        await startMfaSetup();

      /**
       * Actual backend response:
       *
       * {
       *   id,
       *   type,
       *   name,
       *   secret,
       *   otpauth_url,
       *   issuer,
       *   account,
       *   confirmed
       * }
       */

      if (!data.id) {
        throw new Error(
          "The MFA configuration was not created.",
        );
      }

      if (!data.otpauth_url) {
        throw new Error(
          "The server did not return the authenticator configuration.",
        );
      }

      setMfaId(
        data.id,
      );

      setOtpauthUrl(
        data.otpauth_url,
      );

      setIssuer(
        data.issuer ||
          "Municipal Social Analytics",
      );

      setAccount(
        data.account ||
          user?.email ||
          "",
      );

      setStep("setup");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start MFA setup.",
      );
    }
  };

  // =========================================================
  // CONFIRM MFA SETUP
  // =========================================================

  const confirmSetup = async () => {
    if (!mfaId) {
      setError(
        "Your MFA configuration is no longer available. Please start the setup again.",
      );

      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError(
        "Enter the 6-digit verification code from your authenticator app.",
      );

      return;
    }

    setError(null);

    try {
      /**
       * Confirm request:
       *
       * {
       *   id: string,
       *   code: string
       * }
       */
      const data =
        await confirmMfaSetup({
          id: mfaId,
          code,
        });

      /**
       * Actual backend response:
       *
       * {
       *   enabled: true,
       *   confirmed: true,
       *   method: {...},
       *   recovery_codes: [...]
       * }
       */
      if (
        !data.enabled ||
        !data.confirmed
      ) {
        throw new Error(
          "MFA verification completed, but the account was not successfully enabled for MFA.",
        );
      }

      // =====================================================
      // SYNCHRONIZE REDUX USER
      // =====================================================

      if (user) {
        dispatch(
          setUser({
            ...user,
            mfa_enabled: true,
          }),
        );
      }

      // =====================================================
      // STORE RECOVERY CODES
      // =====================================================

      setRecoveryCodes(
        data.recovery_codes ?? [],
      );

      // =====================================================
      // CLEAR SENSITIVE SETUP DATA
      // =====================================================

      setMfaId(null);

      setOtpauthUrl(null);

      setCode("");

      setCopied(false);

      // =====================================================
      // SHOW SUCCESS IMMEDIATELY
      // =====================================================

      setStep("success");

      /**
       * Refresh the authoritative server state.
       *
       * Do not await this here.
       *
       * MFA confirmation has already succeeded. A temporary
       * status-refresh failure must not make the UI report
       * the successful MFA confirmation as failed.
       */
      void refetchMfaStatus();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The verification code is invalid or the MFA configuration could not be confirmed.",
      );
    }
  };

  // =========================================================
  // CANCEL PENDING MFA SETUP
  // =========================================================

  const cancelSetup = async () => {
    if (!mfaId) {
      resetLocalSetup();

      return;
    }

    setError(null);

    try {
      await cancelMfaSetup();

      resetLocalSetup();

      await refetchMfaStatus();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel MFA setup.",
      );
    }
  };

  // =========================================================
  // RESET LOCAL SETUP
  // =========================================================

  const resetLocalSetup = () => {
    setStep("idle");

    setMfaId(null);

    setOtpauthUrl(null);

    setCode("");

    setError(null);

    setCopied(false);

    setRecoveryCodes([]);

    setCopiedRecoveryCode(null);
  };

  // =========================================================
  // COPY OTPAUTH URL
  // =========================================================

  const copyUri = async () => {
    if (!otpauthUrl) {
      return;
    }

    const copiedSuccessfully =
      await copyTextToClipboard(
        otpauthUrl,
      );

    if (
      copiedSuccessfully
    ) {
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);

      return;
    }

    setError(
      "Unable to copy the authenticator configuration. Please copy it manually.",
    );
  };

  // =========================================================
  // COPY SINGLE RECOVERY CODE
  // =========================================================

  const copyRecoveryCode = async (
    recoveryCode: string,
  ) => {
    const copiedSuccessfully =
      await copyTextToClipboard(
        recoveryCode,
      );

    if (
      copiedSuccessfully
    ) {
      setCopiedRecoveryCode(
        recoveryCode,
      );

      window.setTimeout(() => {
        setCopiedRecoveryCode(
          null,
        );
      }, 1800);

      return;
    }

    setError(
      "Unable to copy the recovery code. Please copy it manually.",
    );
  };

  // =========================================================
  // COPY ALL RECOVERY CODES
  // =========================================================

  const copyAllRecoveryCodes = async () => {
    if (
      recoveryCodes.length === 0
    ) {
      return;
    }

    /**
     * Keep each recovery code on its own line.
     *
     * Example:
     *
     * CODE-ONE
     * CODE-TWO
     * CODE-THREE
     */
    const recoveryCodesText =
      recoveryCodes.join("\n");

    const copiedSuccessfully =
      await copyTextToClipboard(
        recoveryCodesText,
      );

    if (
      copiedSuccessfully
    ) {
      setCopiedRecoveryCode(
        "__all__",
      );

      window.setTimeout(() => {
        setCopiedRecoveryCode(
          null,
        );
      }, 1800);

      return;
    }

    setError(
      "Unable to copy the recovery codes. Please copy them manually.",
    );
  };

  // =========================================================
  // BACK TO SETTINGS
  // =========================================================

  const goBack = () => {
    /**
     * Recovery codes are intentionally removed from
     * component memory when leaving this screen.
     */
    setRecoveryCodes([]);

    setCopiedRecoveryCode(
      null,
    );

    router.back();
  };

  // =========================================================
  // SUCCESS STATE
  // =========================================================

  if (step === "success") {
    return (
      <div className="mx-auto w-full max-w-xl p-6">
        <button
          type="button"
          onClick={goBack}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to settings
        </button>

        <Card>
          <CardContent className="px-6 py-10">
            {/* =================================================
                SUCCESS HEADER
            ================================================= */}

            <div className="flex flex-col items-center text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>

              <h1 className="text-xl font-semibold">
                Two-factor authentication enabled
              </h1>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Your account is now protected with
                two-factor authentication.
              </p>
            </div>

            {/* =================================================
                VERIFIED
            ================================================= */}

            <div className="mt-6 flex items-center gap-2 rounded-lg border bg-muted/20 px-4 py-3 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />

              <span>
                Authenticator app verified successfully.
              </span>
            </div>

            {/* =================================================
                RECOVERY CODES
            ================================================= */}

            {recoveryCodes.length > 0 && (
              <div className="mt-6 rounded-xl border">
                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="border-b p-4">
                  <div className="flex items-start gap-3">
                    <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                    <div>
                      <h2 className="text-sm font-semibold">
                        Save your recovery codes
                      </h2>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        These codes can be used to access
                        your account if you lose access to
                        your authenticator app. Each code can
                        normally be used only once.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  {/* =================================================
                      SECURITY WARNING
                  ================================================= */}

                  <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                    <p className="text-xs leading-5 text-amber-800">
                      Store these codes somewhere secure.
                      They will not be shown again after you
                      leave this screen.
                    </p>
                  </div>

                  {/* =================================================
                      RECOVERY CODES
                  ================================================= */}

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {recoveryCodes.map(
                      (recoveryCode) => (
                        <div
                          key={recoveryCode}
                          className="flex items-center justify-between gap-2 rounded-lg border bg-muted/20 px-3 py-2"
                        >
                          <code className="min-w-0 truncate text-sm font-medium tracking-wide">
                            {recoveryCode}
                          </code>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() =>
                              void copyRecoveryCode(
                                recoveryCode,
                              )
                            }
                            aria-label="Copy recovery code"
                          >
                            {copiedRecoveryCode ===
                            recoveryCode ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ),
                    )}
                  </div>

                  {/* =================================================
                      COPY ALL
                  ================================================= */}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      void copyAllRecoveryCodes()
                    }
                  >
                    {copiedRecoveryCode ===
                    "__all__" ? (
                      <>
                        <Check className="mr-2 h-4 w-4 text-green-600" />

                        Recovery codes copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />

                        Copy all recovery codes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* =================================================
                FINISH
            ================================================= */}

            <Button
              className="mt-7 w-full"
              onClick={goBack}
            >
              Back to settings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // =========================================================
  // SETUP STATE
  // =========================================================

  if (step === "setup") {
    return (
      <div className="mx-auto w-full max-w-xl p-6">
        <button
          type="button"
          onClick={() =>
            void cancelSetup()
          }
          disabled={loading}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          {isCancellingSetup ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowLeft className="h-4 w-4" />
          )}

          {isCancellingSetup
            ? "Cancelling..."
            : "Back"}
        </button>

        <Card>
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>

            <CardTitle>
              Set up authenticator app
            </CardTitle>

            <CardDescription>
              Use an authenticator application to
              generate secure verification codes for
              your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* =================================================
                STEP 1 — QR CODE
            ================================================= */}

            <section>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                  1
                </span>

                <div>
                  <p className="text-sm font-medium">
                    Scan the QR code
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Open your authenticator app and scan
                    this code.
                  </p>
                </div>
              </div>

              <div className="flex justify-center rounded-xl border bg-white p-6">
                {otpauthUrl ? (
                  <QRCodeSVG
                    value={otpauthUrl}
                    size={240}
                    level="M"
                    includeMargin
                    aria-label="Authenticator QR code"
                  />
                ) : (
                  <div className="flex h-60 w-60 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* =================================================
                  ACCOUNT INFORMATION
              ================================================= */}

              <div className="mt-4 grid gap-3 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Account
                </p>

                <p className="mt-1 truncate text-sm">
                  {displayedAccount}
                </p>
              </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Issuer
                  </p>

                  <p className="mt-1 text-sm">
                    {issuer}
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* =================================================
                STEP 2 — VERIFY
            ================================================= */}

            <section>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                  2
                </span>

                <div>
                  <p className="text-sm font-medium">
                    Verify your authenticator
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Enter the current 6-digit code.
                  </p>
                </div>
              </div>

              <Label
                htmlFor="mfa-code"
                className="sr-only"
              >
                Verification code
              </Label>

              <Input
                id="mfa-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(event) => {
                  const value =
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);

                  setCode(value);

                  setError(null);
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    canVerify
                  ) {
                    void confirmSetup();
                  }
                }}
                placeholder="000000"
                className="h-12 text-center text-lg tracking-[0.4em]"
                disabled={loading}
              />

              <p className="mt-2 text-xs text-muted-foreground">
                The code changes automatically in your
                authenticator application.
              </p>
            </section>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                role="alert"
                className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />

                <p className="text-destructive">
                  {error}
                </p>
              </div>
            )}

            {/* =================================================
                VERIFY BUTTON
            ================================================= */}

            <Button
              type="button"
              className="w-full"
              disabled={!canVerify}
              onClick={() =>
                void confirmSetup()
              }
            >
              {isConfirmingSetup ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />

                  Verify and enable
                </>
              )}
            </Button>

            {/* =================================================
                MANUAL CONFIGURATION
            ================================================= */}

            {otpauthUrl && (
              <div className="rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      Cant scan the QR code?
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      You can manually enter the
                      authenticator configuration into
                      your authenticator application.
                    </p>

                    <div className="mt-3 flex gap-2">
                      <Input
                        readOnly
                        value={otpauthUrl}
                        className="min-w-0 text-xs"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          void copyUri()
                        }
                        aria-label="Copy authenticator configuration"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
                      Treat this configuration as a
                      secret. Do not share it with anyone.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                CANCEL
            ================================================= */}

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={loading}
              onClick={() =>
                void cancelSetup()
              }
            >
              Cancel setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // =========================================================
  // LOADING STATUS
  // =========================================================

  if (
    isLoadingMfaStatus &&
    !mfaStatus
  ) {
    return (
      <div className="mx-auto w-full max-w-xl p-6">
        <button
          type="button"
          onClick={goBack}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to settings
        </button>

        <Card>
          <CardContent className="flex min-h-80 flex-col items-center justify-center text-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />

            <p className="mt-4 text-sm font-medium">
              Loading MFA security settings
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Checking your current authentication
              security status.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // =========================================================
  // STATUS ERROR
  // =========================================================

  if (
    isMfaStatusError &&
    !mfaStatus
  ) {
    return (
      <div className="mx-auto w-full max-w-xl p-6">
        <button
          type="button"
          onClick={goBack}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to settings
        </button>

        <Card>
          <CardContent className="flex flex-col items-center px-6 py-12 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>

            <h1 className="text-lg font-semibold">
              Unable to load MFA status
            </h1>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              We could not retrieve your current
              multi-factor authentication status.
            </p>

            <Button
              className="mt-6"
              variant="outline"
              onClick={() =>
                void refetchMfaStatus()
              }
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // =========================================================
  // MANAGEMENT / INITIAL STATE
  // =========================================================

  return (
    <div className="mx-auto w-full max-w-xl p-6">
      {/* =====================================================
          BACK
      ===================================================== */}

      <button
        type="button"
        onClick={goBack}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />

        Back to settings
      </button>

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mb-6">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          Two-factor authentication
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Protect your account with an additional
          verification step using an authenticator
          application.
        </p>
      </div>

      {/* =====================================================
          MAIN SECURITY CARD
      ===================================================== */}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted/20">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="min-w-0">
                <CardTitle className="text-base">
                  Authenticator app
                </CardTitle>

                <CardDescription className="mt-1">
                  Time-based one-time password
                  authentication
                </CardDescription>
              </div>
            </div>

            {/* =================================================
                STATUS BADGE
            ================================================= */}

            <span
              className={
                effectiveMfaEnabled
                  ? "shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                  : mfaRequired
                    ? "shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700"
                    : "shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
              }
            >
              {effectiveMfaEnabled
                ? "Enabled"
                : mfaRequired
                  ? "Required"
                  : "Not configured"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* =================================================
              REQUIRED MFA
          ================================================= */}

          {isSetupRequired && (
            <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

              <div>
                <p className="text-sm font-medium text-amber-900">
                  Two-factor authentication is required
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-800">
                  Your organization requires
                  two-factor authentication for this
                  account. Complete setup to satisfy the
                  security requirement.
                </p>
              </div>
            </div>
          )}

          {/* =================================================
              ENABLED
          ================================================= */}

          {effectiveMfaEnabled && (
            <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />

              <div>
                <p className="text-sm font-medium text-green-900">
                  Your account is protected
                </p>

                <p className="mt-1 text-xs leading-5 text-green-800">
                  MFA verification is required during
                  sign-in for this account.
                </p>
              </div>
            </div>
          )}

          {/* =================================================
              CONFIGURATION DETAILS
          ================================================= */}

          {effectiveMfaEnabled &&
            mfaConfigured && (
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Method
                    </p>

                    <p className="mt-1 text-sm">
                      {mfaStatus?.type ??
                        "TOTP"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Application
                    </p>

                    <p className="mt-1 text-sm">
                      {mfaStatus?.name ??
                        "Authenticator App"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Confirmed
                    </p>

                    <p className="mt-1 text-sm">
                      {mfaConfirmed
                        ? "Yes"
                        : "No"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Recovery codes
                    </p>

                    <p className="mt-1 text-sm">
                      {recoveryCodesRemaining} remaining
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* =================================================
              NOT CONFIGURED
          ================================================= */}

          {!effectiveMfaEnabled &&
            !mfaRequired && (
              <div className="flex gap-3 rounded-lg border bg-muted/20 p-4">
                <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                <div>
                  <p className="text-sm font-medium">
                    MFA is not configured
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Two-factor authentication is
                    currently optional for your account.
                    You can enable it to add another layer
                    of account protection.
                  </p>
                </div>
              </div>
            )}

          <Separator />

          {/* =================================================
              ENABLE MFA
          ================================================= */}

          {!effectiveMfaEnabled && (
            <div>
              <Button
                type="button"
                className="w-full"
                disabled={isStartingSetup}
                onClick={() =>
                  void startSetup()
                }
              >
                {isStartingSetup ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                    Preparing secure setup...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />

                    Set up authenticator app
                  </>
                )}
              </Button>

              <p className="mt-2 text-center text-xs text-muted-foreground">
                Setup takes less than a minute.
              </p>
            </div>
          )}

          {/* =================================================
              ENABLED MANAGEMENT
          ================================================= */}

          {effectiveMfaEnabled && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                  <div>
                    <p className="text-sm font-medium">
                      Authenticator configured
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Your authenticator application is
                      currently associated with this account.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  RECONFIGURE
              ================================================= */}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setError(
                    "Reconfiguring MFA requires a secure re-verification flow.",
                  );
                }}
              >
                <KeyRound className="mr-2 h-4 w-4" />

                Reconfigure authenticator
              </Button>

              {/* =================================================
                  DISABLE
              ================================================= */}

              {canDisableMfa && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={() => {
                    setError(
                      "Disabling MFA requires additional verification.",
                    );
                  }}
                >
                  Disable two-factor authentication
                </Button>
              )}

              {/* =================================================
                  REQUIRED POLICY
              ================================================= */}

              {mfaRequired && (
                <p className="text-center text-xs leading-5 text-muted-foreground">
                  Two-factor authentication is required
                  by your organizations security policy
                  and cannot be disabled from this page.
                </p>
              )}
            </div>
          )}

          {/* =====================================================
              SECURITY NOTICE
          ===================================================== */}

          <div className="rounded-lg border bg-muted/20 p-4">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

              <div>
                <p className="text-xs font-medium">
                  Security notice
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Never share your authenticator code,
                  QR code, or setup configuration with
                  another person. Authorized support staff
                  will never ask for your verification code.
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================
              ERROR
          ===================================================== */}

          {error && (
            <div
              role="alert"
              className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />

              <p className="text-destructive">
                {error}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
