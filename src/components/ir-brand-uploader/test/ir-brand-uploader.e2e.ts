import { newE2EPage } from '@stencil/core/testing';

describe('ir-brand-uploader', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-brand-uploader></ir-brand-uploader>');

    const element = await page.find('ir-brand-uploader');
    expect(element).toHaveClass('hydrated');
  });
});
