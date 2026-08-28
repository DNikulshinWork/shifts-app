import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shiftTypesApi } from '@/shared/api/shiftTypes';
import { CreateShiftType, UpdateShiftType } from '@shifts/types';

export const shiftTypesKeys = {
  all: ['shiftTypes'] as const,
  details: () => [...shiftTypesKeys.all, 'detail'] as const,
  detail: (id: string) => [...shiftTypesKeys.details(), id] as const,
};

export function useShiftTypes() {
  return useQuery({
    queryKey: shiftTypesKeys.all,
    queryFn: shiftTypesApi.getAll,
  });
}

export function useShiftType(id: string) {
  return useQuery({
    queryKey: shiftTypesKeys.detail(id),
    queryFn: () => shiftTypesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateShiftType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateShiftType) => shiftTypesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftTypesKeys.all });
    },
  });
}

export function useUpdateShiftType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateShiftType }) =>
      shiftTypesApi.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: shiftTypesKeys.all });
      queryClient.invalidateQueries({
        queryKey: shiftTypesKeys.detail(data.id),
      });
    },
  });
}

export function useDeleteShiftType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shiftTypesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftTypesKeys.all });
    },
  });
}
