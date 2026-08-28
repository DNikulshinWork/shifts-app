import { supabase } from '@/shared/lib/supabase';
import { Shift, CreateShift, UpdateShift } from '@shifts/types';

export const shiftsApi = {
  async getByDateRange(startDate: string, endDate: string): Promise<Shift[]> {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    if (error) throw new Error(error.message);
    return data as Shift[];
  },

  async getByDate(date: string): Promise<Shift[]> {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('date', date);
    if (error) throw new Error(error.message);
    return data as Shift[];
  },

  async create(payload: CreateShift): Promise<Shift> {
    const { data, error } = await supabase
      .from('shifts')
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Shift;
  },

  async update(id: string, payload: UpdateShift): Promise<Shift> {
    const { data, error } = await supabase
      .from('shifts')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Shift;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('shifts').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async upsertMany(shifts: CreateShift[]): Promise<Shift[]> {
    const { data, error } = await supabase
      .from('shifts')
      .upsert(shifts, { onConflict: 'date,typeId' })
      .select();
    if (error) throw new Error(error.message);
    return data as Shift[];
  },

  async getById(id: string): Promise<Shift> {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data as Shift;
  },
};
