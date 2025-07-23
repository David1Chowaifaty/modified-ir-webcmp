import { newE2EPage } from '@stencil/core/testing';

describe('ir-monthly-bookings-report-filter', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-monthly-bookings-report-filter></ir-monthly-bookings-report-filter>');

    const element = await page.find('ir-monthly-bookings-report-filter');
    expect(element).toHaveClass('hydrated');
  });
});
