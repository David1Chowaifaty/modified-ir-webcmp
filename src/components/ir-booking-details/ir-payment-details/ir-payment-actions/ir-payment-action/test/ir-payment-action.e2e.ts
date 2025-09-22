import { newE2EPage } from '@stencil/core/testing';

describe('ir-payment-action', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-payment-action></ir-payment-action>');

    const element = await page.find('ir-payment-action');
    expect(element).toHaveClass('hydrated');
  });
});
