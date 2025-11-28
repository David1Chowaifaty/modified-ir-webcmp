import { newSpecPage } from '@stencil/core/testing';
import { IrBalanceCell } from '../ir-balance-cell';

describe('ir-balance-cell', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBalanceCell],
      html: `<ir-balance-cell></ir-balance-cell>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-balance-cell>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-balance-cell>
    `);
  });
});
