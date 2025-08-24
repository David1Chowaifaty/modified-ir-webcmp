import { newE2EPage } from '@stencil/core/testing';

describe('ir-dropdown-item', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-dropdown-item></ir-dropdown-item>');

    const element = await page.find('ir-dropdown-item');
    expect(element).toHaveClass('hydrated');
  });
});
