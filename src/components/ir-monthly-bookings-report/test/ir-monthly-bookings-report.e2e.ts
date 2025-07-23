import { newE2EPage } from '@stencil/core/testing';

describe('ir-monthly-bookings-report', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-monthly-bookings-report></ir-monthly-bookings-report>');

    const element = await page.find('ir-monthly-bookings-report');
    expect(element).toHaveClass('hydrated');
  });
});
