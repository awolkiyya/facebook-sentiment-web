"use client"

import { useMemo, useState } from "react"
import {
  AlertCircle,
  BrainCircuit,
  Flag,
  FlaskConical,
  Languages,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Tags,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import ModelHistoryTable from "./model-history-table"
import ModelMetrics from "./model-metrics"
import ModelVersionDialog from "./model-version-dialog"

import {
  useActivateModelVersion,
  useCreateModelVersion,
  useDeleteModelVersion,
  useModelVersions,
  useUpdateModelVersion,
} from "@/hooks/use-ai-models"

import type {
  AiModelPipeline,
  CreateModelVersionRequest,
  ModelVersion,
  UpdateModelVersionRequest,
} from "@/types/ai-model"

import {
  AI_MODEL_PIPELINES,
  AI_MODEL_PIPELINE_META,
} from "@/types/ai-model"

/*
|--------------------------------------------------------------------------
| Pipeline metadata
|--------------------------------------------------------------------------
|
| Keep labels/descriptions in ai-model.ts.
| Only icons are maintained here because icons are UI concerns.
|
*/

const PIPELINE_ICONS: Record<
  AiModelPipeline,
  typeof Languages
> = {
  language: Languages,
  sentiment: BrainCircuit,
  priority: Flag,
  topic: Tags,
}

/*
|--------------------------------------------------------------------------
| Pipeline order
|--------------------------------------------------------------------------
*/

const PIPELINE_ORDER: readonly AiModelPipeline[] =
  AI_MODEL_PIPELINES

export default function AIModelManagement() {
  const [selectedPipeline, setSelectedPipeline] =
    useState<AiModelPipeline>("language")

  const [dialogOpen, setDialogOpen] = useState(false)

  const [editingModel, setEditingModel] =
    useState<ModelVersion | null>(null)

  /*
  |--------------------------------------------------------------------------
  | Server data
  |--------------------------------------------------------------------------
  */

  const {
    data: modelVersionsResponse,
    isLoading: isModelsLoading,
    isError: isModelsError,
    refetch: refetchModels,
  } = useModelVersions(selectedPipeline, {
    per_page: 50,
  })

  const selectedModels = useMemo(
    () => modelVersionsResponse?.data ?? [],
    [modelVersionsResponse],
  )

  /*
  |--------------------------------------------------------------------------
  | Active model
  |--------------------------------------------------------------------------
  |
  | The current backend contract guarantees one active version
  | per model name.
  |
  | If your system currently has only one model family per pipeline,
  | this returns that active model.
  |
  */

  const activeModel = useMemo(
    () =>
      selectedModels.find(
        (model) => model.is_active,
      ) ?? null,
    [selectedModels],
  )

  const inactiveCount = useMemo(
    () =>
      selectedModels.filter(
        (model) => !model.is_active,
      ).length,
    [selectedModels],
  )

  /*
  |--------------------------------------------------------------------------
  | Mutations
  |--------------------------------------------------------------------------
  */

  const createModelVersion =
    useCreateModelVersion()

  const updateModelVersion =
    useUpdateModelVersion()

  const activateModelVersion =
    useActivateModelVersion()

  const deleteModelVersion =
    useDeleteModelVersion()

  const isSaving =
    createModelVersion.isPending ||
    updateModelVersion.isPending

  /*
  |--------------------------------------------------------------------------
  | Dialog
  |--------------------------------------------------------------------------
  */

  const openCreateDialog = () => {
    setEditingModel(null)
    setDialogOpen(true)
  }

  const openEditDialog = (model: ModelVersion) => {
    setEditingModel(model)
    setDialogOpen(true)
  }

  const handleSaveModel = (
    data:
      | CreateModelVersionRequest
      | UpdateModelVersionRequest,
  ) => {
    if (editingModel) {
      updateModelVersion.mutate(
        {
          pipeline: selectedPipeline,
          modelVersionId: editingModel.id,
          data,
        },
        {
          onSuccess: () => {
            setDialogOpen(false)
            setEditingModel(null)
          },
        },
      )

      return
    }

    createModelVersion.mutate(
      {
        pipeline: selectedPipeline,
        data: data as CreateModelVersionRequest,
      },
      {
        onSuccess: () => {
          setDialogOpen(false)
          setEditingModel(null)
        },
      },
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Row actions
  |--------------------------------------------------------------------------
  */

  const handleActivate = (
    model: ModelVersion,
  ) => {
    if (model.is_active) {
      return
    }

    activateModelVersion.mutate({
      pipeline: selectedPipeline,
      modelVersionId: model.id,
    })
  }

  const handleDelete = (
    model: ModelVersion,
  ) => {
    /*
     * Active versions are protected by the backend.
     * Guard here as well to avoid an unnecessary request.
     */
    if (model.is_active) {
      return
    }

    deleteModelVersion.mutate({
      pipeline: selectedPipeline,
      modelVersionId: model.id,
    })
  }

  const handlePipelineChange = (
    pipeline: AiModelPipeline,
  ) => {
    setSelectedPipeline(pipeline)
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="gap-4 border-b bg-muted/20 p-4 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="size-5 text-primary" />
              </div>

              <div className="min-w-0">
                <CardTitle className="text-lg">
                  AI Model Management
                </CardTitle>

                <CardDescription className="mt-1">
                  Manage AI model versions, evaluation
                  metrics and production activation.
                </CardDescription>
              </div>
            </div>

            <Button
              onClick={openCreateDialog}
              disabled={isModelsLoading}
              className="w-full shrink-0 md:w-auto"
            >
              <Plus className="mr-2 size-4" />
              Add Model Version
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs
            value={selectedPipeline}
            onValueChange={(value) =>
              handlePipelineChange(
                value as AiModelPipeline,
              )
            }
          >
            <div className="border-b px-4 pt-4 sm:px-6">
              <TabsList className="grid w-full grid-cols-4">
                {PIPELINE_ORDER.map(
                  (pipeline) => {
                    const meta =
                      AI_MODEL_PIPELINE_META[
                        pipeline
                      ]

                    const Icon =
                      PIPELINE_ICONS[pipeline]

                    return (
                      <TabsTrigger
                        key={pipeline}
                        value={pipeline}
                        className="gap-2"
                      >
                        <Icon className="hidden size-4 sm:block" />

                        <span className="truncate">
                          {meta.label}
                        </span>
                      </TabsTrigger>
                    )
                  },
                )}
              </TabsList>
            </div>

            {PIPELINE_ORDER.map(
              (pipeline) => (
                <TabsContent
                  key={pipeline}
                  value={pipeline}
                  className="m-0"
                >
                  <PipelineContent
                    pipeline={pipeline}
                    activeModel={
                      activeModel
                    }
                    inactiveCount={
                      inactiveCount
                    }
                    selectedModels={
                      selectedModels
                    }
                    isLoading={
                      isModelsLoading
                    }
                    isError={
                      isModelsError
                    }
                    onRetry={
                      refetchModels
                    }
                    onEdit={
                      openEditDialog
                    }
                    onActivate={
                      handleActivate
                    }
                    onDelete={
                      handleDelete
                    }
                    onCreate={
                      openCreateDialog
                    }
                  />
                </TabsContent>
              ),
            )}
          </Tabs>
        </CardContent>
      </Card>

      <ModelVersionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        pipeline={selectedPipeline}
        model={editingModel}
        isSaving={isSaving}
        onSave={handleSaveModel}
      />
    </div>
  )
}

/*
|--------------------------------------------------------------------------
| Production status
|--------------------------------------------------------------------------
*/

function ProductionStatus({
  activeModel,
}: {
  activeModel: ModelVersion | null
}) {
  if (!activeModel) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span
          aria-hidden="true"
          className="size-2 shrink-0 rounded-full border border-muted-foreground/50"
        />

        No model in production
      </div>
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-2 text-sm">
      <span
        aria-hidden="true"
        className="size-2 shrink-0 rounded-full bg-emerald-500"
      />

      <span className="shrink-0 text-muted-foreground">
        In production:
      </span>

      <span className="min-w-0 truncate font-medium">
        {activeModel.model_name} ·{" "}
        {activeModel.version}
      </span>
    </div>
  )
}

/*
|--------------------------------------------------------------------------
| Pipeline content
|--------------------------------------------------------------------------
*/

interface PipelineContentProps {
  pipeline: AiModelPipeline
  activeModel: ModelVersion | null
  inactiveCount: number
  selectedModels: ModelVersion[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onEdit: (model: ModelVersion) => void
  onActivate: (model: ModelVersion) => void
  onDelete: (model: ModelVersion) => void
  onCreate: () => void
}

function PipelineContent({
  pipeline,
  activeModel,
  inactiveCount,
  selectedModels,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onActivate,
  onDelete,
  onCreate,
}: PipelineContentProps) {
  const meta =
    AI_MODEL_PIPELINE_META[pipeline]

  const PipelineIcon =
    PIPELINE_ICONS[pipeline]

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/40">
            <PipelineIcon className="size-4 text-foreground/70" />
          </div>

          <div className="min-w-0">
            <h3 className="font-medium">
              {meta.label} pipeline
            </h3>

            <p className="text-sm text-muted-foreground">
              {meta.description}
            </p>
          </div>
        </div>

        {!isLoading && !isError && (
          <ProductionStatus
            activeModel={activeModel}
          />
        )}
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center">
          <AlertCircle
            aria-hidden="true"
            className="size-5 text-destructive"
          />

          <div>
            <p className="text-sm font-medium">
              Unable to load{" "}
              {meta.label.toLowerCase()}{" "}
              model versions
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
  Something went wrong while fetching this pipeline&apos;s models.
</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
          >
            <RefreshCw className="mr-2 size-4" />
            Try again
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed p-10 text-sm text-muted-foreground">
          <Loader2
            aria-hidden="true"
            className="size-4 animate-spin"
          />

          Loading model versions...
        </div>
      ) : (
        <>
          <ModelMetrics
            activeModel={activeModel}
            totalModels={
              selectedModels.length
            }
            inactiveCount={
              inactiveCount
            }
          />

          <ModelHistoryTable
            models={selectedModels}
            onEdit={onEdit}
            onActivate={onActivate}
            onDelete={onDelete}
          />

          {selectedModels.length ===
            0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center px-4 py-10 text-center sm:py-12">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                  <FlaskConical className="size-6 text-muted-foreground" />
                </div>

                <h3 className="font-medium">
                  No model versions
                </h3>

                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Create the first{" "}
                  {meta.label.toLowerCase()}{" "}
                  model version to start
                  managing this pipeline.
                </p>

                <Button
                  className="mt-4 w-full sm:w-auto"
                  onClick={onCreate}
                >
                  <Plus className="mr-2 size-4" />
                  Create Model Version
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}