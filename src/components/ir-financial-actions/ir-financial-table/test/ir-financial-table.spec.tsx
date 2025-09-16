import { newSpecPage } from '@stencil/core/testing';
import { IrFinancialTable } from '../ir-financial-table';

describe('ir-financial-table', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrFinancialTable],
      html: `<ir-financial-table></ir-financial-table>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-financial-table>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-financial-table>
    `);
  });
});
