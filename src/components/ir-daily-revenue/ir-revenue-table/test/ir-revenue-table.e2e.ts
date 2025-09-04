import { newE2EPage } from '@stencil/core/testing';

describe('ir-revenue-table', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-revenue-table></ir-revenue-table>');

    const element = await page.find('ir-revenue-table');
    expect(element).toHaveClass('hydrated');
  });
});
