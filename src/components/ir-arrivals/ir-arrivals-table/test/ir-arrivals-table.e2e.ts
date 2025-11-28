import { newE2EPage } from '@stencil/core/testing';

describe('ir-arrivals-table', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-arrivals-table></ir-arrivals-table>');

    const element = await page.find('ir-arrivals-table');
    expect(element).toHaveClass('hydrated');
  });
});
