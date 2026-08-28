import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { shiftsApi } from '@/shared/api/shifts';
import { CreateShift, UpdateShift } from '@shifts/types';

export const shiftsKeys = {
  all: ['shifts'] as const,
  dateRange: (start: string, end: string) =>
    [...shiftsKeys.all, 'range', start, end] as const,
  date: (date: string) => [...shiftsKeys.all, 'date', date] as const,
  details: () => [...shiftsKeys.all, 'detail'] as const,
  detail: (id: string) => [...shiftsKeys.details(), id] as const,
};

export function useShiftsByDateRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: shiftsKeys.dateRange(startDate, endDate),
    queryFn: () => shiftsApi.getByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}

// остальные хуки без изменений
export function useShiftsByDate(date: string) {
  return useQuery({
    queryKey: shiftsKeys.date(date),
    queryFn: () => shiftsApi.getByDate(date),
    enabled: !!date,
  });
}

export function useShift(id: string) {
  return useQuery({
    queryKey: shiftsKeys.detail(id),
    queryFn: () => shiftsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateShift) => shiftsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftsKeys.all });
    },
  });
}

export function useUpdateShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateShift }) =>
      shiftsApi.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: shiftsKeys.all });
      queryClient.invalidateQueries({ queryKey: shiftsKeys.detail(data.id) });
    },
  });
}

export function useDeleteShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shiftsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftsKeys.all });
    },
  });
}

export function useUpsertManyShifts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shifts: CreateShift[]) => shiftsApi.upsertMany(shifts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftsKeys.all });
    },
  });
}
