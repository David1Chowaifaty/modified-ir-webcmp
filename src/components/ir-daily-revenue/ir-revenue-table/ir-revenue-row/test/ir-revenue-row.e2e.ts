import { newE2EPage } from '@stencil/core/testing';

describe('ir-revenue-row', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-revenue-row></ir-revenue-row>');

    const element = await page.find('ir-revenue-row');
    expect(element).toHaveClass('hydrated');
  });
});
