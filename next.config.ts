import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
  "./i18n/request.ts"
);

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // --------------------------------------------------------
  // SECURITY
  // --------------------------------------------------------

  poweredByHeader: false,

  allowedDevOrigins: [
    "192.168.3.1",
  ],

  // --------------------------------------------------------
  // REVERSE PROXY
  // --------------------------------------------------------

  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!apiUrl) {
      throw new Error(
        "NEXT_PUBLIC_API_URL is not configured."
      );
    }

    if (!baseUrl) {
      throw new Error(
        "NEXT_PUBLIC_BASE_URL is not configured."
      );
    }

    return [
      /*
      |--------------------------------------------------------------------------
      | Laravel API
      |--------------------------------------------------------------------------
      |
      | Browser:
      |   /api/v1/...
      |
      | Laravel:
      |   /api/v1/...
      |
      |--------------------------------------------------------------------------
      */

      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },

      /*
      |--------------------------------------------------------------------------
      | Laravel Sanctum
      |--------------------------------------------------------------------------
      |
      | Browser:
      |   /sanctum/csrf-cookie
      |
      | Laravel:
      |   /sanctum/csrf-cookie
      |
      |--------------------------------------------------------------------------
      */

      {
        source: "/sanctum/:path*",
        destination: `${apiUrl}/sanctum/:path*`,
      },

      /*
      |--------------------------------------------------------------------------
      | Ollama / AI
      |--------------------------------------------------------------------------
      |
      | Browser:
      |   /ai/...
      |
      | Ollama:
      |   http://192.168.3.1:11434/...
      |
      |--------------------------------------------------------------------------
      */

      {
        source: "/ai/:path*",
        destination: `${baseUrl}:11434/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
