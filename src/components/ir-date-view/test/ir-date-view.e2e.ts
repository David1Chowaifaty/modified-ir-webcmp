import { newE2EPage } from '@stencil/core/testing';

describe('ir-date-view', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-date-view></ir-date-view>');

    const element = await page.find('ir-date-view');
    expect(element).toHaveClass('hydrated');
  });
});
