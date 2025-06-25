import { newE2EPage } from '@stencil/core/testing';

describe('igl-cal-change-assignments', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<igl-cal-change-assignments></igl-cal-change-assignments>');

    const element = await page.find('igl-cal-change-assignments');
    expect(element).toHaveClass('hydrated');
  });
});
