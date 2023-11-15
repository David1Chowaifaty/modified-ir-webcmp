import { newE2EPage } from '@stencil/core/testing';

describe('ir-loading-screen', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-loading-screen></ir-loading-screen>');

    const element = await page.find('ir-loading-screen');
    expect(element).toHaveClass('hydrated');
  });
});
