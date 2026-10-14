"use client"

import {
  ArrowDownUp,
  Search,
} from "lucide-react"

import {
  Input,
} from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type {
  SortMode,
} from  "@/types/facebook-post"

interface FacebookPostFiltersProps {
  search: string
  onSearchChange: (value: string) => void

  sortMode: SortMode
  onSortModeChange: (
    value: SortMode,
  ) => void
}

export function FacebookPostFilters({
  search,
  onSearchChange,
  sortMode,
  onSortModeChange,
}: FacebookPostFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search posts or topics..."
          className="pl-9"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Select
          value={sortMode}
          onValueChange={(value) =>
            onSortModeChange(
              value as SortMode,
            )
          }
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <ArrowDownUp className="mr-2 h-4 w-4" />

            <SelectValue placeholder="Sort" />
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