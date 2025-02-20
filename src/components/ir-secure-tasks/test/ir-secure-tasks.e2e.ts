import { newE2EPage } from '@stencil/core/testing';

describe('ir-secure-tasks', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-secure-tasks></ir-secure-tasks>');

    const element = await page.find('ir-secure-tasks');
    expect(element).toHaveClass('hydrated');
  });
});
