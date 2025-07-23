import { newE2EPage } from '@stencil/core/testing';

describe('ir-monthly-bookings-report-table', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-monthly-bookings-report-table></ir-monthly-bookings-report-table>');

    const element = await page.find('ir-monthly-bookings-report-table');
    expect(element).toHaveClass('hydrated');
  });
});
