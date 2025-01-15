import { newE2EPage } from '@stencil/core/testing';

describe('ir-country-picker', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-country-picker></ir-country-picker>');

    const element = await page.find('ir-country-picker');
    expect(element).toHaveClass('hydrated');
  });
});
