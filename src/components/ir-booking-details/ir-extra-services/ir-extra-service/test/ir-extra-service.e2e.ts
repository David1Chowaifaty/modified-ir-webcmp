import { newE2EPage } from '@stencil/core/testing';

describe('ir-extra-service', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-extra-service></ir-extra-service>');

    const element = await page.find('ir-extra-service');
    expect(element).toHaveClass('hydrated');
  });
});
