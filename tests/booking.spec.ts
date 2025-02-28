import { test, expect, Locator } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.goto('/');
});
//Testing filters
test.describe('New Booking', () => {
  test('check new booking btn', async ({ page }) => {
    await expect(page.getByTestId('ir-calendar')).toBeVisible();
    const btn = page.getByTestId('new_booking_btn');
    await expect(btn).toBeVisible();
    await btn.click();
    const sheet = page.getByTestId('book_property_sheet');
    await expect(sheet).toBeVisible();
    const adult_dropdown = page.getByTestId('adult_number');
    const children_dropdown = page.getByTestId('child_number');
    const date_picker = page.getByTestId('date_picker');
    //select adults and children;
    adult_dropdown.selectOption({ label: '2' });
    children_dropdown.selectOption({ label: '1' });

    await expect(adult_dropdown).toHaveValue('2');
    await expect(children_dropdown).toHaveValue('1');

    date_picker.click();
    const datePickerCalendar = page.locator('.daterangepicker');
    await expect(datePickerCalendar).toBeVisible();
    await datePickerCalendar.getByText('28').nth(2).click();
    await datePickerCalendar.getByText('3').nth(5).click();
    await expect(datePickerCalendar).toBeHidden();
    await page.getByText('Check').click();

    // await expect(date_picker).toHaveText('Feb 28 2025');
  });
});
