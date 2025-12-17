import { newE2EPage } from '@stencil/core/testing';

describe('ir-empty-state', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-empty-state></ir-empty-state>');

    const element = await page.find('ir-empty-state');
    expect(element).toHaveClass('hydrated');
  });
});
