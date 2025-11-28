import { newE2EPage } from '@stencil/core/testing';

describe('ir-departures-table', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-departures-table></ir-departures-table>');

    const element = await page.find('ir-departures-table');
    expect(element).toHaveClass('hydrated');
  });
});
