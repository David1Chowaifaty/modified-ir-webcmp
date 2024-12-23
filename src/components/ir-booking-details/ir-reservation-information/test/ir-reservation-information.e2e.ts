import { newE2EPage } from '@stencil/core/testing';

describe('ir-reservation-information', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-reservation-information></ir-reservation-information>');

    const element = await page.find('ir-reservation-information');
    expect(element).toHaveClass('hydrated');
  });
});
