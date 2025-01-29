import { newE2EPage } from '@stencil/core/testing';

describe('ir-tasks-table', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-tasks-table></ir-tasks-table>');

    const element = await page.find('ir-tasks-table');
    expect(element).toHaveClass('hydrated');
  });
});
