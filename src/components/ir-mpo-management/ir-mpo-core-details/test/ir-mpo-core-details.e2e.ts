import { newE2EPage } from '@stencil/core/testing';

describe('ir-mpo-core-details', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-mpo-core-details></ir-mpo-core-details>');

    const element = await page.find('ir-mpo-core-details');
    expect(element).toHaveClass('hydrated');
  });
});
