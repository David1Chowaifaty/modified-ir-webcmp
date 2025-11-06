import { newE2EPage } from '@stencil/core/testing';

describe('ir-mpo-management', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-mpo-management></ir-mpo-management>');

    const element = await page.find('ir-mpo-management');
    expect(element).toHaveClass('hydrated');
  });
});
