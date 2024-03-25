import { newE2EPage } from '@stencil/core/testing';

describe('ir-title', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-title></ir-title>');

    const element = await page.find('ir-title');
    expect(element).toHaveClass('hydrated');
  });
});
