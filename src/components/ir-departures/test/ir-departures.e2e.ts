import { newE2EPage } from '@stencil/core/testing';

describe('ir-departures', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-departures></ir-departures>');

    const element = await page.find('ir-departures');
    expect(element).toHaveClass('hydrated');
  });
});
