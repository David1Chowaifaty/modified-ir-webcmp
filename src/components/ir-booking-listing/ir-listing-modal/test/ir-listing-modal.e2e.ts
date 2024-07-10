import { newE2EPage } from '@stencil/core/testing';

describe('ir-listing-modal', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-listing-modal></ir-listing-modal>');

    const element = await page.find('ir-listing-modal');
    expect(element).toHaveClass('hydrated');
  });
});
