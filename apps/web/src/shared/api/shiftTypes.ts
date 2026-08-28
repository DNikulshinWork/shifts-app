import { supabase } from '@/shared/lib/supabase';
import { ShiftType, CreateShiftType, UpdateShiftType } from '@shifts/types';

export const shiftTypesApi = {
  async getAll(): Promise<ShiftType[]> {
    const { data, error } = await supabase
      .from('shift_types')
      .select('*')
      .order('name');
    if (error) throw new Error(error.message);
    return data as ShiftType[];
  },

  async getById(id: string): Promise<ShiftType> {
    const { data, error } = await supabase
      .from('shift_types')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data as ShiftType;
  },

  async create(payload: CreateShiftType): Promise<ShiftType> {
    const { data, error } = await supabase
      .from('shift_types')
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ShiftType;
  },

  async update(id: string, payload: UpdateShiftType): Promise<ShiftType> {
    const { data, error } = await supabase
      .from('shift_types')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ShiftType;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('shift_types').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
