-- Отключаем проверку внешних ключей
SET session_replication_role = 'replica';

DROP TABLE IF EXISTS preset_meta CASCADE;
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS presets CASCADE;
DROP TABLE IF EXISTS shift_types CASCADE;

SET session_replication_role = 'origin';

-- Создание таблиц
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
ALTER TABLE shift_types ADD CONSTRAINT shift_types_name_unique UNIQUE (name);

CREATE TABLE presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sequence UUID[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE TABLE preset_meta (
  preset_id UUID PRIMARY KEY REFERENCES presets(id) ON DELETE CASCADE,
  user_id UUID,
  reference_date DATE NOT NULL,
  reference_index INTEGER NOT NULL DEFAULT 0,
  last_applied_at TIMESTAMPTZ,
  dirty BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_shifts_type_id ON shifts(type_id);
CREATE INDEX idx_preset_meta_preset_id ON preset_meta(preset_id);

ALTER TABLE shift_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE preset_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for anon" ON shift_types FOR ALL TO anon USING (true);
CREATE POLICY "Enable all for anon" ON presets FOR ALL TO anon USING (true);
CREATE POLICY "Enable all for anon" ON shifts FOR ALL TO anon USING (true);
CREATE POLICY "Enable all for anon" ON preset_meta FOR ALL TO anon USING (true);

-- Вставка начальных данных
INSERT INTO shift_types (name, color, emoji, duration_hours, category)
SELECT 'Дневная', '#FFA500', '☀️', 12, 'day'
WHERE NOT EXISTS (SELECT 1 FROM shift_types WHERE name = 'Дневная');

INSERT INTO shift_types (name, color, emoji, duration_hours, category)
SELECT 'Ночная', '#1E90FF', '🌙', 12, 'night'
WHERE NOT EXISTS (SELECT 1 FROM shift_types WHERE name = 'Ночная');

INSERT INTO shift_types (name, color, emoji, duration_hours, category)
SELECT 'Выходной', '#32CD32', '🌿', 0, 'off'
WHERE NOT EXISTS (SELECT 1 FROM shift_types WHERE name = 'Выходной');