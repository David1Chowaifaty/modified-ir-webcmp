import { newE2EPage } from '@stencil/core/testing';

describe('ir-delete-modal', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-delete-modal></ir-delete-modal>');

    const element = await page.find('ir-delete-modal');
    expect(element).toHaveClass('hydrated');
  });
});
