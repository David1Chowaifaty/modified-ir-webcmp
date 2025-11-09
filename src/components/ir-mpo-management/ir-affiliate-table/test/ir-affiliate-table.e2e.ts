import { newE2EPage } from '@stencil/core/testing';

describe('ir-affiliate-table', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-affiliate-table></ir-affiliate-table>');

    const element = await page.find('ir-affiliate-table');
    expect(element).toHaveClass('hydrated');
  });
});
