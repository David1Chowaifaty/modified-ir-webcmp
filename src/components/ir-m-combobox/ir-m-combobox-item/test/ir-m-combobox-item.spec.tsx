import { newSpecPage } from '@stencil/core/testing';
import { IrMComboboxItem } from '../ir-m-combobox-item';

describe('ir-m-combobox-item', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrMComboboxItem],
      html: `<ir-m-combobox-item></ir-m-combobox-item>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-m-combobox-item>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-m-combobox-item>
    `);
  });
});
