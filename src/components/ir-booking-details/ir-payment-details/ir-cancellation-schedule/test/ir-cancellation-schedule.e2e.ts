import { newE2EPage } from '@stencil/core/testing';

describe('ir-cancellation-schedule', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-cancellation-schedule></ir-cancellation-schedule>');

    const element = await page.find('ir-cancellation-schedule');
    expect(element).toHaveClass('hydrated');
  });
});
