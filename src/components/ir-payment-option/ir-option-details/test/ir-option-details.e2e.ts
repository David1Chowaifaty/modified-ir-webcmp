import { newE2EPage } from '@stencil/core/testing';

describe('ir-option-details', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-option-details></ir-option-details>');

    const element = await page.find('ir-option-details');
    expect(element).toHaveClass('hydrated');
  });
});
