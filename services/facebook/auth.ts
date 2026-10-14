/**
 * FACEBOOK / META AUTH SERVICE
 */

export const facebookAuthService = {
    /**
     * Start Facebook OAuth authorization.
     *
     * Laravel redirects the browser to Meta's OAuth page.
     */
    connect: (): void => {
      window.location.href = "/api/v1/facebook/auth/redirect"
    },
  }