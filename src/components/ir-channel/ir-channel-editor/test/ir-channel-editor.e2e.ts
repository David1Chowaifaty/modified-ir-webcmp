import { newE2EPage } from '@stencil/core/testing';

describe('ir-channel-editor', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-channel-editor></ir-channel-editor>');

    const element = await page.find('ir-channel-editor');
    expect(element).toHaveClass('hydrated');
  });
});
