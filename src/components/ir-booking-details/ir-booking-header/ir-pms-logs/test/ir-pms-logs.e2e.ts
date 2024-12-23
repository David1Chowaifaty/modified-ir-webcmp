import { newE2EPage } from '@stencil/core/testing';

describe('ir-pms-logs', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-pms-logs></ir-pms-logs>');

    const element = await page.find('ir-pms-logs');
    expect(element).toHaveClass('hydrated');
  });
});
