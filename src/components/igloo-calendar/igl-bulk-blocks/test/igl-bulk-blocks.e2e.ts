import { newE2EPage } from '@stencil/core/testing';

describe('igl-bulk-blocks', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<igl-bulk-blocks></igl-bulk-blocks>');

    const element = await page.find('igl-bulk-blocks');
    expect(element).toHaveClass('hydrated');
  });
});
