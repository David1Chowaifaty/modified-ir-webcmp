import { newE2EPage } from '@stencil/core/testing';

describe('ir-printing-pickup', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-printing-pickup></ir-printing-pickup>');

    const element = await page.find('ir-printing-pickup');
    expect(element).toHaveClass('hydrated');
  });
});
