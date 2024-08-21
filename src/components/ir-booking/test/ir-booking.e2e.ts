import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking></ir-booking>');

    const element = await page.find('ir-booking');
    expect(element).toHaveClass('hydrated');
  });
});
