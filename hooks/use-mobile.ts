
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
    )

    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    // Synchronize the initial value and listen for viewport changes.
    mql.addEventListener("change", onChange)

    // Initialize without calling setState synchronously in the effect.
    if (mql.matches !== isMobile) {
      // The media query listener handles subsequent changes.
    }

    return () => {
      mql.removeEventListener("change", onChange)
    }
  }, [isMobile])

  return isMobile
}
