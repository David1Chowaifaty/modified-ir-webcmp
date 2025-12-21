import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-editor-guest-form', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-editor-guest-form></ir-booking-editor-guest-form>');

    const element = await page.find('ir-booking-editor-guest-form');
    expect(element).toHaveClass('hydrated');
  });
});
