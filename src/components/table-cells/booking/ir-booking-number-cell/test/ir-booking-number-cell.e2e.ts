import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-number-cell', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-number-cell></ir-booking-number-cell>');

    const element = await page.find('ir-booking-number-cell');
    expect(element).toHaveClass('hydrated');
  });
});
