import { newE2EPage } from '@stencil/core/testing';

describe('ir-revenue-summary', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-revenue-summary></ir-revenue-summary>');

    const element = await page.find('ir-revenue-summary');
    expect(element).toHaveClass('hydrated');
  });
});
