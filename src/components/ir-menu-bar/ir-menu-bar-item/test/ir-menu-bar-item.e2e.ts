import { newE2EPage } from '@stencil/core/testing';

describe('ir-menu-bar-item', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-menu-bar-item></ir-menu-bar-item>');

    const element = await page.find('ir-menu-bar-item');
    expect(element).toHaveClass('hydrated');
  });
});
