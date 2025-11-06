import { newE2EPage } from '@stencil/core/testing';

describe('ir-image-upload', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-image-upload></ir-image-upload>');

    const element = await page.find('ir-image-upload');
    expect(element).toHaveClass('hydrated');
  });
});
