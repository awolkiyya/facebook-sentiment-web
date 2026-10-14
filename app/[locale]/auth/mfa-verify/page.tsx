"use client"

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useVerifyMfaChallenge } from "@/hooks/mfa/mfa.hooks"

import { setAuth } from "@/lib/store/slices/user.slice"
import {
  clearMfaChallenge,
  selectMfaChallenge,
} from "@/lib/store/slices/mfa.slice"

import { getLocalizedPath } from "@/utils/get-localized-path"

type VerificationMode =
  | "authenticator"
  | "recovery"

export default function MfaLoginVerification() {
  const dispatch = useDispatch()
  const router = useRouter()

  const challenge = useSelector(selectMfaChallenge)

  const [mode, setMode] =
    useState<VerificationMode>("authenticator")

  const [code, setCode] =
    useState("")

  const [error, setError] =
    useState("")

  const [secondsRemaining, setSecondsRemaining] =
    useState(0)

  const [success, setSuccess] =
    useState(false)

  const inputRef =
    useRef<HTMLInputElement>(null)

  const verifyMfaChallenge =
    useVerifyMfaChallenge()

  const loading =
    verifyMfaChallenge.isPending

  /*
  |--------------------------------------------------------------------------
  | Guard: No Active Challenge
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !challenge.challengeId ||
      !challenge.expiresAt
    ) {
      router.replace(
        getLocalizedPath("/auth/login"),
      )
    }
  }, [
    challenge.challengeId,
    challenge.expiresAt,
    router,
  ])

  /*
  |--------------------------------------------------------------------------
  | Countdown
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!challenge.expiresAt) {
      return
    }

    const tick = () => {
      setSecondsRemaining(
        Math.max(
          0,
          Math.round(
            (challenge.expiresAt! -
              Date.now()) /
              1000,
          ),
        ),
      )
    }

    tick()

    const timer =
      window.setInterval(
        tick,
        1000,
      )

    return () => {
      window.clearInterval(timer)
    }
  }, [challenge.expiresAt])

  /*
  |--------------------------------------------------------------------------
  | Focus Input
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        inputRef.current?.focus()
      }, 100)

    return () => {
      window.clearTimeout(timer)
    }
  }, [mode])

  /*
  |--------------------------------------------------------------------------
  | Time
  |--------------------------------------------------------------------------
  */

  const formattedTime =
    useMemo(() => {
      const minutes =
        Math.floor(
          secondsRemaining / 60,
        )

      const seconds =
        secondsRemaining % 60

      return `${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`
    }, [secondsRemaining])

  const isExpired =
    secondsRemaining <= 0

  const isAuthenticator =
    mode === "authenticator"

  /*
  |--------------------------------------------------------------------------
  | Validation
  |--------------------------------------------------------------------------
  */

  function validateCode(
    value: string,
  ): string | null {
    const normalized =
      value.trim()

    if (!normalized) {
      return isAuthenticator
        ? "Enter the 6-digit code from your authenticator app."
        : "Enter one of your recovery codes."
    }

    if (isAuthenticator) {
      if (!/^\d{6}$/.test(normalized)) {
        return "The authentication code must contain 6 digits."
      }

      return null
    }

    const recoveryCode =
      normalized
        .replace(/-/g, "")
        .toUpperCase()

    if (
      !/^[A-Z0-9]{12}$/.test(
        recoveryCode,
      )
    ) {
      return "Enter a valid recovery code."
    }

    return null
  }

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      loading ||
      !challenge.challengeId
    ) {
      return
    }

    setError("")

    if (isExpired) {
      setError(
        "This verification session has expired. Please sign in again.",
      )

      return
    }

    const normalizedCode =
      code.trim()

    const validationError =
      validateCode(
        normalizedCode,
      )

    if (validationError) {
      setError(
        validationError,
      )

      inputRef.current?.focus()

      return
    }

    try {
      const result =
        await verifyMfaChallenge.mutateAsync(
          {
            challenge_id:
              challenge.challengeId,
            code: normalizedCode,
          },
        )

      if (!result.authenticated) {
        setError(
          "The verification code is invalid or could not be accepted.",
        )

        inputRef.current?.focus()

        return
      }

      dispatch(
        setAuth({
          user: result.user!,
        }),
      )

      dispatch(
        clearMfaChallenge(),
      )

      setSuccess(true)

      window.setTimeout(() => {
        router.push(
          getLocalizedPath(
            "dashboard",
          ),
        )
      }, 600)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to verify the code. Please try again."

      setError(message)

      inputRef.current?.focus()
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Code Change
  |--------------------------------------------------------------------------
  */

  function handleCodeChange(
    value: string,
  ) {
    if (isAuthenticator) {
      setCode(
        value
          .replace(/\D/g, "")
          .slice(0, 6),
      )
    } else {
      setCode(
        value
          .toUpperCase()
          .replace(
            /[^A-Z0-9-]/g,
            "",
          )
          .slice(0, 14),
      )
    }

    if (error) {
      setError("")
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Switch Verification Method
  |--------------------------------------------------------------------------
  */

  function switchMode(
    nextMode: VerificationMode,
  ) {
    if (loading) {
      return
    }

    setMode(nextMode)
    setCode("")
    setError("")
  }

  /*
  |--------------------------------------------------------------------------
  | Back
  |--------------------------------------------------------------------------
  */

  function handleBack() {
    dispatch(
      clearMfaChallenge(),
    )

    router.push(
      getLocalizedPath("login"),
    )
  }

  /*
  |--------------------------------------------------------------------------
  | No Challenge
  |--------------------------------------------------------------------------
  */

  if (!challenge.challengeId) {
    return null
  }

  /*
  |--------------------------------------------------------------------------
  | Success
  |--------------------------------------------------------------------------
  */

  if (success) {
    return (
      <main className="flex min-h-[calc(100vh-2rem)] w-full items-center justify-center px-4 py-8">
        <Card className="w-full max-w-sm shadow-sm">
          <CardContent className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="size-6 text-primary" />
            </div>

            <h1 className="mt-5 text-lg font-semibold tracking-tight">
              Verification successful
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Completing your sign-in...
            </p>

            <Loader2 className="mt-5 size-4 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </main>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Main
  |--------------------------------------------------------------------------
  */

  return (
    <main className="flex min-h-[calc(100vh-2rem)] w-full items-center justify-center px-4 py-8">
      <Card className="w-full max-w-[420px] shadow-sm">
        <CardHeader className="space-y-4 pb-5 text-center">
          {/* Security Icon */}

          <div className="mx-auto flex size-12 items-center justify-center rounded-full border bg-primary/5">
            {isAuthenticator ? (
              <ShieldCheck className="size-5 text-primary" />
            ) : (
              <KeyRound className="size-5 text-primary" />
            )}
          </div>

          {/* Heading */}

          <div className="space-y-1.5">
            <CardTitle className="text-xl tracking-tight">
              Verify your identity
            </CardTitle>

            <CardDescription className="mx-auto max-w-[330px] text-sm leading-5">
              {isAuthenticator
                ? "Enter the 6-digit code from your authenticator app to continue."
                : "Enter one of your recovery codes to continue signing in."}
            </CardDescription>
          </div>

          {/* Security Status */}

          <div className="flex items-center justify-center">
            <Badge
              variant="secondary"
              className="gap-1.5 px-2.5 py-1 text-[11px] font-medium"
            >
              <ShieldCheck className="size-3" />
              Secure verification
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Verification Method */}

          <Tabs
            value={mode}
            onValueChange={(value) =>
              switchMode(
                value as VerificationMode,
              )
            }
            className="w-full"
          >
            <TabsList className="grid h-10 w-full grid-cols-2">
              <TabsTrigger
                value="authenticator"
                disabled={loading}
                className="gap-1.5 text-xs"
              >
                <ShieldCheck className="size-3.5" />
                Authenticator
              </TabsTrigger>

              <TabsTrigger
                value="recovery"
                disabled={loading}
                className="gap-1.5 text-xs"
              >
                <KeyRound className="size-3.5" />
                Recovery code
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Expiration */}

          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5">
            <span className="text-xs text-muted-foreground">
              Verification session
            </span>

            {isExpired ? (
              <Badge
                variant="destructive"
                className="text-[10px]"
              >
                Expired
              </Badge>
            ) : (
              <span
                className={[
                  "font-mono text-xs font-semibold tabular-nums",
                  secondsRemaining <= 30
                    ? "text-destructive"
                    : "text-foreground",
                ].join(" ")}
              >
                {formattedTime}
              </span>
            )}
          </div>

          {/* Error */}

          {error && (
            <Alert
              variant="destructive"
              className="py-3"
            >
              <AlertCircle className="size-4" />

              <AlertDescription className="text-xs leading-5">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label
                htmlFor="mfa-code"
                className="text-sm font-medium"
              >
                {isAuthenticator
                  ? "Authentication code"
                  : "Recovery code"}
              </Label>

              <Input
                ref={inputRef}
                id="mfa-code"
                name="code"
                value={code}
                onChange={(event) =>
                  handleCodeChange(
                    event.target.value,
                  )
                }
                placeholder={
                  isAuthenticator
                    ? "000000"
                    : "ABCD-EFGH-IJKL"
                }
                autoComplete="one-time-code"
                inputMode={
                  isAuthenticator
                    ? "numeric"
                    : "text"
                }
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                disabled={
                  loading ||
                  isExpired
                }
                maxLength={
                  isAuthenticator
                    ? 6
                    : 14
                }
                aria-invalid={
                  Boolean(error)
                }
                aria-describedby="mfa-code-help"
                className={[
                  "h-12 rounded-lg bg-background text-center font-mono text-lg",
                  "focus-visible:ring-2",
                  isAuthenticator
                    ? "tracking-[0.35em]"
                    : "tracking-[0.12em]",
                  error
                    ? "border-destructive focus-visible:ring-destructive"
                    : "",
                ].join(" ")}
              />

              <p
                id="mfa-code-help"
                className="text-center text-[11px] leading-4 text-muted-foreground"
              >
                {isAuthenticator
                  ? "Use the current 6-digit code from your authenticator app."
                  : "Recovery codes are single-use and contain 12 characters."}
              </p>
            </div>

            {/* Submit */}

            <Button
              type="submit"
              disabled={
                loading ||
                !code.trim() ||
                isExpired
              }
              className="h-11 w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 size-4" />
                  Verify and sign in
                </>
              )}
            </Button>
          </form>

          {/* Alternative Method */}

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              size="sm"
              disabled={loading}
              onClick={() =>
                switchMode(
                  isAuthenticator
                    ? "recovery"
                    : "authenticator",
                )
              }
              className="h-auto px-1 text-xs text-muted-foreground"
            >
              {isAuthenticator
                ? "Can't access your authenticator?"
                : "Use your authenticator app instead"}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-1">
          <Separator />

          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={loading}
            className="h-9 w-full text-xs text-muted-foreground"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to sign in
          </Button>

          <p className="text-center text-[10px] text-muted-foreground">
            Municipal Social Analytics
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}