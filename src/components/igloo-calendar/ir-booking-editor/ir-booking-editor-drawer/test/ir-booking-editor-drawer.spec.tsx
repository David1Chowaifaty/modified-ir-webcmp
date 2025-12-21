import { newSpecPage } from '@stencil/core/testing';
import { IrBookingEditorDrawer } from '../ir-booking-editor-drawer';

describe('ir-booking-editor-drawer', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingEditorDrawer],
      html: `<ir-booking-editor-drawer></ir-booking-editor-drawer>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-editor-drawer>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-editor-drawer>
    `);
  });
});
