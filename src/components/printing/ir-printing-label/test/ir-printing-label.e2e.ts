import { newE2EPage } from '@stencil/core/testing';

describe('ir-printing-label', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-printing-label></ir-printing-label>');

    const element = await page.find('ir-printing-label');
    expect(element).toHaveClass('hydrated');
  });
});
