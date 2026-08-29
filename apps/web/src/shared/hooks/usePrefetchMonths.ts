import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { shiftsKeys } from './useShifts';
import { shiftTypesKeys } from './useShiftTypes';
import { presetsKeys } from './usePresets';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  addMonths,
  subMonths,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { shiftsApi } from '@/shared/api/shifts';
import { shiftTypesApi } from '@/shared/api/shiftTypes';
import { presetsApi } from '@/shared/api/presets';

export function usePrefetchMonths(viewDate: Date) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const months = [viewDate, subMonths(viewDate, 1), addMonths(viewDate, 1)];

    months.forEach((date) => {
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const start = format(
        startOfWeek(monthStart, { locale: ru, weekStartsOn: 1 }),
        'yyyy-MM-dd'
      );
      const end = format(
        endOfWeek(monthEnd, { locale: ru, weekStartsOn: 1 }),
        'yyyy-MM-dd'
      );

      queryClient.prefetchQuery({
        queryKey: shiftsKeys.dateRange(start, end),
        queryFn: () => shiftsApi.getByDateRange(start, end),
        staleTime: 5 * 60 * 1000,
      });
    });

    // Предзагрузка типов смен и пресетов (они редко меняются)
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
