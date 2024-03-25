import { newE2EPage } from '@stencil/core/testing';

describe('ir-hk-unassigned-units', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-hk-unassigned-units></ir-hk-unassigned-units>');

    const element = await page.find('ir-hk-unassigned-units');
    expect(element).toHaveClass('hydrated');
  });
});
