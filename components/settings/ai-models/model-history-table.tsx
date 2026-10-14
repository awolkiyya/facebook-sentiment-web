"use client"

import {
  CheckCircle2,
  Edit,
  MoreHorizontal,
  Power,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { ModelVersion } from "@/types/ai-model"

interface ModelHistoryTableProps {
  models: ModelVersion[]
  onEdit: (model: ModelVersion) => void
  onActivate: (model: ModelVersion) => void
  onDelete: (model: ModelVersion) => void
}

export default function ModelHistoryTable({
  models,
  onEdit,
  onActivate,
  onDelete,
}: ModelHistoryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Model Version History
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Framework</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Macro F1</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[70px]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {models.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No model versions found.
                  </TableCell>
                </TableRow>
              ) : (
                models.map((model) => (
                  <TableRow key={model.id}>
                    {/* ---------------------------------------------------- */}
                    {/* Model                                                   */}
                    {/* ---------------------------------------------------- */}

                    <TableCell>
                      <div className="min-w-[200px]">
                        <div className="font-medium">
                          {model.name}
                        </div>

                        <div className="mt-1 max-w-[280px] truncate text-xs text-muted-foreground">
                          {model.model_name}
                        </div>
                      </div>
                    </TableCell>

                    {/* ---------------------------------------------------- */}
                    {/* Version                                                 */}
                    {/* ---------------------------------------------------- */}

                    <TableCell>
                      <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs">
                        {model.version}
                      </span>
                    </TableCell>

                    {/* ---------------------------------------------------- */}
                    {/* Framework                                               */}
                    {/* ---------------------------------------------------- */}

                    <TableCell>
                      {model.framework ? (
                        <span className="text-sm">
                          {model.framework}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          —
                        </span>
                      )}
                    </TableCell>

                    {/* ---------------------------------------------------- */}
                    {/* Accuracy                                                */}
                    {/* ---------------------------------------------------- */}

                    <TableCell>
                      {model.accuracy !== null ? (
                        <span className="font-medium">
                          {(
                            model.accuracy * 100
                          ).toFixed(2)}
                          %
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          —
                        </span>
                      )}
                    </TableCell>

                    {/* ---------------------------------------------------- */}
                    {/* Macro F1                                                */}
                    {/* ---------------------------------------------------- */}

                    <TableCell>
                      {model.macro_f1 !== null ? (
                        <span className="font-medium">
                          {(
                            model.macro_f1 * 100
                          ).toFixed(2)}
                          %
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          —
                        </span>
                      )}
                    </TableCell>

                    {/* ---------------------------------------------------- */}
                    {/* Status                                                  */}
                    {/* ---------------------------------------------------- */}

                    <TableCell>
                      {model.is_active ? (
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="size-2 rounded-full bg-emerald-500"
                          />

                          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                            Active
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="size-2 rounded-full border border-muted-foreground/50"
                          />

                          <span className="text-sm text-muted-foreground">
                            Inactive
                          </span>
                        </div>
                      )}
                    </TableCell>

                    {/* ---------------------------------------------------- */}
                    {/* Updated                                                  */}
                    {/* ---------------------------------------------------- */}

                    <TableCell>
                      <span className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(
                          model.updated_at,
                        )}
                      </span>
                    </TableCell>

                    {/* ---------------------------------------------------- */}
                    {/* Actions                                                  */}
                    {/* ---------------------------------------------------- */}

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreHorizontal className="size-4" />

                            <span className="sr-only">
                              Open actions
                            </span>
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          {/* Edit */}

                          <DropdownMenuItem
                            onClick={() =>
                              onEdit(model)
                            }
                          >
                            <Edit className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>

                          {/* Active model */}

                          {model.is_active ? (
                            <DropdownMenuItem disabled>
                              <CheckCircle2 className="mr-2 size-4 text-emerald-600" />
                              Currently Active
                            </DropdownMenuItem>
                          ) : (
                            <>
                              {/* Activate */}

                              <DropdownMenuItem
                                onClick={() =>
                                  onActivate(
                                    model,
                                  )
                                }
                              >
                                <Power className="mr-2 size-4" />
                                Activate
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              {/* Delete */}

                              <DropdownMenuItem
                                onClick={() =>
                                  onDelete(
                                    model,
                                  )
                                }
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 size-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

/*
|--------------------------------------------------------------------------
| Date formatting
|--------------------------------------------------------------------------
*/

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "—"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}
