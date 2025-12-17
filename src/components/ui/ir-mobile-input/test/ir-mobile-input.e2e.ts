import { newE2EPage } from '@stencil/core/testing';

describe('ir-mobile-input', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-mobile-input></ir-mobile-input>');

    const element = await page.find('ir-mobile-input');
    expect(element).toHaveClass('hydrated');
  });
});
