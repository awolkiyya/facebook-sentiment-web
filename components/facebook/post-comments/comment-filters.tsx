import { CalendarDays, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRange } from "@/types/facebook/post-comments-analytics"


/* -------------------------------------------------------------------------- */
/* Quick ranges + "more" dropdown                                             */
/* -------------------------------------------------------------------------- */

interface CommentFiltersProps {
  dateRange: DateRange
  dateLabel: string
  onDateRangeChange: (range: DateRange) => void
}

export function CommentFilters({
  dateRange,
  dateLabel,
  onDateRangeChange,
}: CommentFiltersProps) {
  const isExtendedRange = dateRange === "all" || dateRange === "custom"

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <Tabs
        value={["7d", "30d", "90d"].includes(dateRange) ? dateRange : undefined}
        onValueChange={(value) => onDateRangeChange(value as DateRange)}
        className="w-full sm:w-auto"
      >
        <TabsList className="grid h-9 w-full grid-cols-3 sm:w-auto">
          <TabsTrigger value="7d" className="text-xs">
            7 days
          </TabsTrigger>
          <TabsTrigger value="30d" className="text-xs">
            30 days
          </TabsTrigger>
          <TabsTrigger value="90d" className="text-xs">
            3 months
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isExtendedRange ? "secondary" : "outline"}
            size="sm"
            className="h-9 gap-1.5"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span className="max-w-[150px] truncate">
              {isExtendedRange ? dateLabel : "More ranges"}
            </span>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onDateRangeChange("all")}>
            All time
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDateRangeChange("custom")}>
            Custom range
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Custom date inputs                                                         */
/* -------------------------------------------------------------------------- */

interface CustomDateRangeCardProps {
  customFrom: string
  customTo: string
  onCustomFromChange: (value: string) => void
  onCustomToChange: (value: string) => void
}

export function CustomDateRangeCard({
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}: CustomDateRangeCardProps) {
  return (
    <Card className="mt-4 border-border/70 shadow-none">
      <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium">From</label>
          <Input
            type="date"
            value={customFrom}
            onChange={(event) => onCustomFromChange(event.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium">To</label>
          <Input
            type="date"
            value={customTo}
            min={customFrom || undefined}
            onChange={(event) => onCustomToChange(event.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}