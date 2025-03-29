import { newE2EPage } from '@stencil/core/testing';

describe('ir-range-picker', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-range-picker></ir-range-picker>');

    const element = await page.find('ir-range-picker');
    expect(element).toHaveClass('hydrated');
  });
});
