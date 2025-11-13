import { newE2EPage } from '@stencil/core/testing';

describe('ir-color-picker', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-color-picker></ir-color-picker>');

    const element = await page.find('ir-color-picker');
    expect(element).toHaveClass('hydrated');
  });
});
