import { newE2EPage } from '@stencil/core/testing';

describe('ir-sales-by-channel-summary', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-sales-by-channel-summary></ir-sales-by-channel-summary>');

    const element = await page.find('ir-sales-by-channel-summary');
    expect(element).toHaveClass('hydrated');
  });
});
