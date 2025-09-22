import { newSpecPage } from '@stencil/core/testing';
import { IrRevenueTable } from '../ir-revenue-table';

describe('ir-revenue-table', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrRevenueTable],
      html: `<ir-revenue-table></ir-revenue-table>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-revenue-table>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-revenue-table>
    `);
  });
});
