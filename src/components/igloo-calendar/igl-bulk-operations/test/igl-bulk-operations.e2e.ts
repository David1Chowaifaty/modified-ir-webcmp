import { newE2EPage } from '@stencil/core/testing';

describe('igl-bulk-operations', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<igl-bulk-operations></igl-bulk-operations>');

    const element = await page.find('igl-bulk-operations');
    expect(element).toHaveClass('hydrated');
  });
});
