import { newE2EPage } from '@stencil/core/testing';

describe('ir-extra-service-config-form', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-extra-service-config-form></ir-extra-service-config-form>');

    const element = await page.find('ir-extra-service-config-form');
    expect(element).toHaveClass('hydrated');
  });
});
