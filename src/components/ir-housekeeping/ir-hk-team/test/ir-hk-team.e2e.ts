import { newE2EPage } from '@stencil/core/testing';

describe('ir-hk-team', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-hk-team></ir-hk-team>');

    const element = await page.find('ir-hk-team');
    expect(element).toHaveClass('hydrated');
  });
});
