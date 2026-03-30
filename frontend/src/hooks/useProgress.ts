import { useCallback, useState } from "react";
import { ProgressMetrics } from "@/integrations/supabase/career-types";
import { getProgress, saveProgress, ProgressUpsertPayload } from "@/integrations/supabase/progress";

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (weekStart?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProgress(weekStart);
      setProgress(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load progress";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const save = useCallback(async (payload: ProgressUpsertPayload) => {
    setIsSaving(true);
    setError(null);
    try {
      const data = await saveProgress(payload);
      setProgress(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save progress";
      setError(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    progress,
    isLoading,
    isSaving,
    error,
    load,
    save,
  };
}
