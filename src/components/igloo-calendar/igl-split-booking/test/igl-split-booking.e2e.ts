import { newE2EPage } from '@stencil/core/testing';

describe('igl-split-booking', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<igl-split-booking></igl-split-booking>');

    const element = await page.find('igl-split-booking');
    expect(element).toHaveClass('hydrated');
  });
});
