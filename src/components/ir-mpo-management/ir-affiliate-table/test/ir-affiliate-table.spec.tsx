import { newSpecPage } from '@stencil/core/testing';
import { IrAffiliateTable } from '../ir-affiliate-table';

describe('ir-affiliate-table', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrAffiliateTable],
      html: `<ir-affiliate-table></ir-affiliate-table>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-affiliate-table>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-affiliate-table>
    `);
  });
});
