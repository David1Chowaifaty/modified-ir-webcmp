import { newE2EPage } from '@stencil/core/testing';

describe('ir-listing-header', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-listing-header></ir-listing-header>');

    const element = await page.find('ir-listing-header');
    expect(element).toHaveClass('hydrated');
  });
});
