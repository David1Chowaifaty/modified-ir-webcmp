import { newE2EPage } from '@stencil/core/testing';

describe('ir-arrivals', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-arrivals></ir-arrivals>');

    const element = await page.find('ir-arrivals');
    expect(element).toHaveClass('hydrated');
  });
});
