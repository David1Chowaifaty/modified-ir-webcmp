import { newE2EPage } from '@stencil/core/testing';

describe('ir-sales-by-country', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-sales-by-country></ir-sales-by-country>');

    const element = await page.find('ir-sales-by-country');
    expect(element).toHaveClass('hydrated');
  });
});
