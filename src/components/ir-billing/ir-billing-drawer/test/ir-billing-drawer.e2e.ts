import { newE2EPage } from '@stencil/core/testing';

describe('ir-billing-drawer', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-billing-drawer></ir-billing-drawer>');

    const element = await page.find('ir-billing-drawer');
    expect(element).toHaveClass('hydrated');
  });
});
