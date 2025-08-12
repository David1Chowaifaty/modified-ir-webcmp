import { newE2EPage } from '@stencil/core/testing';

describe('igl-bulk-block', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<igl-bulk-block></igl-bulk-block>');

    const element = await page.find('igl-bulk-block');
    expect(element).toHaveClass('hydrated');
  });
});
