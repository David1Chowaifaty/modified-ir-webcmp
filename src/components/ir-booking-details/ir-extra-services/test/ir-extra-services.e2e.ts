import { newE2EPage } from '@stencil/core/testing';

describe('ir-extra-services', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-extra-services></ir-extra-services>');

    const element = await page.find('ir-extra-services');
    expect(element).toHaveClass('hydrated');
  });
});
