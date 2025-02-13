import { newE2EPage } from '@stencil/core/testing';

describe('ir-combobox', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-combobox></ir-combobox>');

    const element = await page.find('ir-combobox');
    expect(element).toHaveClass('hydrated');
  });
});
