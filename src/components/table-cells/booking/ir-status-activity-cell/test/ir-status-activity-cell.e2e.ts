import { newE2EPage } from '@stencil/core/testing';

describe('ir-status-activity-cell', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-status-activity-cell></ir-status-activity-cell>');

    const element = await page.find('ir-status-activity-cell');
    expect(element).toHaveClass('hydrated');
  });
});
