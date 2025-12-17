import { newE2EPage } from '@stencil/core/testing';

describe('ir-pickup-form', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-pickup-form></ir-pickup-form>');

    const element = await page.find('ir-pickup-form');
    expect(element).toHaveClass('hydrated');
  });
});
