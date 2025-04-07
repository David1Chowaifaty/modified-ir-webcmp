import { newE2EPage } from '@stencil/core/testing';

describe('ir-reset-password', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-reset-password></ir-reset-password>');

    const element = await page.find('ir-reset-password');
    expect(element).toHaveClass('hydrated');
  });
});
