import { newE2EPage } from '@stencil/core/testing';

describe('ir-popover', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-popover></ir-popover>');

    const element = await page.find('ir-popover');
    expect(element).toHaveClass('hydrated');
  });
});
