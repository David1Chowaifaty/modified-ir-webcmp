import { newSpecPage } from '@stencil/core/testing';
import { IrReservationInformation } from '../ir-reservation-information';

describe('ir-reservation-information', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrReservationInformation],
      html: `<ir-reservation-information></ir-reservation-information>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-reservation-information>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-reservation-information>
    `);
  });
});
