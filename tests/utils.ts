import * as fs from 'fs';
import * as path from 'path';
import { expect, Page } from '@playwright/test';
import moment from 'moment';
export function loadTestFile<T>(file: string) {
  const testDataPath = path.resolve(__dirname, 'data', `${file}`);
  let data: T;
  try {
    const rawData = fs.readFileSync(testDataPath, 'utf8');
    data = JSON.parse(rawData) as T;
    return data;
  } catch (error) {
    console.error(`Error reading or parsing ${file}:`, error);
    process.exit(1);
  }
}
export async function selectDate({ date, page }: { date: string; page: Page }) {
  const datePickerCalendar = page.locator('.air-datepicker');
  await expect(datePickerCalendar).toBeVisible();

  const calMonth = datePickerCalendar.locator('.air-datepicker-nav--title');
  const prevBtn = datePickerCalendar.locator("//div[@data-action='prev']");
  const nextBtn = datePickerCalendar.locator("//div[@data-action='next']");

  const dateLabel = moment(date, 'YYYY-MM-DD').format('MMMM, YYYY');
  while ((await calMonth.textContent()) !== dateLabel) {
    if (moment(dateLabel, 'MMMM, YYYY').isBefore(moment(await calMonth.textContent(), 'MMMM, YYYY'), 'months')) {
      await prevBtn.click();
    } else {
      await nextBtn.click();
    }
  }
  const d = moment(date, 'YYYY-MM-DD');
  await page.locator(`//div[@data-year=${d.year()} and @data-month=${d.month()} and @data-date=${d.date()}]`).click();
  await expect(datePickerCalendar).toBeHidden();
}
