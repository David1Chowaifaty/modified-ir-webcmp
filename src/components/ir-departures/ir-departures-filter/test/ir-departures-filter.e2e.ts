import { newE2EPage } from '@stencil/core/testing';

describe('ir-departures-filter', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-departures-filter></ir-departures-filter>');

    const element = await page.find('ir-departures-filter');
    expect(element).toHaveClass('hydrated');
  });
});
