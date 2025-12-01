import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-status-tag', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-status-tag></ir-booking-status-tag>');

    const element = await page.find('ir-booking-status-tag');
    expect(element).toHaveClass('hydrated');
  });
});
