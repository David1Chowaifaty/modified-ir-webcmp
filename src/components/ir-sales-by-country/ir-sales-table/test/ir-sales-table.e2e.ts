import { newE2EPage } from '@stencil/core/testing';

describe('ir-sales-table', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-sales-table></ir-sales-table>');

    const element = await page.find('ir-sales-table');
    expect(element).toHaveClass('hydrated');
  });
});
