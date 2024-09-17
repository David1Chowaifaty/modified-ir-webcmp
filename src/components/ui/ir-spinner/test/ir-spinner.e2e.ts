import { newE2EPage } from '@stencil/core/testing';

describe('ir-spinner', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-spinner></ir-spinner>');

    const element = await page.find('ir-spinner');
    expect(element).toHaveClass('hydrated');
  });
});
