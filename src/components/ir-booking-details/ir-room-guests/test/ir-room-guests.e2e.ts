import { newE2EPage } from '@stencil/core/testing';

describe('ir-room-guests', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-room-guests></ir-room-guests>');

    const element = await page.find('ir-room-guests');
    expect(element).toHaveClass('hydrated');
  });
});
