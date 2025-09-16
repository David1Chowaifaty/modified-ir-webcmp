import { newE2EPage } from '@stencil/core/testing';

describe('ir-financial-table', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-financial-table></ir-financial-table>');

    const element = await page.find('ir-financial-table');
    expect(element).toHaveClass('hydrated');
  });
});
