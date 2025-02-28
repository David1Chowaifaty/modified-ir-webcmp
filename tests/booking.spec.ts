import { test, expect, Locator } from '@playwright/test';
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
    const datePickerCalendar = page.locator('.daterangepicker');
    await expect(datePickerCalendar).toBeVisible();
    await datePickerCalendar.getByText('28').nth(2).click();
    await datePickerCalendar.getByText('3').nth(5).click();
    await expect(datePickerCalendar).toBeHidden();
    await page.getByText('Check').click();
    // await expect(date_picker).toHaveText('Feb 28 2025');
  });
  test('getCustomDateClick', () => {
    const fromDateLabel = moment().format('MMMM YYYY');
    const fromDate = '2025-12-05';
    const toDate = '2026-01-05';
    const toDateLabel = moment('2025-03-01', 'YYYY-MM-DD').format('MMMM YYYY');
    console.log(getMonthClicksSeparateArrows({ fromDate, fromDateLabel, toDate, toDateLabel }));
  });
});

function getMonthClicksSeparateArrows({ fromDate, fromDateLabel, toDate, toDateLabel }: { fromDate: string; toDate: string; fromDateLabel: string; toDateLabel: string }) {
  const fromMoment = moment(fromDate, 'YYYY-MM-DD');
  const fromLabelMoment = moment(fromDateLabel, 'MMMM YYYY');
  const toMoment = moment(toDate, 'YYYY-MM-DD');
  const toLabelMoment = moment(toDateLabel, 'MMMM YYYY');

  const fromDiff = fromMoment.diff(fromLabelMoment, 'months');
  const toDiff = toMoment.diff(toLabelMoment, 'months');

  let leftPositionCount = 0;
  let rightPositionCount = 0;

  // For the "left" calendar
  if (fromDiff < 0) {
    leftPositionCount += Math.abs(fromDiff); // number of previous clicks
  } else {
    rightPositionCount += fromDiff; // number of next clicks
  }

  // For the "right" calendar
  if (toDiff < 0) {
    leftPositionCount += Math.abs(toDiff);
  } else {
    rightPositionCount += toDiff;
  }

  // If no clicks are needed, return null or {0,0}
  if (leftPositionCount === 0 && rightPositionCount === 0) {
    return null;
  }

  return { leftPositionCount, rightPositionCount };
}
