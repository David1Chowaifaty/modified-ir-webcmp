import { newE2EPage } from '@stencil/core/testing';

describe('ir-billing', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-billing></ir-billing>');

    const element = await page.find('ir-billing');
    expect(element).toHaveClass('hydrated');
  });
});
