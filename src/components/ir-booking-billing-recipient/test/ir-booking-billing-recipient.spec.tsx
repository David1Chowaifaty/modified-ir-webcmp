import { newSpecPage } from '@stencil/core/testing';
import { IrBookingBillingRecipient } from '../ir-booking-billing-recipient';

describe('ir-booking-billing-recipient', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingBillingRecipient],
      html: `<ir-booking-billing-recipient></ir-booking-billing-recipient>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-billing-recipient>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-billing-recipient>
    `);
  });
});
