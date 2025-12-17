import { newSpecPage } from '@stencil/core/testing';
import { IrBookingDetailsDrawer } from '../ir-booking-details-drawer';

describe('ir-booking-details-drawer', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingDetailsDrawer],
      html: `<ir-booking-details-drawer></ir-booking-details-drawer>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-details-drawer>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-details-drawer>
    `);
  });
});
