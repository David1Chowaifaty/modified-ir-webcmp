import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-listing-table', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-listing-table></ir-booking-listing-table>');

    const element = await page.find('ir-booking-listing-table');
    expect(element).toHaveClass('hydrated');
  });
});
