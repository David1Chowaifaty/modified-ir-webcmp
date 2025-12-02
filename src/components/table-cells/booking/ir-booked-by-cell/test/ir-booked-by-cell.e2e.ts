import { newE2EPage } from '@stencil/core/testing';

describe('ir-booked-by-cell', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booked-by-cell></ir-booked-by-cell>');

    const element = await page.find('ir-booked-by-cell');
    expect(element).toHaveClass('hydrated');
  });
});
