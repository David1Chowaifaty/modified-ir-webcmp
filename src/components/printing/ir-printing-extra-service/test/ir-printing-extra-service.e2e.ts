import { newE2EPage } from '@stencil/core/testing';

describe('ir-printing-extra-service', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-printing-extra-service></ir-printing-extra-service>');

    const element = await page.find('ir-printing-extra-service');
    expect(element).toHaveClass('hydrated');
  });
});
