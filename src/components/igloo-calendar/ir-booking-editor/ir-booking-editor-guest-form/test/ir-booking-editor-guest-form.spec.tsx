import { newSpecPage } from '@stencil/core/testing';
import { IrBookingEditorGuestForm } from '../ir-booking-editor-guest-form';

describe('ir-booking-editor-guest-form', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingEditorGuestForm],
      html: `<ir-booking-editor-guest-form></ir-booking-editor-guest-form>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-editor-guest-form>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-editor-guest-form>
    `);
  });
});
