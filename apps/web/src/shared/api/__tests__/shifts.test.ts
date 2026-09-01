import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { shiftsApi } from '../shifts';
import { supabase } from '@/shared/lib/supabase';
import { CreateShift } from '@shifts/types';

vi.mock('@/shared/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('shiftsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          lte: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
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
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
    (supabase.from as Mock).mockImplementation(mockFrom);
  });

  it('getByDateRange should return shifts in range (camelCase)', async () => {
    const snakeData = [
      {
        id: '1',
        date: '2026-09-01',
        type_id: 'type-1',
        note: '',
        user_id: null,
      },
    ];
    const expected = [
      { id: '1', date: '2026-09-01', typeId: 'type-1', note: '', userId: null },
    ];

    const mockSelect = vi.fn().mockReturnValue({
      gte: vi.fn().mockReturnValue({
        lte: vi.fn().mockResolvedValue({ data: snakeData, error: null }),
      }),
    });
    (supabase.from as Mock).mockReturnValue({ select: mockSelect });

    const result = await shiftsApi.getByDateRange('2026-09-01', '2026-09-30');
    expect(result).toEqual(expected);
  });

  it('create should insert new shift', async () => {
    const payload: CreateShift = {
      date: '2026-09-01',
      typeId: 'type-1',
      note: '',
    };
    const snakePayload = { date: '2026-09-01', type_id: 'type-1', note: '' };
    const snakeResponse = { id: 'new-id', ...snakePayload };

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: snakeResponse, error: null }),
      }),
    });
    (supabase.from as Mock).mockReturnValue({ insert: mockInsert });

    const result = await shiftsApi.create(payload);
    expect(result).toMatchObject({ id: 'new-id', ...payload });
    expect(mockInsert).toHaveBeenCalledWith(snakePayload);
  });
});
