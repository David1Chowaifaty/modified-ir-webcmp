import { newE2EPage } from '@stencil/core/testing';

describe('igl-book-property-container', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<igl-book-property-container></igl-book-property-container>');

    const element = await page.find('igl-book-property-container');
    expect(element).toHaveClass('hydrated');
  });
});
