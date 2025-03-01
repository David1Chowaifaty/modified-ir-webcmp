import { test, expect, Locator, Page } from '@playwright/test';
import moment from 'moment';
test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

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

    const fromDate = '2025-12-05';
    const toDate = '2026-01-02';
    await selectDates({ fromDate, toDate, page });
    await page.getByText('Check').click();
  });
  test('a', () => {
    console.log(moment('2025-12-05', 'YYYY-MM-DD').format('MMM DD, YYYY'));
  });
});

async function selectDates({ fromDate, toDate, page }: { fromDate: string; toDate: string; page: Page }) {
  const datePickerCalendar = page.locator('.daterangepicker');
  await expect(datePickerCalendar).toBeVisible();

  const calMonths = datePickerCalendar.locator('.month');
  const prevBtn = datePickerCalendar.locator('.prev');
  const nextBtn = datePickerCalendar.locator('.next');

  const fromDateLabel = moment(fromDate, 'YYYY-MM-DD').format('MMMM YYYY');
  const toDateLabel = moment(toDate, 'YYYY-MM-DD').format('MMMM YYYY');

  while ((await calMonths.nth(0).textContent()) !== fromDateLabel) {
    if (moment(fromDateLabel, 'MMMM YYYY').isBefore(moment(await calMonths.nth(0).textContent(), 'MMMM YYYY'), 'months')) {
      await prevBtn.click();
    } else {
      await nextBtn.click();
    }
  }
  await page.locator(`//div[contains(@class, 'drp-calendar left')]//td[@class='available' and text()=${moment(fromDate, 'YYYY-MM-DD').date().toString()}]`).click();

  while ((await calMonths.nth(1).textContent()) !== toDateLabel) {
    if (moment(toDateLabel, 'MMMM YYYY').isBefore(moment(await calMonths.nth(1).textContent(), 'MMMM YYYY'), 'months')) {
      await prevBtn.click();
    } else {
      await nextBtn.click();
    }
  }
  await page.locator(`//div[contains(@class, 'drp-calendar right')]//td[@class='available' and text()=${moment(toDate, 'YYYY-MM-DD').date().toString()}]`).click();

  await expect(datePickerCalendar).toBeHidden();

  await expect(page.locator("(//span[@class='sc-igl-date-range'])[1]")).toHaveText(moment(fromDate, 'YYYY-MM-DD').format('MMM DD, YYYY'));
  await expect(page.locator("(//span[@class='sc-igl-date-range'])[2]")).toHaveText(moment(toDate, 'YYYY-MM-DD').format('MMM DD, YYYY'));
}
