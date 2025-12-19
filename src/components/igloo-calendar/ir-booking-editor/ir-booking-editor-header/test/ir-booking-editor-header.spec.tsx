import { newSpecPage } from '@stencil/core/testing';
import { IrBookingEditorHeader } from '../ir-booking-editor-header';

describe('ir-booking-editor-header', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingEditorHeader],
      html: `<ir-booking-editor-header></ir-booking-editor-header>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-editor-header>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-editor-header>
    `);
  });
});
