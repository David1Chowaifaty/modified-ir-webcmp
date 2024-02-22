import { newE2EPage } from '@stencil/core/testing';

describe('ir-channel', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-channel></ir-channel>');

    const element = await page.find('ir-channel');
    expect(element).toHaveClass('hydrated');
  });
});
