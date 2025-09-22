import { newE2EPage } from '@stencil/core/testing';

describe('ir-applicable-policies', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-applicable-policies></ir-applicable-policies>');

    const element = await page.find('ir-applicable-policies');
    expect(element).toHaveClass('hydrated');
  });
});
