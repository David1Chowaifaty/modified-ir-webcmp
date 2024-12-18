import { newE2EPage } from '@stencil/core/testing';

describe('ir-phone-combobox', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-phone-combobox></ir-phone-combobox>');

    const element = await page.find('ir-phone-combobox');
    expect(element).toHaveClass('hydrated');
  });
});
