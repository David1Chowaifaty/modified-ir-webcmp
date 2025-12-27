import { newE2EPage } from '@stencil/core/testing';

describe('ir-menu-group', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-menu-group></ir-menu-group>');

    const element = await page.find('ir-menu-group');
    expect(element).toHaveClass('hydrated');
  });
});
