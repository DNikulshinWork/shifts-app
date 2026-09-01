import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { presetsApi, presetMetaApi } from '../presets';
import { supabase } from '@/shared/lib/supabase';
import { CreatePreset, CreatePresetMeta } from '@shifts/types';

vi.mock('@/shared/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('presetsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: {}, error: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: {}, error: null }),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
    (supabase.from as Mock).mockImplementation(mockFrom);
  });

  it('getAll should return list of presets', async () => {
    const snakeData = [
      {
        id: '1',
        name: 'Test',
        sequence: ['a', 'b'],
        created_at: null,
        updated_at: null,
      },
    ];
    const expected = [
      {
        id: '1',
        name: 'Test',
        sequence: ['a', 'b'],
        createdAt: null,
        updatedAt: null,
      },
    ];

    const mockSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: snakeData, error: null }),
    });
    (supabase.from as Mock).mockReturnValue({ select: mockSelect });

    const result = await presetsApi.getAll();
    expect(result).toEqual(expected);
  });

  it('create should insert new preset', async () => {
    const payload: CreatePreset = {
      name: 'New Preset',
      sequence: ['a', 'b', 'c'],
    };
    const snakePayload = { name: 'New Preset', sequence: ['a', 'b', 'c'] };
    const snakeResponse = { id: 'new-id', ...snakePayload };

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: snakeResponse, error: null }),
      }),
    });
    (supabase.from as Mock).mockReturnValue({ insert: mockInsert });

    const result = await presetsApi.create(payload);
    expect(result).toMatchObject({ id: 'new-id', ...payload });
    expect(mockInsert).toHaveBeenCalledWith(snakePayload);
  });
});

describe('presetMetaApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: {}, error: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: {}, error: null }),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
    (supabase.from as Mock).mockImplementation(mockFrom);
  });

  it('getByPresetId should return meta', async () => {
    const snakeData = {
      preset_id: '1',
      reference_date: '2026-09-01',
      reference_index: 0,
      dirty: false,
    };
    const expected = {
      presetId: '1',
      referenceDate: '2026-09-01',
      referenceIndex: 0,
      dirty: false,
    };

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi
          .fn()
          .mockResolvedValue({ data: snakeData, error: null }),
      }),
    });
    (supabase.from as Mock).mockReturnValue({ select: mockSelect });

    const result = await presetMetaApi.getByPresetId('1');
    expect(result).toEqual(expected);
  });

  it('upsert should insert or update meta', async () => {
    const payload: CreatePresetMeta = {
      presetId: '1',
      referenceDate: '2026-09-01',
      referenceIndex: 0,
      dirty: false,
    };
    const snakePayload = {
      preset_id: '1',
      reference_date: '2026-09-01',
      reference_index: 0,
      dirty: false,
    };
    const snakeResponse = {
      preset_id: '1',
      reference_date: '2026-09-01',
      reference_index: 0,
      dirty: false,
    };

    const mockUpsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: snakeResponse, error: null }),
      }),
    });
    (supabase.from as Mock).mockReturnValue({ upsert: mockUpsert });

    const result = await presetMetaApi.upsert(payload);
    expect(result).toMatchObject(payload);
    expect(mockUpsert).toHaveBeenCalledWith(snakePayload, {
      onConflict: 'preset_id',
    });
  });
});
