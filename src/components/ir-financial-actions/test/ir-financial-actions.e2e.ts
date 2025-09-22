import { newE2EPage } from '@stencil/core/testing';

describe('ir-financial-actions', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-financial-actions></ir-financial-actions>');

    const element = await page.find('ir-financial-actions');
    expect(element).toHaveClass('hydrated');
  });
});
