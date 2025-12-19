import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-editor', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-editor></ir-booking-editor>');

    const element = await page.find('ir-booking-editor');
    expect(element).toHaveClass('hydrated');
  });
});
