import { newE2EPage } from '@stencil/core/testing';

describe('ir-preview-screen-dialog', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-preview-screen-dialog></ir-preview-screen-dialog>');

    const element = await page.find('ir-preview-screen-dialog');
    expect(element).toHaveClass('hydrated');
  });
});
