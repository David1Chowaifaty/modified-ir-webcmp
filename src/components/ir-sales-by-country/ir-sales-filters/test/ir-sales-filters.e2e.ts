import { newE2EPage } from '@stencil/core/testing';

describe('ir-sales-filters', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-sales-filters></ir-sales-filters>');

    const element = await page.find('ir-sales-filters');
    expect(element).toHaveClass('hydrated');
  });
});
