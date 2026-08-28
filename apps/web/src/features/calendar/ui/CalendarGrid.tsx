'use client';

import { useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { Shift } from '@shifts/types';
import { useShiftTypes } from '@/shared/hooks';
import { cn } from '@/shared/lib/utils';

interface CalendarGridProps {
  currentDate: Date;
  shifts: Shift[];
  onDayClick: (date: string) => void;
  onShiftClick: (shift: Shift) => void;
}

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function CalendarGrid({
  currentDate,
  shifts,
  onDayClick,
  onShiftClick,
}: CalendarGridProps) {
  const { data: shiftTypes = [] } = useShiftTypes();

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const start = startOfWeek(monthStart, { locale: ru, weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { locale: ru, weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const shiftsByDate = useMemo(() => {
    const map = new Map<string, Shift[]>();
    shifts.forEach((shift) => {
      const key = shift.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(shift);
    });
    return map;
  }, [shifts]);

  const getShiftType = (typeId: string) => {
    return shiftTypes.find((t) => t.id === typeId);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Заголовки дней недели */}
      <div className="grid grid-cols-7 bg-muted/50">
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Ячейки календаря */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, currentDate);
          const dayShifts = shiftsByDate.get(dateStr) || [];
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={dateStr}
              className={cn(
                'min-h-24 p-1 border-b last:border-r-0 cursor-pointer hover:bg-muted/30 transition-colors',
                !isCurrentMonth && 'bg-muted/20 text-muted-foreground',
                isToday && 'bg-primary/5'
              )}
              onClick={() => onDayClick(dateStr)}
            >
              <div className="flex justify-between items-start">
                <span
                  className={cn(
                    'text-sm font-medium',
                    isToday &&
                      'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center'
                  )}
                >
                  {format(day, 'd')}
                </span>
                {dayShifts.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {dayShifts.length}
                  </span>
                )}
              </div>

              <div className="mt-1 space-y-1">
                {dayShifts.map((shift) => {
                  const type = getShiftType(shift.typeId);
                  if (!type) return null;
                  return (
                    <div
                      key={shift.id}
                      className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: type.color + '30',
                        color: type.color,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onShiftClick(shift);
                      }}
                    >
                      {type.emoji} {type.name}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
