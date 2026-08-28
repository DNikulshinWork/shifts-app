import { supabase } from '@/shared/lib/supabase';
import {
  Preset,
  CreatePreset,
  UpdatePreset,
  PresetMeta,
  CreatePresetMeta,
  UpdatePresetMeta,
} from '@shifts/types';

export const presetsApi = {
  async getAll(): Promise<Preset[]> {
    const { data, error } = await supabase
      .from('presets')
      .select('*')
      .order('name');
    if (error) throw new Error(error.message);
    return data as Preset[];
  },

  async getById(id: string): Promise<Preset> {
    const { data, error } = await supabase
      .from('presets')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data as Preset;
  },

  async create(payload: CreatePreset): Promise<Preset> {
    const { data, error } = await supabase
      .from('presets')
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Preset;
  },

  async update(id: string, payload: UpdatePreset): Promise<Preset> {
    const { data, error } = await supabase
      .from('presets')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Preset;
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
      .eq('presetId', presetId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as PresetMeta | null;
  },

  async upsert(payload: CreatePresetMeta): Promise<PresetMeta> {
    const { data, error } = await supabase
      .from('preset_meta')
      .upsert(payload, { onConflict: 'presetId' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as PresetMeta;
  },

  async update(
    presetId: string,
    payload: UpdatePresetMeta
  ): Promise<PresetMeta> {
    const { data, error } = await supabase
      .from('preset_meta')
      .update(payload)
      .eq('presetId', presetId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as PresetMeta;
  },

  async delete(presetId: string): Promise<void> {
    const { error } = await supabase
      .from('preset_meta')
      .delete()
      .eq('presetId', presetId);
    if (error) throw new Error(error.message);
  },
};
