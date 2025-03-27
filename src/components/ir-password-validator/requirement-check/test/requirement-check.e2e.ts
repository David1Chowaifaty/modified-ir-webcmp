import { newE2EPage } from '@stencil/core/testing';

describe('requirement-check', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<requirement-check></requirement-check>');

    const element = await page.find('requirement-check');
    expect(element).toHaveClass('hydrated');
  });
});
