import { newE2EPage } from '@stencil/core/testing';

describe('ir-interactive-title', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-interactive-title></ir-interactive-title>');

    const element = await page.find('ir-interactive-title');
    expect(element).toHaveClass('hydrated');
  });
});
