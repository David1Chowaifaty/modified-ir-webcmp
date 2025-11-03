import { newE2EPage } from '@stencil/core/testing';

describe('ir-menu-bar', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-menu-bar></ir-menu-bar>');

    const element = await page.find('ir-menu-bar');
    expect(element).toHaveClass('hydrated');
  });
});
