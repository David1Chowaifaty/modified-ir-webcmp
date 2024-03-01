import { newE2EPage } from '@stencil/core/testing';

describe('ir-housekeeping', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-housekeeping></ir-housekeeping>');

    const element = await page.find('ir-housekeeping');
    expect(element).toHaveClass('hydrated');
  });
});
