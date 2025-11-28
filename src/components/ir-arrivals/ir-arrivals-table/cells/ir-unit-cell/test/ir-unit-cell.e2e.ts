import { newE2EPage } from '@stencil/core/testing';

describe('ir-unit-cell', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-unit-cell></ir-unit-cell>');

    const element = await page.find('ir-unit-cell');
    expect(element).toHaveClass('hydrated');
  });
});
