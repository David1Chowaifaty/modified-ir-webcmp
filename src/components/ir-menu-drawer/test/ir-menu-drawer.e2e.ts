import { newE2EPage } from '@stencil/core/testing';

describe('ir-menu-drawer', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-menu-drawer></ir-menu-drawer>');

    const element = await page.find('ir-menu-drawer');
    expect(element).toHaveClass('hydrated');
  });
});
