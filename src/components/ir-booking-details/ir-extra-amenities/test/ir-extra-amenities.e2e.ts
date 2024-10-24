import { newE2EPage } from '@stencil/core/testing';

describe('ir-extra-amenities', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-extra-amenities></ir-extra-amenities>');

    const element = await page.find('ir-extra-amenities');
    expect(element).toHaveClass('hydrated');
  });
});
