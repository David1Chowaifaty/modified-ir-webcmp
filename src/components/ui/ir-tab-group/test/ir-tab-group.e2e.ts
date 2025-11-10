import { newE2EPage } from '@stencil/core/testing';

describe('ir-tab-group', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-tab-group></ir-tab-group>');

    const element = await page.find('ir-tab-group');
    expect(element).toHaveClass('hydrated');
  });
});
