import { newSpecPage } from '@stencil/core/testing';
import { IrMonthlyBookingsReportTable } from '../ir-monthly-bookings-report-table';

describe('ir-monthly-bookings-report-table', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrMonthlyBookingsReportTable],
      html: `<ir-monthly-bookings-report-table></ir-monthly-bookings-report-table>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-monthly-bookings-report-table>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-monthly-bookings-report-table>
    `);
  });
});
