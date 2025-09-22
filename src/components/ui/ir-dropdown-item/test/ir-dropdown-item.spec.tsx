import { newSpecPage } from '@stencil/core/testing';
import { IrDropdownItem } from '../ir-dropdown-item';

describe('ir-dropdown-item', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrDropdownItem],
      html: `<ir-dropdown-item></ir-dropdown-item>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-dropdown-item>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-dropdown-item>
    `);
  });
});
