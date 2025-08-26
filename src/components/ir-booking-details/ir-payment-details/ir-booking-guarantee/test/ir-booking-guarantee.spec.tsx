import { newSpecPage } from '@stencil/core/testing';
import { IrBookingGuarantee } from '../ir-booking-guarantee';

describe('ir-booking-guarantee', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingGuarantee],
      html: `<ir-booking-guarantee></ir-booking-guarantee>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-guarantee>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-guarantee>
    `);
  });
});
