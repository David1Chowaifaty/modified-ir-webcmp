import { newE2EPage } from '@stencil/core/testing';

describe('ir-date-picker', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-date-picker></ir-date-picker>');

    const element = await page.find('ir-date-picker');
    expect(element).toHaveClass('hydrated');
  });
});
