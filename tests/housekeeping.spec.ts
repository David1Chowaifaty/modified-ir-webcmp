import { test, expect, Locator } from '@playwright/test';
import { IExposedHouseKeepingSetup } from '../src/models/housekeeping';
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('ir-housekeeping')).toBeVisible();
});

test.describe('Check booking Color', () => {
  test('check hk table', async ({ page }) => {
    const hkResult = await page.waitForResponse(res => res.request().method() === 'POST' && res.url().includes('/Get_Exposed_HK_Setup'));
    const { housekeepers } = (await hkResult.json()).My_Result as IExposedHouseKeepingSetup;
    await expect(page.getByTestId('hk_table_body')).toBeVisible();
    const rows = await page.getByTestId('hk_table_body').getByTestId('hk_row').all();
    expect(rows.length).toBe(housekeepers.length);
    for (const hk of housekeepers) {
      const row = page.locator(`//tr[@data-hk-id='${hk.id}']`);
      await expect(row).toBeVisible();
      await expect(row.locator('td').nth(0)).toContainText(hk.name);
      if (hk.note) {
        const note = row.locator("//ir-button[@data-testid='note_trigger']");
        await expect(note).toBeVisible();
        await note.click();
        const popover = page.locator("//div[contains(@class,'popover fade')]");
        await expect(popover).toBeVisible();
        await expect(popover).toHaveText(hk.note);
        await page.click('body');
        await expect(popover).toBeHidden();
      }
    }
  });
});
