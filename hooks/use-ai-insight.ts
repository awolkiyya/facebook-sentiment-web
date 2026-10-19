"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { aiInsightService } from "@/services/ai-insight.service";

import type {
  GenerateInsightRequest,
  GenerateInsightResponse,
  InsightLanguage,
  InsightModel,
  PostInsightData,
} from "@/types/ai-insight.types";

interface UseAiInsightOptions {
  /** Internal UUID from facebook_posts.id */
  postId: string;
  initialLanguage?: InsightLanguage;
}

interface AiInsightState {
  postId: string;
  insight: PostInsightData | null;
  language: InsightLanguage;
  isGenerating: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useAiInsight({
  postId,
  initialLanguage = "am",
}: UseAiInsightOptions) {
  const [state, setState] = useState<AiInsightState>(() => ({
    postId,
    insight: null,
    language: initialLanguage,
    isGenerating: false,
    isLoading: false,
    error: null,
  }));

  const requestId = useRef(0);
  const requestInProgress = useRef(false);
  const activeController = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);

  /**
   * Prevent stale asynchronous requests from updating the state.
   */
  const cancelActiveRequest = useCallback(() => {
    requestId.current += 1;
    activeController.current?.abort();
    activeController.current = null;
    requestInProgress.current = false;
  }, []);

