import { newE2EPage } from '@stencil/core/testing';

describe('ir-booked-by-source-cell', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booked-by-source-cell></ir-booked-by-source-cell>');

    const element = await page.find('ir-booked-by-source-cell');
    expect(element).toHaveClass('hydrated');
  });
});
