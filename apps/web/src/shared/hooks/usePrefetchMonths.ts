import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { shiftsKeys } from './useShifts';
import { shiftTypesKeys } from './useShiftTypes';
import { presetsKeys } from './usePresets';
import {
  startOfMonth,
  endOfMonth,
  format,
  addMonths,
  subMonths,
} from 'date-fns';
import { shiftTypesApi } from '../api/shiftTypes';
import { presetsApi } from '../api/presets';
import { shiftsApi } from '../api/shifts';

export function usePrefetchMonths(viewDate: Date) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Предзагружаем текущий месяц, предыдущий и следующий
    const months = [viewDate, subMonths(viewDate, 1), addMonths(viewDate, 1)];

    // Для каждого месяца запускаем prefetch
    months.forEach((date) => {
      const start = format(startOfMonth(date), 'yyyy-MM-dd');
      const end = format(endOfMonth(date), 'yyyy-MM-dd');

      queryClient.prefetchQuery({
        queryKey: shiftsKeys.dateRange(start, end),
        queryFn: () => shiftsApi.getByDateRange(start, end),
        staleTime: 5 * 60 * 1000, // 5 минут
      });
    });

    // Также предзагружаем типы смен и пресеты (они редко меняются)
    queryClient.prefetchQuery({
      queryKey: shiftTypesKeys.all,
      queryFn: shiftTypesApi.getAll,
      staleTime: 10 * 60 * 1000,
    });
    queryClient.prefetchQuery({
      queryKey: presetsKeys.all,
      queryFn: presetsApi.getAll,
      staleTime: 10 * 60 * 1000,
    });
  }, [viewDate, queryClient]);
}
