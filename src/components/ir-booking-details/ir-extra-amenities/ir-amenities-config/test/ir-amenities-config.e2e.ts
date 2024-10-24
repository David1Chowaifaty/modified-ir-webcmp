import { newE2EPage } from '@stencil/core/testing';

describe('ir-amenities-config', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-amenities-config></ir-amenities-config>');

    const element = await page.find('ir-amenities-config');
    expect(element).toHaveClass('hydrated');
  });
});
