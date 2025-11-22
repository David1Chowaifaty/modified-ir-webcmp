import { newE2EPage } from '@stencil/core/testing';

describe('ir-custom-input', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-custom-input></ir-custom-input>');

    const element = await page.find('ir-custom-input');
    expect(element).toHaveClass('hydrated');
  });
});
