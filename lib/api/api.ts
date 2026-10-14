import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import { normalizeApiError } from "./api-error";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type RetryableRequestConfig =
  InternalAxiosRequestConfig & {
    _csrfRetry?: boolean;
  };

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-XSRF-TOKEN";

const isDevelopment =
  process.env.NODE_ENV === "development";

/*
|--------------------------------------------------------------------------
| LOCALE
|--------------------------------------------------------------------------
*/

const SUPPORTED_LOCALES = [
  "en",
  "am",
  "or",
] as const;

type SupportedLocale =
  (typeof SUPPORTED_LOCALES)[number];

const DEFAULT_LOCALE: SupportedLocale = "or";

const getCurrentLocale =
  (): SupportedLocale => {
    if (typeof window === "undefined") {
      return DEFAULT_LOCALE;
    }

    const segment =
      window.location.pathname
        .split("/")
        .filter(Boolean)[0];

    if (
      segment &&
      SUPPORTED_LOCALES.includes(
        segment as SupportedLocale
      )
    ) {
      return segment as SupportedLocale;
    }

    return DEFAULT_LOCALE;
  };

/*
|--------------------------------------------------------------------------
| LOGIN ROUTE
|--------------------------------------------------------------------------
*/

const getLoginPath = (): string => {
  return `/${getCurrentLocale()}/auth/login`;
};

const isLoginPage = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const pathname =
    window.location.pathname;

  const locale =
    getCurrentLocale();

  return (
    pathname ===
      `/${locale}/auth/login` ||
    pathname.startsWith(
      `/${locale}/auth/login/`
    )
  );
};

/*
|--------------------------------------------------------------------------
| AUTHENTICATION ENDPOINTS
|--------------------------------------------------------------------------
*/

const isAuthenticationRequest = (
  url: string
): boolean => {
  return (
    url.includes("/auth/web-login") ||
    url.includes("/auth/web-logout")
  );
};

/*
|--------------------------------------------------------------------------
| API CLIENT
|--------------------------------------------------------------------------
|
| Browser
|   ↓
| Next.js /api/*
|   ↓
| Laravel /api/*
|
| Authentication:
|   Laravel Sanctum SPA session
|
| Cookies:
|   XSRF-TOKEN
|   laravel-session
|
| Authorization:
|   Laravel + Spatie Permission
|
|--------------------------------------------------------------------------
*/

export const api = axios.create({
  baseURL: "/api",

  withCredentials: true,

  headers: {
    Accept: "application/json",
  },
});

/*
|--------------------------------------------------------------------------
| SANCTUM CLIENT
|--------------------------------------------------------------------------
|
| Used only to initialize the Laravel CSRF cookie.
|
|--------------------------------------------------------------------------
*/

const sanctum = axios.create({
  baseURL: "/",

  withCredentials: true,

  headers: {
    Accept: "application/json",
  },
});

/*
|--------------------------------------------------------------------------
| CSRF STATE
|--------------------------------------------------------------------------
*/

let csrfInitialized = false;

let csrfPromise: Promise<void> | null =
  null;

/*
|--------------------------------------------------------------------------
| READ XSRF COOKIE
|--------------------------------------------------------------------------
*/

const getXsrfToken = (): string | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix =
    `${CSRF_COOKIE_NAME}=`;

  const cookie =
    document.cookie
      .split("; ")
      .find((row) =>
        row.startsWith(prefix)
      );

  if (!cookie) {
    return null;
  }

  const value =
    cookie.substring(prefix.length);

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

/*
|--------------------------------------------------------------------------
| INITIALIZE CSRF
|--------------------------------------------------------------------------
*/

export const initializeCsrf =
  async (): Promise<void> => {
    if (typeof window === "undefined") {
      return;
    }

    if (csrfInitialized) {
      return;
    }

    if (csrfPromise) {
      return csrfPromise;
    }

    csrfPromise =
      (async () => {
        try {
          await sanctum.get(
            "/sanctum/csrf-cookie"
          );

          const token =
            getXsrfToken();

          if (!token) {
            throw new Error(
              "Laravel did not return an XSRF-TOKEN cookie."
            );
          }

          csrfInitialized = true;

          if (isDevelopment) {
            console.debug(
              "Sanctum CSRF initialized."
            );
          }
        } catch (error) {
          csrfInitialized = false;
          throw error;
        } finally {
          csrfPromise = null;
        }
      })();

    return csrfPromise;
  };

