import { newE2EPage } from '@stencil/core/testing';

describe('ir-custom-button', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-custom-button></ir-custom-button>');

    const element = await page.find('ir-custom-button');
    expect(element).toHaveClass('hydrated');
  });
});
