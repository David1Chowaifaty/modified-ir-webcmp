import { newSpecPage } from '@stencil/core/testing';
import { IrSuccessLoader } from '../ir-success-loader';

describe('ir-success-loader', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('shows the spinner initially', async () => {
    const page = await newSpecPage({
      components: [IrSuccessLoader],
      html: `<ir-success-loader></ir-success-loader>`,
    });

    const spinner = page.root.shadowRoot.querySelector('ir-spinner');
    expect(spinner).not.toBeNull();
  });

  it('transitions to success and emits completion event', async () => {
    const page = await newSpecPage({
      components: [IrSuccessLoader],
      html: `<ir-success-loader spinner-duration="500" success-duration="400"></ir-success-loader>`,
    });

    const completionSpy = jest.fn();
    page.root.addEventListener('loaderComplete', completionSpy);

    jest.advanceTimersByTime(500);
    await page.waitForChanges();

    expect(page.root.shadowRoot.querySelector('ir-spinner')).toBeNull();
    expect(page.root.shadowRoot.querySelector('ir-icons')).not.toBeNull();

    jest.advanceTimersByTime(400);
    await page.waitForChanges();

    expect(completionSpy).toHaveBeenCalledTimes(1);
    expect(page.root.hasAttribute('active')).toBe(false);
  });
});
