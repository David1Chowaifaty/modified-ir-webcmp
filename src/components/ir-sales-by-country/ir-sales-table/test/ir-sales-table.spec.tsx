import { newSpecPage } from '@stencil/core/testing';
import { IrSalesTable } from '../ir-sales-table';

describe('ir-sales-table', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrSalesTable],
      html: `<ir-sales-table></ir-sales-table>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-sales-table>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-sales-table>
    `);
  });
});
