import { z } from 'zod';

// ─── Категория смены ──────────────────────────────────────────
export const ShiftCategorySchema = z.enum(['day', 'night', 'off']);
export type ShiftCategory = z.infer<typeof ShiftCategorySchema>;

// ─── Тип смены ─────────────────────────────────────────────────
export const ShiftTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(30),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  emoji: z.string().max(4).default(''),
  durationHours: z.number().min(0).max(24).default(12),
  category: ShiftCategorySchema.default('day'),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type ShiftType = z.infer<typeof ShiftTypeSchema>;

// ─── Схемы для форм типа смены ────────────────────────────────
export const CreateShiftTypeSchema = ShiftTypeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const UpdateShiftTypeSchema = ShiftTypeSchema.partial().required({
  id: true,
});
export type CreateShiftType = z.infer<typeof CreateShiftTypeSchema>;
export type UpdateShiftType = z.infer<typeof UpdateShiftTypeSchema>;

// ─── Смена ──────────────────────────────────────────────────────
export const ShiftSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().optional(), // для будущей многопользовательскости
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  typeId: z.string().uuid(),
  note: z.string().max(500).default(''),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Shift = z.infer<typeof ShiftSchema>;

// ─── Схемы для форм смены ──────────────────────────────────────
export const CreateShiftSchema = ShiftSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const UpdateShiftSchema = ShiftSchema.partial().required({ id: true });
export type CreateShift = z.infer<typeof CreateShiftSchema>;
export type UpdateShift = z.infer<typeof UpdateShiftSchema>;

// ─── Пресет (шаблон последовательности смен) ──────────────────
export const PresetSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().optional(),
  name: z.string().min(1).max(40),
  sequence: z.array(z.string().uuid()).min(1),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type Preset = z.infer<typeof PresetSchema>;

// ─── Схемы для форм пресета ────────────────────────────────────
export const CreatePresetSchema = PresetSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const UpdatePresetSchema = PresetSchema.partial().required({ id: true });
export type CreatePreset = z.infer<typeof CreatePresetSchema>;
export type UpdatePreset = z.infer<typeof UpdatePresetSchema>;

// ─── Метаданные применения пресета ────────────────────────────
export const PresetMetaSchema = z.object({
  presetId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  referenceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  referenceIndex: z.number().int().min(0),
  lastAppliedAt: z.string().datetime().optional(),
  dirty: z.boolean().default(false),
});
export type PresetMeta = z.infer<typeof PresetMetaSchema>;

// ─── Схемы для форм метаданных ────────────────────────────────
export const CreatePresetMetaSchema = PresetMetaSchema;

export const UpdatePresetMetaSchema = PresetMetaSchema.partial().required({
  presetId: true,
});
export type CreatePresetMeta = z.infer<typeof CreatePresetMetaSchema>;
export type UpdatePresetMeta = z.infer<typeof UpdatePresetMetaSchema>;

// ─── Режимы применения пресета ────────────────────────────────
export const ApplyModeSchema = z.enum(['overwrite', 'fill-empty', 'continue']);
export type ApplyMode = z.infer<typeof ApplyModeSchema>;
