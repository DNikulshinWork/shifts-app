import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { presetsApi } from '@/shared/api/presets';
import { CreatePreset, UpdatePreset } from '@shifts/types';

export const presetsKeys = {
  all: ['presets'] as const,
  details: () => [...presetsKeys.all, 'detail'] as const,
  detail: (id: string) => [...presetsKeys.details(), id] as const,
};

export function usePresets() {
  return useQuery({
    queryKey: presetsKeys.all,
    queryFn: presetsApi.getAll,
  });
}

export function usePreset(id: string) {
  return useQuery({
    queryKey: presetsKeys.detail(id),
    queryFn: () => presetsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePreset) => presetsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presetsKeys.all });
    },
  });
}

export function useUpdatePreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePreset }) =>
      presetsApi.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: presetsKeys.all });
      queryClient.invalidateQueries({ queryKey: presetsKeys.detail(data.id) });
    },
  });
}

export function useDeletePreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => presetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presetsKeys.all });
    },
  });
}
