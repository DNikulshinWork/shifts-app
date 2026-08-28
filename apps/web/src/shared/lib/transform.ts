import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

/**
 * Глубокое преобразование ключей объекта из snake_case в camelCase
 */
export const toCamel = <T = Record<string, unknown>>(obj: unknown): T =>
  camelcaseKeys(obj as Record<string, unknown>, { deep: true }) as T;

/**
 * Глубокое преобразование ключей объекта из camelCase в snake_case
 */
export const toSnake = <T = Record<string, unknown>>(obj: unknown): T =>
  snakecaseKeys(obj as Record<string, unknown>, { deep: true }) as T;
