import { newE2EPage } from '@stencil/core/testing';

describe('ir-menu', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-menu></ir-menu>');

    const element = await page.find('ir-menu');
    expect(element).toHaveClass('hydrated');
  });
});
