import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-billing-recipient', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-billing-recipient></ir-booking-billing-recipient>');

    const element = await page.find('ir-booking-billing-recipient');
    expect(element).toHaveClass('hydrated');
  });
});
