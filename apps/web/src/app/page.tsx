'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarGrid } from '@/features/calendar/ui/CalendarGrid';
import { ShiftDialog } from '@/features/calendar/ui/ShiftDialog';
import { Button } from '@/shared/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useShiftsByDateRange } from '@/shared/hooks';
import { Shift } from '@shifts/types';

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');

  const { data: shifts = [], isLoading } = useShiftsByDateRange(
    startDate,
    endDate
  );

  const handlePrevMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

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
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {format(currentDate, 'LLLL yyyy', { locale: ru })}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">Загрузка...</div>
      ) : (
        <CalendarGrid
          currentDate={currentDate}
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
