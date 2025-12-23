import { newE2EPage } from '@stencil/core/testing';

describe('igl-blocked-date-dialog', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<igl-blocked-date-dialog></igl-blocked-date-dialog>');

    const element = await page.find('igl-blocked-date-dialog');
    expect(element).toHaveClass('hydrated');
  });
});
