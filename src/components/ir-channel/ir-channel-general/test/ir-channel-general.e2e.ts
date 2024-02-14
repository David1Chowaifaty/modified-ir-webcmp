import { newE2EPage } from '@stencil/core/testing';

describe('ir-channel-general', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-channel-general></ir-channel-general>');

    const element = await page.find('ir-channel-general');
    expect(element).toHaveClass('hydrated');
  });
});
