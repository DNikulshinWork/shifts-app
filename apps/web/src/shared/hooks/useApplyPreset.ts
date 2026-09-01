import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applyPreset, Conflict } from '@/shared/lib/applyPreset';
import { ApplyMode, Preset } from '@shifts/types';
import { shiftsKeys } from './useShifts';
import { presetMetaKeys } from './usePresetMeta';

interface UseApplyPresetOptions {
  preset: Preset;
  startDate: string;
  endDate: string;
  mode: ApplyMode;
  userId?: string;
  onConflictResolve?: (
    conflicts: Conflict[]
  ) => Promise<'overwrite' | 'skip' | 'cancel'>;
}

export function useApplyPreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options: UseApplyPresetOptions) => applyPreset(options),
    onSuccess: (_, { startDate, endDate }) => {
      queryClient.invalidateQueries({
        queryKey: shiftsKeys.dateRange(startDate, endDate),
      });
      queryClient.invalidateQueries({ queryKey: shiftsKeys.all });
      queryClient.invalidateQueries({ queryKey: presetMetaKeys.all });
    },
  });
}
