import { newE2EPage } from '@stencil/core/testing';

describe('ir-dates-cell', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-dates-cell></ir-dates-cell>');

    const element = await page.find('ir-dates-cell');
    expect(element).toHaveClass('hydrated');
  });
});
