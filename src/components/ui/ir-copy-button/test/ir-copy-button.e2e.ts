import { newE2EPage } from '@stencil/core/testing';

describe('ir-copy-button', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-copy-button></ir-copy-button>');

    const element = await page.find('ir-copy-button');
    expect(element).toHaveClass('hydrated');
  });
});
