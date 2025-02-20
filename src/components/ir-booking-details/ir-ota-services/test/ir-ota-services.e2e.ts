import { newE2EPage } from '@stencil/core/testing';

describe('ir-ota-services', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-ota-services></ir-ota-services>');

    const element = await page.find('ir-ota-services');
    expect(element).toHaveClass('hydrated');
  });
});
