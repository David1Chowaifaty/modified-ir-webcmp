import { newE2EPage } from '@stencil/core/testing';

describe('ir-m-combobox-booking-item', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-m-combobox-booking-item></ir-m-combobox-booking-item>');

    const element = await page.find('ir-m-combobox-booking-item');
    expect(element).toHaveClass('hydrated');
  });
});
