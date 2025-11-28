import { newSpecPage } from '@stencil/core/testing';
import { IrBookingNumberCell } from '../ir-booking-number-cell';

describe('ir-booking-number-cell', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingNumberCell],
      html: `<ir-booking-number-cell></ir-booking-number-cell>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-number-cell>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-number-cell>
    `);
  });
});
