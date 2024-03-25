import { newE2EPage } from '@stencil/core/testing';

describe('ir-channel-mapping', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-channel-mapping></ir-channel-mapping>');

    const element = await page.find('ir-channel-mapping');
    expect(element).toHaveClass('hydrated');
  });
});
