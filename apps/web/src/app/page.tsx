'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarGrid } from '@/features/calendar/ui/CalendarGrid';
import { ShiftDialog } from '@/features/calendar/ui/ShiftDialog';
import { Button } from '@/shared/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useShiftsByDateRange } from '@/shared/hooks';
import { useAppStore } from '@/shared/stores/appStore';
import { usePrefetchMonths } from '@/shared/hooks/usePrefetchMonths';
import { Shift } from '@shifts/types';

export default function HomePage() {
  const { viewDate, goToPrevMonth, goToNextMonth } = useAppStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const startDate = format(startOfMonth(viewDate), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(viewDate), 'yyyy-MM-dd');

  // Предзагрузка соседних месяцев
  usePrefetchMonths(viewDate);

  const { data: shifts = [], isLoading } = useShiftsByDateRange(
    startDate,
    endDate
  );

  // Показываем спиннер только при первой загрузке, а при переходе между месяцами показываем старые данные
  const showSpinner = isLoading && !shifts.length;

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setEditingShift(null);
  };

  const handleShiftClick = (shift: Shift) => {
    setEditingShift(shift);
    setSelectedDate(shift.date);
  };

  const handleDialogClose = () => {
    setSelectedDate(null);
    setEditingShift(null);
  };

  return (
    <div className="container mx-auto p-2 sm:p-4 max-w-5xl">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-2xl font-bold">
          {format(viewDate, 'LLLL yyyy', { locale: ru })}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="default" onClick={goToPrevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="default" onClick={goToNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {showSpinner ? (
        <div className="flex justify-center p-8">
          <div className="animate-pulse text-muted-foreground">
            Загрузка календаря...
          </div>
        </div>
      ) : (
        <CalendarGrid
          currentDate={viewDate}
          shifts={shifts}
          onDayClick={handleDayClick}
          onShiftClick={handleShiftClick}
        />
      )}

      {(selectedDate || editingShift) && (
        <ShiftDialog
          date={selectedDate || editingShift?.date || ''}
          shift={editingShift}
          open={!!selectedDate || !!editingShift}
          onOpenChange={handleDialogClose}
        />
      )}
    </div>
  );
}
