"use client"

import {
  ArrowLeft,
  CheckCircle2,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

import type {
  FacebookPageSummary,
} from "@/types/facebook-post"

interface FacebookPageHeaderProps {
  page: FacebookPageSummary
  locale: string
}

export function FacebookPageHeader({
  page,
  locale,
}: FacebookPageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    router.push(
      `/${locale}/dashboard/facebook/pages`,
    )
  }

  return (
    <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="mt-0.5 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-semibold tracking-tight">
              {page.name}
            </h1>

            {page.isActive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Connected
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>{page.category}</span>

            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {page.followers.toLocaleString()} followers
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}