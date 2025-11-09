import { newE2EPage } from '@stencil/core/testing';

describe('ir-affiliate-form', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-affiliate-form></ir-affiliate-form>');

    const element = await page.find('ir-affiliate-form');
    expect(element).toHaveClass('hydrated');
  });
});
