import { newSpecPage } from '@stencil/core/testing';
import { IrMComboboxBookingItem } from '../ir-m-combobox-booking-item';

describe('ir-m-combobox-booking-item', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrMComboboxBookingItem],
      html: `<ir-m-combobox-booking-item></ir-m-combobox-booking-item>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-m-combobox-booking-item>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-m-combobox-booking-item>
    `);
  });
});
