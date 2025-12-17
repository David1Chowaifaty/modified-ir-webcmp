import { newSpecPage } from '@stencil/core/testing';
import { IrBookingListingTable } from '../ir-booking-listing-table';

describe('ir-booking-listing-table', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingListingTable],
      html: `<ir-booking-listing-table></ir-booking-listing-table>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-listing-table>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-listing-table>
    `);
  });
});
