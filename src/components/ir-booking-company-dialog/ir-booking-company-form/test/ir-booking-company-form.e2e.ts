import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-company-form', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-company-form></ir-booking-company-form>');

    const element = await page.find('ir-booking-company-form');
    expect(element).toHaveClass('hydrated');
  });
});
