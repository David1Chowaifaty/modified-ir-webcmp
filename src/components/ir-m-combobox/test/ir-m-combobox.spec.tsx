import { newSpecPage } from '@stencil/core/testing';
import { IrMCombobox } from '../ir-m-combobox';

describe('ir-m-combobox', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrMCombobox],
      html: `<ir-m-combobox></ir-m-combobox>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-m-combobox>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-m-combobox>
    `);
  });
});
