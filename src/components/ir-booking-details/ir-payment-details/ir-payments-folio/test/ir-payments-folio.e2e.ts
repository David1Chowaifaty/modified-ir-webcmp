import { newE2EPage } from '@stencil/core/testing';

describe('ir-payments-folio', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-payments-folio></ir-payments-folio>');

    const element = await page.find('ir-payments-folio');
    expect(element).toHaveClass('hydrated');
  });
});
