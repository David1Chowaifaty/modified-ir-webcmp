import { newE2EPage } from '@stencil/core/testing';

describe('ir-tabs', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-tabs></ir-tabs>');

    const element = await page.find('ir-tabs');
    expect(element).toHaveClass('hydrated');
  });
});
