import { newE2EPage } from '@stencil/core/testing';

describe('ir-payment-item', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-payment-item></ir-payment-item>');

    const element = await page.find('ir-payment-item');
    expect(element).toHaveClass('hydrated');
  });
});
