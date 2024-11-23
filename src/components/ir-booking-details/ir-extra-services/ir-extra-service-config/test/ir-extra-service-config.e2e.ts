import { newE2EPage } from '@stencil/core/testing';

describe('ir-extra-service-config', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-extra-service-config></ir-extra-service-config>');

    const element = await page.find('ir-extra-service-config');
    expect(element).toHaveClass('hydrated');
  });
});
