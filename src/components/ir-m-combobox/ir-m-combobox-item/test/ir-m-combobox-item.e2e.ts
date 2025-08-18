import { newE2EPage } from '@stencil/core/testing';

describe('ir-m-combobox-item', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-m-combobox-item></ir-m-combobox-item>');

    const element = await page.find('ir-m-combobox-item');
    expect(element).toHaveClass('hydrated');
  });
});
