/**
 * AI model pipelines supported by the backend.
 *
 * Matches:
 * App\Enums\AiModelPipeline
 */
export type AiModelPipeline =
  | "language"
  | "sentiment"
  | "priority"
  | "topic"

/**
 * Matches App\Http\Resources\ModelVersionResource.
 *
 * The backend persists model activation through:
 * - is_active
 * - activated_at
 *
 * There is no separate status field such as:
 * - DRAFT
 * - ACTIVE
 * - INACTIVE
 * - ARCHIVED
 *
 * Model artifact resolution is handled through `model_name`;
 * the frontend does not manage filesystem/model paths.
 */
export interface ModelVersion {
  id: string
  name: string
  version: string
  model_name: string
  framework: string | null
  accuracy: number | null
  macro_f1: number | null
  supported_languages: string[] | null
  is_active: boolean
  activated_at: string | null
  created_at: string | null
  updated_at: string | null
}

/**
 * Query parameters for:
 *
 * GET /api/v1/ai-models/{pipeline}
 */
export interface ModelVersionQueryParams {
  page?: number
  per_page?: number
}

/**
 * Payload for:
 *
 * POST /api/v1/ai-models/{pipeline}
 *
 * `is_active` and `activated_at` are intentionally excluded.
 * Production activation is handled by the dedicated activate endpoint.
 */
export interface CreateModelVersionRequest {
  name: string
  version: string
  model_name: string
  framework?: string
  accuracy?: number
  macro_f1?: number
  supported_languages?: string[]
}

/**
 * Payload for:
 *
 * PUT/PATCH /api/v1/ai-models/{pipeline}/{modelVersion}
 *
 * All fields are optional because the Laravel update request
 * uses `sometimes`.
 *
 * Nullable fields allow explicitly clearing existing values.
 */
export interface UpdateModelVersionRequest {
  name?: string
  version?: string
  model_name?: string
  framework?: string | null
  accuracy?: number | null
  macro_f1?: number | null
  supported_languages?: string[] | null
}

/**
 * Response for:
 *
 * POST /api/v1/ai-models/{pipeline}
 * PUT/PATCH /api/v1/ai-models/{pipeline}/{modelVersion}
 * POST /api/v1/ai-models/{pipeline}/{modelVersion}/activate
 *
 * The Laravel controller adds the pipeline using:
 *
 * ->additional([
 *     'pipeline' => $pipeline->value,
 * ])
 */
export interface ModelVersionResponse {
  data: ModelVersion
  pipeline: AiModelPipeline
}

/**
 * Paginated response for:
 *
 * GET /api/v1/ai-models/{pipeline}
 *
 * Laravel's paginated JsonResource collection provides
 * `links` and `meta`.
 */
export interface ModelVersionListResponse {
  data: ModelVersion[]
  pipeline: AiModelPipeline
  links: ModelPaginationLinks
  meta: ModelPaginationMeta
}

/**
 * Laravel pagination links.
 */
export interface ModelPaginationLinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}

/**
 * Laravel pagination metadata.
 */
export interface ModelPaginationMeta {
  current_page: number
  from: number | null
  last_page: number
  path: string
  per_page: number
  to: number | null
  total: number
}

/**
 * Payload for activating a model version.
 *
 * Used by the frontend service/hook rather than sent as
 * a request body, because the activation endpoint does not
 * require a request payload.
 */
export interface ActivateModelVersionParams {
  pipeline: AiModelPipeline
  modelVersionId: string
}

/**
 * Parameters used when identifying a model version
 * within a specific pipeline.
 */
export interface ModelVersionIdentifier {
  pipeline: AiModelPipeline
  modelVersionId: string
}

/**
 * Common mutation parameters for creating a model version.
 */
export interface CreateModelVersionParams {
  pipeline: AiModelPipeline
  data: CreateModelVersionRequest
}

/**
 * Common mutation parameters for updating a model version.
 */
export interface UpdateModelVersionParams {
  pipeline: AiModelPipeline
  modelVersionId: string
  data: UpdateModelVersionRequest
}

/**
 * Common mutation parameters for deleting a model version.
 */
export interface DeleteModelVersionParams {
  pipeline: AiModelPipeline
  modelVersionId: string
}

/**
 * Human-readable metadata used by the frontend.
 *
 * This is presentation-only and does not come from the API.
 */
export interface AiModelPipelineMeta {
  label: string
  description: string
}

/**
 * Frontend pipeline metadata.
 */
export const AI_MODEL_PIPELINE_META: Record<
  AiModelPipeline,
  AiModelPipelineMeta
> = {
  language: {
    label: "Language",
    description:
      "Identifies the language of incoming municipal comments.",
  },

  sentiment: {
    label: "Sentiment",
    description:
      "Classifies comments as positive, neutral or negative.",
  },

  priority: {
    label: "Priority",
    description:
      "Flags comments that need urgent municipal attention.",
  },

  topic: {
    label: "Topic",
    description:
      "Identifies the main municipal service or discussion topic.",
  },
}

/**
 * Stable frontend ordering for the four AI pipelines.
 */
export const AI_MODEL_PIPELINES: readonly AiModelPipeline[] = [
  "language",
  "sentiment",
  "priority",
  "topic",
] as const
