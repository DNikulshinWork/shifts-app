import { ShiftType, Shift, Preset, PresetMeta } from '@shifts/types';

export type Tables = {
  shift_types: ShiftType;
  shifts: Shift;
  presets: Preset;
  preset_meta: PresetMeta;
};

export type InsertTables = {
  shift_types: Omit<ShiftType, 'id' | 'createdAt' | 'updatedAt'>;
  shifts: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>;
  presets: Omit<Preset, 'id' | 'createdAt' | 'updatedAt'>;
  preset_meta: Omit<PresetMeta, 'presetId'>;
};
