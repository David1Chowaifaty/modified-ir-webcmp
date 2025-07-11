import { newE2EPage } from '@stencil/core/testing';

describe('ir-tasks-table-pagination', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-tasks-table-pagination></ir-tasks-table-pagination>');

    const element = await page.find('ir-tasks-table-pagination');
    expect(element).toHaveClass('hydrated');
  });
});
