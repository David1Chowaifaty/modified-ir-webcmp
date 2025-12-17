import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-company-dialog', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-company-dialog></ir-booking-company-dialog>');

    const element = await page.find('ir-booking-company-dialog');
    expect(element).toHaveClass('hydrated');
  });
});
