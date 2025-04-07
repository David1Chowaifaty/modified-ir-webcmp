import { newE2EPage } from '@stencil/core/testing';

describe('ir-guests-management-user', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-guests-management-user></ir-guests-management-user>');

    const element = await page.find('ir-guests-management-user');
    expect(element).toHaveClass('hydrated');
  });
});
