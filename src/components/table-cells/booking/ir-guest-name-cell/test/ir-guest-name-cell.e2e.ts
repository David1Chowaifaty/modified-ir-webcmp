import { newE2EPage } from '@stencil/core/testing';

describe('ir-guest-name-cell', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-guest-name-cell></ir-guest-name-cell>');

    const element = await page.find('ir-guest-name-cell');
    expect(element).toHaveClass('hydrated');
  });
});
