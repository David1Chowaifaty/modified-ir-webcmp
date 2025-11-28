import { newE2EPage } from '@stencil/core/testing';

describe('ir-balance-cell', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-balance-cell></ir-balance-cell>');

    const element = await page.find('ir-balance-cell');
    expect(element).toHaveClass('hydrated');
  });
});
