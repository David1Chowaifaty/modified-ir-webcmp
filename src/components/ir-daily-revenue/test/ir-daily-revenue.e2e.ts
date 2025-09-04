import { newE2EPage } from '@stencil/core/testing';

describe('ir-daily-revenue', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-daily-revenue></ir-daily-revenue>');

    const element = await page.find('ir-daily-revenue');
    expect(element).toHaveClass('hydrated');
  });
});
