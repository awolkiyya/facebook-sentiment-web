import { api } from "@/lib/api/api"

import type {
  ActivateModelVersionParams,
  AiModelPipeline,
  CreateModelVersionParams,
  DeleteModelVersionParams,
  ModelVersion,
  ModelVersionListResponse,
  ModelVersionQueryParams,
  ModelVersionResponse,
  UpdateModelVersionParams,
} from "@/types/ai-model"

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| GET    /api/v1/ai-models/{pipeline}
| POST   /api/v1/ai-models/{pipeline}
| PATCH  /api/v1/ai-models/{pipeline}/{modelVersion}
| DELETE /api/v1/ai-models/{pipeline}/{modelVersion}
| POST   /api/v1/ai-models/{pipeline}/{modelVersion}/activate
|
|--------------------------------------------------------------------------
*/

/**
 * Base API path for a specific AI model pipeline.
 */
const basePath = (pipeline: AiModelPipeline): string =>
  `/v1/ai-models/${pipeline}`

export const aiModelService = {
  /**
   * List model versions for a pipeline.
   *
   * GET /api/v1/ai-models/{pipeline}
   */
  list: async (
    pipeline: AiModelPipeline,
    params?: ModelVersionQueryParams,
  ): Promise<ModelVersionListResponse> => {
    const { data } =
      await api.get<ModelVersionListResponse>(
        basePath(pipeline),
        {
          params,
        },
      )

    return data
  },

  /**
   * Create a new model version.
   *
   * POST /api/v1/ai-models/{pipeline}
   */
  create: async ({
    pipeline,
    data: payload,
  }: CreateModelVersionParams): Promise<ModelVersion> => {
    const { data } =
      await api.post<ModelVersionResponse>(
        basePath(pipeline),
        payload,
      )

    return data.data
  },

  /**
   * Update an existing model version.
   *
   * PATCH /api/v1/ai-models/{pipeline}/{modelVersion}
   */
  update: async ({
    pipeline,
    modelVersionId,
    data: payload,
  }: UpdateModelVersionParams): Promise<ModelVersion> => {
    const { data } =
      await api.patch<ModelVersionResponse>(
        `${basePath(pipeline)}/${modelVersionId}`,
        payload,
      )

    return data.data
  },

  /**
   * Activate a model version.
   *
   * POST /api/v1/ai-models/{pipeline}/{modelVersion}/activate
   *
   * The backend does not require a request body.
   */
  activate: async ({
    pipeline,
    modelVersionId,
  }: ActivateModelVersionParams): Promise<ModelVersion> => {
    const { data } =
      await api.post<ModelVersionResponse>(
        `${basePath(pipeline)}/${modelVersionId}/activate`,
      )

    return data.data
  },

  /**
   * Delete a model version.
   *
   * DELETE /api/v1/ai-models/{pipeline}/{modelVersion}
   *
   * The backend returns HTTP 204 No Content.
   */
  delete: async ({
    pipeline,
    modelVersionId,
  }: DeleteModelVersionParams): Promise<void> => {
    await api.delete(
      `${basePath(pipeline)}/${modelVersionId}`,
    )
  },
}
