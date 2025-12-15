import { newE2EPage } from '@stencil/core/testing';

describe('ir-print-room', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-print-room></ir-print-room>');

    const element = await page.find('ir-print-room');
    expect(element).toHaveClass('hydrated');
  });
});
