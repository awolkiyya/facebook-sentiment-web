
"use client"

import {
  FormEvent,
  useState,
} from "react"

import { Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import type {
  AiModelPipeline,
  CreateModelVersionRequest,
  ModelVersion,
  UpdateModelVersionRequest,
} from "@/types/ai-model"

interface ModelVersionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pipeline: AiModelPipeline
  model: ModelVersion | null
  isSaving: boolean
  onSave: (
    data:
      | CreateModelVersionRequest
      | UpdateModelVersionRequest,
  ) => void
}

const PIPELINE_LABELS: Record<AiModelPipeline, string> = {
  language: "Language Detection",
  sentiment: "Sentiment Analysis",
  priority: "Priority Classification",
  topic: "Topic Classification",
}

const DEFAULT_LANGUAGES = ["am", "om", "en"]

interface ModelVersionFormProps {
  pipeline: AiModelPipeline
  model: ModelVersion | null
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSave: (
    data:
      | CreateModelVersionRequest
      | UpdateModelVersionRequest,
  ) => void
}

function ModelVersionForm({
  pipeline,
  model,
  isSaving,
  onOpenChange,
  onSave,
}: ModelVersionFormProps) {
  const [name, setName] = useState(() => model?.name ?? "")
  const [version, setVersion] = useState(
    () => model?.version ?? "",
  )
  const [modelName, setModelName] = useState(
    () => model?.model_name ?? "",
  )
  const [framework, setFramework] = useState(
    () => model?.framework ?? "",
  )
  const [accuracy, setAccuracy] = useState(() =>
    model?.accuracy != null ? String(model.accuracy) : "",
  )
  const [macroF1, setMacroF1] = useState(() =>
    model?.macro_f1 != null ? String(model.macro_f1) : "",
  )
  const [supportedLanguages, setSupportedLanguages] =
    useState<string[]>(
      () => model?.supported_languages ?? DEFAULT_LANGUAGES,
    )

  const isEditing = Boolean(model)

  const toggleLanguage = (language: string) => {
    setSupportedLanguages((current) =>
      current.includes(language)
        ? current.filter((item) => item !== language)
        : [...current, language],
    )
  }

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const parsedAccuracy =
      accuracy.trim() === "" ? null : Number(accuracy)

    const parsedMacroF1 =
      macroF1.trim() === "" ? null : Number(macroF1)

    if (
      parsedAccuracy !== null &&
      (!Number.isFinite(parsedAccuracy) ||
        parsedAccuracy < 0 ||
        parsedAccuracy > 1)
    ) {
      return
    }

    if (
      parsedMacroF1 !== null &&
      (!Number.isFinite(parsedMacroF1) ||
        parsedMacroF1 < 0 ||
        parsedMacroF1 > 1)
    ) {
      return
    }

    if (!name.trim() || !version.trim() || !modelName.trim()) {
      return
    }

    const payload = {
      name: name.trim(),
      version: version.trim(),
      model_name: modelName.trim(),
      framework: framework.trim() || undefined,
      accuracy: parsedAccuracy ?? undefined,
      macro_f1: parsedMacroF1 ?? undefined,
      supported_languages:
        supportedLanguages.length > 0
          ? supportedLanguages
          : undefined,
    }

    onSave(payload)
  }

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[620px]">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Model Version" : "Add Model Version"}
        </DialogTitle>

        <DialogDescription>
          Configure the{" "}
          {PIPELINE_LABELS[pipeline].toLowerCase()} model version
          and its evaluation metrics.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="model-name">Model Family Name</Label>
            <Input
              id="model-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="municipal-sentiment"
              required
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Logical name used to group model versions.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model-version">Version</Label>
            <Input
              id="model-version"
              value={version}
              onChange={(event) => setVersion(event.target.value)}
              placeholder="1.1.0"
              required
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Version identifier for this model release.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model-artifact-name">
            Model / Artifact Name
          </Label>
          <Input
            id="model-artifact-name"
            value={modelName}
            onChange={(event) => setModelName(event.target.value)}
            placeholder="municipal-sentiment-v1"
            required
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            Exact model identifier used by the AI service.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="framework">Framework</Label>
          <Input
            id="framework"
            value={framework}
            onChange={(event) => setFramework(event.target.value)}
            placeholder="Transformers / PyTorch"
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            Framework used to train or serve the model.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="accuracy">Accuracy</Label>
            <Input
              id="accuracy"
              type="number"
              min="0"
              max="1"
              step="0.000001"
              value={accuracy}
              onChange={(event) => setAccuracy(event.target.value)}
              placeholder="0.673500"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Value between 0 and 1.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="macro-f1">Macro F1</Label>
            <Input
              id="macro-f1"
              type="number"
              min="0"
              max="1"
              step="0.000001"
              value={macroF1}
              onChange={(event) => setMacroF1(event.target.value)}
              placeholder="0.676500"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Macro-averaged F1 score between 0 and 1.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Supported Languages</Label>

          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "am", label: "Amharic" },
              { value: "om", label: "Afaan Oromo" },
              { value: "en", label: "English" },
            ].map((language) => {
              const checked = supportedLanguages.includes(
                language.value,
              )

              return (
                <label
                  key={language.value}
                  className={[
                    "flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm transition-colors",
                    checked
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleLanguage(language.value)}
                    disabled={isSaving}
                    className="size-4"
                  />
                  <span>{language.label}</span>
                </label>
              )
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            Select the languages supported by this model.
          </p>
        </div>

        <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            Production activation
          </p>
          <p className="mt-1">
            New and edited model versions are not activated
            automatically. Use the{" "}
            <strong>Activate</strong> action in the model history
            table when the version is ready for production.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={
              isSaving ||
              !name.trim() ||
              !version.trim() ||
              !modelName.trim()
            }
          >
            {isSaving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            {isEditing ? "Save Changes" : "Create Model"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

export default function ModelVersionDialog({
  open,
  onOpenChange,
  pipeline,
  model,
  isSaving,
  onSave,
}: ModelVersionDialogProps) {
  const formKey = `${pipeline}:${model?.id ?? "new"}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <ModelVersionForm
          key={formKey}
          pipeline={pipeline}
          model={model}
          isSaving={isSaving}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />
      )}
    </Dialog>
  )
}
