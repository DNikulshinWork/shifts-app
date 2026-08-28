import { supabase } from '@/shared/lib/supabase';
import { Shift, CreateShift, UpdateShift } from '@shifts/types';
import { toCamel, toSnake } from '@/shared/lib/transform';

export const shiftsApi = {
  async getByDateRange(startDate: string, endDate: string): Promise<Shift[]> {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    if (error) throw new Error(error.message);
    return toCamel<Shift[]>(data);
  },

  async getByDate(date: string): Promise<Shift[]> {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('date', date);
    if (error) throw new Error(error.message);
    return toCamel<Shift[]>(data);
  },

  async getById(id: string): Promise<Shift> {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return toCamel<Shift>(data);
  },

  async create(payload: CreateShift): Promise<Shift> {
    const { data, error } = await supabase
      .from('shifts')
      .insert(toSnake(payload))
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toCamel<Shift>(data);
  },

  async update(id: string, payload: UpdateShift): Promise<Shift> {
    const { data, error } = await supabase
      .from('shifts')
      .update(toSnake(payload))
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toCamel<Shift>(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('shifts').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async upsertMany(shifts: CreateShift[]): Promise<Shift[]> {
    const { data, error } = await supabase
      .from('shifts')
      .upsert(shifts.map(toSnake), { onConflict: 'date,type_id' })
      .select();
    if (error) throw new Error(error.message);
    return toCamel<Shift[]>(data);
  },
};
