import { newE2EPage } from '@stencil/core/testing';

describe('ir-arrivals-filters', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-arrivals-filters></ir-arrivals-filters>');

    const element = await page.find('ir-arrivals-filters');
    expect(element).toHaveClass('hydrated');
  });
});
