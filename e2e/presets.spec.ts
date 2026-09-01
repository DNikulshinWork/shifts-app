import { test, expect } from '@playwright/test';

test('should create preset', async ({ page }) => {
  await page.goto('/shifts-app/settings/presets');
  await page.getByRole('button', { name: 'Создать пресет' }).click();

  // Заполняем название
  await page.fill('input[name="name"]', 'Тестовый пресет');

  // Добавляем тип смены (кликаем на кнопку "Добавить тип смены")
  await page.getByRole('button', { name: /Добавить тип смены/ }).click();

  // Открываем Select (кликаем на триггер)
  const selectTrigger = page.locator('[data-slot="select-trigger"]').first();
  await selectTrigger.click();

  // Выбираем первый элемент из списка
  const firstOption = page.locator('[data-slot="select-item"]').first();
  await firstOption.click();

  // Сохраняем пресет
  await page.getByRole('button', { name: 'Создать' }).click();

  // Ждём, пока пресет появится в списке (используем first(), так как может быть несколько)
  await expect(page.getByText('Тестовый пресет').first()).toBeVisible();
});
