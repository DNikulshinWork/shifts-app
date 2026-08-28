-- Базовые типы смен (вставляем только если их ещё нет)
INSERT INTO shift_types (name, color, emoji, duration_hours, category)
SELECT 'Дневная', '#FFA500', '☀️', 12, 'day'
WHERE NOT EXISTS (SELECT 1 FROM shift_types WHERE name = 'Дневная');

INSERT INTO shift_types (name, color, emoji, duration_hours, category)
SELECT 'Ночная', '#1E90FF', '🌙', 12, 'night'
WHERE NOT EXISTS (SELECT 1 FROM shift_types WHERE name = 'Ночная');

INSERT INTO shift_types (name, color, emoji, duration_hours, category)
SELECT 'Выходной', '#32CD32', '🌿', 0, 'off'
WHERE NOT EXISTS (SELECT 1 FROM shift_types WHERE name = 'Выходной');