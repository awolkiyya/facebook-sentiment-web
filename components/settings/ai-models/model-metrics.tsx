"use client"

import {
  BarChart3,
  CheckCircle2,
  FileClock,
  Target,
} from "lucide-react"

import {
  Card,
  CardContent,
} from "@/components/ui/card"

import type { ModelVersion } from "@/types/ai-model"

interface ModelMetricsProps {
  activeModel: ModelVersion | null
  totalModels: number
  inactiveCount: number
}

export default function ModelMetrics({
  activeModel,
  totalModels,
  inactiveCount,
}: ModelMetricsProps) {
  const metrics = [
    {
      label: "Active Version",
      value: activeModel
        ? activeModel.version
        : "None",
      description: activeModel
        ? activeModel.model_name
        : "No production model",
      icon: CheckCircle2,
    },
    {
      label: "Accuracy",
      value:
        activeModel?.accuracy !== null &&
        activeModel?.accuracy !== undefined
          ? `${(
              activeModel.accuracy * 100
            ).toFixed(2)}%`
          : "—",
      description: "Production model accuracy",
      icon: BarChart3,
    },
    {
      label: "Macro F1",
      value:
        activeModel?.macro_f1 !== null &&
        activeModel?.macro_f1 !== undefined
          ? `${(
              activeModel.macro_f1 * 100
            ).toFixed(2)}%`
          : "—",
      description: "Production model macro F1",
      icon: Target,
    },
    {
      label: "Inactive Versions",
      value: String(inactiveCount),
      description: `${totalModels} total versions`,
      icon: FileClock,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon

        return (
          <Card key={metric.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">
                    {metric.label}
                  </p>

                  <p className="mt-2 truncate text-2xl font-semibold tracking-tight">
                    {metric.value}
                  </p>

                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>

                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

