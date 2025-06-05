import { newE2EPage } from '@stencil/core/testing';

describe('ir-weekday-selector', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-weekday-selector></ir-weekday-selector>');

    const element = await page.find('ir-weekday-selector');
    expect(element).toHaveClass('hydrated');
  });
});
