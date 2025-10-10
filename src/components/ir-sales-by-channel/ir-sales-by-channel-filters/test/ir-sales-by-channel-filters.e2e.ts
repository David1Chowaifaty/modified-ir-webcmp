import { newE2EPage } from '@stencil/core/testing';

describe('ir-sales-by-channel-filters', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-sales-by-channel-filters></ir-sales-by-channel-filters>');

    const element = await page.find('ir-sales-by-channel-filters');
    expect(element).toHaveClass('hydrated');
  });
});
