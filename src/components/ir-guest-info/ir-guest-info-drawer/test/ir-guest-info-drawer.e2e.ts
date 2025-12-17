import { newE2EPage } from '@stencil/core/testing';

describe('ir-guest-info-drawer', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-guest-info-drawer></ir-guest-info-drawer>');

    const element = await page.find('ir-guest-info-drawer');
    expect(element).toHaveClass('hydrated');
  });
});
