"use client";

import { useEffect, useState } from "react";

/**
 * Resolves a CSS variable from the shadcn theme (hex, hsl, oklch...) into a
 * hex string, for libraries like WebGL that can't read CSS variables.
 * Re-resolves when the theme class changes (light/dark).
 */
export function useThemeColor(variable: string, fallback: string) {
  const [color, setColor] = useState(fallback);

  useEffect(() => {
    const resolve = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim();
      if (!raw) return;

      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.fillStyle = fallback;
      ctx.fillStyle = raw;
      ctx.fillRect(0, 0, 1, 1);

      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      setColor(
        `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`,
      );
    };

    resolve();

    const observer = new MutationObserver(resolve);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });

    return () => observer.disconnect();
  }, [variable, fallback]);

  return color;
}