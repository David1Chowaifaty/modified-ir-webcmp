import { test, expect } from '@playwright/test';
import { IExposedHouseKeepingSetup } from '../src/models/housekeeping';
import { loadTestFile } from './utils';

interface HkUserPayload {
  new_user: User;
  update_user: User;
}

interface User {
  name: string;
  phone: string;
  note: string;
  username: string;
  password: string;
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('ir-housekeeping')).toBeVisible();
});
const payload = loadTestFile<HkUserPayload>('housekeeping.json');

test.describe('Housekeeping Table Rendering and Note Popover Validation', () => {
  test('should render all housekeeping rows and correctly display note popovers', async ({ page }) => {
    const hkResult = await page.waitForResponse(res => res.request().method() === 'POST' && res.url().includes('/Get_Exposed_HK_Setup'));
    const { housekeepers } = (await hkResult.json()).My_Result as IExposedHouseKeepingSetup;

    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('hk_table_body')).toBeVisible();

    const rows = await page.getByTestId('hk_table_body').getByTestId('hk_row').all();
    expect(rows.length).toBe(housekeepers.length);

    for (const hk of housekeepers) {
      const row = page.locator(`//tr[@data-hk-id='${hk.id}']`);
      await expect(row).toBeVisible();
      await expect(row.locator('td').nth(0)).toContainText(hk.name);

      if (hk.note) {
        const noteButton = row.locator("//ir-button[@data-testid='note_trigger']");
        await expect(noteButton).toBeVisible();
        await noteButton.click();

        const popover = page.locator("//div[contains(@class,'popover fade')]");
        await expect(popover).toBeVisible();
        await expect(popover).toHaveText(hk.note);

        await page.click('body');
        await expect(popover).toBeHidden();
      }
    }
  });
});
test.describe('Users', () => {
  test('should create new user', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.getByTestId('new_user').click();
    await expect(page.locator('ir-hk-user')).toBeVisible();

    // Ensure input fields are visible
    const nameInput = page.getByTestId('name');
    const phoneInput = page.getByTestId('phone');
    const noteInput = page.getByTestId('note');
    const usernameInput = page.getByTestId('username');
    const passwordInput = page.getByTestId('password');

    await expect(nameInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
    await expect(noteInput).toBeVisible();
    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await nameInput.fill(payload.new_user.name);
    await phoneInput.fill(payload.new_user.phone);
    const generatedUser = (await (await page.waitForResponse(res => res.request().method() === 'POST' && res.url().includes('/Generate_UserName'))).json()).My_Result;
    await expect(usernameInput).toHaveValue(generatedUser);
    await noteInput.fill(payload.new_user.note);
    await passwordInput.fill(payload.new_user.password);
    await expect(nameInput).toHaveValue(payload.new_user.name);
    await expect(phoneInput).toHaveValue(payload.new_user.phone);
    await expect(noteInput).toHaveValue(payload.new_user.note);
    await expect(passwordInput).toHaveValue(payload.new_user.password);
  });
  test('should validate name field correctly', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.getByTestId('new_user').click();
    await expect(page.locator('ir-hk-user')).toBeVisible();

    const nameInput = page.getByTestId('name');
    const saveButton = page.getByTestId('save');

    await expect(nameInput).toBeVisible();

    await nameInput.focus();
    await nameInput.blur();
    await expect(nameInput).not.toHaveAttribute('aria-invalid', 'true');

    // Click save to trigger validation error
    await saveButton.click();
    await expect(nameInput).toHaveAttribute('aria-invalid', 'true');

    // Enter correct value and blur (error should disappear)
    await nameInput.fill(payload.new_user.name);
    await page.keyboard.press('Tab');
    await expect(nameInput).not.toHaveAttribute('aria-invalid', 'true');
  });
});
