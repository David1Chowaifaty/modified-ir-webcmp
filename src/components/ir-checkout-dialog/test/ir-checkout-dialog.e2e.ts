import { newE2EPage } from '@stencil/core/testing';

describe('ir-checkout-dialog', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-checkout-dialog></ir-checkout-dialog>');

    const element = await page.find('ir-checkout-dialog');
    expect(element).toHaveClass('hydrated');
  });
});
