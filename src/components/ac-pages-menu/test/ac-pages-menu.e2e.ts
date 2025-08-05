import { newE2EPage } from '@stencil/core/testing';

describe('ac-pages-menu', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ac-pages-menu></ac-pages-menu>');

    const element = await page.find('ac-pages-menu');
    expect(element).toHaveClass('hydrated');
  });
});
