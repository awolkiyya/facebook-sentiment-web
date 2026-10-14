import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { toast } from "sonner"


import type { ApiClientError } from "@/lib/api/api-error"

import type {
  AiModelPipeline,
  CreateModelVersionRequest,
  ModelVersion,
  ModelVersionListResponse,
  ModelVersionQueryParams,
  UpdateModelVersionRequest,
} from "@/types/ai-model"
import { aiModelService } from "@/services/ai-model.service"

/*
|--------------------------------------------------------------------------
| QUERY KEYS
|--------------------------------------------------------------------------
*/

export const aiModelQueryKeys = {
  all: ["ai-model-versions"] as const,

  lists: () =>
    [
      ...aiModelQueryKeys.all,
      "list",
    ] as const,

  /**
   * Scoped to a specific pipeline.
   *
   * Invalidating this key only refetches model versions
   * belonging to the selected pipeline.
   */
  listsForPipeline: (
    pipeline: AiModelPipeline,
  ) =>
    [
      ...aiModelQueryKeys.lists(),
      pipeline,
    ] as const,

  /**
   * Complete query key for a specific pipeline + pagination.
   */
  list: (
    pipeline: AiModelPipeline,
    params?: ModelVersionQueryParams,
  ) =>
    [
      ...aiModelQueryKeys.listsForPipeline(pipeline),
      params ?? {},
    ] as const,
}

/*
|--------------------------------------------------------------------------
| LIST MODEL VERSIONS
|--------------------------------------------------------------------------
|
| GET /api/v1/ai-models/{pipeline}
|
*/

export const useModelVersions = (
  pipeline: AiModelPipeline,
  params?: ModelVersionQueryParams,
) => {
  return useQuery<
    ModelVersionListResponse,
    ApiClientError
  >({
    queryKey: aiModelQueryKeys.list(
      pipeline,
      params,
    ),

    queryFn: () =>
       aiModelService.list(
        pipeline,
        params,
      ),

    staleTime: 30_000,
  })
}

/*
|--------------------------------------------------------------------------
| CREATE MODEL VERSION
|--------------------------------------------------------------------------
|
| POST /api/v1/ai-models/{pipeline}
|
*/

export const useCreateModelVersion = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ModelVersion,
    ApiClientError,
    {
      pipeline: AiModelPipeline
      data: CreateModelVersionRequest
    }
  >({
    mutationFn: ({
      pipeline,
      data,
    }) =>
    aiModelService.create({
        pipeline,
        data,
      }),

    onSuccess: (
      version,
      { pipeline },
    ) => {
      queryClient.invalidateQueries({
        queryKey:
          aiModelQueryKeys.listsForPipeline(
            pipeline,
          ),
      })

      toast.success(
        "Model version created",
        {
          description:
            `${version.model_name} ${version.version} has been added.`,
        },
      )
    },

    onError: (error) => {
      toast.error(
        "Unable to create model version",
        {
          description:
            error.message ||
            "Please check the information and try again.",
        },
      )
    },
  })
}

/*
|--------------------------------------------------------------------------
| UPDATE MODEL VERSION
|--------------------------------------------------------------------------
|
| PATCH /api/v1/ai-models/{pipeline}/{modelVersion}
|
| Updates model metadata only.
| Activation is handled separately.
|
*/

export const useUpdateModelVersion = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ModelVersion,
    ApiClientError,
    {
      pipeline: AiModelPipeline
      modelVersionId: string
      data: UpdateModelVersionRequest
    }
  >({
    mutationFn: ({
      pipeline,
      modelVersionId,
      data,
    }) =>
    aiModelService.update({
        pipeline,
        modelVersionId,
        data,
      }),

    onSuccess: (
      version,
      { pipeline },
    ) => {
      queryClient.invalidateQueries({
        queryKey:
          aiModelQueryKeys.listsForPipeline(
            pipeline,
          ),
      })

      toast.success(
        "Model version updated",
        {
          description:
            `${version.model_name} ${version.version} has been updated.`,
        },
      )
    },

    onError: (error) => {
      toast.error(
        "Unable to update model version",
        {
          description:
            error.message ||
            "Please check the information and try again.",
        },
      )
    },
  })
}

/*
|--------------------------------------------------------------------------
| ACTIVATE MODEL VERSION
|--------------------------------------------------------------------------
|
| POST /api/v1/ai-models/{pipeline}/{modelVersion}/activate
|
| Activation is intentionally separate from update().
|
| The backend:
| 1. Finds the requested model version.
| 2. Deactivates the currently active sibling version(s).
| 3. Activates the selected version.
| 4. Stores activated_at.
| 5. Performs the operation inside a database transaction.
|
*/

export const useActivateModelVersion = () => {
  const queryClient = useQueryClient()

  return useMutation<
    ModelVersion,
    ApiClientError,
    {
      pipeline: AiModelPipeline
      modelVersionId: string
    }
  >({
    mutationFn: ({
      pipeline,
      modelVersionId,
    }) =>
    aiModelService.activate({
        pipeline,
        modelVersionId,
      }),

    onSuccess: (
      version,
      { pipeline },
    ) => {
      queryClient.invalidateQueries({
        queryKey:
          aiModelQueryKeys.listsForPipeline(
            pipeline,
          ),
      })

      toast.success(
        "Model version activated",
        {
          description:
            `${version.model_name} ${version.version} is now in production.`,
        },
      )
    },

    onError: (error) => {
      toast.error(
        "Unable to activate model version",
        {
          description:
            error.message ||
            "Please try again later.",
        },
      )
    },
  })
}

/*
|--------------------------------------------------------------------------
| DELETE MODEL VERSION
|--------------------------------------------------------------------------
|
| DELETE /api/v1/ai-models/{pipeline}/{modelVersion}
|
| The backend rejects deletion of an active model version
| with HTTP 422.
|
*/

export const useDeleteModelVersion = () => {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    ApiClientError,
    {
      pipeline: AiModelPipeline
      modelVersionId: string
    }
  >({
    mutationFn: ({
      pipeline,
      modelVersionId,
    }) =>
    aiModelService.delete({
        pipeline,
        modelVersionId,
      }),

    onSuccess: (
      _,
      { pipeline },
    ) => {
      queryClient.invalidateQueries({
        queryKey:
          aiModelQueryKeys.listsForPipeline(
            pipeline,
          ),
      })

      toast.success(
        "Model version deleted",
        {
          description:
            "The model version has been removed.",
        },
      )
    },

    onError: (error) => {
      toast.error(
        "Unable to delete model version",
        {
          description:
            error.message ||
            "Please try again later.",
        },
      )
    },
  })
}
