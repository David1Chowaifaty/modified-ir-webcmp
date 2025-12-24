import { newE2EPage } from '@stencil/core/testing';

describe('ir-custom-date-range', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-custom-date-range></ir-custom-date-range>');

    const element = await page.find('ir-custom-date-range');
    expect(element).toHaveClass('hydrated');
  });
});
