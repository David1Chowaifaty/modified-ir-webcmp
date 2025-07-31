import { newE2EPage } from '@stencil/core/testing';

describe('ir-report-stats-card', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-report-stats-card></ir-report-stats-card>');

    const element = await page.find('ir-report-stats-card');
    expect(element).toHaveClass('hydrated');
  });
});