/*
|--------------------------------------------------------------------------
| RESET CSRF
|--------------------------------------------------------------------------
*/

export const resetCsrf = (): void => {
  csrfInitialized = false;
};

/*
|--------------------------------------------------------------------------
| REQUEST INTERCEPTOR
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig
  ) => {
    /*
    |--------------------------------------------------------------------------
    | Web application must never send Bearer tokens.
    |--------------------------------------------------------------------------
    */

    if (
      config.headers?.has(
        "Authorization"
      )
    ) {
      config.headers.delete(
        "Authorization"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CSRF
    |--------------------------------------------------------------------------
    */

    if (
      typeof window !== "undefined"
    ) {
      const method =
        config.method?.toLowerCase();

      const requiresCsrf =
        method === "post" ||
        method === "put" ||
        method === "patch" ||
        method === "delete";

      if (requiresCsrf) {
        await initializeCsrf();

        const token =
          getXsrfToken();

        if (token) {
          config.headers.set(
            CSRF_HEADER_NAME,
            token
          );
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Development diagnostics
    |--------------------------------------------------------------------------
    */

    if (isDevelopment) {
      console.debug(
        "API REQUEST",
        {
          method:
            config.method?.toUpperCase(),

          url:
            `${config.baseURL ?? ""}${config.url ?? ""}`,

          withCredentials:
            config.withCredentials,

          hasXsrfHeader:
            config.headers.has(
              CSRF_HEADER_NAME
            ),

          hasAuthorization:
            config.headers.has(
              "Authorization"
            ),
        }
      );
    }

    return config;
  },
  (error) =>
    Promise.reject(error)
);

/*
|--------------------------------------------------------------------------
| RESPONSE INTERCEPTOR
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const status =
      error.response?.status;

    /*
    |--------------------------------------------------------------------------
    | 419 — CSRF TOKEN EXPIRED
    |--------------------------------------------------------------------------
    */

    if (status === 419) {
      const originalRequest =
        error.config as
          | RetryableRequestConfig
          | undefined;

      if (
        originalRequest &&
        !originalRequest._csrfRetry
      ) {
        originalRequest._csrfRetry = true;

        try {
          /*
          |--------------------------------------------------------------------------
          | Invalidate current CSRF state.
          |--------------------------------------------------------------------------
          */

          resetCsrf();

          /*
          |--------------------------------------------------------------------------
          | Fetch fresh CSRF cookie.
          |--------------------------------------------------------------------------
          */

          await initializeCsrf();

          /*
          |--------------------------------------------------------------------------
          | Attach fresh token.
          |--------------------------------------------------------------------------
          */

          const token =
            getXsrfToken();

          if (
            token &&
            originalRequest.headers
          ) {
            originalRequest.headers.set(
              CSRF_HEADER_NAME,
              token
            );
          }

          /*
          |--------------------------------------------------------------------------
          | Retry original request once.
          |--------------------------------------------------------------------------
          */

          return api(
            originalRequest
          );
        } catch (csrfError) {
          return Promise.reject(
            normalizeApiError(
              csrfError
            )
          );
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | 401 — SESSION NO LONGER AUTHENTICATED
    |--------------------------------------------------------------------------
    */

    if (
      status === 401 &&
      typeof window !== "undefined" &&
      !isLoginPage()
    ) {
      const requestUrl =
        error.config?.url ?? "";

      /*
      |--------------------------------------------------------------------------
      | Login/logout failures must remain on the auth page.
      |--------------------------------------------------------------------------
      */

      if (
        !isAuthenticationRequest(
          requestUrl
        )
      ) {
        resetCsrf();

        const returnUrl =
          window.location.pathname +
          window.location.search;

        const loginUrl =
          `${getLoginPath()}?redirect=${encodeURIComponent(
            returnUrl
          )}`;

        if (isDevelopment) {
          console.warn(
            "Laravel session is no longer authenticated.",
            {
              requestUrl,
              loginUrl,
            }
          );
        }

        window.location.replace(
          loginUrl
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Normalize API error
    |--------------------------------------------------------------------------
    */

    return Promise.reject(
      normalizeApiError(error)
    );
  }
);