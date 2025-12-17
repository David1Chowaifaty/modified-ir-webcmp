import { newSpecPage } from '@stencil/core/testing';
import { IrBookingCompanyDialog } from '../ir-booking-company-dialog';

describe('ir-booking-company-dialog', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingCompanyDialog],
      html: `<ir-booking-company-dialog></ir-booking-company-dialog>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-company-dialog>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-company-dialog>
    `);
  });
});
