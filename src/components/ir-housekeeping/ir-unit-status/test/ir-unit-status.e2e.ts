import { newE2EPage } from '@stencil/core/testing';

describe('ir-unit-status', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-unit-status></ir-unit-status>');

    const element = await page.find('ir-unit-status');
    expect(element).toHaveClass('hydrated');
  });
});
