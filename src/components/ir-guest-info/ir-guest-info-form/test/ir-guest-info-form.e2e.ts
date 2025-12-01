import { newE2EPage } from '@stencil/core/testing';

describe('ir-guest-info-form', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-guest-info-form></ir-guest-info-form>');

    const element = await page.find('ir-guest-info-form');
    expect(element).toHaveClass('hydrated');
  });
});
