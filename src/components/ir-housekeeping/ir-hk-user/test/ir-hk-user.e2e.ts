import { newE2EPage } from '@stencil/core/testing';

describe('ir-hk-user', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-hk-user></ir-hk-user>');

    const element = await page.find('ir-hk-user');
    expect(element).toHaveClass('hydrated');
  });
});
