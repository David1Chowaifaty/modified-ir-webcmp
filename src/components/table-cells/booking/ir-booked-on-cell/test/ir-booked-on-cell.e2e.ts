import { newE2EPage } from '@stencil/core/testing';

describe('ir-booked-on-cell', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booked-on-cell></ir-booked-on-cell>');

    const element = await page.find('ir-booked-on-cell');
    expect(element).toHaveClass('hydrated');
  });
});
