import { newE2EPage } from '@stencil/core/testing';

describe('ir-custom-date-picker', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-custom-date-picker></ir-custom-date-picker>');

    const element = await page.find('ir-custom-date-picker');
    expect(element).toHaveClass('hydrated');
  });
});
