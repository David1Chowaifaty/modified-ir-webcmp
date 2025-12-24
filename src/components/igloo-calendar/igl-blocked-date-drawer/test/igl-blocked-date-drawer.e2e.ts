import { newE2EPage } from '@stencil/core/testing';

describe('igl-blocked-date-drawer', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<igl-blocked-date-drawer></igl-blocked-date-drawer>');

    const element = await page.find('igl-blocked-date-drawer');
    expect(element).toHaveClass('hydrated');
  });
});
