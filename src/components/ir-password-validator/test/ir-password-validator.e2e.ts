import { newE2EPage } from '@stencil/core/testing';

describe('ir-password-validator', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-password-validator></ir-password-validator>');

    const element = await page.find('ir-password-validator');
    expect(element).toHaveClass('hydrated');
  });
});
