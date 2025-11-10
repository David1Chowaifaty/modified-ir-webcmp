import { newE2EPage } from '@stencil/core/testing';

describe('ir-image-preview', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-image-preview></ir-image-preview>');

    const element = await page.find('ir-image-preview');
    expect(element).toHaveClass('hydrated');
  });
});
