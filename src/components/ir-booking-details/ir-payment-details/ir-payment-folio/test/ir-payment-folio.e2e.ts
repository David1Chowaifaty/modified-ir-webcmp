import { newE2EPage } from '@stencil/core/testing';

describe('ir-payment-folio', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-payment-folio></ir-payment-folio>');

    const element = await page.find('ir-payment-folio');
    expect(element).toHaveClass('hydrated');
  });
});
