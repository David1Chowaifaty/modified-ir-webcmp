import { newE2EPage } from '@stencil/core/testing';

describe('ir-hk-tasks', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-hk-tasks></ir-hk-tasks>');

    const element = await page.find('ir-hk-tasks');
    expect(element).toHaveClass('hydrated');
  });
});
