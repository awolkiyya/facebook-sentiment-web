import type { FieldErrors, FieldValues } from "react-hook-form";

export function flattenFormErrors<T extends FieldValues>(
  errors: FieldErrors<T>,
): string[] {
  const result: string[] = [];

  const walk = (obj: Record<string, unknown>): void => {
    Object.values(obj).forEach((value) => {
      if (!value || typeof value !== "object") {
        return;
      }

      const candidate = value as {
        message?: unknown;
        types?: unknown;
      };

      if (typeof candidate.message === "string") {
        result.push(candidate.message);
        return;
      }

      walk(value as Record<string, unknown>);
    });
  };

  walk(errors as Record<string, unknown>);

  return result;
}