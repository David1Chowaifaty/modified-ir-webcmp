import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-editor-drawer', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-editor-drawer></ir-booking-editor-drawer>');

    const element = await page.find('ir-booking-editor-drawer');
    expect(element).toHaveClass('hydrated');
  });
});
