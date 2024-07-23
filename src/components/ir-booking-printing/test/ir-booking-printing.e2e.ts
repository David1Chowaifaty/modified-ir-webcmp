import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-printing', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-printing></ir-booking-printing>');

    const element = await page.find('ir-booking-printing');
    expect(element).toHaveClass('hydrated');
  });
});
