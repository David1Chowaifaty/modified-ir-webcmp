import { newE2EPage } from '@stencil/core/testing';

describe('ir-payment-folio-form', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-payment-folio-form></ir-payment-folio-form>');

    const element = await page.find('ir-payment-folio-form');
    expect(element).toHaveClass('hydrated');
  });
});
