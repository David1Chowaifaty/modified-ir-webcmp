import { newE2EPage } from '@stencil/core/testing';

describe('ir-actions-cell', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-actions-cell></ir-actions-cell>');

    const element = await page.find('ir-actions-cell');
    expect(element).toHaveClass('hydrated');
  });
});
