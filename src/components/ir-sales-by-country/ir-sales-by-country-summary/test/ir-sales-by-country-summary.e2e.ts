import { newE2EPage } from '@stencil/core/testing';

describe('ir-sales-by-country-summary', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-sales-by-country-summary></ir-sales-by-country-summary>');

    const element = await page.find('ir-sales-by-country-summary');
    expect(element).toHaveClass('hydrated');
  });
});
