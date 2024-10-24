import { newE2EPage } from '@stencil/core/testing';

describe('ir-amenity', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-amenity></ir-amenity>');

    const element = await page.find('ir-amenity');
    expect(element).toHaveClass('hydrated');
  });
});
