import { newE2EPage } from '@stencil/core/testing';

describe('ir-channel-header', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-channel-header></ir-channel-header>');

    const element = await page.find('ir-channel-header');
    expect(element).toHaveClass('hydrated');
  });
});
