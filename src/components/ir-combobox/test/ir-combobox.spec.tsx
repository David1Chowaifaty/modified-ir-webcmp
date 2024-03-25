import { newSpecPage } from '@stencil/core/testing';
import { IrCombobox } from '../ir-combobox';

describe('ir-combobox', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrCombobox],
      html: `<ir-combobox></ir-combobox>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-combobox>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-combobox>
    `);
  });
});
