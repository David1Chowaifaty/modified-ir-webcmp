import { newSpecPage } from '@stencil/core/testing';
import { IrCancellationSchedule } from '../ir-cancellation-schedule';

describe('ir-cancellation-schedule', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrCancellationSchedule],
      html: `<ir-cancellation-schedule></ir-cancellation-schedule>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-cancellation-schedule>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-cancellation-schedule>
    `);
  });
});
