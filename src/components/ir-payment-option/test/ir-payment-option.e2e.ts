import { newE2EPage } from '@stencil/core/testing';

describe('ir-payment-option', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-payment-option></ir-payment-option>');

    const element = await page.find('ir-payment-option');
    expect(element).toHaveClass('hydrated');
  });
});
