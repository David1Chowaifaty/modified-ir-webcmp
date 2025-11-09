import { newE2EPage } from '@stencil/core/testing';

describe('ir-white-labeling', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-white-labeling></ir-white-labeling>');

    const element = await page.find('ir-white-labeling');
    expect(element).toHaveClass('hydrated');
  });
});
