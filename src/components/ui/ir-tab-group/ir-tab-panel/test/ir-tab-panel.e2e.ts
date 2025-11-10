import { newE2EPage } from '@stencil/core/testing';

describe('ir-tab-panel', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-tab-panel></ir-tab-panel>');

    const element = await page.find('ir-tab-panel');
    expect(element).toHaveClass('hydrated');
  });
});
