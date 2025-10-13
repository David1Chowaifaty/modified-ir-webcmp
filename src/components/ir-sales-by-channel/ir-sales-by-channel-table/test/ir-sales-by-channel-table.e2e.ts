import { newE2EPage } from '@stencil/core/testing';

describe('ir-sales-by-channel-table', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-sales-by-channel-table></ir-sales-by-channel-table>');

    const element = await page.find('ir-sales-by-channel-table');
    expect(element).toHaveClass('hydrated');
  });
});
