import { newE2EPage } from '@stencil/core/testing';

describe('ir-ota-service', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-ota-service></ir-ota-service>');

    const element = await page.find('ir-ota-service');
    expect(element).toHaveClass('hydrated');
  });
});
