-- 1. Таблица: shift_types (типы смен)
CREATE TABLE shift_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  emoji TEXT DEFAULT '',
  duration_hours INTEGER NOT NULL DEFAULT 12,
  category TEXT NOT NULL DEFAULT 'day',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Уникальность имени типа смены (предотвращает дубли)
ALTER TABLE shift_types ADD CONSTRAINT shift_types_name_unique UNIQUE (name);

-- 2. Таблица: presets (шаблоны последовательностей)
CREATE TABLE presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sequence UUID[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Таблица: shifts (сами смены)
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  date DATE NOT NULL,
  type_id UUID NOT NULL REFERENCES shift_types(id) ON DELETE CASCADE,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date, type_id)
);

-- 4. Таблица: preset_meta (метаданные применения пресетов)
CREATE TABLE preset_meta (
  preset_id UUID PRIMARY KEY REFERENCES presets(id) ON DELETE CASCADE,
  user_id UUID,
  reference_date DATE NOT NULL,
  reference_index INTEGER NOT NULL DEFAULT 0,
  last_applied_at TIMESTAMPTZ,
  dirty BOOLEAN NOT NULL DEFAULT false
);

-- 5. Индексы для ускорения работы
CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_shifts_type_id ON shifts(type_id);
CREATE INDEX idx_preset_meta_preset_id ON preset_meta(preset_id);

-- 6. Включаем Row Level Security (RLS)
ALTER TABLE shift_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE preset_meta ENABLE ROW LEVEL SECURITY;

-- 7. Политики для анонимного доступа (для разработки)
-- ВАЖНО: Для продакшена политики нужно будет переделать под аутентификацию!
CREATE POLICY "Enable all for anon" ON shift_types FOR ALL TO anon USING (true);
CREATE POLICY "Enable all for anon" ON presets FOR ALL TO anon USING (true);
CREATE POLICY "Enable all for anon" ON shifts FOR ALL TO anon USING (true);
CREATE POLICY "Enable all for anon" ON preset_meta FOR ALL TO anon USING (true);