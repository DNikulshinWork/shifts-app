import { CreateShift, Preset, ApplyMode } from '@shifts/types';
import { shiftsApi } from '@/shared/api/shifts';
import { presetMetaApi } from '@/shared/api/presets';
import { differenceInDays, format, addDays, parseISO } from 'date-fns';

interface ApplyPresetOptions {
  preset: Preset;
  startDate: string;
  endDate: string;
  mode: ApplyMode;
  userId?: string;
}

export async function applyPreset({
  preset,
  startDate,
  endDate,
  mode,
  userId,
}: ApplyPresetOptions): Promise<void> {
  // 1. Получаем существующие смены в диапазоне
  const existingShifts = await shiftsApi.getByDateRange(startDate, endDate);
  const existingByDate = new Map(existingShifts.map((s) => [s.date, s]));

  // 2. Получаем или создаём метаданные пресета
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

  // 3. Определяем начальную позицию в последовательности
  let currentIndex = 0;
  if (mode === 'continue' && meta.referenceDate) {
    const daysDiff = differenceInDays(
      parseISO(startDate),
      parseISO(meta.referenceDate)
    );
    currentIndex = (meta.referenceIndex + daysDiff) % preset.sequence.length;
    if (currentIndex < 0) currentIndex += preset.sequence.length;
  }

  // 4. Строим список смен для вставки
  const totalDays =
    differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
  const shiftsToInsert: CreateShift[] = [];
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
    }
    index++;
  }

  // 5. Если есть что вставлять — выполняем upsert
  if (shiftsToInsert.length > 0) {
    await shiftsApi.upsertMany(shiftsToInsert);
  }

  // 6. Обновляем метаданные
  if (mode === 'continue') {
    const lastIndex = (currentIndex + totalDays - 1) % preset.sequence.length;
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
