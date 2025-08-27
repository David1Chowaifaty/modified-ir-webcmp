import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-guarantee', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-guarantee></ir-booking-guarantee>');

    const element = await page.find('ir-booking-guarantee');
    expect(element).toHaveClass('hydrated');
  });
});
