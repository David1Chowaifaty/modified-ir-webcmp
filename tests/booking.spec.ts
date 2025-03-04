import { test, expect, Locator, Page } from '@playwright/test';
import moment from 'moment';
import equal from 'fast-deep-equal/es6';
import { loadTestFile } from './utils';

interface TestData {
  from_date: string;
  to_date: string;
  propertyid: number;
  language: string;
  room_type_ids: any[];
  agent_id: null;
  is_in_agent_mode: boolean;
  room_type_ids_to_update: number[];
  adult_nbr: string;
  child_nbr: number;
  currency_ref: string;
  skip_getting_assignable_units: boolean;
  is_backend: boolean;
}

const checkAvailabilityPayload = loadTestFile<TestData>('check_availability.json');
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
    adult_dropdown.selectOption({ label: checkAvailabilityPayload.adult_nbr });
    if (checkAvailabilityPayload.child_nbr > 0) {
      children_dropdown.selectOption({ label: checkAvailabilityPayload.child_nbr.toString() });
      await expect(children_dropdown).toHaveValue(checkAvailabilityPayload.child_nbr?.toString());
    }

    await expect(adult_dropdown).toHaveValue(checkAvailabilityPayload.adult_nbr?.toString());

    date_picker.click();
    await selectDates({ fromDate: checkAvailabilityPayload.from_date, toDate: checkAvailabilityPayload.to_date, page });
    await page.getByText('Check').click();
  });
  test('bar booking', async ({ page }) => {
    const fromDate = '2025-03-05';
    const toDate = '2025-03-08';
    const roomName = '103';
    await expect(page.getByTestId('ir-calendar')).toBeVisible();

    //select the room
    await page.locator(`//div[@data-date='${fromDate}' and @data-room-name='${roomName}']`).click();
    await page.locator(`//div[@data-date='${toDate}' and @data-room-name='${roomName}']`).click();

    await page.getByTestId('bar_booking_btn').click();

    const sheet = page.getByTestId('book_property_sheet');
    await expect(sheet).toBeVisible();
    const adult_dropdown = page.getByTestId('adult_number');
    const children_dropdown = page.getByTestId('child_number');

    //select adults and children;
    adult_dropdown.selectOption({ label: checkAvailabilityPayload.adult_nbr });
    if (checkAvailabilityPayload.child_nbr > 0) {
      children_dropdown.selectOption({ label: checkAvailabilityPayload.child_nbr.toString() });
      await expect(children_dropdown).toHaveValue(checkAvailabilityPayload.child_nbr?.toString());
    }

    await expect(adult_dropdown).toHaveValue(checkAvailabilityPayload.adult_nbr?.toString());

    await page.getByText('Check').click();
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
