import { newE2EPage } from '@stencil/core/testing';

describe('ir-progress-indicator', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-progress-indicator></ir-progress-indicator>');

    const element = await page.find('ir-progress-indicator');
    expect(element).toHaveClass('hydrated');
  });
});
