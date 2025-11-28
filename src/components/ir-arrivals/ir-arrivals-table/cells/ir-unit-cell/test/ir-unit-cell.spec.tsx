import { newSpecPage } from '@stencil/core/testing';
import { IrUnitCell } from '../ir-unit-cell';

describe('ir-unit-cell', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrUnitCell],
      html: `<ir-unit-cell></ir-unit-cell>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-unit-cell>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-unit-cell>
    `);
  });
});
