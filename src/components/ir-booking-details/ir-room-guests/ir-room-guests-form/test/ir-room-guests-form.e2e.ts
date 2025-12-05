import { newE2EPage } from '@stencil/core/testing';

describe('ir-room-guests-form', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-room-guests-form></ir-room-guests-form>');

    const element = await page.find('ir-room-guests-form');
    expect(element).toHaveClass('hydrated');
  });
});
