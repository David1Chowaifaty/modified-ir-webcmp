import { newE2EPage } from '@stencil/core/testing';

describe('ir-menu-item', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-menu-item></ir-menu-item>');

    const element = await page.find('ir-menu-item');
    expect(element).toHaveClass('hydrated');
  });
});
