import { supabase } from '@/shared/lib/supabase';
import {
  Preset,
  CreatePreset,
  UpdatePreset,
  PresetMeta,
  CreatePresetMeta,
  UpdatePresetMeta,
} from '@shifts/types';
import { toCamel, toSnake } from '@/shared/lib/transform';

export const presetsApi = {
  async getAll(): Promise<Preset[]> {
    const { data, error } = await supabase
      .from('presets')
      .select('*')
      .order('name');
    if (error) throw new Error(error.message);
    return toCamel<Preset[]>(data);
  },

  async getById(id: string): Promise<Preset> {
    const { data, error } = await supabase
      .from('presets')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return toCamel<Preset>(data);
  },

  async create(payload: CreatePreset): Promise<Preset> {
    const { data, error } = await supabase
      .from('presets')
      .insert(toSnake(payload))
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toCamel<Preset>(data);
  },

  async update(id: string, payload: UpdatePreset): Promise<Preset> {
    const { data, error } = await supabase
      .from('presets')
      .update(toSnake(payload))
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toCamel<Preset>(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('presets').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

export const presetMetaApi = {
  async getByPresetId(presetId: string): Promise<PresetMeta | null> {
    const { data, error } = await supabase
      .from('preset_meta')
      .select('*')
      .eq('preset_id', presetId) // ← snake_case в запросе
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toCamel<PresetMeta>(data) : null;
  },

  async upsert(payload: CreatePresetMeta): Promise<PresetMeta> {
    // payload содержит camelCase, преобразуем в snake_case
    const { data, error } = await supabase
      .from('preset_meta')
      .upsert(toSnake(payload), { onConflict: 'preset_id' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toCamel<PresetMeta>(data);
  },

  async update(
    presetId: string,
    payload: UpdatePresetMeta
  ): Promise<PresetMeta> {
    const { data, error } = await supabase
      .from('preset_meta')
      .update(toSnake(payload))
      .eq('preset_id', presetId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toCamel<PresetMeta>(data);
  },

  async delete(presetId: string): Promise<void> {
    const { error } = await supabase
      .from('preset_meta')
      .delete()
      .eq('preset_id', presetId);
    if (error) throw new Error(error.message);
  },
};
