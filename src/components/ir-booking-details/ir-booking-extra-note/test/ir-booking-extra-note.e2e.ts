import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-extra-note', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-extra-note></ir-booking-extra-note>');

    const element = await page.find('ir-booking-extra-note');
    expect(element).toHaveClass('hydrated');
  });
});
