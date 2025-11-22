import { newE2EPage } from '@stencil/core/testing';

describe('ir-validator', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-validator></ir-validator>');

    const element = await page.find('ir-validator');
    expect(element).toHaveClass('hydrated');
  });
});
