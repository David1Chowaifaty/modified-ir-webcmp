import { newE2EPage } from '@stencil/core/testing';

describe('ir-notifications', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-notifications></ir-notifications>');

    const element = await page.find('ir-notifications');
    expect(element).toHaveClass('hydrated');
  });
});
