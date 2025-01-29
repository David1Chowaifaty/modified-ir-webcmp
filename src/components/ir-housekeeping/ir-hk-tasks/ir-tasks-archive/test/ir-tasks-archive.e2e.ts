import { newE2EPage } from '@stencil/core/testing';

describe('ir-tasks-archive', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-tasks-archive></ir-tasks-archive>');

    const element = await page.find('ir-tasks-archive');
    expect(element).toHaveClass('hydrated');
  });
});
