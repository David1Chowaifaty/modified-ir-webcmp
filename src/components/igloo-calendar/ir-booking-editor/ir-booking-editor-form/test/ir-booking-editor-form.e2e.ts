import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-editor-form', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-editor-form></ir-booking-editor-form>');

    const element = await page.find('ir-booking-editor-form');
    expect(element).toHaveClass('hydrated');
  });
});
