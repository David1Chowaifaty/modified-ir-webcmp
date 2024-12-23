import { newE2EPage } from '@stencil/core/testing';

describe('ir-revisions', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-revisions></ir-revisions>');

    const element = await page.find('ir-revisions');
    expect(element).toHaveClass('hydrated');
  });
});
