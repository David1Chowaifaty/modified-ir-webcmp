import { newSpecPage } from '@stencil/core/testing';
import { IrBookingPrinting } from '../ir-booking-printing';

describe('ir-booking-printing', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingPrinting],
      html: `<ir-booking-printing></ir-booking-printing>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-printing>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-printing>
    `);
  });
});
