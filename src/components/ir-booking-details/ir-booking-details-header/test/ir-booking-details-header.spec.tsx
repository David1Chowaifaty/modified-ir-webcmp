import { newSpecPage } from '@stencil/core/testing';
import { IrBookingDetailsHeader } from '../ir-booking-details-header';

describe('ir-booking-details-header', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingDetailsHeader],
      html: `<ir-booking-details-header></ir-booking-details-header>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-details-header>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-details-header>
    `);
  });
});
