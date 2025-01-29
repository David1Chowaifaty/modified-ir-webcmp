import { newE2EPage } from '@stencil/core/testing';

describe('ir-tasks-header', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-tasks-header></ir-tasks-header>');

    const element = await page.find('ir-tasks-header');
    expect(element).toHaveClass('hydrated');
  });
});
