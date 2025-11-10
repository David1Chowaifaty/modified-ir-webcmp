import { newE2EPage } from '@stencil/core/testing';

describe('ir-tab', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-tab></ir-tab>');

    const element = await page.find('ir-tab');
    expect(element).toHaveClass('hydrated');
  });
});
