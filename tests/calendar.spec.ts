import { test, expect, Locator } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const fakeTime = new Date('2025-02-28T13:00:00.000Z');
    const OriginalDate = Date;

    class FakeDate extends OriginalDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(fakeTime);
        } else {
          // @ts-ignore
          super(...args); // Ignore TS error about spread on 'any[]'
        }
      }

      static now() {
        return fakeTime.getTime();
      }
    }

    // @ts-ignore
    window.Date = FakeDate;
  });
  await page.goto('/');
});
//Testing filters
test.describe('Check booking Color', () => {
  test('check new booking btn', async ({ page }) => {
    await expect(page.getByTestId('ir-calendar')).toBeVisible();
    const booking_87030158400 = page.getByTestId('booking_63035000165');
    await expect(booking_87030158400).toBeVisible();
    const child = booking_87030158400.locator('.bookingEventBase');
    await expect(child).toHaveCSS('--ir-event-bg', '#31bef1');
    console.log(new Date());
    console.log(new Date().toUTCString());
  });
});
