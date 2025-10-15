import { newE2EPage } from '@stencil/core/testing';

describe('ir-success-loader', () => {
  it('cycles from spinner to success and emits completion event', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-success-loader spinner-duration="10" success-duration="10"></ir-success-loader>');

    const completion = await page.spyOnEvent('loaderComplete');
    const element = await page.find('ir-success-loader');

    expect(element).toHaveClass('hydrated');
    expect(await element.getProperty('active')).toBe(true);

    await page.waitForTimeout(25);

    expect(completion).toHaveReceivedEventTimes(1);
    expect(await element.getProperty('active')).toBe(false);
  });
});
