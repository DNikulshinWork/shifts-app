-- Сброс всех таблиц с удалением зависимостей
-- Отключаем проверку внешних ключей для безопасного удаления
SET session_replication_role = 'replica';

DROP TABLE IF EXISTS preset_meta CASCADE;
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS presets CASCADE;
DROP TABLE IF EXISTS shift_types CASCADE;

-- Включаем проверку обратно
SET session_replication_role = 'origin';

-- Далее можно выполнить schema.sql и seed.sql
-- Либо просто скопировать их содержимое сюда