import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-email-logs', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-email-logs></ir-booking-email-logs>');

    const element = await page.find('ir-booking-email-logs');
    expect(element).toHaveClass('hydrated');
  });
});
