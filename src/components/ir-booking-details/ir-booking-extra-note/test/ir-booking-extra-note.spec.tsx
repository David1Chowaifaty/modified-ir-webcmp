import { newSpecPage } from '@stencil/core/testing';
import { IrBookingExtraNote } from '../ir-booking-extra-note';

describe('ir-booking-extra-note', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingExtraNote],
      html: `<ir-booking-extra-note></ir-booking-extra-note>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-extra-note>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-extra-note>
    `);
  });
});
