import { newE2EPage } from '@stencil/core/testing';

describe('ir-guests-management-table', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-guests-management-table></ir-guests-management-table>');

    const element = await page.find('ir-guests-management-table');
    expect(element).toHaveClass('hydrated');
  });
});
