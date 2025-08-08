import { newE2EPage } from '@stencil/core/testing';

describe('ir-m-combobox', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-m-combobox></ir-m-combobox>');

    const element = await page.find('ir-m-combobox');
    expect(element).toHaveClass('hydrated');
  });
});
