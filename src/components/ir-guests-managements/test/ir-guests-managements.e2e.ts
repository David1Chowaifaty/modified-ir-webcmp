import { newE2EPage } from '@stencil/core/testing';

describe('ir-guests-managements', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-guests-managements></ir-guests-managements>');

    const element = await page.find('ir-guests-managements');
    expect(element).toHaveClass('hydrated');
  });
});
