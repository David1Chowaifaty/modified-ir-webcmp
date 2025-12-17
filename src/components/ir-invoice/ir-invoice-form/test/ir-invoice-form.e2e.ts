import { newE2EPage } from '@stencil/core/testing';

describe('ir-invoice-form', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-invoice-form></ir-invoice-form>');

    const element = await page.find('ir-invoice-form');
    expect(element).toHaveClass('hydrated');
  });
});
