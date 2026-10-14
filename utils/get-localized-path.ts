// @/lib/utils/get-localized-path.ts

const SUPPORTED_LOCALES = ["en", "am", "or"] as const;

type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const isSupportedLocale = (
  value: string,
): value is SupportedLocale =>
  (SUPPORTED_LOCALES as readonly string[]).includes(value);

export const getLocalizedPath = (path: string): string => {
  if (typeof window === "undefined") {
    return `/en/${path}`;
  }

  const segment =
    window.location.pathname
      .split("/")
      .filter(Boolean)[0];

  if (segment && isSupportedLocale(segment)) {
    return `/${segment}/${path}`;
  }

  return `/or/${path}`;
};