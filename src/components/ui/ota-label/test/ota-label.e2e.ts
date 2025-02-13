import { newE2EPage } from '@stencil/core/testing';

describe('ota-label', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ota-label></ota-label>');

    const element = await page.find('ota-label');
    expect(element).toHaveClass('hydrated');
  });
});
