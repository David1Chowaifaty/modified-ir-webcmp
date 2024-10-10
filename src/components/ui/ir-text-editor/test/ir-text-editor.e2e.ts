import { newE2EPage } from '@stencil/core/testing';

describe('ir-text-editor', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-text-editor></ir-text-editor>');

    const element = await page.find('ir-text-editor');
    expect(element).toHaveClass('hydrated');
  });
});
