import { newE2EPage } from '@stencil/core/testing';

describe('ir-new-badge', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-new-badge></ir-new-badge>');

    const element = await page.find('ir-new-badge');
    expect(element).toHaveClass('hydrated');
  });
});
