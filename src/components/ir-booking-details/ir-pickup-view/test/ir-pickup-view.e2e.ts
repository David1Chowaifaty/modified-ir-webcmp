import { newE2EPage } from '@stencil/core/testing';

describe('ir-pickup-view', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-pickup-view></ir-pickup-view>');

    const element = await page.find('ir-pickup-view');
    expect(element).toHaveClass('hydrated');
  });
});
