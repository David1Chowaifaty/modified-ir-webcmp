import { newE2EPage } from '@stencil/core/testing';

describe('ir-room-rateplan-manager', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-room-rateplan-manager></ir-room-rateplan-manager>');

    const element = await page.find('ir-room-rateplan-manager');
    expect(element).toHaveClass('hydrated');
  });
});
