import { newSpecPage } from '@stencil/core/testing';
import { IrMonthlyBookingsReport } from '../ir-monthly-bookings-report';

describe('ir-monthly-bookings-report', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrMonthlyBookingsReport],
      html: `<ir-monthly-bookings-report></ir-monthly-bookings-report>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-monthly-bookings-report>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-monthly-bookings-report>
    `);
  });
});
