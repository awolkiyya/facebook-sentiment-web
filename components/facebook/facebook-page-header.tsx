
"use client"

import {
  ArrowLeft,
  CheckCircle2,
  Users,
} from "lucide-react"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

interface FacebookPageSummary {
  id: string
  name: string
  category: string | null
  followers: number
  isActive: boolean
}

interface FacebookPageHeaderProps {
  page: FacebookPageSummary
  locale: string
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

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
    <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="mt-0.5 shrink-0"
          aria-label="Back to Facebook pages"
        >
          <ArrowLeft
            className="h-4 w-4"
            aria-hidden="true"
          />
        </Button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-semibold tracking-tight">
              {page.name}
            </h1>

            {page.isActive && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                <CheckCircle2
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
                Connected
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {page.category && (
              <span>{page.category}</span>
            )}

            <span className="inline-flex items-center gap-1">
              <Users
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              {page.followers.toLocaleString()} followers
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
