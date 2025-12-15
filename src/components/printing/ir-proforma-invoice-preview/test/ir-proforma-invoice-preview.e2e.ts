import { newE2EPage } from '@stencil/core/testing';

describe('ir-proforma-invoice-preview', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-proforma-invoice-preview></ir-proforma-invoice-preview>');

    const element = await page.find('ir-proforma-invoice-preview');
    expect(element).toHaveClass('hydrated');
  });
});