  /**
   * Track mount status and cancel outstanding HTTP requests on unmount.
   * No synchronous state updates are performed inside this effect.
   */
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      cancelActiveRequest();
    };
  }, [cancelActiveRequest]);

  /**
   * If the selected post or initial language changes, expose fresh state
   * immediately during render instead of resetting state in an effect.
   */
  const isCurrentState =
    state.postId === postId &&
    state.language === initialLanguage;

  const insight = isCurrentState ? state.insight : null;
  const language = isCurrentState ? state.language : initialLanguage;
  const isGenerating = isCurrentState && state.isGenerating;
  const isLoading = isCurrentState && state.isLoading;
  const error = isCurrentState ? state.error : null;

  /**
   * Update state only when the request still belongs to the current post.
   */
  const updateCurrentState = useCallback(
    (
      updater: (current: AiInsightState) => AiInsightState,
      expectedPostId: string,
    ) => {
      if (!mountedRef.current) {
        return;
      }

      setState((current) => {
        if (
          current.postId !== expectedPostId ||
          expectedPostId !== postId
        ) {
          return current;
        }

        return updater(current);
      });
    },
    [postId],
  );

  /**
   * Read the latest saved insight.
   * This does not trigger AI generation.
   */
  const loadLatest = useCallback(
    async (
      nextLanguage: InsightLanguage = language,
    ): Promise<PostInsightData | null> => {
      if (!postId.trim()) {
        updateCurrentState(
          (current) => ({
            ...current,
            postId,
            language: nextLanguage,
            insight: null,
            error: new Error("A Facebook post must be selected."),
          }),
          postId,
        );

        return null;
      }

      if (requestInProgress.current) {
        return null;
      }

      const currentRequestId = ++requestId.current;
      const controller = new AbortController();

      activeController.current = controller;
      requestInProgress.current = true;

      updateCurrentState(
        (current) => ({
          ...current,
          postId,
          language: nextLanguage,
          isLoading: true,
          isGenerating: false,
          error: null,
          insight:
            current.postId === postId &&
            current.language === nextLanguage
              ? current.insight
              : null,
        }),
        postId,
      );

      try {
        const result = await aiInsightService.showLatest(
          postId,
          nextLanguage,
          controller.signal,
        );

        if (
          controller.signal.aborted ||
          requestId.current !== currentRequestId ||
          !mountedRef.current
        ) {
          return null;
        }

        updateCurrentState(
          (current) => ({
            ...current,
            postId,
            language: nextLanguage,
            insight: result.data,
            error: null,
          }),
          postId,
        );

        return result.data;
      } catch (cause: unknown) {
        if (
          controller.signal.aborted ||
          requestId.current !== currentRequestId ||
          !mountedRef.current
        ) {
          return null;
        }

        const normalizedError =
          cause instanceof Error
            ? cause
            : new Error("Unable to load the saved insight.");

        updateCurrentState(
          (current) => ({
            ...current,
            postId,
            language: nextLanguage,
            error: normalizedError,
          }),
          postId,
        );

        console.error("[useAiInsight] Loading failed", {
          postId,
          language: nextLanguage,
          message: normalizedError.message,
        });

        return null;
      } finally {
        if (requestId.current === currentRequestId) {
          requestInProgress.current = false;
          activeController.current = null;

          updateCurrentState(
            (current) => ({
              ...current,
              isLoading: false,
            }),
            postId,
          );
        }
      }
    },
    [postId, language, updateCurrentState],
  );

  /**
   * Queue AI insight generation.
   *
   * regenerate = false:
   *   Reuse an existing completed result when supported by the backend.
   *
   * regenerate = true:
   *   Explicitly request regeneration.
   *
   * A successful response may have PENDING or PROCESSING status.
   */
  const generate = useCallback(
    async (
      nextLanguage: InsightLanguage = language,
      model?: InsightModel,
      regenerate = false,
      dateRange?: GenerateInsightRequest["date_range"],
    ): Promise<GenerateInsightResponse | null> => {
      if (!postId.trim()) {
        updateCurrentState(
          (current) => ({
            ...current,
            postId,
            language: nextLanguage,
            insight: null,
            error: new Error("A Facebook post must be selected."),
          }),
          postId,
        );

        return null;
      }

      if (requestInProgress.current) {
        return null;
      }

      const currentRequestId = ++requestId.current;
      const controller = new AbortController();

      activeController.current = controller;
      requestInProgress.current = true;

      updateCurrentState(
        (current) => ({
          ...current,
          postId,
          language: nextLanguage,
          isGenerating: true,
          isLoading: false,
          error: null,
          insight:
            current.postId === postId &&
            current.language === nextLanguage
              ? current.insight
              : null,
        }),
        postId,
      );

      try {
        const request: GenerateInsightRequest = {
          language: nextLanguage,
          regenerate,
          ...(model ? { model } : {}),
          ...(dateRange ? { date_range: dateRange } : {}),
        };

        const result = await aiInsightService.generate(
          postId,
          request,
          controller.signal,
        );

        if (
          controller.signal.aborted ||
          requestId.current !== currentRequestId ||
          !mountedRef.current
        ) {
          return null;
        }

        updateCurrentState(
          (current) => ({
            ...current,
            postId,
            language: nextLanguage,
            insight: result.data,
            error: null,
          }),
          postId,
        );

        return result;
      } catch (cause: unknown) {
        if (
          controller.signal.aborted ||
          requestId.current !== currentRequestId ||
          !mountedRef.current
        ) {
          return null;
        }

        const normalizedError =
          cause instanceof Error
            ? cause
            : new Error("Unable to queue AI insight generation.");

        updateCurrentState(
          (current) => ({
            ...current,
            postId,
            language: nextLanguage,
            error: normalizedError,
          }),
          postId,
        );

        console.error("[useAiInsight] Generation failed", {
          postId,
          language: nextLanguage,
          model,
          regenerate,
          message: normalizedError.message,
        });

        return null;
      } finally {
        if (requestId.current === currentRequestId) {
          requestInProgress.current = false;
          activeController.current = null;

          updateCurrentState(
            (current) => ({
              ...current,
              isGenerating: false,
            }),
            postId,
          );
        }
      }
    },
    [postId, language, updateCurrentState],
  );

  /**
   * Clear local state and cancel the active HTTP request.
   * This does not cancel a job already accepted by Laravel's queue.
   */
  const reset = useCallback(() => {
    cancelActiveRequest();

    if (!mountedRef.current) {
      return;
    }

    setState({
      postId,
      insight: null,
      language,
      isGenerating: false,
      isLoading: false,
      error: null,
    });
  }, [cancelActiveRequest, postId, language]);

  /**
   * Update the selected language and clear any result for another language.
   */
  const handleSetLanguage = useCallback(
    (nextLanguage: InsightLanguage) => {
      if (nextLanguage === language) {
        return;
      }

      cancelActiveRequest();

      setState({
        postId,
        insight: null,
        language: nextLanguage,
        isGenerating: false,
        isLoading: false,
        error: null,
      });
    },
    [cancelActiveRequest, language, postId],
  );

  const isQueued =
    insight?.status === "PENDING" ||
    insight?.status === "PROCESSING";

  const isCompleted = insight?.status === "COMPLETED";
  const isFailed = insight?.status === "FAILED";

  return {
    insight,
    language,
    isGenerating,
    isLoading,
    isQueued,
    isCompleted,
    isFailed,
    error,
    loadLatest,
    generate,
    reset,
    setLanguage: handleSetLanguage,
  };
}
