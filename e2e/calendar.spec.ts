import { test, expect } from '@playwright/test';
import { format, addMonths } from 'date-fns';
import { ru } from 'date-fns/locale';

test('should load calendar page', async ({ page }) => {
  await page.goto('/shifts-app/');
  const currentMonth = format(new Date(), 'LLLL yyyy', { locale: ru });
  await expect(page.locator('h1')).toContainText(currentMonth);
});

test('should navigate to next month', async ({ page }) => {
  await page.goto('/shifts-app/');
  const nextButton = page
    .locator('button')
    .filter({ has: page.locator('svg[class*="chevron-right"]') })
    .first();
  await nextButton.click();
  const nextMonth = format(addMonths(new Date(), 1), 'LLLL yyyy', {
    locale: ru,
  });
  await expect(page.locator('h1')).toContainText(nextMonth);
});

test('should open shift dialog on day click', async ({ page }) => {
  await page.goto('/shifts-app/');
  // Ищем первую ячейку текущего месяца (без класса text-muted-foreground)
  const firstDay = page
    .locator('[class*="cursor-pointer"]:not([class*="text-muted-foreground"])')
    .first();
  await firstDay.click();
  // Ожидаем появления диалога с атрибутом role="dialog" или data-slot="dialog"
  await expect(
    page.locator('[role="dialog"], [data-slot="dialog"]')
  ).toBeVisible({ timeout: 10000 });
});
