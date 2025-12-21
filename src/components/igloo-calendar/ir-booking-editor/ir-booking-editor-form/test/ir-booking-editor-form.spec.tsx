import { newSpecPage } from '@stencil/core/testing';
import { IrBookingEditorForm } from '../ir-booking-editor-form';

describe('ir-booking-editor-form', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingEditorForm],
      html: `<ir-booking-editor-form></ir-booking-editor-form>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-editor-form>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-editor-form>
    `);
  });
});
