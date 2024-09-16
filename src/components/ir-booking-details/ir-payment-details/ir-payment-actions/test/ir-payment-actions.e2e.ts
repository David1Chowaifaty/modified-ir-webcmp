import { newE2EPage } from '@stencil/core/testing';

describe('ir-payment-actions', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-payment-actions></ir-payment-actions>');

    const element = await page.find('ir-payment-actions');
    expect(element).toHaveClass('hydrated');
  });
});
