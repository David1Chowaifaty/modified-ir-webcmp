import { newE2EPage } from '@stencil/core/testing';

describe('ir-affiliate', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-affiliate></ir-affiliate>');

    const element = await page.find('ir-affiliate');
    expect(element).toHaveClass('hydrated');
  });
});
