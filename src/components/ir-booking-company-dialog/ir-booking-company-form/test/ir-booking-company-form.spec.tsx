import { newSpecPage } from '@stencil/core/testing';
import { IrBookingCompanyForm } from '../ir-booking-company-form';

describe('ir-booking-company-form', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingCompanyForm],
      html: `<ir-booking-company-form></ir-booking-company-form>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-company-form>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-company-form>
    `);
  });
});
