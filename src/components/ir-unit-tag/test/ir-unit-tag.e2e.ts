import { newE2EPage } from '@stencil/core/testing';

describe('ir-unit-tag', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-unit-tag></ir-unit-tag>');

    const element = await page.find('ir-unit-tag');
    expect(element).toHaveClass('hydrated');
  });
});
