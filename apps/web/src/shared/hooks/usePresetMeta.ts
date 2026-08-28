import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { presetMetaApi } from '@/shared/api/presets';
import { CreatePresetMeta, UpdatePresetMeta } from '@shifts/types';

export const presetMetaKeys = {
  all: ['presetMeta'] as const,
  byPreset: (presetId: string) => [...presetMetaKeys.all, presetId] as const,
};

export function usePresetMeta(presetId: string) {
  return useQuery({
    queryKey: presetMetaKeys.byPreset(presetId),
    queryFn: () => presetMetaApi.getByPresetId(presetId),
    enabled: !!presetId,
  });
}

export function useUpsertPresetMeta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePresetMeta) => presetMetaApi.upsert(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: presetMetaKeys.byPreset(data.presetId),
      });
    },
  });
}

export function useUpdatePresetMeta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      presetId,
      payload,
    }: {
      presetId: string;
      payload: UpdatePresetMeta;
    }) => presetMetaApi.update(presetId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: presetMetaKeys.byPreset(data.presetId),
      });
    },
  });
}

export function useDeletePresetMeta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (presetId: string) => presetMetaApi.delete(presetId),
    onSuccess: (_, presetId) => {
      queryClient.invalidateQueries({
        queryKey: presetMetaKeys.byPreset(presetId),
      });
    },
  });
}
