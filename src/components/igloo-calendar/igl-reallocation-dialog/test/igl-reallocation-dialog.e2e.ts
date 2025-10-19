import { newE2EPage } from '@stencil/core/testing';

describe('igl-reallocation-dialog', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<igl-reallocation-dialog></igl-reallocation-dialog>');

    const element = await page.find('igl-reallocation-dialog');
    expect(element).toHaveClass('hydrated');
  });
});
