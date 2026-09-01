import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { previewPreset } from '../applyPreset';
import { shiftsApi } from '@/shared/api/shifts';
import { presetMetaApi } from '@/shared/api/presets';
import type { Shift } from '@shifts/types';

vi.mock('@/shared/api/shifts', () => ({
  shiftsApi: {
    getByDateRange: vi.fn(),
    upsertMany: vi.fn(),
  },
}));

vi.mock('@/shared/api/presets', () => ({
  presetMetaApi: {
    getByPresetId: vi.fn(),
    upsert: vi.fn(),
  },
}));

describe('previewPreset', () => {
  const mockPreset = {
    id: 'preset-1',
    name: 'Test',
    sequence: ['type-a', 'type-b', 'type-c'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should preview conflicts and apply with overwrite', async () => {
    const startDate = '2026-09-01';
    const endDate = '2026-09-05';
    const existingShifts: Shift[] = [
      {
        id: '1',
        date: '2026-09-01',
        typeId: 'old-type',
        note: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    (shiftsApi.getByDateRange as Mock).mockResolvedValue(existingShifts);
    (presetMetaApi.getByPresetId as Mock).mockResolvedValue(null);

    const preview = await previewPreset({
      preset: mockPreset,
      startDate,
      endDate,
      mode: 'overwrite',
    });

    expect(preview.conflicts).toHaveLength(1);
    expect(preview.conflicts[0].date).toBe('2026-09-01');
    expect(preview.shiftsToInsert).toHaveLength(5);
  });

  it('should handle fill-empty mode without conflicts', async () => {
    const startDate = '2026-09-01';
    const endDate = '2026-09-03';
    (shiftsApi.getByDateRange as Mock).mockResolvedValue([]);
    (presetMetaApi.getByPresetId as Mock).mockResolvedValue(null);

    const preview = await previewPreset({
      preset: mockPreset,
      startDate,
      endDate,
      mode: 'fill-empty',
    });

    expect(preview.conflicts).toHaveLength(0);
    expect(preview.shiftsToInsert).toHaveLength(3);
  });
});
