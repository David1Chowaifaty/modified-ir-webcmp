import { newE2EPage } from '@stencil/core/testing';

describe('ir-test-cmp', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-test-cmp></ir-test-cmp>');

    const element = await page.find('ir-test-cmp');
    expect(element).toHaveClass('hydrated');
  });
});
