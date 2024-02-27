import { newE2EPage } from '@stencil/core/testing';

describe('ir-listing-body', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-listing-body></ir-listing-body>');

    const element = await page.find('ir-listing-body');
    expect(element).toHaveClass('hydrated');
  });
});
