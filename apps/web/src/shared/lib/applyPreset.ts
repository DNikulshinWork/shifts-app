import { CreateShift, Preset, ApplyMode, Shift } from '@shifts/types';
import { shiftsApi } from '@/shared/api/shifts';
import { presetMetaApi } from '@/shared/api/presets';
import { differenceInDays, format, addDays, parseISO } from 'date-fns';

export interface Conflict {
  date: string;
  existingShift: Shift;
  proposedTypeId: string;
}

export interface PreviewResult {
  conflicts: Conflict[];
  shiftsToInsert: CreateShift[];
  totalDays: number;
  occupiedDays: number;
  emptyDays: number;
}

interface ApplyPresetOptions {
  preset: Preset;
  startDate: string;
  endDate: string;
  mode: ApplyMode;
  userId?: string;
  onConflictResolve?: (
    conflicts: Conflict[]
  ) => Promise<'overwrite' | 'skip' | 'cancel'>;
}

/**
 * Сбор информации о конфликтах и предпросмотр изменений
 */
export async function previewPreset({
  preset,
  startDate,
  endDate,
  mode,
  userId,
}: Omit<ApplyPresetOptions, 'onConflictResolve'>): Promise<PreviewResult> {
  const existingShifts = await shiftsApi.getByDateRange(startDate, endDate);
  const existingByDate = new Map(existingShifts.map((s) => [s.date, s]));

  let meta = await presetMetaApi.getByPresetId(preset.id);
  if (!meta) {
    meta = {
      presetId: preset.id,
      userId,
      referenceDate: startDate,
      referenceIndex: 0,
      lastAppliedAt: new Date().toISOString(),
      dirty: false,
    };
  }

  let currentIndex = 0;
  if (mode === 'continue' && meta.referenceDate) {
    const daysDiff = differenceInDays(
      parseISO(startDate),
      parseISO(meta.referenceDate)
    );
    currentIndex = (meta.referenceIndex + daysDiff) % preset.sequence.length;
    if (currentIndex < 0) currentIndex += preset.sequence.length;
  }

  const totalDays =
    differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
  const shiftsToInsert: CreateShift[] = [];
  const conflicts: Conflict[] = [];
  let occupiedDays = 0;
  let emptyDays = 0;
  let index = currentIndex;

  for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
    const currentDate = addDays(parseISO(startDate), dayOffset);
    const dateStr = format(currentDate, 'yyyy-MM-dd');

    const existing = existingByDate.get(dateStr);
    if (mode === 'overwrite' || (mode === 'fill-empty' && !existing)) {
      const typeId = preset.sequence[index % preset.sequence.length];
      shiftsToInsert.push({
        date: dateStr,
        typeId,
        note: '',
        userId,
      });
      if (existing) {
        occupiedDays++;
        conflicts.push({
          date: dateStr,
          existingShift: existing,
          proposedTypeId: typeId,
        });
      } else {
        emptyDays++;
      }
    }
    index++;
  }

  return {
    conflicts,
    shiftsToInsert,
    totalDays,
    occupiedDays,
    emptyDays,
  };
}

/**
 * Применение пресета с обработкой конфликтов
 */
export async function applyPreset({
  preset,
  startDate,
  endDate,
  mode,
  userId,
  onConflictResolve,
}: ApplyPresetOptions): Promise<void> {
  const preview = await previewPreset({
    preset,
    startDate,
    endDate,
    mode,
    userId,
  });

  // Если есть конфликты и передан обработчик – вызываем его
  if (preview.conflicts.length > 0 && onConflictResolve) {
    const action = await onConflictResolve(preview.conflicts);
    if (action === 'cancel') {
      throw new Error('Application cancelled by user');
    }
    if (action === 'skip') {
      // Удаляем конфликтующие даты из shiftsToInsert
      const conflictDates = new Set(preview.conflicts.map((c) => c.date));
      preview.shiftsToInsert = preview.shiftsToInsert.filter(
        (s) => !conflictDates.has(s.date)
      );
    }
    // если 'overwrite' – оставляем как есть
  }

  // Вставляем смены
  if (preview.shiftsToInsert.length > 0) {
    await shiftsApi.upsertMany(preview.shiftsToInsert);
  }

  // Обновляем метаданные (для режима continue)
  if (mode === 'continue') {
    const totalDays =
      differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
    const lastIndex = (0 + totalDays - 1) % preset.sequence.length;
    await presetMetaApi.upsert({
      presetId: preset.id,
      userId,
      referenceDate: endDate,
      referenceIndex: lastIndex,
      lastAppliedAt: new Date().toISOString(),
      dirty: false,
    });
  } else {
    await presetMetaApi.upsert({
      presetId: preset.id,
      userId,
      referenceDate: startDate,
      referenceIndex: 0,
      lastAppliedAt: new Date().toISOString(),
      dirty: false,
    });
  }
}
