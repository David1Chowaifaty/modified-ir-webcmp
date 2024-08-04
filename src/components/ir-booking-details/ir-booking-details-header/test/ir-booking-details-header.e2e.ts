import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-details-header', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-details-header></ir-booking-details-header>');

    const element = await page.find('ir-booking-details-header');
    expect(element).toHaveClass('hydrated');
  });
});
