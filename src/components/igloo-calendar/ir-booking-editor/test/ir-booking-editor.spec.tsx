import { newSpecPage } from '@stencil/core/testing';
import { IrBookingEditor } from '../ir-booking-editor';

describe('ir-booking-editor', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingEditor],
      html: `<ir-booking-editor></ir-booking-editor>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-editor>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-editor>
    `);
  });
});
