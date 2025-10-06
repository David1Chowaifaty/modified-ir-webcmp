import { newE2EPage } from '@stencil/core/testing';

describe('ir-sales-by-channel', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-sales-by-channel></ir-sales-by-channel>');

    const element = await page.find('ir-sales-by-channel');
    expect(element).toHaveClass('hydrated');
  });
});
