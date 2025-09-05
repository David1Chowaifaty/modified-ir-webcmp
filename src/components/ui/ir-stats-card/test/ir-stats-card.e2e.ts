import { newE2EPage } from '@stencil/core/testing';

describe('ir-stats-card', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-stats-card></ir-stats-card>');

    const element = await page.find('ir-stats-card');
    expect(element).toHaveClass('hydrated');
  });
});
