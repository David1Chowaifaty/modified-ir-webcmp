import { newE2EPage } from '@stencil/core/testing';

describe('ir-room-nights', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-room-nights></ir-room-nights>');

    const element = await page.find('ir-room-nights');
    expect(element).toHaveClass('hydrated');
  });
});
