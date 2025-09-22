import { newSpecPage } from '@stencil/core/testing';
import { IrBookingEmailLogs } from '../ir-booking-email-logs';

describe('ir-booking-email-logs', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingEmailLogs],
      html: `<ir-booking-email-logs></ir-booking-email-logs>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-email-logs>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-email-logs>
    `);
  });
});
