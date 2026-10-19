
"use client"

import {
  ArrowDownUp,
  Search,
} from "lucide-react"

import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

export type SortMode = "recent" | "engagement"

interface FacebookPostFiltersProps {
  search: string
  onSearchChange: (value: string) => void

  sortMode: SortMode
  onSortModeChange: (value: SortMode) => void
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export function FacebookPostFilters({
  search,
  onSearchChange,
  sortMode,
  onSortModeChange,
}: FacebookPostFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      {/* SEARCH */}

      <div className="relative w-full lg:max-w-md">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />

        <Input
          type="search"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search posts or topics..."
          aria-label="Search Facebook posts or topics"
          className="pl-9"
        />
      </div>

      {/* SORT */}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Select
          value={sortMode}
          onValueChange={(value) => {
            if (
              value === "recent" ||
              value === "engagement"
            ) {
              onSortModeChange(value)
            }
          }}
        >
          <SelectTrigger
            className="w-full sm:w-[180px]"
            aria-label="Sort Facebook posts"
          >
            <ArrowDownUp
              aria-hidden="true"
              className="mr-2 h-4 w-4 shrink-0"
            />

            <SelectValue placeholder="Sort posts" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="recent">
              Most Recent
            </SelectItem>

            <SelectItem value="engagement">
              Most Engaged
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
