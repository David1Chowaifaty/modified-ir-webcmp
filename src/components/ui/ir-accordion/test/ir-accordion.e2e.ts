import { newE2EPage } from '@stencil/core/testing';

describe('ir-accordion', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-accordion></ir-accordion>');

    const element = await page.find('ir-accordion');
    expect(element).toHaveClass('hydrated');
  });
});
