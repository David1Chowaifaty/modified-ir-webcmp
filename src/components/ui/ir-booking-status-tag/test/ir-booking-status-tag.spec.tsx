import { newSpecPage } from '@stencil/core/testing';
import { IrBookingStatusTag } from '../ir-booking-status-tag';

describe('ir-booking-status-tag', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingStatusTag],
      html: `<ir-booking-status-tag></ir-booking-status-tag>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-status-tag>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-status-tag>
    `);
  });
});
