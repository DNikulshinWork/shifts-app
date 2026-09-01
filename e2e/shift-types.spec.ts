import { test, expect } from '@playwright/test';

test('should create shift type', async ({ page }) => {
  await page.goto('/shifts-app/settings/shift-types');
  await page.getByRole('button', { name: 'Добавить' }).click();
  await page.fill('input[name="name"]', 'Тестовый тип');
  await page.fill('input[name="color"]', '#FF00FF');
  await page.fill('input[name="emoji"]', '🧪');
  await page.getByRole('button', { name: 'Создать' }).click();
  await expect(page.getByText('Тестовый тип')).toBeVisible();
});
