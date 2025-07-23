import { newSpecPage } from '@stencil/core/testing';
import { IrMonthlyBookingsReportFilter } from '../ir-monthly-bookings-report-filter';

describe('ir-monthly-bookings-report-filter', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrMonthlyBookingsReportFilter],
      html: `<ir-monthly-bookings-report-filter></ir-monthly-bookings-report-filter>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-monthly-bookings-report-filter>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-monthly-bookings-report-filter>
    `);
  });
});
