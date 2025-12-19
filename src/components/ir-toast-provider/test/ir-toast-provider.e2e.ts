import { newE2EPage } from '@stencil/core/testing';

describe('ir-toast-provider', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-toast-provider></ir-toast-provider>');

    const element = await page.find('ir-toast-provider');
    expect(element).toHaveClass('hydrated');
  });
});
