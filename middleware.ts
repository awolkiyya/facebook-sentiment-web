import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import createMiddleware from "next-intl/middleware"

/*
|--------------------------------------------------------------------------
| NEXT-INTL
|--------------------------------------------------------------------------
*/

const intlMiddleware = createMiddleware({
  locales: ["en", "am", "or"],
  defaultLocale: "or",
})

/*
|--------------------------------------------------------------------------
| SUPPORTED LOCALES
|--------------------------------------------------------------------------
*/

const LOCALES = ["en", "am", "or"] as const

type Locale = (typeof LOCALES)[number]

/*
|--------------------------------------------------------------------------
| APPLICATION
|--------------------------------------------------------------------------
|
| Mayor Social Analytics is a single application.
|
| There is no separate:
|
|     /office/*
|     /citizen/*
|
| The authenticated application lives under:
|
|     /[locale]/dashboard/*
|
|--------------------------------------------------------------------------
*/

const DASHBOARD_PREFIX = "/dashboard"


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

/**
 * Remove locale from pathname.
 *
 * Examples:
 *
 * /or/dashboard
 *      ↓
 * /dashboard
 *
 * /en/dashboard/users
 *      ↓
 * /dashboard/users
 *
 * /am/auth/login
 *      ↓
 * /auth/login
 */
function stripLocale(pathname: string): string {
  const parts = pathname.split("/")

  if (LOCALES.includes(parts[1] as Locale)) {
    parts.splice(1, 1)
  }

  const path = parts.join("/")

  return path || "/"
}

/**
 * Get locale from pathname.
 *
 * Examples:
 *
 * /or/dashboard → or
 * /en/dashboard → en
 * /am/dashboard → am
 */
function getLocale(pathname: string): Locale {
  const firstSegment = pathname.split("/")[1]

  if (LOCALES.includes(firstSegment as Locale)) {
    return firstSegment as Locale
  }

  return "or"
}

/**
 * Determine whether the route belongs to the
 * authenticated Mayor Social Analytics application.
 */
function isDashboardRoute(path: string): boolean {
  return (
    path === DASHBOARD_PREFIX ||
    path.startsWith(`${DASHBOARD_PREFIX}/`)
  )
}

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
|
| These routes do not require authentication.
|
|--------------------------------------------------------------------------
*/

function isPublicRoute(path: string): boolean {
  return (
    path === "/" ||
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/mfa-verify") ||
    path.startsWith("/unauthorized")||
    path.startsWith("/privacy-policy") ||
    path.startsWith("/data-deletion") ||
    path.startsWith("/terms")
  )
}

/*
|--------------------------------------------------------------------------
| REDIRECT TO LOCALIZED ROUTE
|--------------------------------------------------------------------------
*/

function redirectTo(
  request: NextRequest,
  locale: Locale,
  pathname: string,
): NextResponse {
  const url = request.nextUrl.clone()

  url.pathname = `/${locale}${pathname}`

  return NextResponse.redirect(url)
}

/*
|--------------------------------------------------------------------------
| REDIRECT TO LOGIN
|--------------------------------------------------------------------------
*/

function redirectToLogin(
  request: NextRequest,
  locale: Locale,
): NextResponse {
  return redirectTo(
    request,
    locale,
    "/auth/login",
  )
}

/*
|--------------------------------------------------------------------------
| LARAVEL SESSION COOKIE
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| This is only a frontend navigation signal.
|
| The existence of this cookie does NOT prove that
| Laravel considers the user authenticated.
|
| Laravel remains the actual authentication authority.
|
|--------------------------------------------------------------------------
*/

function hasLaravelSession(
  request: NextRequest,
): boolean {
  const sessionCookie =
    request.cookies.get("laravel-session") ??
    request.cookies.get("laravel_session")

  return Boolean(sessionCookie?.value)
}


/*
|--------------------------------------------------------------------------
| MIDDLEWARE
|--------------------------------------------------------------------------
*/

export function middleware(
  request: NextRequest,
): NextResponse {
  const { pathname } = request.nextUrl

  /*
  |--------------------------------------------------------------------------
  | 1. NORMALIZE PATH
  |--------------------------------------------------------------------------
  */

  const cleanPath = stripLocale(pathname)

  const locale = getLocale(pathname)

  /*
  |--------------------------------------------------------------------------
  | 2. PUBLIC ROUTES
  |--------------------------------------------------------------------------
  |
  | Public routes are allowed through next-intl.
  |
  |--------------------------------------------------------------------------
  */

  if (isPublicRoute(cleanPath)) {
    return intlMiddleware(request)
  }

  /*
  |--------------------------------------------------------------------------
  | 3. AUTHENTICATED APPLICATION
  |--------------------------------------------------------------------------
  |
  | All authenticated application pages live under:
  |
  |     /dashboard/*
  |
  | Examples:
  |
  |     /or/dashboard
  |     /or/dashboard/analytics
  |     /or/dashboard/administration/users
  |     /or/dashboard/administration/roles
  |     /am/dashboard
  |     /en/dashboard
  |
  |--------------------------------------------------------------------------
  */

  if (isDashboardRoute(cleanPath)) {
    /*
    |--------------------------------------------------------------------------
    | 3.1 NO LARAVEL SESSION
    |--------------------------------------------------------------------------
    |
    | The user is not authenticated.
    |
    |--------------------------------------------------------------------------
    */

    if (!hasLaravelSession(request)) {
      return redirectToLogin(
        request,
        locale,
      )
    }


    /*
    |--------------------------------------------------------------------------
    | 3.3 AUTHENTICATED APPLICATION
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | No role check here.
    |
    | No permission check here.
    |
    | Example:
    |
    | SYSTEM_ADMIN
    | MAYOR
    | DATA_MANAGER
    | EXECUTIVE_VIEWER
    | ANALYTICS_OFFICER
    | REPORT_OFFICER
    |
    | All may reach the frontend application.
    |
    | The actual authorization decision is made by
    | the Laravel backend.
    |
    | The frontend can use permissions to:
    |
    |     - show/hide navigation
    |     - show/hide buttons
    |     - control UI actions
    |
    | But this middleware must NOT be treated as
    | an authorization mechanism.
    |
    |--------------------------------------------------------------------------
    */

    return intlMiddleware(request)
  }

  /*
  |--------------------------------------------------------------------------
  | 4. UNKNOWN ROUTES
  |--------------------------------------------------------------------------
  |
  | Security default:
  |
  | Anything outside the known application routes
  | is redirected to unauthorized.
  |
  |--------------------------------------------------------------------------
  */

  return redirectTo(
    request,
    locale,
    "/unauthorized",
  )
}

/*
|--------------------------------------------------------------------------
| MATCHER
|--------------------------------------------------------------------------
|
| Middleware processes frontend pages only.
|
| Excluded:
|
|     /api/*
|     /sanctum/*
|     /ai/api/*
|     /auth/api/*
|     /_next/*
|     static files
|
|--------------------------------------------------------------------------
*/

export const config = {
  matcher: [
    "/((?!api|sanctum|ai/api|_next|.*\\..*|auth/api).*)",
  ],
}