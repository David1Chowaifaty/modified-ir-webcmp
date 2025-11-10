import { newE2EPage } from '@stencil/core/testing';

describe('ir-image-gallery', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-image-gallery></ir-image-gallery>');

    const element = await page.find('ir-image-gallery');
    expect(element).toHaveClass('hydrated');
  });
});
