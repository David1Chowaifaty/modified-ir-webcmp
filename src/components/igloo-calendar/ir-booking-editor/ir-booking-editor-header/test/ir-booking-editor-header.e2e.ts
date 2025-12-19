import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-editor-header', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-editor-header></ir-booking-editor-header>');

    const element = await page.find('ir-booking-editor-header');
    expect(element).toHaveClass('hydrated');
  });
});
