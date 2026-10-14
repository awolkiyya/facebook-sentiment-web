import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authService } from "@/services/auth.service";
import { setAuth } from "@/lib/store/slices/user.slice";

import type {
  LoginVariables,
  LoginResult,
  LoginMfaChallengeResult,
} from "@/services/auth.service";
import type { ApiClientError } from "@/lib/api/api-error";
import { setMfaChallenge } from "@/lib/store/slices/mfa.slice";

/*
|--------------------------------------------------------------------------
| Hook Options
|--------------------------------------------------------------------------
*/

export interface UseLoginOptions {
  onMfaRequired?: (
    challenge: LoginMfaChallengeResult
  ) => void;
}

export const useLogin = (
  options?: UseLoginOptions,
) => {
  const dispatch = useDispatch();
  const router = useRouter();

  return useMutation<
    LoginResult,
    ApiClientError,
    LoginVariables
  >({
    mutationFn: authService.login,

    onSuccess: (result) => {
      /*
      |--------------------------------------------------------------------------
      | MFA Required
      |--------------------------------------------------------------------------
      |
      | Password authentication succeeded, but the user has
      | not completed authentication yet.
      |
      | The challenge is stored in Redux — not the URL — since
      | challenge_id is a live, single-use credential. The verify
      | page reads it from the store rather than a query param.
      |
      | Do NOT:
      |
      | - dispatch setAuth()
      | - show "signed in successfully"
      |
      */

      if (result.authenticated === false) {
        dispatch(
          setMfaChallenge({
            challengeId: result.challenge_id,
            expiresAt: Date.now() + result.expires_in * 1000,
            setupRequired: result.mfa_setup_required,
          })
        );

        options?.onMfaRequired?.(result);

        router.push(
          getLocalizedPath("/auth/mfa-verify")
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Fully Authenticated
      |--------------------------------------------------------------------------
      */

      dispatch(
        setAuth({
          user: result.user,
        })
      );

      toast.success(
        `Welcome back, ${result.user.name}!`,
        {
          description:
            "You have been signed in successfully.",
        }
      );

      router.push(
        getLocalizedPath("dashboard")
      );
    },

    onError: (error) => {
      switch (error.code) {
        case "INVALID_CREDENTIALS":
          toast.error(
            "Invalid credentials",
            {
              description:
                "The email or password is incorrect.",
            }
          );
          break;

        case "ACCOUNT_LOCKED":
          toast.error(
            "Account temporarily locked",
            {
              description:
                error.message,
            }
          );
          break;

        case "FORBIDDEN":
        case "INSUFFICIENT_PERMISSION":
          toast.error(
            "Access denied",
            {
              description:
                "Your account does not have permission to access this application.",
            }
          );
          break;

        case "RATE_LIMIT_EXCEEDED":
          toast.error(
            "Too many attempts",
            {
              description:
                "Please wait a moment before trying again.",
            }
          );
          break;

        default:
          toast.error(
            "Unable to sign in",
            {
              description:
                error.message ||
                "Please try again later.",
            }
          );
      }
    },
  });
};

/*
|--------------------------------------------------------------------------
| Localized Path
|--------------------------------------------------------------------------
|
| Preserve the current locale when redirecting.
|
*/

const getLocalizedPath = (path: string): string => {
  if (
    typeof window === "undefined"
  ) {
    return `/en/${path}`;
  }

  const segment =
    window.location.pathname
      .split("/")
      .filter(Boolean)[0];

  if (
    segment === "en" ||
    segment === "am" ||
    segment === "or"
  ) {
    return `/${segment}/${path}`;
  }

  return `/or/${path}`;
};