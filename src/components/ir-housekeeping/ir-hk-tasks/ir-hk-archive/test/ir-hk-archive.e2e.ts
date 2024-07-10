import { newE2EPage } from '@stencil/core/testing';

describe('ir-hk-archive', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-hk-archive></ir-hk-archive>');

    const element = await page.find('ir-hk-archive');
    expect(element).toHaveClass('hydrated');
  });
});
