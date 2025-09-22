import { newE2EPage } from '@stencil/core/testing';

describe('ir-revenue-row-details', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-revenue-row-details></ir-revenue-row-details>');

    const element = await page.find('ir-revenue-row-details');
    expect(element).toHaveClass('hydrated');
  });
});
