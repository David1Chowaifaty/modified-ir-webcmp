import { newE2EPage } from '@stencil/core/testing';

describe('ir-marketplace', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-marketplace></ir-marketplace>');

    const element = await page.find('ir-marketplace');
    expect(element).toHaveClass('hydrated');
  });
});
