import { newE2EPage } from '@stencil/core/testing';

describe('ir-otp-modal', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-otp-modal></ir-otp-modal>');

    const element = await page.find('ir-otp-modal');
    expect(element).toHaveClass('hydrated');
  });
});
