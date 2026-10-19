"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"

import { facebookPageService } from "@/services/facebook/page"

import type {
  FacebookPage,
  FacebookPagesResponse,
  FacebookPageResponse,
  FacebookPageDisconnectResponse,
} from "@/types/facebook/page"

export const useFacebookPages = () => {
  const [pages, setPages] = useState<FacebookPage[]>([])

  const [summary, setSummary] = useState({
    total: 0,
    monitoring: 0,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const [updatingPageId, setUpdatingPageId] =
    useState<string | null>(null)

  const [syncingPageId, setSyncingPageId] =
    useState<string | null>(null)

  const [disconnectingPageId, setDisconnectingPageId] =
    useState<string | null>(null)

  const getPages = useCallback(async () => {
    try {
      setIsLoading(true)

      const response: FacebookPagesResponse =
        await facebookPageService.getPages()

      if (!response.success) {
        throw new Error(
          response.message ||
            "Unable to load Facebook Pages."
        )
      }

      setPages(response.data.pages)
      setSummary(response.data.summary)

      return response.data
    } catch (error) {
      toast.error("Unable to load Facebook Pages", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again later.",
      })

      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const connect = useCallback(() => {
    setIsConnecting(true)

    // Start the Facebook OAuth flow using a full browser navigation.
    // This allows the backend to redirect the browser to Facebook.
    window.location.assign(
      "/api/v1/facebook/auth/redirect"
    )
  }, [])

  const updateMonitoring = useCallback(
    async (
      facebookPageId: string,
      isActive: boolean
    ) => {
      try {
        setUpdatingPageId(facebookPageId)

        const response: FacebookPageResponse =
          await facebookPageService.updateMonitoring(
            facebookPageId,
            isActive
          )

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to update monitoring status."
          )
        }

        await getPages()

        toast.success(
          isActive
            ? "Monitoring enabled"
            : "Monitoring disabled",
          {
            description:
              `${response.data.name} is now ${
                isActive
                  ? "being monitored."
                  : "not being monitored."
              }`,
          }
        )

        return response.data
      } catch (error) {
        toast.error(
          "Unable to update monitoring",
          {
            description:
              error instanceof Error
                ? error.message
                : "Please try again later.",
          }
        )

        throw error
      } finally {
        setUpdatingPageId(null)
      }
    },
    [getPages]
  )

  const syncPage = useCallback(
    async (facebookPageId: string) => {
      try {
        setSyncingPageId(facebookPageId)

        const response: FacebookPageResponse =
          await facebookPageService.syncPage(
            facebookPageId
          )

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to synchronize Facebook Page."
          )
        }

        await getPages()

        toast.success(
          "Facebook Page synchronized",
          {
            description:
              `${response.data.name} was synchronized successfully.`,
          }
        )

        return response.data
      } catch (error) {
        toast.error(
          "Unable to synchronize Facebook Page",
          {
            description:
              error instanceof Error
                ? error.message
                : "Please try again later.",
          }
        )

        throw error
      } finally {
        setSyncingPageId(null)
      }
    },
    [getPages]
  )

  const disconnect = useCallback(
    async (facebookPageId: string) => {
      try {
        setDisconnectingPageId(facebookPageId)

        const response: FacebookPageDisconnectResponse =
          await facebookPageService.disconnect(
            facebookPageId
          )

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to disconnect Facebook Page."
          )
        }

        await getPages()

        toast.success(
          "Facebook Page disconnected",
          {
            description:
              "The Facebook Page has been disconnected successfully.",
          }
        )

        return response.data
      } catch (error) {
        toast.error(
          "Unable to disconnect Facebook Page",
          {
            description:
              error instanceof Error
                ? error.message
                : "Please try again later.",
          }
        )

        throw error
      } finally {
        setDisconnectingPageId(null)
      }
    },
    [getPages]
  )

  return {
    pages,
    summary,

    isLoading,
    isConnecting,

    updatingPageId,
    syncingPageId,
    disconnectingPageId,

    connect,
    getPages,
    updateMonitoring,
    syncPage,
    disconnect,
  }
}
