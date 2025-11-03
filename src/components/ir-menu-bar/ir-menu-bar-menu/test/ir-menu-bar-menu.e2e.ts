import { newE2EPage } from '@stencil/core/testing';

describe('ir-menu-bar-menu', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-menu-bar-menu></ir-menu-bar-menu>');

    const element = await page.find('ir-menu-bar-menu');
    expect(element).toHaveClass('hydrated');
  });
});
