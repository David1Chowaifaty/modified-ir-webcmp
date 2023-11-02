import { newE2EPage } from '@stencil/core/testing';

describe('igl-pagetwo', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<igl-pagetwo></igl-pagetwo>');

    const element = await page.find('igl-pagetwo');
    expect(element).toHaveClass('hydrated');
  });
});
