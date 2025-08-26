import { newE2EPage } from '@stencil/core/testing';

describe('ir-payment-summary', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-payment-summary></ir-payment-summary>');

    const element = await page.find('ir-payment-summary');
    expect(element).toHaveClass('hydrated');
  });
});
