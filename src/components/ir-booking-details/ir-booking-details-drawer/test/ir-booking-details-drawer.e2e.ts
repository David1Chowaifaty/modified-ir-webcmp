import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-details-drawer', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-details-drawer></ir-booking-details-drawer>');

    const element = await page.find('ir-booking-details-drawer');
    expect(element).toHaveClass('hydrated');
  });
});
