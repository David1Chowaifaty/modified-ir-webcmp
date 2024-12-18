import { newSpecPage } from '@stencil/core/testing';
import { IrPhoneCombobox } from '../ir-phone-combobox';

describe('ir-phone-combobox', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPhoneCombobox],
      html: `<ir-phone-combobox></ir-phone-combobox>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-phone-combobox>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-phone-combobox>
    `);
  });
});
