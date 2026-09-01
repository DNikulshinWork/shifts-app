import { describe, it, expect, beforeEach, Mock } from 'vitest';
import { shiftTypesApi } from '../shiftTypes';
import { supabase } from '@/shared/lib/supabase';
import { CreateShiftType } from '@shifts/types';

vi.mock('@/shared/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('shiftTypesApi', () => {
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

  it('getAll should return list of shift types (camelCase)', async () => {
    const snakeData = [
      {
        id: '1',
        name: 'Day',
        color: '#FF0000',
        emoji: '☀️',
        duration_hours: 12,
        category: 'day',
      },
    ];
    const expected = [
      {
        id: '1',
        name: 'Day',
        color: '#FF0000',
        emoji: '☀️',
        durationHours: 12,
        category: 'day',
      },
    ];

    const mockSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: snakeData, error: null }),
    });
    (supabase.from as Mock).mockReturnValue({ select: mockSelect });

    const result = await shiftTypesApi.getAll();
    expect(result).toEqual(expected);
  });

  it('create should insert new shift type and return camelCase', async () => {
    const payload: CreateShiftType = {
      name: 'Night',
      color: '#0000FF',
      emoji: '🌙',
      durationHours: 12,
      category: 'night',
    };
    const snakePayload = {
      name: 'Night',
      color: '#0000FF',
      emoji: '🌙',
      duration_hours: 12,
      category: 'night',
    };
    const snakeResponse = { id: '2', ...snakePayload };

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: snakeResponse, error: null }),
      }),
    });
    (supabase.from as Mock).mockReturnValue({ insert: mockInsert });

    const result = await shiftTypesApi.create(payload);
    expect(result).toMatchObject({ id: '2', ...payload });
    expect(mockInsert).toHaveBeenCalledWith(snakePayload);
  });
});
